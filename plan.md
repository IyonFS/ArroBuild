# ArroBuild — Improvement & Product Continuation Plan

> Status: Draft eksekusi
> Dibuat: 12 Agustus 2026
> Fokus: keamanan, kejujuran produk, stabilitas launch, validasi bisnis, dan evolusi menuju Living Blueprint

## 1. Tujuan

Rencana ini bertujuan membawa ArroBuild dari produk beta yang sudah dapat dibuild menjadi produk yang:

1. Aman digunakan di production.
2. Memiliki build, lint, dan CI yang konsisten hijau.
3. Menampilkan klaim pemasaran yang sesuai dengan implementasi nyata.
4. Memiliki alur berbayar utama yang terukur dan dapat divalidasi.
5. Berkembang dari generator dokumen satu kali menjadi project memory dan guardrail untuk AI coding agent.

## 2. Prinsip Eksekusi

- Security dan data integrity dikerjakan sebelum fitur baru.
- Kode runtime menjadi source of truth; dokumentasi mengikuti kode yang sudah disepakati.
- Jangan menambah mini tool baru sebelum core paid loop tervalidasi.
- Fitur yang belum siap disembunyikan atau diberi label beta yang jujur.
- Setiap perubahan penting harus memiliki acceptance criteria dan regression test.
- Perubahan dilakukan per fase dan per pull request kecil agar mudah ditinjau dan di-rollback.
- Tiga perubahan lokal yang sudah ada pada auth dan navbar harus dipertahankan dan tidak ditimpa.

## 3. Kondisi Awal

| Area | Kondisi awal | Target |
|---|---|---|
| Production build | Hijau | Tetap hijau |
| Lint | 20 error, 30 warning | 0 error; warning lama ditriage |
| Validation tests | 12/12 lulus | Tetap lulus |
| Error formatting tests | 4/4 lulus | Tetap lulus |
| ArroDesign URL fetch | Belum memblokir private/internal address | SSRF protection lengkap |
| ArroDesign preview | Output AI dirender sebagai HTML tanpa sanitasi | Rendering aman |
| Learn Hub | 24 lesson masih placeholder | Hanya konten siap terbit yang publik |
| Tier naming | Base/Core/Prime bercampur dengan slug legacy | Satu vocabulary kanonik |
| Marketing integrations | Stats, newsletter, dan social links belum lengkap | Aktif atau dihapus |
| Observability produk | Belum ada funnel inti yang jelas | Core paid loop terukur |

## 4. Urutan Prioritas

### P0 — Wajib sebelum production launch

1. Tutup SSRF pada ArroDesign.
2. Tutup XSS pada preview hasil ArroDesign.
3. Jadikan lint dan CI hijau.
4. Tambahkan regression test keamanan.
5. Audit ulang autentikasi, ownership, webhook, dan credit reservation pada jalur berbayar.

### P1 — Wajib sebelum promosi publik

1. Selaraskan klaim landing dengan produk nyata.
2. Selesaikan atau sembunyikan Learn Hub placeholder.
3. Standardisasi Base/Core/Prime.
4. Perbaiki stats, newsletter, social links, dan route yang tidak aktif.
5. Tambahkan analytics untuk core paid loop.

### P2 — Setelah core loop stabil

1. Refactor komponen besar dan kurangi duplikasi konfigurasi.
2. Tambahkan benchmark kualitas output AI.
3. Perkuat observability biaya, provider, dan kualitas dokumen.
4. Mulai GitHub/repository import dan Living Blueprint.

## 5. Fase 1 — Security Hardening

### 5.1 Lindungi URL fetch ArroDesign dari SSRF

**Masalah**
URL dari pengguna divalidasi sebagai URL, lalu di-fetch oleh server. Validasi tersebut belum mencegah akses ke localhost, private network, link-local address, atau redirect menuju alamat internal.

**File utama**

- `src/app/api/tools/arrodesign/route.ts`
- `src/lib/ai/arrodesign-engine.ts`
- `src/lib/ai/tavily.ts`
- File utilitas security baru, misalnya `src/lib/security/safe-url.ts`

**Task**

- [x] Izinkan hanya protokol `http:` dan `https:`.
- [x] Tolak URL yang memiliki username/password tertanam.
- [x] Tolak hostname `localhost`, `.localhost`, `.local`, dan hostname internal yang dilarang.
- [x] Resolve seluruh hasil DNS hostname sebelum request.
- [x] Tolak IPv4/IPv6 loopback, private, link-local, multicast, unspecified, dan reserved ranges.
- [x] Tolak cloud metadata endpoints, termasuk `169.254.169.254`.
- [x] Batasi jumlah redirect dan validasi ulang setiap tujuan redirect.
- [x] Batasi response body maksimum sebelum seluruh body dimuat ke memory.
- [x] Pertahankan timeout request.
- [x] Validasi `Content-Type` sebelum memproses body.
- [x] Kembalikan pesan error aman tanpa membocorkan detail jaringan internal.
- [x] Catat rejection secara terstruktur tanpa menyimpan URL sensitif secara penuh.

