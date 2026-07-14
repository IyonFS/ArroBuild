import Link from "next/link";

export const metadata = {
  title: "Kebijakan Privasi — ArroBuild",
  description: "Kebijakan privasi ArroBuild",
};

export default function PrivacyPage() {
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
        Kebijakan Privasi
      </h1>
      <p>Terakhir diperbarui: 10 Juli 2026</p>

      <h2 style={h2}>1. Data yang Dikumpulkan</h2>
      <ul style={ul}>
        <li>Email, nama, dan profil autentikasi (via Supabase Auth)</li>
        <li>Isian form generate, draft plan, dan proyek yang disimpan</li>
        <li>Riwayat pembayaran dan transaksi kredit</li>
        <li>Log teknis (IP, rate limit) untuk keamanan</li>
      </ul>

      <h2 style={h2}>2. Cara Data Digunakan</h2>
      <ul style={ul}>
        <li>Menyediakan layanan generate, revisi, dan export</li>
        <li>Memproses pembayaran dan langganan</li>
        <li>Mengirim prompt ke provider AI untuk menghasilkan dokumen</li>
        <li>Mencegah penyalahgunaan (rate limit, audit keamanan)</li>
      </ul>

      <h2 style={h2}>3. Penyimpanan</h2>
      <p>
        Data disimpan di PostgreSQL (Supabase) dan infrastruktur hosting Vercel.
        Draft plan dapat disimpan di browser (localStorage) dan server (maks 5 draft
        aktif, expire 30 hari).
      </p>

      <h2 style={h2}>4. Berbagi dengan Pihak Ketiga</h2>
      <ul style={ul}>
        <li>Supabase — autentikasi & database</li>
        <li>Midtrans — pembayaran</li>
        <li>Provider AI — pemrosesan generate (sesuai input kamu)</li>
        <li>Upstash — rate limiting</li>
      </ul>

      <h2 style={h2}>5. Hak Kamu</h2>
      <p>
        Kamu dapat meminta penghapusan akun dan data terkait dengan menghubungi kami.
        Beberapa data transaksi mungkin tetap disimpan untuk kepatuhan hukum dan audit
        pembayaran.
      </p>

      <h2 style={h2}>6. Keamanan</h2>
      <p>
        Kami menerapkan Row Level Security di database, autentikasi wajib untuk API
        sensitif, dan verifikasi signature pada webhook pembayaran.
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

const ul = {
  paddingLeft: 20,
  margin: "8px 0",
} as const;
