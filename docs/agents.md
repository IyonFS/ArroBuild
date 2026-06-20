# ArroBuild — AI Agents

> File ini mendefinisikan semua AI agent yang bekerja dalam ekosistem ArroBuild, baik agent yang berjalan di dalam produk (untuk generate dokumentasi) maupun agent yang direkomendasikan kepada user untuk digunakan bersama dokumentasi yang dihasilkan.

---

## Bagian 1: Internal Agents (ArroBuild System)

Agent-agent ini berjalan di backend ArroBuild dan bertanggung jawab menghasilkan setiap file dokumentasi.

---

### 1.1 Orchestrator Agent

**Peran:** Koordinator utama seluruh proses generation.

**Tanggung Jawab:**
- Menerima input dari user (idea, clarification answers, preset selection)
- Menentukan urutan generation yang optimal
- Meneruskan context dari satu file ke file berikutnya
- Menangani error dan fallback jika satu agent gagal
- Memvalidasi output sebelum dikirim ke user

**Input:**
```json
{
  "idea": "string",
  "clarifications": { "platform": "web", "monetization": "freemium", "scope": "mvp" },
  "presets": { "framework": "nextjs", "design": "linear", "agent_tool": "cursor" }
}
```

**Output:** Ordered list of generated files dengan status per file.

**Model:** `claude-sonnet-4-6`

---

### 1.2 Product Strategist Agent

**Peran:** Menganalisis idea dan menghasilkan `prd.md`.

**Tanggung Jawab:**
- Mengekstrak problem statement dari deskripsi idea user
- Mendefinisikan target user dan segmentasinya
- Menentukan fitur MVP vs nice-to-have
- Menulis user stories yang actionable
- Menetapkan success metrics yang measurable

**Prompt System:**
```
You are a senior product strategist with experience building B2B SaaS and developer tools.
Analyze the user's idea and produce a structured PRD document.
Focus on: clarity of problem, specificity of target user, realistic MVP scope.
Output format: Markdown, structured with clear sections.
Language: Match the user's input language (Indonesian or English).
```

**Context yang dibutuhkan:** Idea input + clarification answers  
**Menghasilkan:** `prd.md`

---

### 1.3 Design Architect Agent

**Peran:** Menghasilkan `design-system.md` dan `ui-rules.md`.

**Tanggung Jawab:**
- Memilih color palette berdasarkan design preset yang dipilih
- Mendefinisikan typography scale
- Menentukan spacing system
- Menulis component guidelines
- Menyusun UI/UX rules yang spesifik untuk produk

**Preset Mapping:**

| Design Preset | Karakteristik |
|---|---|
| **Apple** | SF Pro font, generous whitespace, subtle shadows, rounded corners xl, neutral palette |
| **Linear** | Inter font, dark mode first, purple accent, monospace code blocks, tight spacing |
| **Stripe** | Inter font, clean white, indigo/violet accent, heavy use of tables, enterprise feel |
| **Notion** | Inter font, minimal styling, serif for headings, lots of whitespace, neutral grays |
| **Vercel** | Geist font, dark mode first, white accent on dark, monospace heavy, sharp corners |

**Context yang dibutuhkan:** Idea input + design preset  
**Menghasilkan:** `design-system.md`, `ui-rules.md`

---

### 1.4 Flow Mapper Agent

**Peran:** Menghasilkan `user-flow.md`.

**Tanggung Jawab:**
- Memetakan semua halaman yang diperlukan aplikasi
- Mendefinisikan alur dari landing page hingga core feature
- Mengidentifikasi edge cases dan error states
- Menentukan entry points dan exit points per flow
- Memastikan flow konsisten dengan fitur di PRD

**Context yang dibutuhkan:** `prd.md` (output Product Strategist Agent)  
**Menghasilkan:** `user-flow.md`

---

### 1.5 Database Architect Agent

**Peran:** Menghasilkan `database-schema.md`.

**Tanggung Jawab:**
- Mengidentifikasi entitas utama dari PRD
- Mendefinisikan relasi antar tabel
- Menentukan tipe data yang tepat per field
- Mempertimbangkan kebutuhan indeks untuk performa
- Menyesuaikan schema dengan framework yang dipilih