**Acceptance criteria**

- URL publik HTTP/HTTPS yang valid tetap dapat dianalisis.
- Request ke `localhost`, `127.0.0.1`, `::1`, RFC1918, link-local, dan metadata endpoint ditolak sebelum fetch.
- Redirect dari domain publik ke IP internal ikut ditolak.
- Response besar tidak dapat menghabiskan memory server.
- Seluruh test SSRF lulus.

### 5.2 Hilangkan XSS pada preview hasil AI

**Masalah**
Output AI pada ArroDesign dibentuk menjadi HTML menggunakan string replacement dan ditampilkan melalui `dangerouslySetInnerHTML`.

**File utama**

- `src/components/arrodesign/ResultStep.tsx`
- Bila diperlukan, buat renderer aman bersama di `src/components/ui/`.

**Task**

- [x] Ganti renderer string HTML dengan `react-markdown`.
- [x] Batasi elemen Markdown yang boleh dirender.
- [x] Nonaktifkan raw HTML dari output AI.
- [x] Render tag `[EXTRACTED]` dan `[INFERRED]` melalui React component, bukan injeksi HTML.
- [x] Pastikan URL link hanya menggunakan protokol aman.
- [x] Tambahkan test untuk `<script>`, event handler, `javascript:` URL, SVG payload, dan malformed Markdown.
- [x] Audit penggunaan `dangerouslySetInnerHTML` lain; renderer inline Learn Hub juga telah diganti dengan node React aman.

**Acceptance criteria**

- Payload HTML/JavaScript muncul sebagai teks atau dibuang, tidak pernah dieksekusi.
- Highlight `[EXTRACTED]` dan `[INFERRED]` tetap bekerja.
- Toggle untuk menyembunyikan inferred content tetap bekerja.
- Download `.md` mempertahankan konten asli.

### 5.3 Security regression suite

**Task**

- [x] Buat unit test validator URL.
- [ ] Buat integration test ArroDesign untuk URL terlarang.
- [x] Buat component test atau test helper untuk renderer Markdown aman.
- [ ] Verifikasi ownership project dan generated file lintas user.
- [x] Verifikasi webhook signature invalid tetap menghasilkan 401.
- [ ] Verifikasi reservation kredit dilepas ketika generation atau ArroDesign gagal.
- [x] Tambahkan test abuse untuk payload dan input berukuran maksimum.

**Exit gate Fase 1**

- Semua test keamanan baru hijau.
- Tidak ada known P0 security finding yang terbuka.
- Build production tetap hijau.

## 6. Fase 2 — Build, Lint, dan CI Reliability

### 6.1 Perbaiki scope ESLint

**Masalah**
Lint ikut memeriksa `.agents/` dan script tooling yang bukan source aplikasi. `.eslintignore` juga sudah tidak digunakan oleh ESLint versi sekarang.

**File utama**

- `eslint.config.mjs`
- `.eslintignore` setelah aturan dipindahkan

**Task**

- [x] Tambahkan `.agents/**` dan direktori tooling non-aplikasi lain ke `globalIgnores`.
- [x] Tentukan apakah root maintenance script harus di-ignore atau mempunyai rule override khusus CommonJS.
- [x] Hapus ketergantungan pada `.eslintignore` yang deprecated.
- [x] Jangan mengabaikan `src/**`, `prisma/**`, atau script test utama hanya untuk membuat CI hijau.

### 6.2 Perbaiki error source aplikasi

**Task minimum**

- [x] Hilangkan explicit `any` pada `src/app/api/user/me/route.ts`.
- [x] Perbaiki JSX comment text node pada `FileListingSection.tsx`.
- [x] Perbaiki pola synchronous setState di effect pada `CustomCursor.tsx`.
- [x] Triage unused imports, variables, dan eslint-disable directives.
- [x] Jalankan formatter hanya pada file yang disentuh.

### 6.3 Perkuat pipeline CI

**Task**

- [x] Pertahankan urutan install → Prisma generate → lint → build.
- [ ] Tambahkan `format:check` setelah baseline formatting repo diselesaikan dalam PR mekanis terpisah (265 file lama belum sesuai; jangan campur dengan perubahan logic).
- [x] Jalankan `test:validation` dan `test:errors` di CI.
- [x] Tambahkan test keamanan Fase 1 ke CI.
- [x] Self-host font agar build tidak tergantung Google Fonts.
- [ ] Pisahkan integration/E2E test yang membutuhkan Supabase, Redis, Midtrans, dan AI secrets ke job khusus.
- [x] Pastikan job integration tidak berjalan dengan production credential.
- [x] Audit 17 advisory dependency; upgrade terarah Next.js, Prisma, Google GenAI, Tailwind, Sentry, dan tooling tanpa `npm audit fix --force` menghasilkan 0 vulnerability.

