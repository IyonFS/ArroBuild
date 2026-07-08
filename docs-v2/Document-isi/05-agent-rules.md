# Template: Agent Rules — v2, terintegrasi

> **Tipe dokumen:** Wajib (Core Module) — dokumen #5
> **Tersedia di tier:** Pro, Pro Max saja (Starter tidak dapat dokumen ini)
> **Kelas model:** Pro → Hemat (DeepSeek V4 Flash) | Pro Max → Flagship (GPT-5.4)
> **Token budget:** Pro 2.500 | Pro Max 4.000
> **Kredit (default mix):** Pro 3 | Pro Max 140

---

## 1. Aturan Penulisan Kode
*Bahasa/framework yang dipakai, gaya penamaan file & variabel, struktur import.*

## 2. Format Khusus per Tool
*Berbeda tergantung `agent_tool` yang dipilih user — bukan tergantung `product_type`.*

| Tool | Format Output |
|---|---|
| Cursor | `.cursorrules` |
| Claude Code | `CLAUDE.md` |
| Windsurf | `.windsurfrules` |
| Cline | format rules generik — tetap wajib diisi detail, jangan hanya placeholder |
| Opencode | format rules generik — tetap wajib diisi detail, jangan hanya placeholder |

## 3. Ekosistem Dev Tambahan *(section baru, dari form-flow v2 Bag. 2.6)*
*Isi hanya jika field terkait dipilih user (semua opsional):*

| Field | Pengaruh ke isi Agent Rules |
|---|---|
| `versionControl` (GitHub/GitLab/Bitbucket) | Konvensi commit & branch naming |
| `designHandoffTool` (Figma / tidak pakai) | Jika Figma dipilih: konvensi terjemahan desain→kode (penamaan komponen mengikuti nama layer Figma) |
| `projectManagementTool` (Notion/Linear/Trello) | Konvensi penamaan task/branch mengikuti ID tiket, jika relevan |

## 4. Larangan & Batasan
*Contoh: jangan ubah skema database tanpa memperbarui Architecture.md, jangan hardcode API key, jangan menambah dependency baru tanpa alasan jelas.*

> 🔒 **Pro Max saja:** tambahkan aturan testing (wajib menulis test untuk fungsi baru atau tidak), aturan format commit message, dan instruksi eskalasi jika AI agent perlu menyimpang dari Architecture.md.

---

**Catatan implementasi:** Bagian 2 untuk tool selain Cursor/Claude Code/Windsurf masih perlu instruksi lebih spesifik saat prompt ditulis (temuan lama: `agents.md` versi awal terlalu generik untuk `cline`/`opencode`) — jangan diwarisi apa adanya dari prompt lama.
