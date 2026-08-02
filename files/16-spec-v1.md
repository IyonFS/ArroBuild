# 16 — Spesifikasi V1: Context Living Document + Perapian Konfigurasi

Dokumen ini adalah sumber kebenaran teknis untuk semua item di kolom "V1 — Wajib Sebelum Beli VPS" dari `15-konsep-lifecycle-infrastructure-v1.md`. Baca dan setujui dulu isi ini sebelum lanjut ke `17-agent-prompt-eksekusi-v1.md` — kalau ada bagian yang kurang pas, lebih murah dikoreksi di sini daripada setelah agent mulai membangun.

---

## 1. Ringkasan & Tujuan V1

V1 = 14 dokumen + 3 tier + sistem kredit yang sudah diaudit (sudah jalan) **ditambah** satu kemampuan baru: proyek bisa "melapor progress" dan sistem menjaga satu dokumen `Context` yang selalu mencerminkan kondisi terkini proyek — status tiap FEAT-ID, keputusan yang sudah diambil, dan blocker yang masih aktif. User tinggal paste dokumen ini ke sesi baru dengan Cursor/Claude Code, agent langsung tahu di titik mana proyek berhenti.

Lima item teknis yang dispesifikasikan di dokumen ini:
- **E.** Restrukturisasi folder & modularitas — terbatas, dikerjakan sebagai Fase 0 sebelum yang lain
- **A.** Context sebagai dokumen hidup (item utama)
- **B.** FEAT-ID status field minimal
- **C.** Pricing Page & Paywall menarik data langsung dari `TIER_CONFIG`
- **D.** Decoupling nama tampilan tier dari ID internal (lihat Bagian 6 — ini penting, resolves blocker keputusan nama tier)

---

## 2. Spec E: Restrukturisasi Folder & Modularitas (Fase 0)

Dikerjakan PALING AWAL, sebelum Spec A-D — supaya fitur Context dibangun langsung di struktur yang rapi, bukan dirapikan belakangan.

### 2.1 Prinsip

- Pengelompokan berbasis **fitur**, bukan berbasis tipe file. Folder `features/context-living-doc/` (berisi UI + logic + type-nya sekaligus) lebih tahan lama daripada dipisah jadi `components/`, `hooks/`, `types/` yang tersebar dan makin susah ditelusuri begitu proyek membesar.
- Route (`src/app/`) tetap tipis — cuma routing & layout, logic bisnis pindah ke `features/`.
- `lib/` di level root cuma untuk hal yang benar-benar lintas-fitur (auth, db client, UI primitives seperti `app-icons.tsx`) — bukan tempat sampah umum untuk apa saja.

### 2.2 Struktur Target (arah jangka panjang)

```
src/
  app/                    routing murni (Next.js App Router), tipis
    (marketing)/pricing/
    (app)/generate/, projects/[id]/, tools/*
    api/generate/, export/, payment/, context/

  features/               satu folder = satu domain fitur, self-contained
    generation/           flow generate dokumen (step 1-7 + prompt builder)
    context-living-doc/   fitur Context — MODUL PERTAMA yang ikut pola baru
    credits/
    payment/
    tiers/
    mini-tools/

  lib/                    lintas-fitur murni: db client, auth, ui primitives
  components/             UI dumb/reusable lintas-fitur
```

Tiap folder di `features/` isinya `components/`, `lib/` (logic), dan `types.ts` miliknya sendiri.

### 2.3 Scope yang Dikerjakan Sekarang (dibatasi sengaja)

- Buat folder `features/` + catatan konvensi singkat (`CONVENTIONS.md` atau bagian di README) supaya arahnya jelas untuk siapa pun yang lanjutkan kode ini nanti.
- Fitur Context (Spec A) dibangun 100% mengikuti struktur baru ini sejak awal — jadi "contoh baku" untuk fitur berikutnya.
- File yang MEMANG disentuh oleh Spec C & D (`tiers.ts`, tier-enforcer) dipindah ke `features/tiers/` sekalian saat disentuh — karena sudah pasti diedit di fase itu juga.

### 2.4 Scope yang Sengaja TIDAK Dikerjakan Sekarang