**Acceptance criteria**

- `npm run lint` selesai dengan exit code 0.
- `npm run format:check` lulus.
- `npm run test:validation` lulus.
- `npm run test:errors` lulus.
- Security regression suite lulus.
- `npm run build` lulus dari clean checkout.

**Exit gate Fase 2**

- Branch tidak dapat digabung bila lint, test wajib, atau build gagal.

## 7. Fase 3 — Product Truth & Launch Cleanup

### 7.1 Perbaiki Learn Hub

**Masalah**
Landing menjanjikan konten belajar dalam jumlah besar, tetapi seluruh 24 lesson saat ini masih menggunakan placeholder.

**Keputusan produk yang direkomendasikan**
Publikasikan satu learning path lengkap dan berkualitas terlebih dahulu. Sembunyikan path lain dari navigasi dan sitemap sampai siap.

**Task**

- [x] Pilih learning path pertama: `Vibe Coding Fundamentals`.
- [x] Tulis empat lesson final dengan outcome terukur, konsep, contoh, latihan, dan pitfalls.
- [ ] Human review seluruh lesson sebelum publish.
- [x] Hapus kata `placeholder` dari konten yang dapat diakses publik.
- [x] Tandai path yang belum siap sebagai draft pada metadata.
- [x] Filter draft path dari hub, search, navigation, `generateStaticParams`, dan sitemap.
- [x] Ubah copy landing dari “ratusan konten” menjadi klaim yang sesuai kondisi aktual.
- [x] Tambahkan CTA dari lesson ke fitur ArroBuild yang relevan.

**Acceptance criteria**

- Tidak ada halaman publik yang menampilkan placeholder.
- Semua klaim jumlah path/lesson sesuai jumlah konten published.
- Empat lesson pertama lolos content review dan mobile QA.

### 7.2 Selesaikan elemen marketing yang belum aktif

**Task**

- [x] Buat `/api/stats/public` dengan data agregat yang aman atau hapus badge statistik dari hero.
- [x] Jangan tampilkan angka jika datanya belum tersedia atau terlalu kecil untuk bermakna.
- [x] Hubungkan newsletter ke provider email dengan consent dan feedback sukses/gagal, atau hapus form sementara.
- [x] Ganti social link `#` dengan URL nyata atau sembunyikan link.
- [x] Audit halaman Integrations; bedakan jelas antara aktif, beta, dan coming soon.
- [x] Pastikan CTA “Mulai gratis” menjelaskan bahwa form/exploration gratis tetapi generation berbayar.
- [x] Audit FAQ terhadap kebijakan tier dan revisi runtime terbaru.

### 7.3 Standardisasi tier Base/Core/Prime

**Source of truth**

- `src/lib/config/tiers.ts`

**Task**

- [x] Tetapkan slug kanonik `base`, `core`, dan `prime` untuk URL baru.
- [x] Ubah CTA landing yang masih menghasilkan `pro` dan `pro_max`.
- [x] Pertahankan parser legacy pada boundary untuk bookmark atau callback lama.
- [x] Jangan terus menyebarkan nama legacy ke state internal baru.
- [x] Audit Prisma enum, API responses, analytics properties, payment metadata, copy UI, dan dokumentasi.
- [x] Tambahkan test mapping legacy → kanonik.
- [x] Perbarui keputusan bisnis pada docs agar tidak lagi memakai dua vocabulary.

**Acceptance criteria**

- UI hanya menampilkan Base/Core/Prime.
- URL baru hanya membuat slug base/core/prime.
- Link lama tetap dipetakan dengan benar.
- Payment dan entitlement menghasilkan tier yang benar.

**Exit gate Fase 3**

- Semua fitur dan klaim yang terlihat publik merepresentasikan kondisi produk sebenarnya.

## 8. Fase 4 — Core Paid Loop Validation

### 8.1 Funnel yang harus diukur

Gunakan event konsisten untuk alur:

1. `landing_cta_clicked`
2. `signup_started`
3. `signup_completed`
4. `generate_mode_selected`
5. `generate_form_started`
6. `generate_form_completed`
7. `paywall_viewed`
8. `checkout_started`
9. `payment_succeeded`
10. `generation_started`
11. `generation_completed`
12. `workspace_opened`
13. `project_exported`
14. `revision_requested`
15. `user_returned`

**Aturan analytics**

