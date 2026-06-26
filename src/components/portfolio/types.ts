// ─── Portfolio Tool Types ─────────────────────────────────────────────────────

export type Step = 1 | 2 | 3 | "result";

// ── Step 1 — Identitas ────────────────────────────────────────────────────────

export type Profesi =
  // Teknologi
  | "Frontend Developer"
  | "Backend Developer"
  | "Fullstack Developer"
  | "Mobile Developer"
  | "UI/UX Designer"
  | "AI Engineer"
  | "Data Scientist"
  | "DevOps / Cloud Engineer"
  // Desain & Kreatif
  | "Graphic Designer"
  | "Ilustrator"
  | "Motion Designer"
  | "Fotografer"
  | "Video Editor"
  | "3D Artist"
  // Konten & Marketing
  | "Content Writer"
  | "Social Media Specialist"
  | "Digital Marketer"
  | "Copywriter"
  // Bisnis
  | "Product Manager"
  | "Project Manager"
  | "Business Analyst"
  | "Founder / Indie Hacker"
  // Custom
  | "lainnya";

export interface SosialLinks {
  github?: string;
  linkedin?: string;
  instagram?: string;
  whatsapp?: string;
}

export interface IdentitasData {
  nama: string;
  profesi: Profesi | string;
  profesiCustom?: string;
  tagline: string;
  bio: string;
  kota?: string;
  email?: string;
  sosial: SosialLinks;
}

// ── Step 2 — Konten ───────────────────────────────────────────────────────────

export type ProyekTipe = "Web App" | "Mobile" | "Design" | "Writing" | "Other";

export interface Proyek {
  id: string;
  nama: string;
  deskripsi: string;
  tech?: string;
  linkDemo?: string;
  linkGithub?: string;
  tipe?: ProyekTipe;
}

export interface Layanan {
  id: string;
  nama: string;
  deskripsi?: string;
  hargaMulai?: string;
}

export interface KontenData {
  skills: string[]; // chip/tag list
  proyek: Proyek[];
  layanan: Layanan[];
}

// ── Step 3 — Desain ───────────────────────────────────────────────────────────

export type ColorThemeId =
  | "midnight-pro"
  | "ocean-depth"
  | "warm-studio"
  | "soft-minimal"
  | "purple-haze"
  | "forest-code"
  | "rose-gold"
  | "sand-sun"
  | "custom";

export interface ColorTheme {
  id: ColorThemeId;
  name: string;
  bg: string;
  primary: string;
  text: string;
  vibe: string;
}

export const COLOR_THEMES: ColorTheme[] = [
  { id: "midnight-pro", name: "Midnight Pro", bg: "#0A0A0A", primary: "#CCFF00", text: "#FFFFFF", vibe: "Dark, hacker, techy" },
  { id: "ocean-depth", name: "Ocean Depth", bg: "#0D1B2A", primary: "#00D4FF", text: "#FFFFFF", vibe: "Professional, calm" },
  { id: "warm-studio", name: "Warm Studio", bg: "#1C1410", primary: "#FF6B35", text: "#FFF8F0", vibe: "Creative, warm" },
  { id: "soft-minimal", name: "Soft Minimal", bg: "#FAFAF5", primary: "#1A1A1A", text: "#6B6B6B", vibe: "Clean, minimal" },
  { id: "purple-haze", name: "Purple Haze", bg: "#13001E", primary: "#9D4EDD", text: "#FFFFFF", vibe: "Bold, Gen-Z" },
  { id: "forest-code", name: "Forest Code", bg: "#0D1F0D", primary: "#39FF14", text: "#CCCCCC", vibe: "Matrix, terminal" },
  { id: "rose-gold", name: "Rose Gold", bg: "#1A0A0A", primary: "#FF6B9D", text: "#FFFFFF", vibe: "Feminine, elegant" },
  { id: "sand-sun", name: "Sand & Sun", bg: "#FFF8E7", primary: "#D4A017", text: "#2D2D2D", vibe: "Warm, earthy" },
];

export type FontPairId =
  | "techy-bold"
  | "editorial"
  | "classic-pro"
  | "clean-modern"
  | "creative"
  | "minimalist"
  | "ai-pick";

export interface FontPair {
  id: FontPairId;
  label: string;
  display: string;
  body: string;
  vibe: string;
}

