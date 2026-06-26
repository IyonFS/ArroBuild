// ─── Learn Hub Content Store ─────────────────────────────────────────────────
// All content is static TypeScript — no CMS. Easy to migrate to MDX later.

export type LessonLevel = "pemula" | "menengah" | "lanjut";

export type BlockType =
  | "text"
  | "code"
  | "callout"
  | "tip"
  | "warning"
  | "cta-link"
  | "heading"
  | "list";

export interface Block {
  type: BlockType;
  content?: string;
  language?: string; // for code blocks
  label?: string;    // for callout/tip/warning titles, cta-link text
  href?: string;     // for cta-link
  items?: string[];  // for list
}

export interface Lesson {
  slug: string;
  title: string;
  estimasi: string; // e.g. "5 menit"
  blocks: Block[];
}

export interface LearningPath {
  slug: string;
  title: string;
  description: string;
  level: LessonLevel;
  estimasi: string;  // e.g. "30 menit"
  tag: string;
  icon: string;
  featured?: boolean;
  lessons: Lesson[];
}

// ─── Path 1: Vibe Coding 101 ──────────────────────────────────────────────────

const vibeCoding101: LearningPath = {
  slug: "vibe-coding-101",
  title: "Vibe Coding 101",
  description:
    "Panduan lengkap untuk developer yang baru mau mulai membangun dengan AI agent. Dari nol sampai deploy project pertamamu.",
  level: "pemula",
  estimasi: "45 menit",
  tag: "Gratis",
  icon: "🚀",
  featured: true,
  lessons: [
    {
      slug: "apa-itu-vibe-coding",
      title: "Apa itu Vibe Coding?",
      estimasi: "5 menit",
      blocks: [
        {
          type: "text",
          content:
            "Vibe coding adalah cara baru membangun software — kamu mendeskripsikan apa yang kamu mau, dan AI agent yang mengeksekusinya. Bukan magic, tapi kolaborasi yang efektif antara kamu sebagai arsitek dan AI sebagai eksekutor.",
        },
        {
          type: "heading",
          content: "Kenapa ini berbeda dari coding biasa?",
        },
        {
          type: "list",
          items: [
            "Kamu fokus pada **apa** yang ingin dibangun, bukan **bagaimana** cara coding-nya",
            "AI menulis kode, kamu mereview dan mengarahkan",
            "Kecepatan iterasi 5–10x lebih cepat dari coding manual",
            "Tetap butuh pemahaman arsitektur — AI bukan pengganti berpikir",
          ],
        },
        {
          type: "callout",
          label: "Penting",
          content:
            "Vibe coding efektif bukan karena kamu tidak perlu berpikir — justru sebaliknya. Kamu harus bisa mendeskripsikan masalah dengan jelas, mereview output AI, dan tahu kapan output-nya salah.",
        },
        {
          type: "heading",
          content: "Ekosistem AI Coding Tools",
        },
        {
          type: "text",
          content:
            "Ada beberapa tools utama yang dipakai untuk vibe coding saat ini:",
        },
        {
          type: "list",
          items: [
            "**Cursor** — Code editor berbasis VSCode dengan AI built-in. Paling populer untuk vibe coding.",
            "**Claude Code** — CLI dari Anthropic, powerful untuk project besar.",
            "**Windsurf** — IDE dari Codeium, mirip Cursor dengan fitur agentic.",
            "**Cline** — Extension VSCode untuk agentic coding.",
          ],
        },
        {
          type: "tip",
          label: "Rekomendasi untuk pemula",
          content:
            "Mulai dengan Cursor. Setup-nya paling mudah dan komunitas Indonesia-nya paling aktif.",
        },
        {
          type: "heading",
          content: "Apa peran dokumentasi di sini?",
        },
        {
          type: "text",
          content:
            "Ini inti dari ArroBuild. AI agent bekerja jauh lebih baik ketika kamu kasih konteks yang jelas — lewat file dokumentasi seperti PRD, context.md, dan design-system.md. Tanpa dokumentasi yang baik, output AI sering meleset dari ekspektasi.",
        },
        {
          type: "cta-link",
          label: "Generate dokumentasi proyekmu sekarang →",
          href: "/generate",
        },
      ],
    },
    {
      slug: "setup-ai-agent",
      title: "Setup AI Agent Pertama",
      estimasi: "10 menit",
      blocks: [
        {
          type: "text",
          content:
            "Tutorial ini menggunakan Cursor sebagai contoh — tapi prinsipnya sama untuk semua tools. Kita akan setup dari nol sampai AI agent siap digunakan.",
        },
        {
          type: "heading",
          content: "1. Install Cursor",
        },
        {
          type: "text",
          content:
            "Download Cursor dari cursor.com. Tersedia untuk Mac, Windows, dan Linux. Install seperti aplikasi biasa.",
        },
        {
          type: "code",
          language: "bash",
          content: `# Cursor tersedia di: https://cursor.com
# Setelah install, verifikasi dengan buka terminal bawaan Cursor
cursor --version`,
        },
        {
          type: "heading",
          content: "2. Pilih Model AI",
        },
        {
          type: "text",
          content:
            "Di Cursor, buka Settings → Models. Pilih model yang ingin digunakan. Untuk pemula, gunakan Claude Sonnet atau GPT-4o.",
        },
        {
          type: "tip",
          label: "Model yang direkomendasikan",
          content:
            "Claude Sonnet 4 adalah pilihan terbaik untuk coding saat ini — output-nya konsisten dan mengikuti instruksi dengan baik.",
        },
        {
          type: "heading",
          content: "3. Buat File .cursorrules",
        },
        {
          type: "text",
          content:
            "File ini adalah instruksi permanen untuk AI agent kamu. Taruh di root project. AI akan membacanya setiap kali memberikan saran.",
        },
        {
          type: "code",
          language: "markdown",
          content: `# .cursorrules

## Project Context
Ini adalah [nama project kamu]. [Deskripsi singkat].

## Tech Stack
- Framework: Next.js 14 (App Router)
- Styling: Tailwind CSS
- Database: PostgreSQL + Prisma

## Coding Rules
- Gunakan TypeScript strict mode
- Semua komponen harus functional, bukan class
- Nama variabel dalam bahasa Inggris
- Komentar kode boleh bahasa Indonesia

## Folder Structure
- /app — Next.js routes
- /components — Reusable components
- /lib — Utilities dan helpers`,
        },
        {
          type: "heading",
          content: "4. Test dengan Prompt Pertama",
        },
        {
          type: "text",
          content:
            'Buka Cursor, tekan Cmd+L (Mac) atau Ctrl+L (Windows) untuk buka chat. Coba prompt sederhana dulu untuk verifikasi AI sudah membaca .cursorrules kamu.',
        },
        {
          type: "code",
          language: "text",
          content: `Buatkan saya komponen Button sederhana sesuai stack yang ada di .cursorrules.
Gunakan TypeScript dan Tailwind CSS.`,
        },
        {
          type: "callout",
          label: "Setup selesai!",
          content:
            "Kalau AI memberikan output yang sesuai dengan stack kamu, berarti setup sudah benar. Sekarang saatnya buat dokumentasi yang lebih lengkap.",
        },
        {
          type: "cta-link",
          label: "Generate .cursorrules lengkap dengan ArroBuild →",
          href: "/generate",
        },
      ],
    },
    {
      slug: "cara-buat-prd",
      title: "Cara Buat PRD yang Baik",
      estimasi: "8 menit",
      blocks: [
        {
          type: "text",
          content:
            "PRD (Product Requirements Document) adalah dokumen paling penting dalam vibe coding. Ini adalah 'source of truth' yang dibaca AI setiap kali kamu mulai sesi baru.",
        },
        {
          type: "heading",
          content: "Kenapa PRD itu penting?",
        },
        {
          type: "list",
          items: [
            "AI tidak punya memori — setiap sesi dimulai dari nol",
            "PRD yang baik = AI langsung paham konteks tanpa penjelasan panjang",
            "Mengurangi 'AI hallucination' karena konteks jelas",
            "Dokumen ini juga berguna untuk kamu sendiri saat project besar",
          ],
        },
        {
          type: "heading",
          content: "Anatomi PRD yang Baik",
        },
        {
          type: "code",
          language: "markdown",
          content: `# Product Requirements Document
## [Nama Project]

### Overview
Satu paragraf yang menjelaskan apa produk ini dan untuk siapa.

### Problem Statement
Masalah spesifik apa yang dipecahkan? Kenapa solusi yang ada sekarang tidak cukup?

### Target Users
- **Primary:** [Siapa user utama, karakteristiknya]
- **Secondary:** [User sekunder kalau ada]

### Core Features (MVP)
1. [Feature 1] — [deskripsi singkat]
2. [Feature 2] — [deskripsi singkat]
3. [Feature 3] — [deskripsi singkat]

### Non-Goals (Explicitly Out of Scope)
- [Apa yang tidak akan dibangun di MVP]
- [Ini penting — tanpa ini AI sering menambah fitur sendiri]

### Tech Stack
- Frontend: Next.js 14
- Backend: same (monorepo)
- DB: PostgreSQL + Prisma
- Auth: Supabase
- Deploy: Vercel

### Success Metrics
- [Metric 1] — target: [angka]
- [Metric 2] — target: [angka]`,
        },
        {
          type: "warning",
          label: "Kesalahan umum",
          content:
            'PRD yang terlalu panjang dan tidak terstruktur justru membingungkan AI. Targetkan maksimal 1–2 halaman untuk MVP. Kalau perlu detail, pisahkan ke dokumen lain (context.md, plan.md).',
        },
        {
          type: "heading",
          content: "Tips Praktis",
        },
        {
          type: "list",
          items: [
            "Tulis **Non-Goals** — ini seringkali lebih penting dari Goals",
            "Spesifik soal tech stack, jangan hanya tulis 'React'",
            "Update PRD setiap kali ada perubahan signifikan",
            "Taruh PRD di root project sebagai `prd.md`",
          ],
        },
        {
          type: "cta-link",
          label: "Generate PRD otomatis dengan AI →",
          href: "/generate",
        },
      ],
    },
    {
      slug: "iterasi-cepat",
      title: "Iterasi Cepat dengan AI",
      estimasi: "7 menit",
      blocks: [
        {
          type: "text",
          content:
            "Salah satu keahlian terpenting dalam vibe coding adalah bisa memberikan feedback yang jelas dan efisien ke AI. Iterasi yang baik = progress yang cepat.",
        },
        {
          type: "heading",
          content: "Pola Iterasi yang Efektif",
        },
        {
          type: "list",
          items: [
            "**Small tasks** — Satu prompt, satu tugas. Jangan minta terlalu banyak sekaligus.",
            "**Specific feedback** — Bukan 'ini salah', tapi 'bagian X seharusnya Y karena Z'",
            "**Show, don't tell** — Kalau bisa, paste code yang salah dan jelaskan yang diinginkan",
            "**Reset context** — Kalau AI mulai 'confused', mulai sesi baru dengan konteks bersih",
          ],
        },
        {
          type: "heading",
          content: "Contoh: Prompt yang Buruk vs Baik",
        },
        {
          type: "code",
          language: "text",
          content: `# ❌ Prompt buruk
"Buatkan auth system lengkap"

# ✅ Prompt baik
"Buatkan halaman login dengan form email + password.
Gunakan Supabase Auth untuk handle submit.
Redirect ke /dashboard setelah berhasil login.
Tampilkan error message jika login gagal.
Ikuti komponen yang sudah ada di /components/ui/Button.tsx"`,
        },
        {
          type: "heading",
          content: "Teknik: Context Stuffing",
        },
        {
          type: "text",
          content:
            "Di awal setiap sesi baru, paste ringkasan konteks ke AI. Ini memastikan AI tidak membuat keputusan yang bertentangan dengan keputusan sebelumnya.",
        },
        {
          type: "code",
          language: "text",
          content: `Konteks project:
- Stack: Next.js 14, TypeScript, Tailwind, Supabase
- Sejauh ini sudah ada: auth (email+password), dashboard page, user profile
- Konvensi: semua komponen ada di /components, API routes di /app/api
- Sudah diputuskan: tidak pakai Redux, state management pakai React Context

Sekarang saya mau: [tugas spesifik kamu]`,
        },
        {
          type: "tip",
          label: "Gunakan context.md",
          content:
            "File context.md yang dihasilkan ArroBuild sudah berisi semua konteks ini dalam format yang siap paste ke AI agent.",
        },
        {
          type: "heading",
          content: "Kapan Harus Stop dan Refactor?",
        },
        {
          type: "list",
          items: [
            "AI mulai memberikan solusi yang semakin kompleks untuk masalah sederhana",
            "Kode susah dibaca dan banyak duplikasi",
            "Bug baru muncul setiap kali fix bug lama",
            "Context window AI sudah terlalu panjang (sesi >2 jam)",
          ],
        },
        {
          type: "callout",
          label: "Prinsip penting",
          content:
            "Kamu adalah arsitek, AI adalah eksekutor. Kalau arsitekturnya jelek, output AI juga akan jelek. Invest waktu di perencanaan — itu pekerjaan kamu.",
        },
      ],
    },
    {
      slug: "deploy-project",
      title: "Deploy Project Pertamamu",
      estimasi: "10 menit",
      blocks: [
        {
          type: "text",
          content:
            "Deploy adalah momen validasi — apakah kode yang ditulis AI benar-benar berjalan di environment production. Tutorial ini fokus pada Vercel (paling simple untuk Next.js).",
        },
        {
          type: "heading",
          content: "Persiapan Sebelum Deploy",
        },
        {
          type: "list",
          items: [
            "Semua environment variables sudah di-set di `.env.local`",
            "Build lokal berhasil: `npm run build` tidak error",
            "Git repository sudah ada (GitHub/GitLab/Bitbucket)",
            "Database production sudah siap (kalau pakai database)",
          ],
        },
        {
          type: "heading",
          content: "Deploy ke Vercel",
        },
        {
          type: "code",
          language: "bash",
          content: `# 1. Install Vercel CLI
npm i -g vercel

# 2. Login ke Vercel
vercel login

# 3. Deploy (dari root project)
vercel

# 4. Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
# ... tambahkan semua env vars yang dibutuhkan

# 5. Re-deploy dengan env vars baru
vercel --prod`,
        },
        {
          type: "tip",
          label: "Cara lebih mudah",
          content:
            "Hubungkan GitHub repo ke Vercel dashboard. Setiap push ke main branch otomatis trigger deploy. Tidak perlu CLI.",
        },
        {
          type: "heading",
          content: "Checklist Pre-Launch",
        },
        {
          type: "list",
          items: [
            "✅ Custom domain sudah di-set (atau pakai .vercel.app dulu)",
            "✅ HTTPS aktif otomatis di Vercel",
            "✅ Environment variables production sudah benar",
            "✅ Database migrations sudah dijalankan",
            "✅ Test core flow: register → login → main action",
            "✅ Mobile responsive sudah di-cek",
            "✅ Error monitoring sudah dipasang (Sentry, dsb)",
          ],
        },
        {
          type: "warning",
          label: "Jangan lupa",
          content:
            "Pastikan environment variables production berbeda dari development. Terutama database URL, secret keys, dan API keys.",
        },
        {
          type: "heading",
          content: "Selamat! Apa selanjutnya?",
        },
        {
          type: "text",
          content:
            "Project pertamamu sudah live. Sekarang saatnya iterasi berdasarkan feedback pengguna nyata. Vibe coding di production environment berbeda — kamu harus lebih berhati-hati dengan perubahan yang langsung affects users.",
        },
        {
          type: "cta-link",
          label: "Generate dokumentasi untuk project berikutnya →",
          href: "/generate",
        },
      ],
    },
  ],
};