- Jangan kirim isi ide, dokumen, email, prompt, atau data sensitif ke analytics.
- Gunakan identifier pseudonymous.
- Sertakan tier, mode, jumlah dokumen, kelas model, success/failure code, dan duration bucket.
- Definisikan event schema terpusat agar frontend dan backend tidak membuat nama sendiri-sendiri.

### 8.2 Dashboard metrik minimum

- Visit → signup conversion.
- Signup → form completion.
- Form completion → paywall.
- Paywall → checkout.
- Checkout → successful payment.
- Payment → successful first generation.
- Generation → export.
- Time to first export.
- Failure rate per provider dan model class.
- Credit estimate vs actual usage.
- Revision rate dan 7/30-day return rate.

### 8.3 Beta validation

**Task**

- [ ] Rekrut kelompok beta kecil dengan target user utama.
- [ ] Observasi minimal satu sesi dari ide sampai export.
- [ ] Wawancarai pengguna setelah mereka memasukkan hasil ke coding agent.
- [ ] Catat dokumen yang benar-benar dibaca/dipakai.
- [ ] Catat bagian output yang paling sering direvisi manual.
- [ ] Jangan menambah tool baru sampai bottleneck utama funnel diketahui.

**Success signals awal**

- Mayoritas pembayaran berhasil berakhir pada generation dan export.
- Pengguna mampu memakai ZIP tanpa perlu restrukturisasi besar.
- Ada penggunaan ulang untuk revisi atau proyek berikutnya.
- Pengguna dapat menjelaskan perbedaan hasil ArroBuild dengan prompt ChatGPT biasa.

**Exit gate Fase 4**

- Terdapat bukti penggunaan nyata, daftar bottleneck terurut, dan keputusan produk berbasis data.

## 9. Fase 5 — Maintainability & AI Quality

### 9.1 Pecah komponen besar secara bertahap

**Target awal**

- `src/components/generate/StackStep.tsx`
- `src/components/marketing/landing/KnowledgeModelSection.tsx`
- `src/app/generate/page.tsx`
- `src/components/generate/ContextStep.tsx`
- `src/components/generate/ConfirmScreen.tsx`
- `src/components/generate/DocumentPickerStep.tsx`

**Prinsip refactor**

- Pindahkan data/config statis keluar dari komponen.
- Pisahkan domain state dari presentational UI.
- Gunakan reducer atau domain hook untuk state multi-step yang kompleks.
- Jangan melakukan redesign visual bersamaan dengan refactor struktur.
- Tambahkan regression test sebelum memecah alur berisiko tinggi.

### 9.2 Hilangkan konfigurasi ganda

**Task**

- [x] Pastikan pricing UI membaca konfigurasi bersama, bukan angka hardcoded terpisah.
- [x] Satukan mapping tier, document access, model access, dan copy label.
- [x] Identifikasi config yang hanya untuk display dan config yang menjadi business rule.
- [x] Tambahkan consistency test untuk harga, kredit, dokumen, dan model class.

### 9.3 Bangun AI output benchmark

**Dataset minimum**

- 10–20 ide produk representatif.
- Mencakup SaaS, marketplace, mobile, AI product, internal tool, ecommerce, dan portfolio.
- Input pendek, sedang, dan sangat detail.

**Evaluator**

- Kelengkapan dokumen.
- Konsistensi FEAT-ID.
- Konsistensi antar dokumen.
- Tidak adanya kontradiksi stack dan architecture.
- Actionability task plan.
- Tidak adanya klaim yang difabrikasi.
- Validitas Markdown/YAML/JSON.
- Estimated vs actual token/credit usage.

**Task**

- [x] Simpan benchmark input tanpa data pengguna nyata.
- [x] Buat runner yang dapat membandingkan prompt/model version.
- [x] Simpan hasil evaluasi sebagai artefak CI atau laporan internal.
- [ ] Terapkan quality gate sebelum mengganti prompt produksi.
- [x] Catat prompt version dan model route pada setiap generation.

### 9.4 Observability

- [ ] Error rate per endpoint.
- [ ] Latency p50/p95 untuk interview, generate, revise, regen, dan tools.
- [ ] Provider fallback frequency.
- [ ] Generation failure setelah credit reservation.
- [ ] Credit reconciliation mismatch.
- [ ] Payment callback/webhook delay.
- [ ] Redact prompt dan data proyek dari log default.

**Exit gate Fase 5**

- Perubahan prompt/model dapat dibandingkan secara objektif.
- Komponen paling berisiko lebih mudah dipelihara tanpa mengubah UX.

## 10. Fase 6 — Living Blueprint

### 10.1 Arah produk

ArroBuild tidak berhenti pada “generate 14 dokumen”, tetapi menjadi memory layer yang menjaga intent produk, dokumen, dan implementasi tetap sinkron sepanjang umur proyek.