**Framework-specific rules:**
- **Laravel** → snake_case, timestamps standar (created_at, updated_at), soft deletes dengan deleted_at
- **Next.js** → camelCase atau snake_case (Prisma convention), UUID sebagai primary key
- **Django** → snake_case, auto-id, menggunakan Django model conventions
- **Rails** → snake_case, integer id, timestamps otomatis
- **FastAPI** → snake_case, UUID atau integer sesuai kebutuhan

**Context yang dibutuhkan:** `prd.md`, framework preset  
**Menghasilkan:** `database-schema.md`

---

### 1.6 Stack Advisor Agent

**Peran:** Menghasilkan `tech-stack.md`.

**Tanggung Jawab:**
- Merekomendasikan stack berdasarkan framework preset
- Menjelaskan justifikasi setiap pilihan teknologi
- Menyertakan package dan library yang direkomendasikan
- Menentukan development tools dan CI/CD
- Mempertimbangkan skala dan budget (indie hacker perspective)

**Stack Templates per Framework:**

| Framework | Default Stack |
|---|---|
| **Next.js** | Next.js 14 + Tailwind + shadcn/ui + Supabase + Prisma + Stripe + Vercel |
| **Laravel** | Laravel 12 + Filament + PostgreSQL + Horizon + Cashier + Forge/Vapor |
| **Django** | Django 5 + DRF + PostgreSQL + Celery + Stripe + Railway |
| **Rails** | Rails 7 + Hotwire + PostgreSQL + Sidekiq + Stripe + Fly.io |
| **FastAPI** | FastAPI + SQLAlchemy + PostgreSQL + Redis + Stripe + Railway |

**Context yang dibutuhkan:** Idea input, framework preset, clarification answers  
**Menghasilkan:** `tech-stack.md`

---

### 1.7 Task Breakdown Agent

**Peran:** Menghasilkan `tasks.md` dan `mvp-roadmap.md`.

**Tanggung Jawab:**
- Memecah seluruh produk menjadi task yang konkrit dan atomic
- Mengelompokkan task per phase (Phase 1, 2, 3)
- Menentukan dependencies antar task
- Membuat timeline realistis berdasarkan scope
- Menghasilkan 4-week MVP roadmap yang actionable

**Task format:**
```markdown
- [ ] Task name (estimated: Xh)
  - Sub-task 1
  - Sub-task 2
```

**Context yang dibutuhkan:** `prd.md`, `database-schema.md`, framework preset  
**Menghasilkan:** `tasks.md`, `mvp-roadmap.md`

---

### 1.8 Rules Generator Agent

**Peran:** Menghasilkan `cursor-rules.md` (atau versi per tool) dan `agents.md`.

**Tanggung Jawab:**
- Menghasilkan coding rules yang spesifik untuk framework yang dipilih
- Menyesuaikan format dengan AI tool yang dipilih
- Mendefinisikan AI agent roles untuk proyek user
- Memastikan rules cukup spesifik untuk mencegah AI mengambil keputusan yang salah

**Output per Agent Tool:**

| Tool | File yang dihasilkan | Format |
|---|---|---|
| **Cursor** | `cursor-rules.md` | Markdown dengan `.cursor/rules/` instruction |
| **Claude Code** | `CLAUDE.md` | Claude Code format standard |
| **Windsurf** | `.windsurfrules` | Windsurf rules format |
| **Cline** | `.clinerules` | Cline format |
| **OpenCode** | `opencode-rules.md` | Generic markdown |

**Context yang dibutuhkan:** `context.md`, `tech-stack.md`, framework preset, agent tool preset  
**Menghasilkan:** `cursor-rules.md` (atau equivalent), `agents.md`

---

## Bagian 2: User-Facing Agents (untuk proyek yang dihasilkan)

Agent-agent ini direkomendasikan kepada user untuk digunakan bersama dokumentasi ArroBuild di proyek mereka sendiri.

---

### 2.1 Product Manager Agent

**Peran:** Menjaga scope dan arah produk agar tetap konsisten dengan PRD.

**Trigger:** Gunakan saat: menambah fitur baru, evaluasi apakah sesuatu masuk MVP, menulis user stories baru.

