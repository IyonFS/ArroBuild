export type CopyStudioTemplateId =
  | "saas-launch"
  | "company-profile"
  | "umkm-promo"
  | "personal-portfolio"
  | "event-promo";

export interface CopyStudioSection {
  id: string;
  title: string;
  contentHint: string;
}

export interface CopyStudioTemplate {
  id: CopyStudioTemplateId;
  name: string;
  blurb: string;
  bestFor: string;
  tags: string[];
  sections: CopyStudioSection[];
}

export const COPY_STUDIO_TEMPLATES: CopyStudioTemplate[] = [
  {
    id: "saas-launch",
    name: "SaaS Product Launch",
    blurb: "Urutan klasik peluncuran produk digital: hook → masalah → solusi → bukti → CTA.",
    bestFor: "SaaS, tool, app launch",
    tags: ["Hero", "Value props", "Pricing CTA"],
    sections: [
      { id: "hero", title: "Hero", contentHint: "Headline + subhead + CTA utama" },
      { id: "problem", title: "Problem", contentHint: "Pain point audiens" },
      { id: "solution", title: "Solution", contentHint: "Bagaimana produk menyelesaikan" },
      { id: "features", title: "Features", contentHint: "3–5 value props singkat" },
      { id: "social-proof", title: "Social Proof", contentHint: "Testimoni / logo / metrik" },
      { id: "cta", title: "CTA Akhir", contentHint: "Ajakan bertindak + FAQ singkat" },
    ],
  },
  {
    id: "company-profile",
    name: "Profile Perusahaan",
    blurb: "Struktur company profile: siapa kami, apa yang kami lakukan, mengapa percaya.",
    bestFor: "B2B, agency, korporat",
    tags: ["About", "Layanan", "Kredibilitas"],
    sections: [
      { id: "hero", title: "Hero", contentHint: "Tagline perusahaan + CTA kontak" },
      { id: "about", title: "Tentang Kami", contentHint: "Sejarah singkat + misi" },
      { id: "services", title: "Layanan", contentHint: "Paket / kapabilitas utama" },
      { id: "why-us", title: "Mengapa Kami", contentHint: "Differentiator & kredibilitas" },
      { id: "clients", title: "Klien / Portofolio", contentHint: "Bukti kerja nyata" },
      { id: "contact", title: "Kontak", contentHint: "CTA hubungi / lokasi" },
    ],
  },
  {
    id: "umkm-promo",
    name: "Promosi UMKM",
    blurb: "Halaman promo produk lokal: penawaran jelas, manfaat, cara pesan.",
    bestFor: "UMKM, warung, toko online",
    tags: ["Penawaran", "Manfaat", "Cara pesan"],
    sections: [
      { id: "hero", title: "Hero Promo", contentHint: "Nama produk + penawaran utama" },
      { id: "offer", title: "Penawaran", contentHint: "Harga / bundling / periode" },
      { id: "benefits", title: "Manfaat", contentHint: "Kenapa harus beli" },
      { id: "how-to-order", title: "Cara Pesan", contentHint: "Langkah singkat" },
      { id: "faq", title: "FAQ", contentHint: "3 pertanyaan umum" },
      { id: "cta", title: "CTA", contentHint: "WhatsApp / checkout" },
    ],
  },
  {
    id: "personal-portfolio",
    name: "Portfolio Personal",
    blurb: "Landing portfolio: siapa kamu, karya unggulan, cara dihubungi.",
    bestFor: "Freelancer, designer, developer",
    tags: ["Intro", "Works", "Contact"],
    sections: [
      { id: "hero", title: "Intro", contentHint: "Nama + peran + one-liner" },
      { id: "about", title: "About", contentHint: "Latar belakang singkat" },
      { id: "works", title: "Selected Works", contentHint: "3–6 proyek dengan 1 kalimat tiap" },
      { id: "skills", title: "Skills / Services", contentHint: "Keahlian yang ditawarkan" },
      { id: "contact", title: "Contact", contentHint: "CTA hire / email" },
    ],
  },
  {
    id: "event-promo",
    name: "Event / Promo Page",
    blurb: "Halaman event atau campaign: tanggal, manfaat ikut, agenda, daftar.",
    bestFor: "Webinar, workshop, flash sale",
    tags: ["Tanggal", "Agenda", "Register"],
    sections: [
      { id: "hero", title: "Hero Event", contentHint: "Nama event + tanggal + CTA daftar" },
      { id: "why", title: "Kenapa Ikut", contentHint: "Manfaat peserta" },
      { id: "agenda", title: "Agenda", contentHint: "Jadwal ringkas" },
      { id: "speakers", title: "Speaker / Highlight", contentHint: "Siapa yang tampil / apa yang didapat" },
      { id: "ticket", title: "Tiket / Harga", contentHint: "Opsi & batas waktu" },
      { id: "cta", title: "CTA Daftar", contentHint: "Form / link registrasi" },
    ],
  },
];

export function getCopyStudioTemplate(id: CopyStudioTemplateId): CopyStudioTemplate | undefined {
  return COPY_STUDIO_TEMPLATES.find((t) => t.id === id);
}