Alur target:

```text
Ide atau repository
        ↓
Blueprint awal
        ↓
Implementasi oleh AI coding agent
        ↓
Code/spec drift analysis
        ↓
Change proposal + impact report
        ↓
Dokumen, task, dan agent rules diperbarui
```

### 10.2 MVP Living Blueprint

#### A. Repository import

- [ ] Hubungkan GitHub repository dengan izin read-only minimum.
- [ ] Baca tree, manifest, schema, routes, tests, dan agent instruction files.
- [ ] Jangan clone atau mengirim secret dan file sensitif ke provider AI.
- [ ] Berikan preview file yang akan dianalisis sebelum generation.

#### B. Brownfield bootstrap

- [ ] Generate baseline PRD dan architecture dari repository existing.
- [ ] Bedakan fakta dari kode dan inference AI.
- [ ] Berikan confidence/source reference untuk setiap temuan penting.

#### C. Drift detector

- [ ] Bandingkan FEAT-ID dengan route, component, schema, dan tests.
- [ ] Tampilkan status `planned`, `partial`, `implemented`, `tested`, atau `drifted`.
- [ ] Deteksi perubahan dependency, route, schema, dan environment variable.
- [ ] Jangan mengubah dokumen otomatis tanpa review pengguna.

#### D. Change impact analysis

- [ ] Pengguna menulis perubahan fitur.
- [ ] ArroBuild menunjukkan dokumen, task, API, database, dan test yang terpengaruh.
- [ ] Pengguna menyetujui patch dokumen per bagian.
- [ ] Setiap perubahan memiliki history dan dapat dibandingkan.

#### E. Agent-native export

- [ ] Export `AGENTS.md`.
- [ ] Export `CLAUDE.md`.
- [ ] Export Cursor rules.
- [ ] Export Kiro steering/spec structure.
- [ ] Export struktur yang kompatibel dengan Spec Kit.
- [ ] Version-kan template per target agent.

### 10.3 Moat yang dituju

- Konsistensi lintas dokumen dan kode, bukan sekadar banyaknya dokumen.
- Workflow terpandu untuk developer Indonesia.
- Pembayaran dan dukungan lokal.
- Quality benchmark yang transparan.
- Project history dan change impact yang sulit direplikasi oleh prompt satu kali.

## 11. Backlog yang Ditunda

Item berikut tidak dikerjakan sebelum Fase 1–4 selesai:

- [ ] Mini tools baru pada bagian “Segera hadir”.
- [ ] Integrasi tambahan yang belum mendukung core loop.
- [ ] Ekspansi jumlah learning path sebelum path pertama selesai.
- [ ] Multi-agent orchestration penuh.
- [ ] Team workspace dan role management.
- [ ] Marketplace template/preset.
- [ ] Mobile app native.
- [ ] Perubahan visual besar yang tidak memperbaiki conversion atau usability.

## 12. Rencana Pull Request

Urutan PR yang direkomendasikan:

1. `security/arrodesign-safe-url`
2. `security/arrodesign-safe-renderer`
3. `test/security-regressions`
4. `chore/eslint-scope-and-errors`
5. `ci/quality-gates`
6. `content/learn-publishing-state`
7. `content/vibe-coding-fundamentals`
8. `fix/marketing-dead-elements`
9. `refactor/tier-slug-canonicalization`
10. `analytics/core-paid-funnel`
11. `test/ai-output-benchmark`
12. `refactor/generate-flow-boundaries`
13. `feat/repository-import-foundation`
14. `feat/living-blueprint-drift-report`

Setiap PR harus:

- Memiliki scope tunggal.
- Menjelaskan perubahan perilaku dan risiko.
- Menyertakan test atau alasan mengapa test tidak diperlukan.
- Menjalankan lint, test relevan, dan build.
- Tidak mencampur formatting massal dengan perubahan logic.

## 13. Definition of Done

Sebuah task dianggap selesai jika:

- Acceptance criteria terpenuhi.
- Test otomatis yang relevan ditambahkan dan lulus.
- Tidak menambah lint error atau warning baru.
- Build production lulus.
- Error dan loading state sudah ditangani.
- Security dan privacy impact sudah diperiksa.
- Dokumentasi terkait diperbarui.
- Copy publik sesuai implementasi nyata.
- Tidak merusak compatibility tanpa migration plan.

## 14. Checklist Go-Live

### Security

- [x] SSRF protection aktif dan telah diuji.
- [x] Output AI tidak dapat mengeksekusi HTML/JavaScript.
- [ ] RLS dan cross-user access test lulus.
- [ ] Webhook signature test lulus.
- [ ] Production secrets hanya berada di secret manager/Vercel.
- [ ] Supabase leaked password protection aktif.
- [ ] Backup database terjadwal.