// ─── Path 2: PRD & Documentation ─────────────────────────────────────────────

const prdDocumentation: LearningPath = {
  slug: "prd-dan-dokumentasi",
  title: "PRD & Documentation",
  description:
    "Pelajari cara membuat dokumentasi teknis yang benar-benar berguna untuk AI agent. Core use case ArroBuild.",
  level: "pemula",
  estimasi: "35 menit",
  tag: "Gratis",
  icon: "📝",
  lessons: [
    {
      slug: "kenapa-dokumentasi-penting",
      title: "Kenapa Dokumentasi itu Penting?",
      estimasi: "5 menit",
      blocks: [
        {
          type: "text",
          content:
            "Di era AI agent, dokumentasi bukan lagi untuk manusia — tapi untuk machine. AI perlu konteks yang terstruktur untuk bisa bekerja secara konsisten.",
        },
        {
          type: "heading",
          content: "Dokumentasi sebagai Konteks AI",
        },
        {
          type: "text",
          content:
            "Setiap kali kamu membuka sesi baru dengan Cursor atau Claude Code, AI tidak punya memori dari sesi sebelumnya. Tanpa dokumentasi, kamu harus menjelaskan ulang konteks setiap kali — buang waktu.",
        },
        {
          type: "list",
          items: [
            "**PRD** → AI tahu apa yang harus dibangun",
            "**context.md** → AI tahu state project saat ini",
            "**design-system.md** → AI tahu style yang konsisten",
            "**agents.md** → AI tahu role dan batasan kerjanya",
          ],
        },
        {
          type: "callout",
          label: "Insight",
          content:
            "Developer yang punya dokumentasi lengkap bisa memberikan task ke AI yang 5x lebih kompleks dan tetap mendapat output yang benar.",
        },
        {
          type: "cta-link",
          label: "Generate semua dokumentasi sekarang →",
          href: "/generate",
        },
      ],
    },
    {
      slug: "anatomi-prd",
      title: "Anatomi PRD yang Baik",
      estimasi: "8 menit",
      blocks: [
        {
          type: "text",
          content:
            "PRD yang baik bukan yang paling panjang — tapi yang paling jelas. Ini panduan section by section.",
        },
        {
          type: "heading",
          content: "Section yang Wajib Ada",
        },
        {
          type: "list",
          items: [
            "**Overview** — Apa produk ini, untuk siapa, kenapa ada",
            "**Problem Statement** — Masalah spesifik yang dipecahkan",
            "**Core Features** — Fitur MVP, tidak lebih",
            "**Non-Goals** — Apa yang *tidak* dibangun (sangat penting!)",
            "**Tech Stack** — Stack yang spesifik, bukan generik",
          ],
        },
        {
          type: "tip",
          label: "Non-Goals adalah kunci",
          content:
            "Tanpa Non-Goals, AI sering menambahkan fitur yang tidak diminta. Tulis explicit: 'Tidak akan ada multi-tenancy di fase ini.'",
        },
        {
          type: "cta-link",
          label: "Generate PRD otomatis →",
          href: "/generate",
        },
      ],
    },
    {
      slug: "context-md",
      title: "context.md: Master Reference",
      estimasi: "7 menit",
      blocks: [
        {
          type: "text",
          content:
            "context.md adalah dokumen living — terus diupdate seiring project berkembang. Ini adalah 'state of the project' yang dibaca AI di awal setiap sesi.",
        },
        {
          type: "heading",
          content: "Apa yang Masuk ke context.md?",
        },
        {
          type: "list",
          items: [
            "Status fitur yang sudah selesai vs masih dalam pengerjaan",
            "Keputusan arsitektur yang sudah dibuat (dan alasannya)",
            "Known issues dan workarounds",
            "Konvensi naming dan struktur folder",
            "Dependencies penting dan versinya",
          ],
        },
        {
          type: "warning",
          label: "Update rutin",
          content:
            "context.md yang outdated lebih berbahaya dari tidak ada. Set reminder untuk update setiap milestone penting.",
        },
      ],
    },
    {
      slug: "design-system-md",
      title: "design-system.md: Panduan Konsistensi",
      estimasi: "6 menit",
      blocks: [
        {
          type: "text",
          content:
            "design-system.md memastikan semua komponen yang dibuat AI konsisten secara visual. Tanpa ini, tiap sesi bisa menghasilkan style yang berbeda.",
        },
        {
          type: "heading",
          content: "Apa yang Ada di design-system.md?",
        },
        {
          type: "list",
          items: [
            "Color palette (hex values, tidak hanya nama warna)",
            "Typography: font family, size scale, weight",
            "Spacing system (4px grid, dll)",
            "Component patterns: Button, Input, Card, dll",
            "Animation dan transition standards",
          ],
        },
        {
          type: "cta-link",
          label: "Generate design-system.md →",
          href: "/generate",
        },
      ],
    },
    {
      slug: "agents-md",
      title: "agents.md: Role Setup untuk AI Agent",
      estimasi: "6 menit",
      blocks: [
        {
          type: "text",
          content:
            "agents.md mendefinisikan bagaimana AI agent harus berperilaku di project kamu — role-nya, batasannya, dan workflow-nya.",
        },
        {
          type: "heading",
          content: "Kenapa Perlu agents.md?",
        },
        {
          type: "list",
          items: [
            "AI yang tahu 'role'-nya akan lebih fokus dan konsisten",
            "Bisa define: 'Jangan pernah ubah file ini tanpa konfirmasi'",
            "Workflow multi-agent: setiap agent punya tugasnya sendiri",
            "Safety rails: batasan apa yang boleh dan tidak boleh dilakukan AI",
          ],
        },
        {
          type: "code",
          language: "markdown",
          content: `# agents.md — AI Agent Configuration

## Role Definition
Kamu adalah software engineer senior yang membantu membangun [nama project].

## What You Can Do
- Buat dan edit file di /components, /app, /lib
- Tulis unit test untuk kode yang kamu buat
- Refactor kode yang ada sesuai instruksi

## What You Must NOT Do
- Jangan ubah file di /prisma/migrations
- Jangan edit .env files
- Jangan hapus file tanpa konfirmasi eksplisit

## Coding Standards
- TypeScript strict mode
- Functional components only
- No any types`,
        },
        {
          type: "cta-link",
          label: "Generate agents.md untuk project kamu →",
          href: "/generate",
        },
      ],
    },
  ],
};

