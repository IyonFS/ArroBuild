# Format Materi Learn Hub

Dokumen ini menjelaskan **bentuk, struktur, dan format** materi yang perlu kamu kirim agar bisa langsung dimasukkan ke halaman belajar ArroBuild.

---

## Ringkasan

| Aspek | Rekomendasi |
|---|---|
| **Format utama** | JSON (paling disarankan) atau Google Doc/Markdown terstruktur |
| **Satuan** | 1 file JSON per **learning path**, atau 1 file per **lesson** |
| **Bahasa** | Indonesia (konsisten) |
| **Panjang lesson** | 5–15 menit baca + 10–20 menit practice task |

---

## Hierarki Konten

```
Learning Path (topik besar)
├── metadata path (judul, level, objective, ...)
└── Lesson[] (4–6 lesson per path)
    ├── metadata lesson (judul, slug, estimasi, outcome)
    └── blocks[] (isi materi)
```

Saat ini ada **6 path** dengan **4 lesson** masing-masing (24 lesson total). Slug path sudah fixed — jangan diubah kecuali ada keputusan baru.

### Daftar Path (slug)

| Track | Slug | Level |
|---|---|---|
| Foundation | `vibe-coding-fundamentals` | pemula |
| Foundation | `setup-tooling` | pemula |
| Workflow | `product-planning-for-ai` | menengah |
| Workflow | `implementation-workflow` | menengah |
| Advanced | `multi-agent-orchestration` | lanjut |
| Advanced | `reliability-deployment` | lanjut |

---

## Template JSON — Learning Path

Simpan sebagai `vibe-coding-fundamentals.json` (contoh):

```json
{
  "slug": "vibe-coding-fundamentals",
  "title": "Vibe Coding Fundamentals",
  "description": "Satu paragraf deskripsi path (2-3 kalimat).",
  "level": "pemula",
  "estimasi": "35 menit",
  "tag": "Gratis",
  "icon": "foundation",
  "track": "foundation",
  "featured": true,
  "objective": "Tujuan pembelajaran path — apa yang dipelajari secara keseluruhan.",
  "prerequisites": [],
  "outcome": "Output setelah menyelesaikan seluruh path — satu kalimat konkret.",
  "lessons": []
}
```

### Field Path

| Field | Wajib | Nilai / Catatan |
|---|---|---|
| `slug` | ✅ | kebab-case, sudah ada di codebase |
| `title` | ✅ | Judul tampilan |
| `description` | ✅ | 2–3 kalimat |
| `level` | ✅ | `pemula` \| `menengah` \| `lanjut` |
| `estimasi` | ✅ | e.g. `"35 menit"` |
| `tag` | ✅ | e.g. `"Gratis"` |
| `icon` | ✅ | `foundation` \| `document` \| `workflow` \| `toolkit` |
| `track` | ✅ | `foundation` \| `workflow` \| `advanced` |
| `objective` | ✅ | Paragraf singkat |
| `prerequisites` | ✅ | Array slug path; `[]` jika tidak ada |
| `outcome` | ✅ | Satu kalimat hasil akhir path |
| `featured` | ❌ | `true` hanya untuk path unggulan |
| `lessons` | ✅ | Array lesson (lihat bawah) |

---

## Template JSON — Lesson

Setiap lesson punya **metadata** + **blocks** (isi materi).

```json
{
  "slug": "apa-itu-vibe-coding",
  "title": "Apa itu Vibe Coding?",
  "estimasi": "8 menit",
  "outcome": "Satu kalimat: apa yang bisa dilakukan siswa setelah lesson ini.",
  "blocks": []
}
```

### Urutan Section yang Disarankan (via blocks)

Gunakan urutan ini agar konsisten di semua lesson:

1. **Outcome** → `callout` dengan `label: "Outcome"`
2. **Core Concept** → `heading` + `text` (+ optional `list`)
3. **Worked Example** → `heading` + `code`
4. **Practice Task** → `heading` + `text`
5. **Common Pitfalls** → `heading` + `list` (optional)
6. **Pro tip** → `tip` (optional)
7. **Perhatian** → `warning` (optional)
8. **CTA** → `cta-link` (optional, maksimal 1 per lesson)