### Reliability

- [x] Lint hijau.
- [ ] Format check hijau.
- [x] Build hijau.
- [x] Test unit/security hijau.
- [ ] Production migration berhasil.
- [ ] Cron endpoint diverifikasi dengan secret production.
- [ ] Sentry test event diterima.

### Product

- [x] Tidak ada placeholder pada halaman publik.
- [x] Pricing dan entitlement konsisten.
- [x] CTA dan route tidak mati.
- [x] Newsletter aktif atau tidak ditampilkan.
- [x] Social links aktif atau tidak ditampilkan.
- [ ] Core paid loop lolos smoke test production.
- [ ] Export ZIP dapat dipakai pada minimal satu coding agent target.

### Business

- [ ] Midtrans production aktif dan webhook terverifikasi.
- [ ] Refund/support procedure terdokumentasi.
- [ ] Credit estimate dan charge aktual telah diuji.
- [ ] Funnel analytics menerima event tanpa data sensitif.
- [ ] Founder/admin contact production telah dikonfigurasi.

## 15. Keputusan yang Perlu Dicatat

Gunakan `docs/12-DECISIONS-LOG.md` untuk keputusan berikut saat dieksekusi:

- Base/Core/Prime sebagai nama dan slug kanonik.
- Kebijakan publish/draft Learn Hub.
- Kebijakan URL fetch dan daftar jaringan terlarang.
- Renderer Markdown aman yang dipilih.
- Provider analytics dan event schema.
- Scope MVP repository import.
- Format compatibility untuk agent-native export.

## 16. Langkah Pertama yang Direkomendasikan

Mulai dari satu workstream kecil dan terukur:

1. Implementasikan safe URL validator.
2. Tambahkan SSRF regression tests.
3. Ganti preview ArroDesign dengan renderer Markdown aman.
4. Jadikan lint hijau.
5. Jalankan seluruh quality gate dan build dari clean checkout.

Jangan memulai Living Blueprint sebelum lima langkah tersebut selesai. Fondasi produk sudah cukup kuat; peningkatan terbesar sekarang datang dari keamanan, kepercayaan, dan bukti penggunaan—bukan dari menambah jumlah fitur.

## 17. Execution Log

### 29 Agustus 2026 — Fase 1 dan core Fase 2

**Selesai**

- SSRF hardening untuk ArroDesign: validasi protokol/host/IP/DNS, DNS pinning, redirect revalidation, timeout, batas response, dan validasi content type.
- Safe Markdown renderer untuk output AI; raw HTML dan protokol link berbahaya diblokir.
- Seluruh penggunaan `dangerouslySetInnerHTML` di `src/` dihapus.
- Security regression suite ditambahkan ke `npm run test:security` dan CI.
- Scope ESLint diperbaiki, `.eslintignore` deprecated dihapus, dan seluruh error/warning source dituntaskan.
- CI menjalankan Prisma generate, lint, validation tests, error tests, security tests, dan production build.

**Hasil verifikasi**

- `npm run lint`: lulus, 0 error dan 0 warning.
- `npm run test:validation`: 12/12 lulus.
- `npm run test:errors`: 4/4 lulus.
- `npm run test:security`: 31/31 lulus, termasuk kasus SVG dan malformed Markdown.
- `npm run build`: lulus, TypeScript lulus, 83 halaman statis berhasil dibuat pada checkpoint sebelum filtering draft Learn Hub.

**Ditunda secara eksplisit**

- `format:check` repo-wide belum dimasukkan ke CI karena 265 file lama belum sesuai baseline. Selesaikan dalam PR formatting mekanis tersendiri agar tidak mengaburkan perubahan logic.
- Integration/E2E yang membutuhkan Supabase, Redis, Midtrans, dan provider AI tetap menunggu environment test khusus.

### 29 Agustus 2026 — Fase 3 Product Truth

**Selesai**

- Menetapkan satu path published (`Vibe Coding Fundamentals`) dan lima path draft melalui metadata tunggal.
- Menulis empat lesson lengkap dan menambahkan CTA relevan; draft difilter dari hub, search, navigation, SSG, dan sitemap.
- Mengganti klaim “ratusan konten” dengan jumlah aktual 1 path/4 lesson.
- Menghapus badge statistik tanpa endpoint, newsletter tanpa backend, dan social link `#`.
- Memperjelas Integrations sebagai kompatibilitas file ekspor manual, bukan koneksi akun otomatis.
- Menstandarkan URL/copy baru ke Base/Core/Prime sambil mempertahankan parser legacy di boundary.
- Memperbarui monetization docs dan decisions log sebagai source of truth bisnis.

**Hasil verifikasi**