**Prompt starter:**
```
Kamu adalah Product Manager untuk [nama produk].
Baca prd.md dan context.md terlebih dahulu.
Evaluasi apakah [idea/fitur baru] sesuai dengan MVP scope.
Jika ya, tambahkan ke tasks.md. Jika tidak, catat di backlog.
```

---

### 2.2 Architect Agent

**Peran:** Memastikan setiap keputusan teknis konsisten dengan tech-stack.md dan database-schema.md.

**Trigger:** Gunakan saat: membuat fitur baru, memilih library, merancang API endpoint.

**Prompt starter:**
```
Kamu adalah Software Architect untuk [nama produk].
Baca context.md dan tech-stack.md terlebih dahulu.
Stack yang digunakan: [sebutkan stack].
[Deskripsi kebutuhan teknis].
Pastikan output konsisten dengan konvensi yang sudah didefinisikan.
```

---

### 2.3 UI/UX Agent

**Peran:** Memastikan semua UI konsisten dengan design-system.md dan ui-rules.md.

**Trigger:** Gunakan saat: membuat komponen baru, merancang halaman, review UI yang sudah ada.

**Prompt starter:**
```
Kamu adalah UI Developer untuk [nama produk].
Baca design-system.md dan ui-rules.md terlebih dahulu.
Primary color: [warna]. Framework: [framework]. Tema: [tema].
Buat [komponen/halaman] yang konsisten dengan design system yang sudah didefinisikan.
```

---

### 2.4 Code Reviewer Agent

**Peran:** Mereview kode yang dihasilkan AI untuk memastikan konsistensi dengan cursor-rules.md.

**Trigger:** Gunakan setelah setiap coding session sebelum commit.

**Prompt starter:**
```
Kamu adalah Code Reviewer untuk [nama produk].
Baca cursor-rules.md terlebih dahulu.
Review kode berikut dan pastikan:
1. Mengikuti konvensi penamaan yang sudah ditetapkan
2. Tidak ada hal yang bertentangan dengan tech stack
3. Error handling sudah ditangani
4. Tidak ada hardcoded values

[paste kode di sini]
```

---

### 2.5 QA Agent

**Peran:** Membuat test cases dan memvalidasi bahwa fitur berjalan sesuai user-flow.md.

**Trigger:** Gunakan setelah fitur selesai dibuat.

**Prompt starter:**
```
Kamu adalah QA Engineer untuk [nama produk].
Baca user-flow.md dan prd.md terlebih dahulu.
Buat test cases untuk [nama fitur]:
1. Happy path
2. Edge cases
3. Error states
Format: Given / When / Then
```

---

### 2.6 Documentation Agent

**Peran:** Menjaga semua file .md tetap up-to-date saat ada perubahan.

**Trigger:** Gunakan setiap kali ada perubahan signifikan di produk.

**Prompt starter:**
```
Kamu adalah Documentation Lead untuk [nama produk].
File yang perlu diupdate: [sebutkan file].
Perubahan yang terjadi: [deskripsi perubahan].
Update dokumentasi yang relevan agar tetap akurat dan sinkron dengan kondisi produk saat ini.
```

---

## Bagian 3: Agent Workflow

Urutan penggunaan agent yang direkomendasikan dalam satu sprint:

```
1. Product Manager Agent  → Validasi fitur / update PRD
         ↓
2. Architect Agent        → Desain solusi teknis
         ↓
3. UI/UX Agent            → Buat komponen / halaman
         ↓
4. [Coding session]       → AI coding agent build fitur
         ↓
5. Code Reviewer Agent    → Review konsistensi
         ↓
6. QA Agent               → Buat dan jalankan test cases
         ↓
7. Documentation Agent    → Update docs yang berubah
```

---

## Bagian 4: Context Loading Protocol

Setiap kali memulai sesi baru dengan AI agent manapun, selalu load file dalam urutan berikut:

1. `context.md` — master file, wajib dibaca pertama
2. File yang relevan dengan task yang akan dikerjakan
3. `cursor-rules.md` (atau equivalent) — pastikan AI mengikuti konvensi

**Contoh untuk Cursor:**
```
@context.md @prd.md @cursor-rules.md
Saya ingin mengerjakan: [deskripsi task]
```

**Contoh untuk Claude Code:**
```bash
# Pastikan CLAUDE.md ada di root project
# Claude Code akan otomatis membacanya di setiap sesi
```
