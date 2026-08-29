export class RequestBodyError extends Error {
  constructor(
    public code: "INVALID_JSON" | "PAYLOAD_TOO_LARGE",
    message: string,
    public statusCode: 400 | 413
  ) {
    super(message);
    this.name = "RequestBodyError";
  }
}

export async function readJsonBody(
  request: Request,
  maxBytes: number
): Promise<unknown> {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const declaredBytes = Number(contentLength);
    if (Number.isFinite(declaredBytes) && declaredBytes > maxBytes) {
      throw new RequestBodyError(
        "PAYLOAD_TOO_LARGE",
        `Payload melebihi batas ${maxBytes} byte`,
        413
      );
    }
  }

  if (!request.body) {
    throw new RequestBodyError("INVALID_JSON", "Invalid JSON", 400);
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel("payload_too_large").catch(() => {});
        throw new RequestBodyError(
          "PAYLOAD_TOO_LARGE",
          `Payload melebihi batas ${maxBytes} byte`,
          413
        );
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw new RequestBodyError("INVALID_JSON", "Invalid JSON", 400);
  }
}
