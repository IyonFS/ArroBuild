import { lookup as dnsLookup, type LookupAddress, type LookupOptions } from "node:dns";
import { request as httpRequest, type IncomingHttpHeaders } from "node:http";
import { request as httpsRequest } from "node:https";
import { BlockList, isIP, type LookupFunction } from "node:net";

const DEFAULT_TIMEOUT_MS = 20_000;
const DEFAULT_MAX_BYTES = 150_000;
const DEFAULT_MAX_REDIRECTS = 3;

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata.google.com",
  "instance-data",
]);

const blockedIpv4 = new BlockList();
[
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
].forEach(([address, prefix]) => blockedIpv4.addSubnet(String(address), Number(prefix), "ipv4"));

const blockedIpv6 = new BlockList();
blockedIpv6.addAddress("::", "ipv6");
blockedIpv6.addAddress("::1", "ipv6");
[
  ["::", 96],
  ["::ffff:0:0", 96],
  ["64:ff9b::", 96],
  ["64:ff9b:1::", 48],
  ["100::", 64],
  ["2001::", 32],
  ["2001:db8::", 32],
  ["2002::", 16],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
].forEach(([address, prefix]) => blockedIpv6.addSubnet(String(address), Number(prefix), "ipv6"));

export type SafeUrlErrorCode =
  | "INVALID_URL"
  | "UNSAFE_PROTOCOL"
  | "EMBEDDED_CREDENTIALS"
  | "BLOCKED_HOST"
  | "DNS_LOOKUP_FAILED"
  | "BLOCKED_ADDRESS"
  | "TOO_MANY_REDIRECTS"
  | "INVALID_REDIRECT"
  | "RESPONSE_TOO_LARGE"
  | "UNSUPPORTED_CONTENT_TYPE"
  | "REQUEST_FAILED";

export class SafeUrlError extends Error {
  constructor(
    public readonly code: SafeUrlErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "SafeUrlError";
  }
}

export type SafeUrlResolver = (hostname: string) => Promise<LookupAddress[]>;

export interface ValidatedPublicUrl {
  url: URL;
  addresses: LookupAddress[];
}

export interface SafeHtmlFetchOptions {
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
  resolver?: SafeUrlResolver;
}

export interface SafeHtmlFetchResult {
  html: string;
  finalUrl: string;
  headers: IncomingHttpHeaders;
}

function normalizeHostname(hostname: string): string {
  return hostname
    .replace(/^\[|\]$/g, "")
    .replace(/\.$/, "")
    .toLowerCase();
}

function defaultResolver(hostname: string): Promise<LookupAddress[]> {
  return new Promise((resolve, reject) => {
    dnsLookup(hostname, { all: true, verbatim: true }, (error, addresses) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(addresses);
    });
  });
}

export function isPublicIpAddress(address: string): boolean {
  const normalized = normalizeHostname(address);
  const family = isIP(normalized);

  if (family === 4) {
    return !blockedIpv4.check(normalized, "ipv4");
  }
  if (family === 6) {
    return !blockedIpv6.check(normalized, "ipv6");
  }
  return false;
}

function isBlockedHostname(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);
  return (
    BLOCKED_HOSTNAMES.has(normalized) ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local") ||
    normalized.endsWith(".internal")
  );
}

export async function validatePublicHttpUrl(
  input: string | URL,
  resolver: SafeUrlResolver = defaultResolver,
): Promise<ValidatedPublicUrl> {
  let url: URL;
  try {
    url = input instanceof URL ? new URL(input.href) : new URL(input);
  } catch {
    throw new SafeUrlError("INVALID_URL", "URL referensi tidak valid.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new SafeUrlError(
      "UNSAFE_PROTOCOL",
      "URL referensi hanya boleh menggunakan HTTP atau HTTPS.",
    );
  }

  if (url.username || url.password) {
    throw new SafeUrlError(
      "EMBEDDED_CREDENTIALS",
      "URL referensi tidak boleh memuat username atau password.",
    );
  }

  const hostname = normalizeHostname(url.hostname);
  if (!hostname || isBlockedHostname(hostname)) {
    throw new SafeUrlError("BLOCKED_HOST", "Host URL referensi tidak diizinkan.");
  }

  const literalFamily = isIP(hostname);
  let addresses: LookupAddress[];
  if (literalFamily) {
    addresses = [{ address: hostname, family: literalFamily }];
  } else {
    try {
      addresses = await resolver(hostname);
    } catch {
      throw new SafeUrlError("DNS_LOOKUP_FAILED", "Host URL referensi tidak dapat ditemukan.");
    }
  }

  if (addresses.length === 0) {
    throw new SafeUrlError(
      "DNS_LOOKUP_FAILED",
      "Host URL referensi tidak memiliki alamat yang dapat digunakan.",
    );
  }

  const normalizedAddresses = addresses.map(({ address, family }) => ({
    address: normalizeHostname(address),
    family: typeof family === "string" ? (family === "IPv6" ? 6 : 4) : family,
  }));

  if (
    normalizedAddresses.some(
      ({ address, family }) => !isPublicIpAddress(address) || isIP(address) !== family,
    )
  ) {
    throw new SafeUrlError(
      "BLOCKED_ADDRESS",
      "URL referensi mengarah ke jaringan internal atau alamat yang tidak diizinkan.",
    );
  }

  return { url, addresses: normalizedAddresses };
}

