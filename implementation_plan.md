# 🏗️ Backend Redesign — Implementation Plan ArroBuild

Redesain arsitektur backend ArroBuild dari sistem monolitik sederhana (tier config tersebar, tanpa kredit ledger, webhook opsional) menjadi sistem modular monolith yang kokoh sesuai spesifikasi di `docs-v2/Backend-sistem-baru`.

---

## User Review Required

> [!IMPORTANT]
> **Perubahan Prisma Schema Signifikan**
> Schema lama memiliki enum `SubscriptionTier` (FREE, STARTER, PRO, UNLIMITED) dan model `GeneratedFile`. Schema baru menggantinya dengan `Tier` (STARTER, PRO, PRO_MAX), menambah `CreditLedger`, `PaymentEvent`, dan model lain. Ini memerlukan **Prisma migration** yang akan mengubah tabel existing. Data existing di database perlu **dimigrasikan** (FREE → STARTER, UNLIMITED → PRO_MAX, dst).

> [!IMPORTANT]
> **Tidak Ada Lagi Tier FREE / Anonymous Generate — Keputusan Final**
> Sesuai `arrobuild_pricing_monetisasi_v2.md` §1 dan `docs-v2/MASTER-IMPLEMENTATION-PLAN.md`:
> - **Login wajib** sebelum akses form generate (bukan hanya saat klik Generate).
> - **Tier FREE dihapus** — enum baru: `STARTER`, `PRO`, `PRO_MAX`.
> - **Isi form (Step 1–4) gratis** tanpa AI dan tanpa potong kredit; paywall muncul saat klik Generate.
> - User tanpa subscription aktif **tidak bisa generate** — diarahkan ke halaman pricing, bukan didefaultkan ke tier gratis.
> - `assertCanGenerate()` untuk anonymous **dihapus**; middleware wajib session untuk `/generate` dan `/api/generate`.
> - Migrasi data: `UNLIMITED` → `PRO_MAX`, `STARTER` tetap; record `FREE` lama dihapus atau di-migrate ke tidak-aktif.

> [!CAUTION]
> **DeepSeek Model Migration — Deadline 24 Juli 2026 (16 hari lagi)**
> Alias `deepseek-chat` dan `deepseek-reasoner` pensiun 24 Juli 2026. Ini harus di-migrasi sebagai bagian pekerjaan ini.

## Prasyarat & Keputusan yang Masih Perlu Input Kamu

1. **Founder UUID untuk RLS policies** — Sediakan UUID dari Supabase Auth untuk `11-rls-policies.sql`.

2. **Upstash Redis** — Buat akun Upstash; set `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN` di `.env`.

3. **Midtrans Subscription API vs Manual Renewal** — Untuk billing berulang: Midtrans Subscription API atau manual renewal + reminder email?

> **Peta eksekusi keseluruhan (frontend + backend + launch):** lihat `docs-v2/MASTER-IMPLEMENTATION-PLAN.md`.

---

## Analisis Gap: Codebase Lama vs Spesifikasi Baru

