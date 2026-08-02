# 17 — Prompt Eksekusi V1 (untuk AI Coding Agent)

**Untuk:** Cursor / Claude Code / Windsurf (atau agent coding lain yang punya akses langsung ke codebase ArroBuild)
**Diberikan oleh:** Vansico (founder)
**Sumber Kebenaran:** `16-spec-v1.md` — baca dokumen itu SELURUHNYA sebelum mulai kerja apa pun. Prompt ini cuma urutan eksekusi + aturan main, bukan pengganti spec.

---

## 0. Cara Pakai

Tempel isi dokumen ini ke AI coding agent yang memegang codebase ArroBuild, bersama file `16-spec-v1.md` sebagai referensi. Kerjakan berurutan sesuai fase di Bagian 2 — jangan loncat fase sebelum fase sebelumnya lolos checklist-nya sendiri.

---

## 1. Aturan Kerja

1. **`16-spec-v1.md` adalah kebenaran teknis.** Kalau ada bagian yang ambigu atau tidak cukup detail untuk diimplementasi, JANGAN menebak — tandai di laporan akhir sebagai pertanyaan terbuka.
2. **Scope ketat ke 5 item di spec (Restrukturisasi folder terbatas, Context, FEAT-ID status, TIER_CONFIG sync, decoupling nama tier).** Semua yang disebut "Di Luar Scope" di Bagian 9 spec TIDAK dikerjakan, meskipun terasa "gampang sekalian dikerjakan sambil di sini". Godaan untuk menambah scope di tengah jalan justru persis pola yang mau dihindari lewat proyek ini sendiri.
2a. **Khusus restrukturisasi folder: batasnya ketat.** Cuma folder fitur Context (baru) dan file yang memang tersentuh Spec C/D yang boleh dirapikan. Kode existing lain yang sudah jalan TIDAK boleh dipindah/direstruktur meskipun agent merasa "bisa sekalian dirapikan". Kalau ragu apakah sebuah file termasuk boleh disentuh atau tidak, JANGAN disentuh — tanyakan di laporan akhir.
3. **Commit terpisah per fase** (bukan satu commit besar untuk semuanya) supaya gampang direview.
4. **Perubahan skema database (Bagian 6 spec) dikerjakan lebih dulu dan terpisah** dari logic/UI, supaya kalau ada revisi skema, tidak perlu bongkar kode yang sudah dibangun di atasnya.
5. Tulis unit test dasar untuk mekanisme classifier (Fase 2) — khususnya kasus negatif ("belum selesai", "kapan ya ini kelar") supaya tidak salah trigger. Ini bagian dari Definition of Done, bukan opsional.

---

## 2. Urutan Eksekusi

### Fase 0 — Restrukturisasi Folder (Terbatas)
- [ ] Buat struktur `features/` sesuai spec Bagian 2.2 (`16-spec-v1.md`) — kalau folder ini belum ada di codebase
- [ ] Tulis catatan konvensi singkat (`CONVENTIONS.md` atau bagian di README) menjelaskan prinsip pengelompokan berbasis fitur
- [ ] Pindahkan `tiers.ts` dan tier-enforcer ke `features/tiers/` — file ini SUDAH PASTI disentuh di Fase 4, jadi sekalian dirapikan saat itu juga
- [ ] **JANGAN** memindah kode existing lain (flow generate, mini tools, payment, dsb) — ini scope yang sengaja ditahan, lihat spec Bagian 2.4 untuk alasannya
- [ ] Seluruh kode Fase 1-3 di bawah ini (skema, logic, UI untuk Context) dibangun LANGSUNG di `features/context-living-doc/`, bukan dibangun dulu di tempat lama lalu dipindah belakangan

### Fase 1 — Skema Database
- [ ] Tambah tabel `context_checkpoints` sesuai skema di spec Bagian 6
- [ ] Tambah kolom `status` ke model FEAT-ID/Feature yang sudah ada, default `todo`
- [ ] Migrasi dijalankan di environment development, verifikasi tidak merusak data proyek existing