function createPinnedLookup(addresses: LookupAddress[]): LookupFunction {
  return (_hostname, options, callback) => {
    const lookupOptions: LookupOptions = options ?? {};
    const requestedFamily = Number(lookupOptions.family || 0);
    const candidates = requestedFamily
      ? addresses.filter(({ family }) => family === requestedFamily)
      : addresses;

    if (candidates.length === 0) {
      const error = new Error(
        "No validated address matches the requested family",
      ) as NodeJS.ErrnoException;
      error.code = "ENOTFOUND";
      callback(error, "", requestedFamily || undefined);
      return;
    }

    if (lookupOptions.all) {
      callback(null, candidates);
      return;
    }

    callback(null, candidates[0].address, candidates[0].family);
  };
}

function requestValidatedHtml(
  validated: ValidatedPublicUrl,
  timeoutMs: number,
  maxBytes: number,
): Promise<{
  statusCode: number;
  headers: IncomingHttpHeaders;
  body: string;
}> {
  const transport = validated.url.protocol === "https:" ? httpsRequest : httpRequest;

  return new Promise((resolve, reject) => {
    let settled = false;
    const finishReject = (error: Error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    const request = transport(
      validated.url,
      {
        method: "GET",
        lookup: createPinnedLookup(validated.addresses),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; ArroBuild-Design-Analyzer/1.0; +https://arrobuild.com)",
          Accept: "text/html,application/xhtml+xml;q=0.9",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "identity",
        },
      },
      (response) => {
        const statusCode = response.statusCode ?? 0;
        const contentLength = Number(response.headers["content-length"] ?? 0);
        if (Number.isFinite(contentLength) && contentLength > maxBytes) {
          response.destroy();
          finishReject(
            new SafeUrlError(
              "RESPONSE_TOO_LARGE",
              "Halaman referensi terlalu besar untuk dianalisis.",
            ),
          );
          return;
        }

        const chunks: Buffer[] = [];
        let receivedBytes = 0;

        response.on("data", (chunk: Buffer | string) => {
          const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          receivedBytes += buffer.length;
          if (receivedBytes > maxBytes) {
            response.destroy();
            finishReject(
              new SafeUrlError(
                "RESPONSE_TOO_LARGE",
                "Halaman referensi terlalu besar untuk dianalisis.",
              ),
            );
            return;
          }
          chunks.push(buffer);
        });

        response.on("end", () => {
          if (settled) return;
          settled = true;
          resolve({
            statusCode,
            headers: response.headers,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });

        response.on("error", finishReject);
      },
    );

    request.setTimeout(timeoutMs, () => {
      request.destroy(
        new SafeUrlError("REQUEST_FAILED", "Pengambilan halaman referensi melewati batas waktu."),
      );
    });
    request.on("error", (error) => {
      finishReject(
        error instanceof SafeUrlError
          ? error
          : new SafeUrlError("REQUEST_FAILED", "Halaman referensi tidak dapat diambil."),
      );
    });
    request.end();
  });
}

export async function fetchPublicHtml(
  input: string | URL,
  options: SafeHtmlFetchOptions = {},
): Promise<SafeHtmlFetchResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;
  const resolver = options.resolver ?? defaultResolver;

  let currentUrl = input instanceof URL ? new URL(input.href) : new URL(input);

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount++) {
    const validated = await validatePublicHttpUrl(currentUrl, resolver);
    const response = await requestValidatedHtml(validated, timeoutMs, maxBytes);

    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
      if (redirectCount === maxRedirects) {
        throw new SafeUrlError(
          "TOO_MANY_REDIRECTS",
          "Halaman referensi memiliki terlalu banyak redirect.",
        );
      }
      try {
        currentUrl = new URL(response.headers.location, validated.url);
      } catch {
        throw new SafeUrlError("INVALID_REDIRECT", "Redirect halaman referensi tidak valid.");
      }
      continue;
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new SafeUrlError(
        "REQUEST_FAILED",
        `Halaman referensi merespons dengan HTTP ${response.statusCode}.`,
      );
    }

    const contentType = String(response.headers["content-type"] ?? "").toLowerCase();
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      throw new SafeUrlError(
        "UNSUPPORTED_CONTENT_TYPE",
        "URL referensi bukan halaman HTML yang didukung.",
      );
    }

    return {
      html: response.body,
      finalUrl: validated.url.href,
      headers: response.headers,
    };
  }

  throw new SafeUrlError(
    "TOO_MANY_REDIRECTS",
    "Halaman referensi memiliki terlalu banyak redirect.",
  );
}
