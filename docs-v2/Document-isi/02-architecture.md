# Template: Architecture & Technical Blueprint — v2, terintegrasi

> **Tipe dokumen:** Wajib (Core Module) — dokumen #2
> **Tersedia di tier:** Starter, Pro, Pro Max
> **Kelas model:** Starter → Hemat (Gemini 2.5 Flash-Lite / DeepSeek V4 Flash) | Pro → Menengah (Gemini 2.5 Pro) | Pro Max → Flagship (GPT-5.4)
> **Token budget:** Starter 2.500 | Pro 4.000 | Pro Max 7.000
> **Kredit (default mix):** Starter 3 | Pro 96 | Pro Max 245
> **Kenapa wajib:** Tanpa dokumen ini, AI Coding Agent akan menebak skema database & struktur folder sendiri tiap sesi kerja — hasilnya tidak konsisten.

---

## 1. Keputusan Teknis Utama
*Tabel keputusan final dari Step 3 (Stack & Preferensi) — sudah termasuk field baru dari form-flow v2 (bahasa pemrograman, database kontekstual).*

| Aspek | Keputusan | Alasan Singkat |
|---|---|---|
| Bahasa Pemrograman | `{{programmingLanguage}}` | — |
| Framework | `{{framework}}` | — |
| Database | `{{database}}` | *(termasuk opsi vector DB — pgvector/Pinecone/dll — jika `product_type=ai-app`)* |
| Autentikasi | `{{auth_method}}` | — |
| Hosting / Deploy | `{{deployment_target}}` | — |
| Struktur API | REST / GraphQL | — |

## 2. Skema Database
*Tabel, kolom, tipe data, relasi antar tabel. Setiap tabel wajib merujuk balik ke `FEAT-ID` dari PRD.*

```
Tabel: users
- id (uuid, primary key)
- email (string, unique)
- created_at (timestamp)
→ Mendukung: FEAT-001

Tabel: {{nama_tabel}}
- ...
→ Mendukung: FEAT-00X
```

> ⚪ **Starter:** daftar tabel + kolom penting saja, tanpa detail relasi kompleks.
> 🔷 **Pro:** + relasi antar tabel dijelaskan singkat.
> 🔒 **Pro Max saja:** tambahkan diagram relasi (format Mermaid ER diagram) dan strategi migrasi jika ada perubahan skema di masa depan.

## 3. Struktur Folder Proyek
*Struktur folder yang disarankan, menyesuaikan framework & bahasa yang dipilih.*

```
src/
├── app/
├── components/
├── lib/
└── ...
```

## 4. Kontrak API (jika produk punya API internal/eksternal)
*Endpoint utama, method, request/response singkat. Untuk daftar endpoint lengkap, lihat Dokumen Adaptif "API Reference" (khusus `product_type=api`) atau modul opsional API Reference.*

> ⚪ **Starter:** section ini boleh dilewati kalau tidak relevan.
> 🔷 **Pro ke atas:**

| Endpoint | Method | Fungsi | Terkait Fitur |
|---|---|---|---|
| `/api/...` | POST | ... | FEAT-00X |

> 🔒 **Pro Max saja:** tambahkan format error response standar dan aturan versioning API (contoh: `/api/v1/...`).

## 5. Batasan & Pertimbangan Teknis
*Rate limit, batas ukuran file upload, dependency pihak ketiga.*
> ⚪ **Starter:** boleh dilewati/ringkas. 🔷 **Pro ke atas:** wajib diisi.

---

**Catatan implementasi:** Field `database` sekarang kontekstual sesuai `product_type` (lihat `08-form-flow-redesign-v2.md` Bag. 2.2) — badge rekomendasi otomatis muncul di form, tapi AI tetap harus menulis alasan pemilihan di sini, bukan cuma menyalin nama database yang dipilih user.
