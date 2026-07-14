# Hasil Testing — ArroBuild v2

> **Diperbarui:** 12 Juli 2026  
> **Lingkungan:** `localhost:3000` + `.env.local`  
> **Panduan:** `PANDUAN-TESTING-PRODUCTION.md`  
> **Konteks fitur:** `HASIL-DOCS-V2.md`

Dokumen ini menggabungkan **testing otomatis (agent)** dan **testing manual (kamu)** sebelum deploy production.

---

## Ringkasan Eksekutif

| Area | Status | Catatan |
|------|--------|---------|
| Test otomatis (API, security, draft, RLS) | ✅ **63/63** lulus | 12 Jul 2026, dev server aktif |
| Testing manual Skenario 1–4 | ✅ Selesai | Paywall, Starter, Pro, Security |
| Testing manual Skenario 5 (Draft) | 🔄 Sebagian | localStorage OK; server draft via API otomatis OK |
| Bugfix selama sesi QA | ✅ 9 isu diperbaiki | Lihat §4 |
| `npm run build` | ✅ **Hijau** | 12 Jul 2026 — fix `AppNav.tsx` + `DashboardShell` Suspense |
| Deploy production | ⏳ Belum | Checklist §6 |

**Kesimpulan:** Fungsional inti sudah diverifikasi end-to-end di sandbox. Build production hijau — siap deploy + smoke test.

---

## 1. Testing Otomatis (Agent)

> Dev server wajib aktif: `npm run dev` di port **3000**.

### 1.1 Ringkasan suite — 12 Juli 2026

| Suite | Hasil | Detail |
|-------|-------|--------|
| `npm run test:validation` | ✅ **12/12** | Validasi output AI, dedupe, merge |
| `npm run test:errors` | ✅ **4/4** | Pesan error 429 ramah pengguna |
| `npm run test:backend` | ✅ **15/15** | Auth, kredit, paywall 402, payment snap, generate stream |
| `npm run test:production` | ✅ **32/32** | Security, RLS, cross-user, draft limit, export tree |
| `npm run test:midtrans` | ✅ | Snap token sandbox berhasil |
| `npm run build` | ⚠️ | TypeScript error di `AppNav.tsx:145` (`link.external`) |

**Total otomatis:** 63 assertions lulus (tidak termasuk build).

Jalankan ulang:

```bash
npm run dev              # terminal 1
npm run test:backend
npm run test:production
npm run test:midtrans
npm run test:validation
npm run test:errors
npm run build            # wajib hijau sebelum deploy
```

### 1.2 Detail yang diverifikasi otomatis

#### Marketing & halaman statis
- `/` tanpa copy misleading (free tanpa login, Rp49K, unlimited)
- `/terms`, `/privacy`, `/tools` → 200

#### Keamanan
- Security headers: CSP, X-Frame-Options, nosniff, Referrer-Policy
- API tanpa login → **401** (`generate`, `export`, `draft`, `payment`, `tools`)
- Webhook signature invalid → **401**
- User B tidak bisa export / GET project User A → **403**
- RLS aktif di 5 tabel sensitif (query langsung ke DB)

#### Bisnis logic
- Generate tanpa subscription → **402**
- Payment Snap token (Starter + Pro 3 bulan, orderId `m3-`)
- Draft server: 5 OK, ke-6 → **409**
- Starter regen per file → **403**
- Pro tier terbaca di `/api/user/me`
- Export tree: `PRD.md` + `.cursorrules` untuk agent Cursor

#### Infrastruktur lokal
- Env: Gemini, Upstash, `CRON_SECRET`, `RATE_LIMIT_REQUIRED`, Midtrans
- Schema DB: `credit_ledger`, `payments`, `subscriptions`, `payment_events`
- Rate limit Upstash: 429 pada request ~ke-20 (verifikasi sesi 11 Jul)

### 1.3 Hasil otomatis sebelumnya (11 Juli 2026)