### Fase 2 — Logic Backend: Deteksi & Checkpoint
- [ ] Bangun endpoint/fungsi yang menerima teks bebas dari user, panggil AI classifier kelas Hemat sesuai format JSON di spec Bagian 2.2
- [ ] Tulis unit test classifier: minimal 5 kasus positif (variasi kalimat "selesai" dalam Bahasa Indonesia & Inggris) dan 5 kasus negatif (kalimat yang MIRIP tapi bukan sinyal selesai, misal "belum selesai", "kapan selesainya ya")
- [ ] Bangun fungsi commit checkpoint: simpan ke `context_checkpoints`, update `status` FEAT-ID terkait
- [ ] Bangun fungsi render `Context.md`: template deterministik (BUKAN AI call) yang membaca seluruh checkpoint proyek + status FEAT-ID terkini, assembly jadi markdown

### Fase 3 — UI
- [ ] Kotak input "lapor progress" di workspace proyek (boleh numpang di panel chat revisi yang sudah ada, sesuai spec Bagian 2.1)
- [ ] Kartu konfirmasi (Simpan ke Context / Bukan sekarang / Edit dulu) sesuai spec Bagian 2.3
- [ ] Tampilan `Context.md` yang bisa di-copy/download
- [ ] List riwayat checkpoint kronologis sederhana (spec Bagian 2.6 — tanpa diff view, cukup list)
- [ ] Toggle status manual di Feature Builder (todo/in_progress/done) sebagai jalur alternatif di luar alur Context

### Fase 4 — Konfigurasi Tier
- [ ] Tambah field `displayName` terpisah dari `id` di `tiers.ts` sesuai spec Bagian 5
- [ ] Ganti semua tempat yang menampilkan nama tier ke user (Pricing Page, Paywall Step 5, badge lock di Document Picker & model picker) supaya membaca `displayName`, bukan `id` atau string hardcode
- [ ] Verifikasi: ganti nilai `displayName` di satu tempat, pastikan berubah konsisten di semua UI tanpa error

### Fase 5 — Testing Menyeluruh
- [ ] Jalankan Definition of Done di `16-spec-v1.md` Bagian 7 satu per satu, tandai lolos/tidak
- [ ] Test manual end-to-end: dari buat FEAT-ID baru → ketik update progress → konfirmasi → lihat Context.md ter-update → lihat muncul di riwayat checkpoint

---

## 3. Format Laporan Setelah Selesai

Buat SATU dokumen laporan baru (jangan menimpa dokumen lain), strukturnya:

1. **Ringkasan** — berapa dari 5 fase yang selesai penuh, ada yang terhambat di mana.
2. **Per Fase:** apa yang dikerjakan, file yang disentuh (path lengkap), hasil test (khususnya hasil unit test classifier — tampilkan berapa dari 10 kasus uji yang lolos).
3. **Definition of Done** — checklist dari spec Bagian 7, ditandai lolos/tidak per poin, dengan bukti singkat (screenshot/log/hasil test).
4. **Pertanyaan Terbuka** — bagian spec yang ternyata ambigu saat diimplementasi dan butuh keputusan Vansico.
5. **Estimasi Biaya Kredit Aktual** — setelah classifier benar-benar jalan, konfirmasi ulang apakah realisasi token/kredit per pengecekan sesuai estimasi di spec Bagian 2.7, atau meleset.

---

## 4. Checklist Akhir Sebelum Lapor "Selesai"

- [ ] Semua 5 fase sudah dikerjakan berurutan, tidak ada yang di-skip
- [ ] Unit test classifier lolos untuk kasus positif maupun negatif
- [ ] Rendering Context.md dikonfirmasi TIDAK memanggil AI (murni template)
- [ ] Rename `displayName` di satu tempat terbukti tidak butuh migrasi database
- [ ] Tidak ada pekerjaan di luar scope 5 item spec yang ikut disentuh
- [ ] Kode fitur Context sepenuhnya ada di `features/context-living-doc/`, tidak tersebar ke `components/`/`lib/` global
- [ ] Tidak ada file existing di luar `tiers.ts`/tier-enforcer yang ikut dipindah/direstruktur
- [ ] Laporan akhir dibuat sebagai file baru sesuai format Bagian 3