---

## Tipe Block yang Didukung

| `type` | Field | Keterangan |
|---|---|---|
| `heading` | `content` | Subjudul section |
| `text` | `content` | Paragraf. Support inline: `**bold**`, `` `code` `` |
| `list` | `items[]` | Bullet list; tiap item bisa pakai `**bold**` |
| `code` | `content`, `language?` | Snippet kode atau contoh prompt |
| `callout` | `content`, `label?` | Kotak highlight (Outcome, Penting, dll.) |
| `tip` | `content`, `label?` | Kotak biru — tips praktis |
| `warning` | `content`, `label?` | Kotak peringatan |
| `cta-link` | `label`, `href` | Tombol aksi (gunakan hemat) |

### Contoh blocks lengkap

```json
{
  "blocks": [
    {
      "type": "callout",
      "label": "Outcome",
      "content": "Kamu bisa menjelaskan perbedaan vibe coding dan coding tradisional."
    },
    {
      "type": "heading",
      "content": "Core Concept"
    },
    {
      "type": "text",
      "content": "Vibe coding adalah kolaborasi antara kamu sebagai **arsitek** dan AI sebagai **eksekutor**."
    },
    {
      "type": "list",
      "items": [
        "Kamu fokus pada apa yang dibangun",
        "AI menulis kode, kamu mereview",
        "Iterasi 5–10x lebih cepat dari manual"
      ]
    },
    {
      "type": "heading",
      "content": "Worked Example"
    },
    {
      "type": "code",
      "language": "text",
      "content": "Buatkan komponen Button dengan TypeScript dan Tailwind.\nIkuti konvensi di .cursorrules."
    },
    {
      "type": "heading",
      "content": "Practice Task"
    },
    {
      "type": "text",
      "content": "Tulis 3 kalimat yang menjelaskan project impianmu. Identifikasi bagian mana yang akan kamu kerjakan sendiri vs delegasikan ke AI."
    },
    {
      "type": "heading",
      "content": "Common Pitfalls"
    },
    {
      "type": "list",
      "items": [
        "Menganggap AI selalu benar tanpa review",
        "Prompt terlalu luas tanpa konteks project"
      ]
    },
    {
      "type": "tip",
      "label": "Pro tip",
      "content": "Simpan prompt yang berhasil di file notes — bisa dipakai ulang."
    }
  ]
}
```

---

## Alternatif: Markdown per Lesson

Jika lebih nyaman menulis di Notion/Google Docs, gunakan heading level 2 (`##`) untuk section:

```markdown
## Outcome
Satu kalimat hasil lesson.

## Core Concept
Paragraf penjelasan...

- Poin 1
- Poin 2

## Worked Example
\`\`\`bash
npm run dev
\`\`\`

## Practice Task
Instruksi tugas 10-20 menit...

## Common Pitfalls
- Kesalahan 1
- Kesalahan 2
```

Kami akan konversi Markdown ini ke format `blocks` di codebase.

---

## Checklist Sebelum Kirim

- [ ] Setiap lesson punya `outcome` (1 kalimat, terukur)
- [ ] Ada **Practice Task** yang actionable (bukan hanya baca)
- [ ] `slug` lesson unik dalam satu path (kebab-case)
- [ ] Estimasi waktu realistis per lesson
- [ ] Kode/contoh prompt di `code` block, bukan di paragraf panjang
- [ ] CTA `/generate` hanya jika relevan dengan exercise (tidak di setiap lesson)

---

## Cara Kirim

1. **Satu path dulu** (disarankan: `product-planning-for-ai`) sebagai pilot
2. Format: file JSON atau folder Markdown per lesson
3. Kirim via chat — kami masukkan ke `src/lib/learn-content/paths/<slug>.ts`

File contoh lengkap: `docs/learn-content-example.json`