export const FONT_PAIRS: FontPair[] = [
  { id: "techy-bold", label: "Techy Bold", display: "Unbounded", body: "JetBrains Mono", vibe: "Developer, hacker" },
  { id: "editorial", label: "Editorial", display: "Syne", body: "DM Sans", vibe: "Modern, editorial" },
  { id: "classic-pro", label: "Classic Pro", display: "Playfair Display", body: "Inter", vibe: "Profesional, elegan" },
  { id: "clean-modern", label: "Clean Modern", display: "Space Grotesk", body: "Outfit", vibe: "Startup, friendly" },
  { id: "creative", label: "Creative", display: "Bricolage Grotesque", body: "Nunito", vibe: "Kreatif, playful" },
  { id: "minimalist", label: "Minimalist", display: "Plus Jakarta Sans", body: "DM Sans", vibe: "Clean, Indonesian feel" },
  { id: "ai-pick", label: "Biarkan AI pilih", display: "—", body: "—", vibe: "AI tentukan sesuai profesi" },
];

export type Vibe =
  | "Profesional & bersih"
  | "Kreatif & berani"
  | "Mewah & elegan"
  | "Hangat & personal"
  | "Modern & techy"
  | "Minimalis & rapi"
  | "Editorial & artistik"
  | "Playful & fun";

export const VIBES: Vibe[] = [
  "Profesional & bersih",
  "Kreatif & berani",
  "Mewah & elegan",
  "Hangat & personal",
  "Modern & techy",
  "Minimalis & rapi",
  "Editorial & artistik",
  "Playful & fun",
];

export type HeroLayout = "centered" | "two-column";
export type BgEffect = "dot-grid" | "diagonal-lines" | "noise" | "geometric" | "gradient-mesh" | "plain";
export type BorderStyle = "rounded" | "slightly-rounded" | "sharp";

export interface DesignData {
  themeId: ColorThemeId;
  customBg?: string;
  customPrimary?: string;
  customText?: string;
  fontPairId: FontPairId;
  vibe?: Vibe;
  heroLayout: HeroLayout;
  bgEffect: BgEffect;
  borderStyle: BorderStyle;
  sections: {
    hero: boolean;
    skills: boolean;
    proyek: boolean;
    layanan: boolean;
    kontak: boolean;
    testimonial: boolean;
  };
}

// ── Full Form State ────────────────────────────────────────────────────────────

export interface PortfolioFormState {
  identitas: IdentitasData;
  konten: KontenData;
  design: DesignData;
}

// ── Demo Data ─────────────────────────────────────────────────────────────────