- `npm run test:content`: 11/11 lulus.
- `npm run test:tiers`: 11/11 lulus.
- QA mobile 390 px: tidak ada overflow, placeholder, atau link draft; CTA lesson tampil.
- Direct URL ke path draft menghasilkan 404.
- Production build: lulus dan hanya membuat 58 halaman statis; hanya 1 path dan 4 lesson published yang diprerender.

**Menunggu keputusan manusia**

- Empat lesson sudah lolos struktur test dan QA teknis, tetapi tetap membutuhkan human editorial review sebelum deployment production.

### 29 Agustus 2026 — Credit & Request Reliability

**Selesai**

- Memperbaiki settlement reservation agar seluruh hold dikembalikan sebelum pemakaian aktual dihitung; saldo akhir sekarang konsisten dengan `saldo awal - kredit aktual`.
- Menolak commit/release reservation lintas user dan lintas project, serta membuat retry release idempotent.
- Menyatukan release hold dan charge mini-tool dalam satu transaksi atomik.
- Menghitung hanya reservation yang belum mempunyai release sebagai kredit aktif yang ditahan.
- Menambahkan bounded streaming JSON reader untuk `/api/generate`, `/api/tools/run`, dan `/api/tools/arrodesign`; oversized payload menghasilkan 413 sebelum seluruh body dialokasikan.
- Membatasi field dan image mini-tool sesuai batas UI.
- Mengganti Google Fonts build-time dengan variable font lokal dari Fontsource tanpa mengubah keluarga font Inter, Unbounded, dan JetBrains Mono.
- Mengecualikan `/api/payment/webhook` dan `/api/payment/config` dari session guard; endpoint pembayaran lain tetap login-protected.
- Menambahkan fail-closed guard pada script integration agar membutuhkan opt-in environment test eksplisit dan menolak flag production.
- Memperluas skenario E2E lintas user untuk GET project, PATCH generated file, DELETE project, dan release reservation.

**Hasil verifikasi**

- `npm run test:credits`: 16/16 lulus.
- `npm run test:security`: 55/55 lulus.
- Invalid webhook signature melalui route lokal: 401.
- `npm run lint`: lulus, 0 error dan 0 warning.
- Production build tanpa akses Google Fonts: lulus, TypeScript lulus, 58 halaman statis dibuat.

**Masih membutuhkan environment test terisolasi**

- Menjalankan skenario E2E lintas user dan idempotensi reservation terhadap Supabase/Postgres test.
- Mensimulasikan kegagalan generation/ArroDesign setelah reservation dibuat dan memastikan release tercatat tepat satu kali.
- Menguji webhook valid/idempotent terhadap Midtrans sandbox dan database test.
- Menjalankan integration test terhadap Supabase/Postgres dan Midtrans sandbox tetap membutuhkan environment test terisolasi beserta credential non-production.

### 29 Agustus 2026 — Dependency & Configuration Consistency

**Selesai**

- Meng-upgrade Next.js ke 16.3.3, Prisma ke 7.10.0, Google GenAI ke 2.19.0, Tailwind ke 4.3.3, Sentry ke 10.72.0, dan dependency pendukung secara terarah.
- Memindahkan Prisma CLI ke `devDependencies` dan mengunci `deepmerge-ts` 8.0.2 melalui override kompatibel; `prisma generate` dan `prisma validate` lulus.
- Menurunkan audit dependency dari 17 advisory menjadi 0 tanpa forced major audit fix.
- Menjadikan `src/lib/config/tiers.ts` sebagai business-rule source untuk harga, kredit, batas proyek, kelas model, dokumen inti, dan akses modul opsional.
- Menghapus duplikasi data pricing dari landing dan membuat `src/lib/pricing.ts` hanya menyimpan metadata/copy display di atas business config.
- Memperbaiki entitlement dokumen opsional yang sebelumnya masih dapat dibuka oleh Core; seluruh 8 modul opsional kini Prime-only sesuai monetization spec.
- Menyatukan multiplier kredit dan mapping kelas model pada generator dengan konfigurasi tier.
- Menyatukan rentang kredit ArroDesign UI dengan estimator runtime `ARRODESIGN_CREDITS`.
- Menyesuaikan empat navigasi client terhadap lint rule Next.js 16.3.3; logout tetap full reload untuk membersihkan client state.

**Hasil verifikasi**

- `npm audit --audit-level=moderate`: 0 vulnerability.
- `npm run test:tiers`: 41/41 lulus (sebelumnya 11 mapping test).
- `npm run lint`: lulus, 0 error dan 0 warning.
- Seluruh validation, error, security, content, dan credit test: lulus.
- `npm run build`: lulus dengan Next.js 16.3.3; TypeScript lulus dan 58 halaman statis dibuat.
- Browser smoke test `/generate`, landing pricing, dan `/tools/arrodesign`: copy/config benar dan tidak ada console warning/error.