// ─── Path 3: Agent Engineering ────────────────────────────────────────────────

const agentEngineering: LearningPath = {
  slug: "agent-engineering",
  title: "Agent Engineering",
  description:
    "Dari vibe coding ke agentic workflows. Pelajari cara membangun sistem multi-agent yang scalable.",
  level: "menengah",
  estimasi: "50 menit",
  tag: "Gratis",
  icon: "🤖",
  lessons: [
    {
      slug: "apa-itu-ai-agent",
      title: "Apa itu AI Agent?",
      estimasi: "8 menit",
      blocks: [
        {
          type: "text",
          content:
            "AI agent bukan sekadar chatbot — ini adalah sistem yang bisa mengambil aksi, menggunakan tools, dan menyelesaikan tugas multi-step secara otonom.",
        },
        {
          type: "heading",
          content: "Perbedaan AI Agent vs Chatbot",
        },
        {
          type: "list",
          items: [
            "**Chatbot**: Menjawab pertanyaan → selesai",
            "**AI Agent**: Menerima goal → planning → eksekusi multi-step → deliver hasil",
          ],
        },
        {
          type: "callout",
          label: "Contoh nyata",
          content:
            "Cursor dalam mode agentic bisa: membaca codebase → menemukan bug → menulis fix → membuat test → menjalankan test → report hasilnya. Semua tanpa intervensi manusia.",
        },
        {
          type: "cta-link",
          label: "Coba generate project foundation →",
          href: "/generate",
        },
      ],
    },
    {
      slug: "multi-agent-workflow",
      title: "Multi-Agent Workflow",
      estimasi: "10 menit",
      blocks: [
        {
          type: "text",
          content:
            "Satu agent punya keterbatasan context window. Untuk project besar, kamu butuh workflow multi-agent di mana setiap agent punya spesialisasi.",
        },
        {
          type: "heading",
          content: "Contoh Setup Multi-Agent",
        },
        {
          type: "list",
          items: [
            "**Architect Agent** — Merancang arsitektur sistem",
            "**Frontend Agent** — Fokus UI/UX, komponen",
            "**Backend Agent** — API, database, business logic",
            "**QA Agent** — Testing, review kode",
          ],
        },
        {
          type: "tip",
          label: "Mulai simple",
          content:
            "Tidak perlu langsung multi-agent. Kuasai single-agent workflow dulu, baru scale ke multi-agent.",
        },
      ],
    },
    {
      slug: "prompt-engineering-dasar",
      title: "Prompt Engineering Dasar",
      estimasi: "10 menit",
      blocks: [
        {
          type: "text",
          content:
            "Prompt yang baik adalah investasi terbaik dalam vibe coding. 5 menit untuk menulis prompt yang tepat bisa menghemat 30 menit debugging.",
        },
        {
          type: "heading",
          content: "Framework RICE untuk Prompt",
        },
        {
          type: "list",
          items: [
            "**R**ole — Definisikan peran AI ('Kamu adalah senior React developer')",
            "**I**nstructions — Tugas yang spesifik dan terukur",
            "**C**ontext — Background yang dibutuhkan AI untuk memahami tugas",
            "**E**xamples — Contoh output yang diinginkan",
          ],
        },
        {
          type: "cta-link",
          label: "Lihat template agents.md →",
          href: "/generate",
        },
      ],
    },
    {
      slug: "context-window-management",
      title: "Context Window Management",
      estimasi: "8 menit",
      blocks: [
        {
          type: "text",
          content:
            "Context window adalah memori kerja AI — terbatas, dan kalau penuh, kualitas output turun. Manajemen context yang baik adalah kunci konsistensi.",
        },
        {
          type: "heading",
          content: "Teknik Manajemen Context",
        },
        {
          type: "list",
          items: [
            "Mulai sesi baru untuk setiap task besar",
            "Compress context: ringkas percakapan panjang sebelum lanjut",
            "Pin files penting di Cursor menggunakan @file",
            "Hapus file yang tidak relevan dari context",
          ],
        },
        {
          type: "warning",
          label: "Red flag",
          content:
            "Kalau AI mulai mengulang instruksi yang sudah diberikan atau lupa keputusan yang baru dibuat, context window mungkin sudah terlalu penuh.",
        },
      ],
    },
    {
      slug: "debugging-output-ai",
      title: "Debugging Output AI",
      estimasi: "10 menit",
      blocks: [
        {
          type: "text",
          content:
            "AI tidak selalu benar. Knowing how to debug AI output adalah skill critical yang sering diabaikan pemula.",
        },
        {
          type: "heading",
          content: "Pola Error Output AI yang Umum",
        },
        {
          type: "list",
          items: [
            "**Hallucination** — AI membuat fungsi/library yang tidak ada",
            "**Context confusion** — AI mencampur instruksi dari sesi berbeda",
            "**Over-engineering** — Solusi terlalu kompleks untuk masalah sederhana",
            "**Incomplete implementation** — AI berhenti di tengah jalan",
          ],
        },
        {
          type: "tip",
          label: "Cara debug efektif",
          content:
            "Paste error message + kode yang error ke AI. Jangan cuma paste error — AI butuh konteks untuk debug dengan baik.",
        },
        {
          type: "cta-link",
          label: "Generate dokumentasi untuk project kamu →",
          href: "/generate",
        },
      ],
    },
  ],
};

