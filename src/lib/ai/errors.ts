/**
 * Normalize raw provider/API errors into user-facing messages.
 */
export function formatGenerationError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);

  // Gemini / Google — quota exhausted
  if (
    raw.includes("429") ||
    raw.includes("RESOURCE_EXHAUSTED") ||
    raw.includes("quota")
  ) {
    if (
      raw.includes("free_tier") ||
      raw.includes("FreeTier") ||
      raw.includes("limit: 20")
    ) {
      return "Kuota API Gemini gratis habis (20 request/hari per model). Coba lagi besok, atau pilih model DeepSeek di langkah Presets.";
    }
    const retryMatch = raw.match(/retry in (\d+(?:\.\d+)?)\s*s/i);
    if (retryMatch) {
      const secs = Math.ceil(parseFloat(retryMatch[1]));
      return `Rate limit API AI tercapai. Tunggu ~${secs} detik lalu coba lagi.`;
    }
    return "Rate limit API AI tercapai. Tunggu sebentar lalu coba lagi.";
  }

  // Missing API keys
  if (raw.includes("GEMINI_API_KEY is not set")) {
    return "GEMINI_API_KEY belum dikonfigurasi di server.";
  }
  if (raw.includes("OPENAI_API_KEY is not set")) {
    return "OPENAI_API_KEY belum dikonfigurasi. Pilih model Gemini atau DeepSeek.";
  }
  if (raw.includes("ANTHROPIC_API_KEY is not set")) {
    return "ANTHROPIC_API_KEY belum dikonfigurasi. Pilih model Gemini atau DeepSeek.";
  }
  if (raw.includes("DEEPSEEK_API_KEY is not set")) {
    return "DEEPSEEK_API_KEY belum dikonfigurasi. Pilih model Gemini.";
  }

  // Incomplete content
  if (raw.startsWith("Generated content incomplete:")) {
    return "Dokumen terpotong saat di-generate. Silakan coba lagi.";
  }

  // Avoid dumping raw JSON to users
  if (raw.includes('"code":429') || raw.includes('"status":"Too Many Requests"')) {
    return "Kuota/rate limit API AI tercapai. Coba lagi nanti atau ganti model.";
  }
  if (raw.length > 200 && (raw.includes("{") || raw.includes("ApiError"))) {
    return "Gagal menghubungi API AI. Periksa koneksi dan coba lagi.";
  }

  return raw;
}

export function isQuotaError(err: unknown): boolean {
  const raw = err instanceof Error ? err.message : String(err);
  return (
    raw.includes("429") ||
    raw.includes("RESOURCE_EXHAUSTED") ||
    raw.includes("free_tier") ||
    raw.includes("FreeTier")
  );
}