export const PROFESI_DEMO: Partial<Record<string, Partial<PortfolioFormState>>> = {
  "Frontend Developer": {
    identitas: {
      nama: "Andi Pratama",
      profesi: "Frontend Developer",
      tagline: "Frontend dev yang obsesi sama detail UI dan performa web",
      bio: "Saya seorang frontend developer dengan 2 tahun pengalaman membangun web app modern. Fokus di React, Next.js, dan Tailwind CSS.",
      kota: "Bandung, Indonesia",
      email: "andi@example.com",
      sosial: { github: "github.com/andipratama", linkedin: "linkedin.com/in/andipratama" },
    },
    konten: {
      skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Figma", "Git"],
      proyek: [
        { id: "1", nama: "SaaS Landing Page", deskripsi: "Landing page modern untuk startup SaaS dengan animasi Framer Motion", tech: "Next.js, Tailwind, Framer Motion", tipe: "Web App" },
        { id: "2", nama: "Dashboard Analytics", deskripsi: "Dashboard data interaktif dengan chart dan filter real-time", tech: "React, Recharts, Zustand", tipe: "Web App" },
      ],
      layanan: [],
    },
  },
  "UI/UX Designer": {
    identitas: {
      nama: "Dewi Sartika",
      profesi: "UI/UX Designer",
      tagline: "Desainer yang percaya bahwa produk baik dimulai dari riset yang dalam",
      bio: "UI/UX Designer dengan pengalaman 3 tahun merancang produk digital untuk startup dan korporat. Spesialis Figma dan design system.",
      kota: "Jakarta, Indonesia",
      email: "dewi@example.com",
      sosial: { linkedin: "linkedin.com/in/dewisartika", instagram: "instagram.com/dewi.design" },
    },
    konten: {
      skills: ["Figma", "FigJam", "Notion", "User Research", "Prototyping", "Design System"],
      proyek: [
        { id: "1", nama: "Redesign App Fintech", deskripsi: "Redesign UX flow onboarding dan transaksi — meningkatkan completion rate 40%", tech: "Figma, Maze, Dovetail", tipe: "Design" },
        { id: "2", nama: "Design System B2B SaaS", deskripsi: "Membangun design system dari nol untuk produk enterprise dengan 50+ komponen", tech: "Figma, Zeroheight", tipe: "Design" },
      ],
      layanan: [],
    },
  },
  "Fullstack Developer": {
    identitas: {
      nama: "Rizki Hamdani",
      profesi: "Fullstack Developer",
      tagline: "Saya build dari API sampai UI — solo, cepat, scalable",
      bio: "Fullstack developer yang suka build produk dari nol. Stack utama: Next.js, Node.js, PostgreSQL. Pernah ship 3 SaaS sebagai indie hacker.",
      kota: "Yogyakarta, Indonesia",
      email: "rizki@example.com",
      sosial: { github: "github.com/rizkihamdani", linkedin: "linkedin.com/in/rizkihamdani" },
    },
    konten: {
      skills: ["Next.js", "Node.js", "PostgreSQL", "Prisma", "Supabase", "Tailwind CSS", "TypeScript"],
      proyek: [
        { id: "1", nama: "ArroBuild Clone", deskripsi: "Platform dokumentasi AI untuk developer — 500+ users aktif", tech: "Next.js, Supabase, Gemini API", tipe: "Web App" },
        { id: "2", nama: "Invoice SaaS", deskripsi: "Aplikasi invoicing untuk freelancer Indonesia dengan integrasi Midtrans", tech: "Next.js, Prisma, Stripe", tipe: "Web App" },
      ],
      layanan: [],
    },
  },
  "Content Writer": {
    identitas: {
      nama: "Sari Indah",
      profesi: "Content Writer",
      tagline: "Kata-kata yang menggerakkan orang untuk bertindak",
      bio: "Content writer dengan pengalaman 4 tahun di industri teknologi dan startup. Ahli dalam SEO writing, copywriting, dan storytelling brand.",
      kota: "Surabaya, Indonesia",
      email: "sari@example.com",
      sosial: { linkedin: "linkedin.com/in/sariindah", instagram: "instagram.com/sari.writes" },
    },
    konten: {
      skills: ["SEO Writing", "Copywriting", "Content Strategy", "WordPress", "Notion", "Ahrefs"],
      proyek: [
        { id: "1", nama: "Blog Tech Startup", deskripsi: "Mengelola 30+ artikel/bulan untuk startup fintech — traffic organik naik 200%", tech: "WordPress, Ahrefs, Notion", tipe: "Writing" },
        { id: "2", nama: "Email Marketing Campaign", deskripsi: "Menulis 12-seri email campaign yang meningkatkan open rate 45%", tech: "Mailchimp, Canva", tipe: "Writing" },
      ],
      layanan: [],
    },
  },
};

// ── Skill Templates per Profesi ───────────────────────────────────────────────

export const SKILL_TEMPLATES: Partial<Record<string, string[]>> = {
  "Frontend Developer": ["React", "Next.js", "Vue.js", "TypeScript", "Tailwind CSS", "CSS/SCSS", "Figma", "Git", "Webpack", "Vite"],
  "Backend Developer": ["Node.js", "Python", "Go", "PostgreSQL", "MySQL", "Redis", "REST API", "GraphQL", "Docker", "AWS"],
  "Fullstack Developer": ["Next.js", "Node.js", "TypeScript", "PostgreSQL", "Prisma", "Supabase", "Tailwind CSS", "Docker", "Git"],
  "UI/UX Designer": ["Figma", "FigJam", "Adobe XD", "Prototyping", "User Research", "Design System", "Wireframing", "Usability Testing"],
  "Mobile Developer": ["React Native", "Flutter", "Swift", "Kotlin", "Expo", "Firebase", "App Store", "Google Play"],
  "AI Engineer": ["Python", "PyTorch", "TensorFlow", "LangChain", "OpenAI API", "Hugging Face", "Vector DB", "FastAPI"],
  "Data Scientist": ["Python", "Pandas", "Scikit-learn", "SQL", "Tableau", "Power BI", "Statistics", "Machine Learning"],
  "Graphic Designer": ["Adobe Illustrator", "Photoshop", "InDesign", "Figma", "Canva", "Branding", "Typography"],
  "Content Writer": ["SEO Writing", "Copywriting", "Content Strategy", "WordPress", "Notion", "Ahrefs", "Semrush"],
  "Digital Marketer": ["Google Ads", "Meta Ads", "SEO", "Analytics", "Email Marketing", "Content Marketing", "CRM"],
  "Product Manager": ["Notion", "Jira", "Figma", "User Research", "A/B Testing", "Analytics", "Roadmapping", "Agile"],
};
