# 🧠 Context Handover: Status Pengembangan ArroBuild (docs-v2)

> **Dokumen ini dibuat secara khusus sebagai rangkuman (checkpoint) bagi AI Agent yang akan mengambil alih, melanjutkan, atau meninjau pengerjaan proyek ArroBuild berdasarkan spesifikasi `docs-v2`.**

---

## 1. Visi Utama Redesain (v2)

Fokus utama dari redesain form ArroBuild (mengacu pada spesifikasi `08-form-flow-redesign-v2.md` dan `arrobuild_pricing_monetisasi_v2.md`) adalah mengubah paradigma form dari pengisian data statis menjadi ekosistem berorientasi **AI & Monetisasi Kredit**.

Perubahan mendasar yang telah diterapkan:
1. **Knowledge Model JSON:** Data *prompt* pengguna tidak lagi digabung menjadi teks bebas (`string`), melainkan dikonversi ke *Knowledge Model JSON* agar lebih terstruktur dan mudah di-parse oleh agen AI *backend*.
2. **Kredit & Model AI Per-Dokumen:** Pengguna kini bisa mengatur kelas model AI (Hemat, Menengah, Flagship, Ultra) secara **granular** per-dokumen (misalnya: *PRD* pakai model *Flagship*, tapi *Plan/Task* pakai *Hemat*).
3. **Penyajian UI Live & Transparan:** Memunculkan estimasi pemotongan kredit secara aktual (*real-time*) beserta indikator progres *pool* kuota bulanan.

---

## 2. Status Implementasi Codebase Saat Ini

Sebagian besar pengembangan UI (*frontend form flow*) telah **SELESAI (100%)** dan sudah lolos kompilasi (`npm run build`). Berikut status *file* utama yang dimodifikasi:

### ✅ Selesai Diimplementasikan (Sprint 1 - 4)

| File / Komponen | Peran & Perubahan Signifikan |
|---|---|
| `src/components/generate/types.ts` | Pusat kebenaran baru. Mendefinisikan tipe `Feature`, `ModelClass` (*hemat, menengah, flagship, ultra*), estimasi kredit (`calcDocCredits`, `calcTotalCredits`), serta *array constant* untuk opsi bahasa pemrograman, *database*, *tools*, dll. |
| `src/components/generate/ContextStep.tsx` | (Langkah 2) Mengganti *textarea* bebas dengan **FeatureBuilder.tsx** untuk *tracking* `FEAT-00X`. Terdapat fitur *Live JSON Preview* sebagai panel di sisi kanan layar Desktop. |
| `src/components/generate/StackStep.tsx` | (Langkah 3) Pilihan *Design Style* dirombak menggunakan **DESIGNS_DATA** yang menampilkan *mini-mockup CSS* yang interaktif beserta deskripsi asal-usul desain (*lineage*). |
| `src/components/generate/DocumentPickerStep.tsx` | (Langkah 4) Mengimplementasikan *picker* model **per-dokumen**. Model terkunci ditandai 🔒. Estimasi kredit bulanan dan *bar* sisa kuota terlihat jelas. |
| `src/components/generate/ConfirmScreen.tsx` | (Langkah 5) Merombak UI untuk transparansi penuh. Menampilkan *badge* kelas model, harga individual dokumen, total kredit, serta ringkasan *Knowledge Model JSON* (Mini Brief Preview). |
| `src/app/generate/page.tsx` | Induk *state*. Menyalurkan *prop* baru (`perDocModelClass`, `tier`, dll.) ke anak komponen dan mengganti `buildIdeaString()` dengan `buildKnowledgeModel()`. |

*(Catatan: Folder `docs-v2` telah dimasukkan ke dalam `exclude` di `tsconfig.json` karena berisi *snippet* TS referensi yang dapat menyebabkan *error build*).*

---

## 3. Peta Jalan Selanjutnya (Tugas Berikutnya)

Bagi AI Agent yang membaca ini, Anda dapat melanjutkan ke **Fase 5 hingga Fase 7**. Skala kerja akan beralih menuju arsitektur interaktif dan sisi *Backend*. 

Tugas yang tersisa berdasarkan `implementation_plan.md`:

### 🚧 Fase 5: Mode Dipandu AI (Chat Interview)
- Mengembangkan UI/UX di Langkah 1 untuk memilih: **Mode Cepat (Form Manual)** vs **Mode Dipandu AI (Chat)**.
- Mendesain mekanisme pembatasan token (*cap context*) maksimum 8 iterasi chat.
- Menyiapkan *backend endpoint* baru (mis. `/api/interview`) untuk mem-parse percakapan menjadi `ContextData`.

### 🚧 Fase 6: Ruang Kerja IDE Pasca-Generate
- Merombak halaman `/project/[id]` atau halaman pasca-generate menjadi UI *3-panel workspace*.
- Mengimplementasikan fitur referensi-silang (memperlihatkan `FEAT-001` merujuk ke kode bagian mana).
- Tampilan perbandingan revisi (*Diff view*) untuk regenerasi *file* tertentu.

### 🚧 Fase 7: Backend Sync & Polish
- Memastikan `src/app/api/generate/route.ts` dan fungsi *Orchestrator* di dalamnya bisa membaca dan memproses struktur JSON baru (*Knowledge Model*) dengan benar sebelum meneruskannya ke layanan LLM.
- Membuat *Live Build Log* bergaya terminal, dan *Autosave Draft* agar *form* tidak hilang jika pengguna me-*refresh* halaman.

---

## 4. Konvensi & Aturan Repositori
1. **Dilarang Merusak Types:** Semua *data binding* antar *step* sangat bergantung pada `types.ts`. Jangan menghapus konstanta atau atribut yang merusak komponen Langkah 2, 3, atau 4.
2. **Prioritaskan `arrobuild_pricing_monetisasi_v2.md`**: Harga, kelas, dan multiplikasi *token* selalu harus merujuk pada dokumen tersebut. Jika ada keraguan mengenai aturan kredit, rujuk ke dokumen tersebut.
3. **Peringatan Build Next.js:** Proyek menggunakan *Next.js App Router*. Hindari memasukkan *file markdown* spesifikasi langsung ke alur eksekusi aplikasi karena akan berbenturan dengan Turbopack/TypeScript *compiler*.
