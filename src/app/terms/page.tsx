import Link from "next/link";

export const metadata = {
  title: "Syarat & Ketentuan — ArroBuild",
  description: "Syarat dan ketentuan penggunaan ArroBuild",
};

export default function TermsPage() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "120px 24px 80px",
        fontFamily: "var(--font-jetbrains-mono), monospace",
        color: "var(--color-text-secondary)",
        lineHeight: 1.75,
        fontSize: 14,
      }}
    >
      <Link href="/" style={{ color: "var(--color-lime)", fontSize: 12 }}>
        ← Beranda
      </Link>
      <h1
        style={{
          fontFamily: "var(--font-unbounded), sans-serif",
          color: "var(--color-text-primary)",
          fontSize: "1.75rem",
          margin: "24px 0 16px",
        }}
      >
        Syarat & Ketentuan
      </h1>
      <p>Terakhir diperbarui: 10 Juli 2026</p>

      <h2 style={h2}>1. Layanan</h2>
      <p>
        ArroBuild menyediakan platform untuk membangun rencana produk terstruktur dan
        menghasilkan dokumentasi teknis menggunakan AI. Akses generate memerlukan akun
        terdaftar dan paket berlangganan aktif.
      </p>

      <h2 style={h2}>2. Akun & Login</h2>
      <p>
        Kamu wajib mendaftar dan login untuk menggunakan fitur generate, export, dan
        workspace proyek. Kamu bertanggung jawab menjaga kerahasiaan kredensial akun.
      </p>

      <h2 style={h2}>3. Kredit & Langganan</h2>
      <p>
        Paket Base, Core, dan Prime memberikan alokasi kredit bulanan. Kredit dipotong
        saat generate dokumen, revisi, dan fitur berbayar lainnya. Kredit tidak dapat
        ditukar tunai. Top-up kredit bersifat final setelah pembayaran berhasil.
      </p>

      <h2 style={h2}>4. Pembayaran & Refund</h2>
      <p>
        Pembayaran diproses melalui Midtrans. Kebijakan refund mengikuti ketentuan
        Midtrans dan kebijakan operasional ArroBuild: langganan aktif dapat dibatalkan
        untuk periode berikutnya; tidak ada refund prorata untuk periode yang sudah
        dimulai kecuali diwajibkan oleh hukum.
      </p>

      <h2 style={h2}>5. Data & AI</h2>
      <p>
        Konten yang kamu masukkan ke form dapat dikirim ke provider AI pihak ketiga
        (Google Gemini, OpenAI, Anthropic, DeepSeek) untuk menghasilkan output. Jangan
        memasukkan data rahasia atau informasi pribadi sensitif yang tidak perlu.
      </p>

      <h2 style={h2}>6. Batasan Tanggung Jawab</h2>
      <p>
        Output AI bersifat saran dan perlu ditinjau manusia sebelum dipakai di production.
        ArroBuild tidak bertanggung jawab atas kerugian akibat penggunaan output tanpa
        verifikasi.
      </p>

      <h2 style={h2}>7. Kontak</h2>
      <p>
        Pertanyaan legal: hubungi founder melalui dashboard (paket Pro ke atas) atau email
        yang tertera di situs.
      </p>
    </main>
  );
}

const h2 = {
  fontFamily: "var(--font-unbounded), sans-serif",
  color: "var(--color-text-primary)",
  fontSize: "1.1rem",
  margin: "28px 0 8px",
} as const;