**Ditunda secara eksplisit**

- Migrasi ESLint 9 ke ESLint 10 dipisahkan sebagai upgrade major tooling karena ESLint 9 masih kompatibel dengan config Next saat ini tetapi sudah berada di luar masa dukungan upstream.

### 29 Agustus 2026 — AI Output Benchmark Foundation

**Selesai**

- Menambahkan 10 brief benchmark sintetis yang mencakup SaaS, marketplace, mobile, AI app, internal tool, ecommerce, dan portfolio pada tiga tingkat detail.
- Menambahkan validator dataset yang menolak ID/FEAT-ID duplikat, cakupan kategori tidak lengkap, serta email atau nomor telepon pada fixture.
- Menambahkan evaluator deterministik untuk kelengkapan, FEAT-ID, konsistensi lintas dokumen, stack, actionability plan, format Markdown/YAML, groundedness heuristic, serta estimated-vs-actual usage.
- Menambahkan runner pembanding prompt/model version dengan threshold skor, batas regresi terhadap baseline, path traversal guard, dan laporan JSON untuk artefak CI/internal.
- Menambahkan prompt version terpusat dan menyimpan prompt version serta model route aktual pada generated file dan metadata credit ledger setiap generation.
- Menambahkan migrasi nullable `promptVersion`/`modelRoute` sehingga data lama tetap kompatibel.
- Menambahkan test evaluator benchmark ke CI.

**Hasil verifikasi**

- `npm run benchmark:ai:validate`: 10 kasus dan 7 kategori valid.
- `npm run test:ai-benchmark`: 8/8 lulus.
- Prisma 7.10 `generate` dan `validate`: lulus.
- `npm run test:credits`: 16/16 lulus setelah metadata provenance ditambahkan.
- `npm run lint`: lulus, 0 error dan 0 warning.

**Gate berikutnya**

- Generate baseline untuk seluruh fixture menggunakan environment AI test, review false-positive evaluator, lalu aktifkan quality gate wajib sebelum perubahan prompt produksi.

### 29 Agustus 2026 — Release Stabilization Audit

**Selesai**

- Menyelaraskan README dan dokumentasi lokal dengan status Late Beta / Pre-Production, stack Next.js 16.3.3 + Prisma 7.10, paket Base/Core/Prime, entitlement modul opsional Prime-only, model route aktual, dan Learn Hub publik 1 path/4 lesson.
- Memperbaiki integration fixture yang masih memakai enum Prisma legacy `STARTER`/`PRO` dan slug checkout `pro` menjadi `BASE`/`CORE` serta `core`.
- Menambahkan guard autentikasi pada smoke test generate dan mempertahankan fail-closed opt-in pada seluruh script yang dapat menyentuh layanan eksternal.
- Menambahkan `npm run check:release-db`, pemeriksaan read-only untuk migration, schema provenance, dan RLS tanpa mencetak credential.

**Hasil verifikasi**

- 147 assertion deterministik lulus: validation 12, errors 4, security 55, content 11, tiers 41, credits 16, dan AI benchmark 8.
- `npm run lint`: lulus, 0 error dan 0 warning.
- `npm run build`: lulus; TypeScript lulus dan 58 halaman statis dibuat.
- Seluruh integration script lolos pemeriksaan sintaks dan menolak eksekusi tanpa opt-in environment test eksplisit.

**Blocker eksternal yang ditemukan**

- `DIRECT_URL` dan `DATABASE_URL` saat ini ditolak provider database dengan kode `XX000`: tenant/user yang dikonfigurasi tidak ditemukan. Karena itu status migration `20260829120000_add_generation_provenance` dan penerapan RLS remote belum dapat diverifikasi.
- Credential/connection string database perlu diperbarui sebelum migration, cross-user RLS E2E, payment settlement, dan core paid-loop smoke test dapat dijalankan.

### 29 Agustus 2026 — Analytics Privacy Guard

**Selesai**

- Menambahkan schema allowlist properti analytics terpusat per event.
- Menghapus pengiriman pesan error generation mentah dan menggantinya dengan kode kategori stabil seperti `provider_quota`, `timeout`, `network`, atau `unknown`.
- Memastikan properti tak dikenal, email, prompt, object, dan detail error tidak diteruskan ke Vercel Analytics maupun log analytics development.
- Menambahkan regression test privacy analytics ke security suite.

**Hasil verifikasi**

- Analytics privacy regression: 7/7 lulus.
- Security suite gabungan: 62/62 lulus.
- `npm run lint`: lulus, 0 error dan 0 warning.
- `npm run build`: lulus; TypeScript lulus dan 58 halaman statis dibuat.