| Aspek | Kondisi Saat Ini | Target Baru |
|---|---|---|
| **Tier config** | Tersebar di 4 file: [pricing.ts](file:///c:/Users/User/Documents/ArroBuild/src/lib/pricing.ts), [tier-enforcer.ts](file:///c:/Users/User/Documents/ArroBuild/src/lib/ai/tier-enforcer.ts), [auth.ts](file:///c:/Users/User/Documents/ArroBuild/src/lib/auth.ts), [types.ts](file:///c:/Users/User/Documents/ArroBuild/src/components/generate/types.ts) | 1 file `tiers.ts` — single source of truth |
| **Tier enum** | `FREE, STARTER, PRO, UNLIMITED` | `STARTER, PRO, PRO_MAX` |
| **Kredit** | Tidak ada tracking kredit | Double-entry ledger (`CreditLedger`) |
| **Ownership check** | Export route tanpa auth check | 2 lapis: app-layer + RLS database |
| **Webhook** | Signature opsional (`if (signatureKey && ...)`) | Signature WAJIB + idempotency |
| **Rate limiting** | Tidak ada | Upstash Redis, 2 lapis (IP + user) |
| **Provider AI** | Logic tersebar di orchestrator | AI Gateway pattern (adapter per provider) |
| **Middleware** | Hanya Supabase session refresh | + Rate limit + security headers |
| **Subscription expiry** | Field `expiresAt` ada, tidak ada scheduler | Cron job harian |

---

## Proposed Changes

Pekerjaan dibagi menjadi **7 fase** berurutan. Setiap fase bisa di-build dan di-test secara independen.

---

### Fase 1: Single Source of Truth — Config & Schema

Fondasi dari semua perubahan. Harus dikerjakan pertama karena semua fase lain bergantung pada ini.

#### [NEW] [tiers.ts](file:///c:/Users/User/Documents/ArroBuild/src/lib/config/tiers.ts)
- Adaptasi dari [10-tiers-config.ts](file:///c:/Users/User/Documents/ArroBuild/docs-v2/Backend-sistem-baru/10-tiers-config.ts)
- Single source of truth: `TIER`, `MODEL_CLASS`, `CREDIT_MULTIPLIER`, `TIER_CONFIG`
- Helper functions: `getTierConfig()`, `estimateCreditsPerDocument()`, `validateModelClassForTier()`

#### [NEW] [options.ts](file:///c:/Users/User/Documents/ArroBuild/src/lib/config/options.ts)
- Satu sumber array untuk `FRAMEWORKS`, `DESIGN_PRESETS`, `DATABASES`, `DEPLOYMENTS` dll
- Dipakai oleh Zod schema di route.ts DAN TypeScript types di frontend — tidak bisa out of sync

#### [MODIFY] [schema.prisma](file:///c:/Users/User/Documents/ArroBuild/prisma/schema.prisma)
- Merge perubahan dari [10A-prisma-schema-update.prisma](file:///c:/Users/User/Documents/ArroBuild/docs-v2/Backend-sistem-baru/10A-prisma-schema-update.prisma):
  - Ubah enum `SubscriptionTier` → `Tier` (STARTER, PRO, PRO_MAX)
  - Ubah enum `PaymentStatus` → tambah SETTLEMENT, CAPTURE, DENY, CANCEL
  - Tambah model: `CreditLedger`, `PaymentEvent`, `SystemConfig`, `WhatsappChat`, `RateLimitEvent`, `DocumentRevision`
  - Update model `User`: tambah `tier`, `creditBalance`, relasi `creditLedger`, `whatsappChat`
  - Update model `Subscription`: tambah `renewalDate`, `startDate`
  - Update model `Project`: tambah field `planData` (JSON), rename `GeneratedFile` → `GeneratedDocument` dengan field tambahan `modelClass`, `tokensUsed`, `version`
- Buat migration: `npx prisma migrate dev --name backend_v2_redesign`

#### [NEW] [logger.ts](file:///c:/Users/User/Documents/ArroBuild/src/lib/logger.ts)
- Simple structured logger (wrapper `console.log` JSON format)
- Akan di-upgrade ke `pino` + Sentry di Fase 7

---

### Fase 2: Keamanan Database — RLS Policies

#### [NEW] [rls-policies.sql](file:///c:/Users/User/Documents/ArroBuild/src/lib/security/rls-policies.sql)
- Adaptasi dari [11-rls-policies.sql](file:///c:/Users/User/Documents/ArroBuild/docs-v2/Backend-sistem-baru/11-rls-policies.sql)
- 14 RLS policies untuk semua tabel sensitif
- Placeholder `INSERT_YOUR_FOUNDER_ID_HERE` — perlu diganti dengan founder UUID aktual
- File ini referensi saja; dijalankan manual di Supabase SQL editor

#### [MODIFY] [route.ts (export)](file:///c:/Users/User/Documents/ArroBuild/src/app/api/export/route.ts)
- Tambah ownership check: verify `project.userId === session.userId` sebelum query
- Saat ini route ini **tidak punya auth check sama sekali** — ini security gap P0

---

### Fase 3: Credit Service — Ledger & Reserve/Commit

#### [NEW] [credit.service.ts](file:///c:/Users/User/Documents/ArroBuild/src/lib/services/credit.service.ts)
- Adaptasi dari [12-credit-service.ts](file:///c:/Users/User/Documents/ArroBuild/docs-v2/Backend-sistem-baru/12-credit-service.ts)
- Methods: `reserveCredit()`, `commitCredit()`, `releaseReservation()`, `getBalance()`, `refreshMonthlyCredits()`, `applyRollover()`, `adjustCredits()`
- Thread-safe via Prisma `$transaction` + `Serializable` isolation level

#### [NEW] [tier.service.ts](file:///c:/Users/User/Documents/ArroBuild/src/lib/services/tier.service.ts)
- Wrapper untuk tier config lookup + user tier resolution
- Replace logic tersebar di `auth.ts` dan `tier-enforcer.ts`

---

### Fase 4: Payment Service & Webhook Overhaul

#### [NEW] [payment.service.ts](file:///c:/Users/User/Documents/ArroBuild/src/lib/services/payment.service.ts)
- Adaptasi dari [12A-payment-service.ts](file:///c:/Users/User/Documents/ArroBuild/docs-v2/Backend-sistem-baru/12A-payment-service.ts)
- `createSnapToken()` — menggunakan `midtrans.ts` existing (refactor ke service pattern)
- `handleWebhook()` — signature WAJIB + idempotency via `PaymentEvent` UNIQUE constraint
- `processExpiredSubscriptions()` — untuk cron job

#### [MODIFY] [route.ts (webhook)](file:///c:/Users/User/Documents/ArroBuild/src/app/api/payment/webhook/route.ts)
- Refactor total: delegate ke `PaymentService.handleWebhook()`
- **Hapus** kondisional signature check (`if (signatureKey && ...)` → signature WAJIB)
- Tambah idempotency: cek `PaymentEvent` sebelum proses
- Atomic transaction: payment status + subscription + credit refresh dalam 1 TX

#### [MODIFY] [midtrans.ts](file:///c:/Users/User/Documents/ArroBuild/src/lib/midtrans.ts)
- Update `verifyWebhookSignature()` — sesuaikan parameter agar cocok dengan `PaymentService`
- Pertahankan `createSnapToken()` existing, tapi pastikan import dari `tiers.ts` bukan `pricing.ts`

#### [MODIFY] [activate-subscription.ts](file:///c:/Users/User/Documents/ArroBuild/src/lib/payment/activate-subscription.ts)
- Refactor: pindahkan logic ke `PaymentService`, file ini jadi thin wrapper atau dihapus

---

### Fase 5: Rate Limiting & Middleware Enhancement

#### [NEW] [rate-limit.ts](file:///c:/Users/User/Documents/ArroBuild/src/lib/rate-limit.ts)
- `ipLimiter`: 30 req/menit per IP (Upstash sliding window)
- `generateLimiter(tier)`: sesuai `maxProjectsPerDay` di `TIER_CONFIG`
- Graceful fallback jika Redis unavailable

#### [MODIFY] [middleware.ts](file:///c:/Users/User/Documents/ArroBuild/src/middleware.ts)
- Tambah IP rate limiting (dari Upstash)
- Pertahankan Supabase session update existing

#### [MODIFY] [next.config.ts/js](file:///c:/Users/User/Documents/ArroBuild/next.config.ts)
- Tambah security headers: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy

---

### Fase 6: Refactor Route Handlers & Auth

#### [MODIFY] [route.ts (generate)](file:///c:/Users/User/Documents/ArroBuild/src/app/api/generate/route.ts)
- Import Zod enums dari `options.ts` (bukan hardcode di sini)
- Integrasi `CreditService.reserveCredit()` sebelum generate
- Integrasi `CreditService.commitCredit()` setelah generate selesai
- Tangani gagal: `CreditService.releaseReservation()` di catch block

#### [MODIFY] [auth.ts](file:///c:/Users/User/Documents/ArroBuild/src/lib/auth.ts)
- `getEffectiveTier()` → import dari `tiers.ts`, bukan hardcode mapping
- `assertCanGenerate()` → integrasi kredit check via `CreditService.getBalance()`
- Hapus `FREE_PROJECT_LIMIT` hardcode, ganti dengan `TIER_CONFIG[tier].maxProjectsPerMonth`

#### [MODIFY] [tier-enforcer.ts](file:///c:/Users/User/Documents/ArroBuild/src/lib/ai/tier-enforcer.ts)
- Hapus `V3_TIER_CONFIG` lokal — import dari `src/lib/config/tiers.ts`
- Update `ModelId` — migrasi `deepseek-chat` ke nama model baru (DeepSeek V4 Flash)
- Sederhanakan: fokus pada enforcement saja, config ada di `tiers.ts`

#### [MODIFY] [pricing.ts](file:///c:/Users/User/Documents/ArroBuild/src/lib/pricing.ts)
- Import harga dari `tiers.ts` — **tidak boleh ada angka harga hardcode lagi**
- Update tier names: `free` → `starter`, `unlimited` → `pro_max`

---

### Fase 7: AI Gateway Foundation

#### [NEW] [model-router.ts](file:///c:/Users/User/Documents/ArroBuild/src/lib/ai-gateway/model-router.ts)
- Pemetaan `ModelClass` → provider + model name konkret
- Fallback chain: jika provider A gagal → coba provider B di kelas yang sama

#### [NEW] [context-builder.ts](file:///c:/Users/User/Documents/ArroBuild/src/lib/ai-gateway/context-builder.ts)
- Token cap sesuai `TIER_CONFIG.maxContextInjectionTokens`
- Ringkasan terstruktur (JSON) bukan dump mentah

#### [NEW] [types.ts](file:///c:/Users/User/Documents/ArroBuild/src/lib/ai-gateway/types.ts)
- `ProviderAdapter` interface

#### [NEW] adapters: [gemini.ts](file:///c:/Users/User/Documents/ArroBuild/src/lib/ai-gateway/adapters/gemini.ts), [openai.ts](file:///c:/Users/User/Documents/ArroBuild/src/lib/ai-gateway/adapters/openai.ts), [anthropic.ts](file:///c:/Users/User/Documents/ArroBuild/src/lib/ai-gateway/adapters/anthropic.ts), [deepseek.ts](file:///c:/Users/User/Documents/ArroBuild/src/lib/ai-gateway/adapters/deepseek.ts)
- Implementasi `ProviderAdapter` per provider
- DeepSeek adapter langsung pakai model name baru (bukan alias `deepseek-chat`)

---

## Struktur Folder Akhir (Backend)

```
src/
├── app/api/
│   ├── generate/route.ts        ← [MODIFY] integrasi kredit + Zod dari options.ts
│   ├── export/route.ts          ← [MODIFY] tambah ownership check
│   ├── payment/
│   │   ├── create/route.ts
│   │   ├── confirm/route.ts
│   │   ├── config/route.ts
│   │   └── webhook/route.ts     ← [MODIFY] refactor total
│   └── admin/
│       └── dashboard/page.tsx   ← [FUTURE — Fase 7 monitoring]
│
├── lib/
│   ├── config/
│   │   ├── tiers.ts             ← [NEW] single source of truth
│   │   └── options.ts           ← [NEW] sumber Zod + TS type
│   ├── ai-gateway/
│   │   ├── types.ts             ← [NEW]
│   │   ├── model-router.ts      ← [NEW]
│   │   ├── context-builder.ts   ← [NEW]
│   │   └── adapters/
│   │       ├── gemini.ts        ← [NEW]
│   │       ├── openai.ts        ← [NEW]
│   │       ├── anthropic.ts     ← [NEW]
│   │       └── deepseek.ts      ← [NEW]
│   ├── services/
│   │   ├── credit.service.ts    ← [NEW]
│   │   ├── tier.service.ts      ← [NEW]
│   │   └── payment.service.ts   ← [NEW]
│   ├── security/
│   │   └── rls-policies.sql     ← [NEW] referensi, paste manual
│   ├── rate-limit.ts            ← [NEW]
│   ├── logger.ts                ← [NEW]
│   ├── auth.ts                  ← [MODIFY]
│   ├── midtrans.ts              ← [MODIFY]
│   ├── pricing.ts               ← [MODIFY]
│   └── ai/
│       ├── tier-enforcer.ts     ← [MODIFY]
│       └── ... (existing files)
│
├── middleware.ts                 ← [MODIFY]
└── prisma/
    └── schema.prisma            ← [MODIFY]
```

---

## Verification Plan

### Automated Tests
```bash
# 1. Build check — pastikan compile tanpa error
npm run build

# 2. Prisma migration test
npx prisma migrate dev --name backend_v2_redesign

# 3. Unit test Credit Service (concurrent reserve)
npm test -- credit.service.test.ts

# 4. Type check
npx tsc --noEmit
```

### Manual Verification
- **RLS**: Login sebagai user A, coba query project user B → harus empty
- **Webhook**: POST payload dengan signature palsu → harus 401
- **Rate limit**: Kirim request melebihi daily limit → harus 429
- **Export**: Coba export project milik user lain → harus 403
- **Kredit flow**: Reserve → Generate → Commit → cek saldo berkurang sesuai aktual

### Pre-Launch Checklist (dari 09A §3.2)
```
🔴 P0 — WAJIB
[ ] RLS policy test passed
[ ] Race condition test passed (50 concurrent requests)
[ ] Webhook signature WAJIB (bukan opsional)
[ ] Rate limit ditegakkan
[ ] Export route ownership check

🟡 P1 — Strongly Recommended
[ ] Sentry setup & tested
[ ] DeepSeek V4 Flash model tested
[ ] Ledger reconciliation script

🟢 P2 — Nice to Have
[ ] Cron job subscription expiry
[ ] Admin dashboard
```

---

## Dependencies Baru yang Perlu Diinstall

| Package | Fungsi |
|---|---|
| `@upstash/redis` | Redis client untuk rate limiting |
| `@upstash/ratelimit` | Sliding window rate limiter |
| `@sentry/nextjs` | Error tracking (Fase 7) |

---

## Timeline Estimasi

| Fase | Estimasi | Dependensi |
|---|---|---|
| Fase 1: Config & Schema | 1 hari | — |
| Fase 2: RLS Policies | 0.5 hari | Fase 1 |
| Fase 3: Credit Service | 1.5 hari | Fase 1 |
| Fase 4: Payment Service | 1.5 hari | Fase 1, 3 |
| Fase 5: Rate Limiting | 0.5 hari | Fase 1 |
| Fase 6: Refactor Routes | 1.5 hari | Fase 1, 3, 4, 5 |
| Fase 7: AI Gateway | 2 hari | Fase 1, 6 |
| **Total** | **~8-9 hari kerja** | |