Memindah seluruh kode existing (flow generate, mini tools, payment, dll) ke struktur baru dalam satu sapuan besar **tidak** termasuk pekerjaan ini. Ini ditahan dengan sengaja — bukan karena tidak penting, tapi karena memindah kode yang sudah jalan stabil sekarang menaikkan risiko regresi tanpa manfaat langsung ke fitur Context yang jadi prioritas. Restrukturisasi kode existing yang menyeluruh sebaiknya jadi pekerjaan terpisah dengan porsi testing sendiri, dikerjakan setelah fitur Context ini terbukti stabil — bukan disisipkan diam-diam di tengah membangun fitur baru.

### 2.5 Kenapa Dibatasi Begini

Kalau semua kode lama ikut dipindah sekarang, risikonya dua: diff yang dihasilkan jadi sangat besar sehingga susah direview satu-satu, dan — yang lebih penting — ini persis pola scope creep yang sudah berkali-kali kita sepakati untuk dihindari di proyek ini. "Sekalian aja dirapikan semua" terasa efisien di kepala, tapi hasilnya sering kebalikannya: pekerjaan yang seharusnya selesai dalam hitungan hari jadi molor karena scope-nya diam-diam membesar.

---

## 3. Spec A: Context sebagai Dokumen Hidup

### 3.1 Di mana ini terjadi

ArroBuild tidak punya visibilitas ke sesi kerja user di dalam Cursor/Claude Code (itu aplikasi eksternal, integrasi lebih dalam masuk kategori CLI yang di-Parkir). Jadi mekanisme "lapor progress" untuk V1 terjadi **di dalam ArroBuild sendiri** — bentuknya kotak input ringan di halaman workspace proyek (bisa numpang di panel chat revisi yang sudah direncanakan di `arrobuild_pricing_monetisasi_v2.md` Bagian 8.2, tidak perlu bikin UI baru terpisah). User cukup ketik ringkasan bebas tentang apa yang baru dikerjakan — bisa hasil copy-paste dari percakapan dia dengan Cursor, atau ringkasan manual.

### 3.2 Mekanisme Deteksi (bukan keyword literal)

Tiap kali user mengirim teks di kotak ini, sistem memanggil **satu kali AI call kelas Hemat** (murah, cepat) dengan tugas klasifikasi terstruktur, output JSON:

```
{
  "is_completion_signal": boolean,
  "feat_ids_mentioned": string[],
  "summary": string,
  "decisions": string[],
  "blockers": string[]
}
```

Prompt classifier ini tugasnya SEMPIT: menentukan apakah teks user mengindikasikan sebuah FEAT-ID/task sudah selesai atau ada progress berarti — bukan cuma mencocokkan kata "selesai" secara harfiah, supaya kalimat seperti "belum selesai" atau "kapan ya ini kelar" tidak salah ke-trigger.

Kalau `is_completion_signal = false`, tidak terjadi apa-apa — teks user dianggap obrolan biasa, tidak mengganggu.

### 3.3 Alur Konfirmasi

Kalau `is_completion_signal = true`, tampilkan kartu konfirmasi ringan, TIDAK langsung disimpan:

```
"Sepertinya ada progress baru:
 - FEAT-003: Reminder otomatis → selesai
 - Keputusan baru: pakai cron job, bukan queue

 [Simpan ke Context]   [Bukan sekarang]   [Edit dulu]"
```

- **Simpan ke Context** -> commit checkpoint (lihat 3.4)
- **Bukan sekarang** -> dibatalkan, tidak ada yang tersimpan
- **Edit dulu** -> field summary/decisions/blockers jadi bisa diedit manual sebelum disimpan (menangani kasus classifier salah tangkap detail)

### 3.4 Apa yang Disimpan per Checkpoint

Satu baris/record baru di tabel checkpoint (lihat skema di Bagian 7), isinya:
- FEAT-ID yang statusnya berubah + status barunya
- Ringkasan progress (hasil classifier atau editan user)
- Keputusan baru yang disebut di sesi itu
- Blocker baru kalau ada
- Timestamp