// ─── Path 4: Tools & Integrations ────────────────────────────────────────────

const toolsIntegrations: LearningPath = {
  slug: "tools-dan-integrasi",
  title: "Tools & Integrations",
  description:
    "Setup Cursor, Claude Code, dan tools lainnya dari nol. Cara export dan integrasi output ArroBuild.",
  level: "pemula",
  estimasi: "40 menit",
  tag: "Gratis",
  icon: "🔧",
  lessons: [
    {
      slug: "setup-cursor",
      title: "Setup Cursor dari Nol",
      estimasi: "8 menit",
      blocks: [
        {
          type: "text",
          content:
            "Panduan lengkap setup Cursor untuk produktivitas maksimal — dari install sampai konfigurasi advanced.",
        },
        {
          type: "heading",
          content: "Konfigurasi Dasar",
        },
        {
          type: "list",
          items: [
            "Install Cursor dari cursor.com",
            "Set model ke Claude Sonnet atau GPT-4o",
            "Enable 'Auto-run' untuk mode agentic",
            "Set max tokens yang cukup (jangan pelit, ini tentukan kualitas output)",
          ],
        },
        {
          type: "cta-link",
          label: "Generate .cursorrules untuk project kamu →",
          href: "/generate",
        },
      ],
    },
    {
      slug: "claude-code-workflow",
      title: "Claude Code Workflow",
      estimasi: "8 menit",
      blocks: [
        {
          type: "text",
          content:
            "Claude Code adalah CLI tool dari Anthropic. Cocok untuk project besar yang butuh long-running agentic tasks.",
        },
        {
          type: "code",
          language: "bash",
          content: `# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Set API key
export ANTHROPIC_API_KEY=sk-...

# Jalankan di project kamu
cd my-project
claude`,
        },
        {
          type: "tip",
          label: "CLAUDE.md",
          content:
            "Taruh file CLAUDE.md di root project — Claude Code akan membacanya otomatis setiap kali dijalankan. ArroBuild bisa generate file ini untuk kamu.",
        },
        {
          type: "cta-link",
          label: "Generate CLAUDE.md →",
          href: "/generate",
        },
      ],
    },
    {
      slug: "cursorrules-explained",
      title: ".cursorrules Explained",
      estimasi: "8 menit",
      blocks: [
        {
          type: "text",
          content:
            ".cursorrules adalah file konfigurasi yang memberikan instruksi permanen ke Cursor AI. Ini dibaca otomatis di setiap sesi.",
        },
        {
          type: "heading",
          content: "Anatomy .cursorrules",
        },
        {
          type: "list",
          items: [
            "Project context dan tech stack",
            "Coding conventions dan standards",
            "File structure dan naming rules",
            "Forbidden actions (jangan hapus X, jangan ubah Y)",
            "Preferred patterns dan anti-patterns",
          ],
        },
        {
          type: "cta-link",
          label: "Generate .cursorrules →",
          href: "/generate",
        },
      ],
    },
    {
      slug: "claude-md-best-practices",
      title: "CLAUDE.md Best Practices",
      estimasi: "8 menit",
      blocks: [
        {
          type: "text",
          content:
            "CLAUDE.md adalah versi Anthropic dari .cursorrules — tapi dengan beberapa perbedaan format penting.",
        },
        {
          type: "list",
          items: [
            "Lebih verbose dari .cursorrules — Claude Code bisa handle konteks lebih panjang",
            "Bisa include examples lebih banyak",
            "Support sub-sections untuk project yang kompleks",
            "Bisa reference file lain menggunakan @filename",
          ],
        },
        {
          type: "cta-link",
          label: "Generate CLAUDE.md →",
          href: "/generate",
        },
      ],
    },
    {
      slug: "export-integrasi-arrobuild",
      title: "Export & Integrasi ArroBuild",
      estimasi: "6 menit",
      blocks: [
        {
          type: "text",
          content:
            "Output ArroBuild dirancang untuk langsung dipakai — tidak perlu modifikasi manual.",
        },
        {
          type: "heading",
          content: "Cara Gunakan Output",
        },
        {
          type: "list",
          items: [
            "Download ZIP → extract ke root project",
            "prd.md → taruh di root, reference di .cursorrules",
            "context.md → paste di awal setiap sesi AI baru",
            "design-system.md → reference di .cursorrules untuk UI work",
            "agents.md → paste sebagai system prompt di Claude",
          ],
        },
        {
          type: "callout",
          label: "Pro tip",
          content:
            "Buat file README.md yang list semua docs yang ada di project dan cara penggunaannya. Ini memudahkan onboarding AI agent baru.",
        },
        {
          type: "cta-link",
          label: "Generate semua file →",
          href: "/generate",
        },
      ],
    },
  ],
};

// ─── All Learning Paths ───────────────────────────────────────────────────────

export const LEARNING_PATHS: LearningPath[] = [
  vibeCoding101,
  prdDocumentation,
  agentEngineering,
  toolsIntegrations,
];

export function getPath(slug: string): LearningPath | undefined {
  return LEARNING_PATHS.find((p) => p.slug === slug);
}

export function getLesson(
  pathSlug: string,
  lessonSlug: string
): { path: LearningPath; lesson: Lesson; index: number } | undefined {
  const path = getPath(pathSlug);
  if (!path) return undefined;
  const index = path.lessons.findIndex((l) => l.slug === lessonSlug);
  if (index === -1) return undefined;
  return { path, lesson: path.lessons[index], index };
}