| Perubahan | Sebelum | Sesudah (12 Jul) |
|-----------|---------|------------------|
| `test:validation` | 8/8 | **12/12** (test dedupe/merge ditambah) |
| `test:production` | 32/32 | 32/32 (tetap hijau) |
| `test:backend` | 15/15 | 15/15 (tetap hijau) |

---

## 2. Testing Manual (Kamu)

Akun utama uji: **Elena (Pro)** + akun Starter terpisah untuk Skenario 2.

### Skenario 1 — New User → Paywall ✅

| Step | Aksi | Hasil |
|------|------|-------|
| 1 | Buka `/` tanpa login | Tidak ada CTA misleading |
| 2 | CTA utama → signup | Redirect benar |
| 3 | Daftar / login | Dashboard bisa diakses |
| 4 | Isi `/generate` Step 0–4 | Sampai ConfirmScreen |
| 5 | Generate tanpa paket | Paywall + rekomendasi tier |
| 6 | `POST /api/generate` tanpa cookie | 401 (otomatis) |

### Skenario 2 — Starter E2E ✅

| Step | Aksi | Hasil |
|------|------|-------|
| 1 | Upgrade Starter via Midtrans sandbox | Snap sukses |
| 2 | Kartu `4811 1111 1111 1114` | Paket aktif, ~3000 kredit |
| 3 | Generate 3 dokumen default | SSE selesai, file di workspace |
| 4 | Saldo kredit berkurang | Sesuai estimasi |
| 5 | Export ZIP + preview tree | Struktur folder benar |
| 6 | Regen file | 403 (Starter) — otomatis juga |

### Skenario 3 — Pro ✅

| Step | Aksi | Hasil |
|------|------|-------|
| 1 | Generate 5 dokumen core Pro | Semua selesai |
| 2 | Pilih kelas model per dokumen (Step 4) | ✅ Setelah fix model-class picker |
| 3 | Stack frontend + backend terpisah (Step 3) | ✅ Setelah fix `backendFramework` |
| 4 | Dokumen opsional Pro (mis. Cost, Analytics) | ✅ Setelah fix cap `getMaxDocumentsForTier` |
| 5 | Revisi pertama bulan ini | **Gratis** — UI "revisi gratis" |
| 6 | Revisi kedua | Potong kredit |
| 7 | Request WA 1× dan 2× | Sukses, kuota 2/2 |
| 8 | Request WA ke-3 | Quota exhausted |
| 9 | Halaman `/dashboard/support` | UI dukungan WA dedicated |

### Skenario 4 — Security ✅

| Step | Aksi | Hasil |
|------|------|-------|
| 1 | User A akses project User B | 403 |
| 2 | Export project orang lain | 403 |
| 3 | Webhook signature invalid | 401 (otomatis) |

### Skenario 5 — Draft & Autosave 🔄

| Step | Aksi | Hasil |
|------|------|-------|
| 1 | Isi form, refresh halaman | ✅ Draft kembali (localStorage + modal restore) |
| 2 | Modal draft tidak overlap konten | ✅ Setelah fix overlay centered |
| 3 | Login, isi form, `GET /api/project/draft` | ✅ Entry ada (autosave server ~1.5s) |
| 4 | Buang draft → isi baru → ulang 5× | Alur multi-draft dijelaskan; `Buang, mulai baru` reset server draft ID |
| 5 | Draft ke-6 tanpa generate → 409 | ✅ Via `npm run test:production` (belum diulang manual browser) |

### Setup manual infrastruktur (sudah kamu selesaikan)

| Item | Status |
|------|--------|
| Supabase project + auth | ✅ |
| RLS aktif (5 tabel) | ✅ Diverifikasi agent + otomatis |
| `.env.local` lengkap (Gemini, Midtrans sandbox, Upstash, CRON) | ✅ Dirapikan 10 Jul |
| `RATE_LIMIT_REQUIRED=true` | ✅ |
| Prisma migrate lokal | ✅ |
| Midtrans sandbox keys | ✅ |