**Tidak menyimpan riwayat percakapan mentah.** Ini prinsip yang sama dengan cap context yang sudah ditetapkan di `arrobuild_pricing_monetisasi_v2.md` Bagian 3 — supaya file tetap ringkas dan murah untuk terus di-refresh.

### 3.5 Rendering Context.md — Template, BUKAN AI Call

Ini poin penting untuk efisiensi biaya: dokumen `Context.md` yang dilihat/di-copy user **dirender dari template deterministik**, bukan generate ulang lewat AI. Datanya sudah terstruktur (status FEAT-ID + daftar keputusan + daftar blocker dari seluruh checkpoint sampai saat ini), jadi cukup di-assembly jadi markdown rapi lewat kode biasa — nol biaya AI untuk langkah ini. Yang berbayar AI cuma classifier di 3.2.

### 3.6 Riwayat Checkpoint (Versi Minimal V1)

User bisa lihat daftar checkpoint dalam bentuk list kronologis sederhana (tanggal + ringkasan 1 baris tiap checkpoint). **Tidak perlu** diff view atau timeline visual mewah — itu ditandai di dokumen 15 sebagai bagian dari fitur "dokumen pintar" yang di-Parkir. Untuk V1, list polos yang bisa di-scroll sudah cukup.

### 3.7 Estimasi Biaya Kredit

- Classifier call: teks input pendek (~200-400 token) + output JSON kecil (~100 token), kelas Hemat -> **~1 kredit per pengecekan**.
- Rendering Context.md: **0 kredit** (template, bukan AI call).
- Kalau user mengirim 20 update dalam sebulan untuk satu proyek: total ~20 kredit — sangat kecil dibanding pool bulanan terkecil (3.000 kredit Starter).

---

## 4. Spec B: FEAT-ID Status Field (Minimal)

Knowledge Model (blok YAML di PRD, lihat `00-overview.md` Bagian 3) diperluas dengan satu field baru per FEAT-ID:

```yaml
status: todo | in_progress | done
```

Aturan:
- Default `todo` saat FEAT-ID pertama kali dibuat di Feature Builder.
- Bisa berubah lewat dua jalur: (1) otomatis lewat checkpoint Context (Bagian 3), atau (2) manual — tambahkan toggle status langsung di UI Feature Builder, untuk user yang tidak mau pakai alur check-in dan lebih suka update manual.
- **Sengaja pakai enum yang longgar** (`todo | in_progress | done`) supaya nanti gampang ditambah `deprecated`/`modified` untuk fase Evolution tanpa migrasi ulang skema — tapi dua nilai itu TIDAK dibangun sekarang, cukup pastikan tipe datanya tidak mengunci ke hanya 3 nilai secara kaku di level database (pakai string/enum yang mudah diperluas, bukan boolean atau hardcode terpisah).

---

## 5. Spec C: Pricing Page & Paywall Menarik dari TIER_CONFIG

Sesuai rekomendasi di laporan audit (`audit_report.md` Bagian 5, poin 2): pastikan komponen berikut membaca harga, limit, dan daftar fitur **langsung dari `src/lib/config/tiers.ts`**, bukan hardcode string/angka terpisah:
- Halaman Pricing (marketing/landing)
- Paywall di Step 5 flow generator (ConfirmScreen sebelum generate)
- Badge lock "Upgrade ke Pro" di Document Picker & model picker per dokumen

Tujuannya supaya kalau harga/limit kredit berubah lagi di masa depan, cukup edit satu file, tidak perlu re-sync manual ke 3+ tempat seperti masalah lama yang sudah ditemukan.

---

## 6. Spec D: Decoupling Nama Tampilan Tier dari ID Internal

Ini yang menyelesaikan blocker keputusan nama tier (Starter/Pro/Pro Max vs Base/Core/Prime) supaya **tidak menghalangi mulai build V1 sekarang**.

Prinsipnya: pisahkan **ID internal** (dipakai di kode, database enum, logic — tidak pernah berubah: `STARTER | PRO | PRO_MAX`) dari **nama tampilan** (yang dilihat user di UI — boleh berubah kapan saja).

```ts
// tiers.ts
{
  id: "PRO",                 // tidak pernah berubah, dipakai di logic & database
  displayName: "Pro",        // ini yang tampil ke user, gampang diganti ke "Core" nanti
  ...
}
```

