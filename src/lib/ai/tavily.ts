import { logger } from "@/lib/logger";
import { fetchPublicHtml, SafeUrlError } from "@/lib/security/safe-url";

/**
 * Tavily integration — web search + content extraction.
 * Free tier: 1.000 credit/bulan (terus-menerus).
 * Dipakai ArroDesign mode URL: cross-reference situs referensi.
 *
 * Butuh: TAVILY_API_KEY di .env.local
 */

export function isTavilyConfigured(): boolean {
  return Boolean(process.env.TAVILY_API_KEY?.trim());
}

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface TavilySearchResponse {
  results: TavilySearchResult[];
  answer?: string;
}

/**
 * Search via Tavily API — contextual info about a site/brand.
 * Context-only: untuk ambil nama studio, brief resmi yang terpublikasi.
 * BUKAN untuk menyalin aset/konten berhak cipta.
 */
export async function tavilySearch(params: {
  query: string;
  maxResults?: number;
  includeAnswer?: boolean;
}): Promise<TavilySearchResponse> {
  const key = process.env.TAVILY_API_KEY?.trim();
  if (!key) throw new Error("TAVILY_API_KEY is not set");

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      query: params.query,
      max_results: params.maxResults ?? 3,
      include_answer: params.includeAnswer ?? false,
      search_depth: "basic",
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Tavily error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as TavilySearchResponse;
  return {
    results: (data.results ?? []).slice(0, params.maxResults ?? 3),
    answer: data.answer,
  };
}

/**
 * Fetch raw HTML dari URL referensi.
 * Dipakai ArroDesign mode URL untuk dapat struktur halaman.
 */
export async function fetchPageHtml(url: string): Promise<{
  html: string;
  finalUrl: string;
  error?: string;
}> {
  try {
    const result = await fetchPublicHtml(url, {
      timeoutMs: 20_000,
      maxBytes: 150_000,
      maxRedirects: 3,
    });
    return { html: result.html, finalUrl: result.finalUrl };
  } catch (err) {
    if (err instanceof SafeUrlError) {
      logger.warn("public_html_fetch_rejected", { code: err.code });
    }
    const message =
      err instanceof SafeUrlError ? err.message : "Halaman referensi tidak dapat diambil.";
    return { html: "", finalUrl: url, error: message };
  }
}

/**
 * Rangkum hasil Tavily search menjadi string konteks untuk prompt.
 */
export function formatTavilyContext(result: TavilySearchResponse): string {
  const parts: string[] = [];

  if (result.answer) {
    parts.push(`Ringkasan: ${result.answer}`);
  }

  for (const r of result.results.slice(0, 3)) {
    parts.push(`---\nJudul: ${r.title}\nURL: ${r.url}\nKutipan: ${r.content.slice(0, 600)}`);
  }

  return parts.join("\n") || "(Tidak ada hasil Tavily)";
}