---

## 3. Bug Ditemukan & Diperbaiki Saat QA

| # | Isu | Perbaikan |
|---|-----|-----------|
| 1 | Kelas model Step 4 tidak bisa dipilih (Pro) | Callback `onModelClassChange(doc, mc)` + functional state |
| 2 | Stack hanya satu `framework` | `backendFramework` terpisah di StackStep |
| 3 | Dokumen opsional Pro tidak digenerate | `getMaxDocumentsForTier` menghitung semua dokumen tier |
| 4 | Agent Rules output bahasa Inggris | Prompt rules Bahasa Indonesia |
| 5 | Revisi error `Unexpected token '<'` / section 404 | Normalisasi `fileKey`, `findSection` lebih robust, safe JSON parse |
| 6 | WA support terlalu berat di Overview | Halaman `/dashboard/support` + teaser |
| 7 | Modal draft overlap form | Modal centered overlay |
| 8 | `security-launch` terpilih sendiri di Pro (Pro Max lock) | `sanitizeSelectedDocs()` + filter preset stage |
| 9 | Build/runtime Internal Server Error (cache) | Clean `.next` + restart dev server |
| 10 | `npm run build` gagal (AppNav TS + Suspense dashboard) | Fix `external` guard + `DashboardShell` Suspense |

---

## 4. Belum Diverifikasi / Retest Disarankan

| Item | Prioritas | Catatan |
|------|-----------|---------|
| Regenerate opsional dokumen (Pro) | P1 | Retest setelah fix cap dokumen |
| Skenario 5 step 5 manual di browser | P2 | Sudah hijau via API otomatis |
| Pro Max full E2E (6 core + opsional + adaptive) | P2 | Belum diuji manual |
| Paket multi-bulan 3/4 bln di browser | P2 | API otomatis OK; UI belum |
| Mini tools #1–6 per tier | P2 | Endpoint ada; belum QA manual menyeluruh |
| Interview mode (Step 0 Dipandu) | P2 | Backend ada |
| `FOUNDER_WHATSAPP_NUMBER` di env | P1 deploy | Tanpa ini WA link tidak buka wa.me |
| `FOUNDER_EMAIL` / `FOUNDER_USER_ID` | P2 | Untuk `/admin/metrics` |

---

## 5. Checklist Deploy Production

> Lakukan **setelah** `npm run build` hijau.

| # | Task | Owner |
|---|------|-------|
| 1 | Salin `.env.local` → Vercel (production keys) | Manual |
| 2 | `MIDTRANS_IS_PRODUCTION=true` + webhook production | Manual |
| 3 | Supabase: leaked password protection ON | Manual |
| 4 | Supabase: backup terjadwal | Manual |
| 5 | `npx prisma migrate deploy` di production | Manual |
| 6 | Smoke test 1× di URL production (akun internal) | Manual |
| 7 | Isi `FOUNDER_EMAIL` / `FOUNDER_USER_ID` | Manual |
| 8 | Opsional: `SENTRY_DSN` → test capture error | Manual |

---

## 6. Kartu Test Midtrans Sandbox

| Field | Nilai |
|-------|-------|
| Kartu | `4811 1111 1111 1114` |
| CVV | `123` |
| Exp | `01/28` |
| OTP | `112233` |

---

## 7. Kesimpulan

| Lapisan | Verdict |
|---------|---------|
| Backend & API | ✅ Siap |
| Keamanan & isolasi data | ✅ Siap |
| Alur bisnis Starter + Pro | ✅ Diverifikasi manual |
| Draft & autosave | ✅ Inti OK |
| Build production | ✅ Hijau |
| Go-live | ⏳ Deploy + smoke test |

**Langkah berikutnya:** deploy staging/production → smoke test 1 akun internal → announce.