Semua komponen UI (Pricing Page, badge lock, dsb dari Spec C) WAJIB menampilkan `displayName`, bukan `id`, ke user. Dengan begini, kalau nanti kamu putuskan rename ke Base/Core/Prime, itu tinggal ubah 3 baris string di `tiers.ts` — tidak perlu migrasi database atau refactor logic apa pun. Keputusan nama tier jadi tidak lagi mem-block pekerjaan teknis V1.

---

## 7. Data Model Ringkas

Tambahan skema yang dibutuhkan (nama tabel/kolom menyesuaikan konvensi Prisma schema yang sudah ada):

**Tabel baru — `context_checkpoints`**
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | string/uuid | primary key |
| projectId | string | relasi ke proyek |
| createdAt | datetime | timestamp checkpoint |
| featIdsAffected | json/array | FEAT-ID yang statusnya berubah di checkpoint ini |
| statusChanges | json | `{ featId: newStatus }` |
| decisions | text[] | keputusan baru yang tercatat |
| blockers | text[] | blocker baru yang tercatat |
| summary | text | ringkasan 1 paragraf (dari classifier atau editan user) |
| rawInput | text | teks asli yang diketik user (untuk audit/debug) |

**Perluasan model FEAT-ID/Feature (di Knowledge Model yang sudah ada)**
- Tambah kolom `status` (string/enum longgar, lihat Bagian 4)

**Tabel `context_checkpoints` dipakai untuk:**
- Merender `Context.md` (Spec A 3.5) — ambil status FEAT-ID terkini + kumpulan decisions/blockers dari seluruh checkpoint proyek
- Menampilkan riwayat checkpoint (Spec A 3.6)

---

## 8. Definition of Done — V1

V1 dianggap selesai kalau SEMUA berikut benar, bisa dites langsung:

- [ ] Folder `features/` dibuat dengan `context-living-doc/` di dalamnya berisi seluruh kode Spec A (bukan tersebar di `components/`/`lib/` global).
- [ ] Ada dokumentasi singkat (README/CONVENTIONS) yang menjelaskan konvensi struktur folder baru.
- [ ] `tiers.ts` & tier-enforcer sudah pindah ke `features/tiers/`, tidak ada file existing lain yang ikut dipindah.
- [ ] User bisa mengetik update progress bebas di workspace proyek, dan sistem benar mendeteksi sinyal "selesai" (bukan cuma keyword match) minimal untuk kasus umum berbahasa Indonesia dan Inggris.
- [ ] Kartu konfirmasi muncul sebelum apa pun tersimpan; user bisa terima/tolak/edit.
- [ ] Setelah konfirmasi, `Context.md` ter-update dan bisa di-download/copy, mencerminkan status FEAT-ID terbaru + kumpulan decisions/blockers.
- [ ] Riwayat checkpoint bisa dilihat sebagai list kronologis sederhana.
- [ ] FEAT-ID status bisa diubah manual dari Feature Builder, terlepas dari alur Context.
- [ ] Pricing Page, Paywall Step 5, dan badge lock semuanya menampilkan `displayName` dari `TIER_CONFIG`, bukan string hardcode.
- [ ] Rename nama tier (kapan pun diputuskan) bisa dilakukan cukup dengan mengubah `displayName` di satu file, tanpa migrasi database.

---

## 9. Eksplisit Di Luar Scope V1

Rujuk kolom "Parkir" di `15-konsep-lifecycle-infrastructure-v1.md` — semua itu TIDAK termasuk pekerjaan ini. Yang paling penting ditegaskan supaya agent tidak scope creep saat eksekusi: tidak ada Scope Drift Guard, tidak ada Revision Prompt Composer per-lensa, tidak ada fitur "dokumen pintar" (Explain, freshness indicator, lint, FEAT-ID graph), tidak ada CLI, tidak ada integrasi langsung ke sesi Cursor/Claude Code, dan tidak ada restrukturisasi folder menyeluruh di luar yang disebut eksplisit di Bagian 2.3. Context untuk V1 murni fitur web, dipicu input manual dari user di dalam ArroBuild.
