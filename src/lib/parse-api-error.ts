/** Parse error bodies from /api/generate and similar routes for UI display. */
export function parseApiErrorMessage(status: number, raw: string): string {
  const trimmed = raw.trim();

  try {
    const jsonStart = trimmed.indexOf("{");
    if (jsonStart >= 0) {
      const json = JSON.parse(trimmed.slice(jsonStart)) as {
        error?: string;
        message?: string;
      };
      const msg = json.error ?? json.message;
      if (msg) return msg;
    }
  } catch {
    /* fall through */
  }

  if (status === 429) {
    return "Limit generate tercapai. Tunggu hingga besok atau coba lagi nanti.";
  }
  if (status === 402) {
    return "Paket atau kredit belum mencukupi. Cek dashboard untuk upgrade/top-up.";
  }
  if (status === 401) {
    return "Sesi login habis. Masuk kembali lalu coba generate.";
  }
  if (status === 403) {
    return "Akses ditolak. Periksa paket langganan dan model yang dipilih.";
  }
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
    return `Server mengembalikan halaman error (HTTP ${status}). Coba refresh halaman lalu ulangi.`;
  }

  return trimmed.length > 0 && trimmed.length < 200
    ? trimmed
    : `Gagal memulai generate (HTTP ${status}). Coba lagi.`;
}
