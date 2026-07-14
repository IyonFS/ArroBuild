# Hasil Penyelesaian docs-v2 — ArroBuild

> **Diperbarui:** 12 Juli 2026  
> **Sumber rencana:** `docs-v2/`, `MASTER-IMPLEMENTATION-PLAN.md`  
> **Plan penutupan:** `PLAN-PENYELESAIAN-DOCS-V2.md`  
> **Analisis awal:** `analysis-docs-v2.md` (10 Jul — sebagian sudah usang)  
> **Testing:** `HASIL-TESTING.md`

Dokumen ini adalah **snapshot konteks**: apa yang sudah selesai, berhasil diverifikasi, dan apa yang sengaja ditunda post-launch.

---

## 1. Ringkasan Eksekutif

ArroBuild v2 adalah perombakan di **tiga sumbu**:

| Sumbu | Target docs-v2 | Status 12 Jul 2026 |
|-------|----------------|---------------------|
| **Data** | Knowledge Model JSON + FEAT-ID sejak form | ✅ **Selesai** |
| **Monetisasi** | Login wajib → form gratis → paywall → kredit | ✅ **Selesai** |
| **Backend** | Modular monolith: tier, ledger, RLS, AI Gateway | ✅ **Selesai** |

### Progres estimasi (vs analisis 10 Jul)

```
Frontend form flow (Fase 0–7)     ████████████████████  ~98%
Backend core (Gelombang 1)        ████████████████████  ~98%
Integrasi generate (Gelombang 2)  ████████████████████  ~98%
Fitur lanjutan (Gelombang 3)      ███████████████████░  ~95%
Launch prep (Gelombang 4)         █████████████████░░░  ~85%
```

**Alur end-to-end hidup:** login → form v2 (4 step + mode dipandu) → paywall → Midtrans → generate SSE → workspace revisi/regen → export ZIP + tree preview.

---

## 2. Per Gelombang — Apa yang Selesai

### Gelombang 0 — P0 & Migrasi Urgent ✅

| Item | Status |
|------|--------|
| DeepSeek V4 Flash di model router | ✅ |
| `selectedDocs` + `perDocumentModelClass` ke API | ✅ |
| Zod schema sinkron dengan types v2 | ✅ |
| Hapus komponen legacy (IdeaInput, dll.) | ✅ |
| Rename tier `starter` / `pro` / `pro_max` | ✅ |
| Navbar hydration fix | ✅ |
| `npm run build` | ✅ |

### Gelombang 1 — Backend Core ✅

| Komponen | Lokasi | Status |
|----------|--------|--------|
| Tier config | `src/lib/config/tiers.ts` | ✅ |
| Document config (14 dokumen) | `src/lib/config/documents.ts` | ✅ |
| Prisma schema v2 | `prisma/schema.prisma` | ✅ |
| Credit service (reserve/commit/release) | `credit.service.ts` | ✅ |
| Payment service + webhook idempotent | `payment.service.ts` | ✅ |
| RLS policies | `rls-policies.sql` — **dijalankan di Supabase** | ✅ |
| Upstash rate limit | `rate-limit.ts` + `RATE_LIMIT_REQUIRED` | ✅ |
| AI Gateway + model router | `ai-gateway/model-router.ts` | ✅ |
| Cron renew-credits + reconcile | `vercel.json` | ✅ |

### Gelombang 2 — Integrasi Generate & Dokumen ✅

| Item | Status |
|------|--------|
| Knowledge Model JSON di `planData` | ✅ |
| Reserve kredit sebelum generate | ✅ |
| Orchestrator v3 (features, productType, model class) | ✅ |
| Context manager cap token per tier | ✅ |
| YAML FEAT-ID di PRD | ✅ |
| Tier-gating dokumen per tier | ✅ |
| Paywall ConfirmScreen (`assertCanGenerate` → 402) | ✅ |
| Login wajib (middleware) | ✅ |
| Draft localStorage (30 hari) | ✅ |
| Draft server-side max 5 / expire 30 hari | ✅ `draft.service.ts` |
| Sanitasi seleksi dokumen per tier | ✅ `sanitizeSelectedDocs()` |

### Gelombang 3 — Fitur Lanjutan ✅

| Item | Status |
|------|--------|
| Mode Dipandu AI (Step 0) + `/api/interview` | ✅ |
| Kuota 3 sesi interview/bulan | ✅ |
| Workspace IDE 3-panel | ✅ |
| Cross-reference FEAT-ID | ✅ |
| Revisi section + diff + estimasi kredit | ✅ |
| Pro: 1 revisi gratis/bulan | ✅ |
| Regen per file (Pro Max) | ✅ |
| Live Build Log (SSE) | ✅ |
| Chip jawaban cepat Step 2 | ✅ |
| Export preview folder tree | ✅ |
| Stack frontend + backend terpisah | ✅ |
| Kelas model per dokumen (Step 4) | ✅ |
| WhatsApp support UI + quota | ✅ `/dashboard/support` |

### Gelombang 4 — Launch Prep ~85%

| Item | Status |
|------|--------|
| Landing copy v2 (no free tanpa login) | ✅ |
| ToS & Privacy | ✅ `/terms`, `/privacy` |
| Security headers | ✅ `next.config.ts` |
| Test suite otomatis | ✅ 63 assertions |
| CI build + lint | ✅ `.github/workflows/ci.yml` |
| Sentry SDK | ✅ (aktif jika `SENTRY_DSN` diisi) |
| Admin metrics founder | ✅ `/admin/metrics` |
| Deploy production | ⏳ Manual |
| Supabase leaked password protection | ⏳ Manual |

---

## 3. Sistem Dokumen (14 File)

Sumber kebenaran: `src/lib/config/documents.ts`

### 3.1 Dokumen inti (6)

| Key | Label | Min tier | Generate |
|-----|-------|----------|----------|
| `prd` | PRD | Starter | ✅ |
| `architecture` | Architecture & Blueprint | Starter | ✅ |
| `plan-task` | Plan / Task | Starter | ✅ |
| `design-system` | Design System | Pro | ✅ |
| `agent-rules` | Agent Rules | Pro | ✅ |
| `adaptive-document` | Dokumen Adaptif | Pro Max | ✅ (belum QA manual penuh) |

### 3.2 Dokumen opsional (8)

| Key | Label | Min tier | Generate |
|-----|-------|----------|----------|
| `cost-infrastructure` | Cost & Infrastructure | Pro | ✅ |
| `analytics-metrics` | Analytics & Metrics | Pro | ✅ |
| `testing-qa` | Testing & QA Plan | Pro | ✅ |
| `onboarding-email` | Onboarding & Email | Pro | ✅ |
| `competitive-analysis` | Competitive Analysis | Pro | ✅ |
| `security-launch` | Security & Launch Checklist | Pro Max | ✅ (gated) |
| `database-deep-dive` | Database Deep-Dive | Pro Max | ✅ (gated) |
| `compliance-legal` | Compliance & Legal | Pro Max | ✅ (gated) |

### 3.3 Akses per tier

| Tier | Dokumen default | Max pilih | Kelas model |
|------|-----------------|-----------|-------------|
| **Starter** | PRD, Architecture, Plan/Task (3) | 3 | Hemat saja |
| **Pro** | 5 core (tanpa adaptive) | 10 | Hemat, Menengah, Flagship |
| **Pro Max** | 6 core + opsional | 14 | Semua kelas |

Prompt per dokumen: `src/lib/ai/prompts/` (termasuk `prd.ts`, `architecture.ts`, `plan-task.ts`, `design-system.ts`, `agent-rules.ts`, `adaptive-document.ts`, `optional-modules.ts`, dll.)

---

## 4. Monetisasi & Kebijakan Bisnis

Keputusan final: `docs-v2/DECISIONS.md`

| Kebijakan | Implementasi | Diverifikasi |
|-----------|--------------|--------------|
| Harga Rp 65K / 145K / 199K | `TIER_CONFIG` | ✅ |
| Kredit 3K / 7K / 14K per bulan | `credit.service` refresh | ✅ |
| 4 kelas model + multiplier | `tiers.ts` | ✅ |
| Login wajib, paywall di generate | middleware + 402 | ✅ |
| Top-up 20K / 45K / 85K | `/api/payment/topup` | ✅ API |
| Max user Fase 1 (150/60/15) | `capacity.service` | ✅ |
| Waitlist saat penuh | `/api/waitlist` | ✅ |
| Pro: 1 revisi gratis/bulan | `commitFreeRevision` | ✅ Manual |
| Pro Max: regen per file | `/api/project/[id]/regen` | ✅ API |
| WA chat 2×/bulan (Pro) | `whatsapp/request` | ✅ Manual |
| Paket multi-bulan 3/4 bln | `SUBSCRIPTION_PACKS` | ✅ API; UI ada |
| Pro Max bonus +500 kredit pertama | `payment.service` webhook | ✅ Kode |

---

## 5. Form Flow v2 (08-form-flow-redesign)

| Fase | Fitur | Status |
|------|-------|--------|
| 0 | Mode Cepat vs Dipandu AI | ✅ |
| 1 | Tipe produk (8 tipe) | ✅ |
| 2 | Konteks + chips + Feature Builder | ✅ |
| 3 | Stack (frontend + backend terpisah) | ✅ |
| 4 | Pilih dokumen + kelas model per dokumen | ✅ |
| 5 | Confirm + paywall + estimasi kredit | ✅ |
| 6 | Generate SSE + progress | ✅ |
| 7 | Preview + masuk workspace | ✅ |

**Autosave:** localStorage (`generate-draft.ts`) + server sync (`POST /api/project/draft`) untuk user login.

---

## 6. Inventaris Task Plan (P0–P3)

Ringkasan dari `PLAN-PENYELESAIAN-DOCS-V2.md`:

### P0 — Blocker Launch: **10/10 ✅**

Landing copy, RLS, Upstash, cron, security headers, navbar, revisi policy, top-up pricing, ToS/Privacy, env checklist.

### P1 — MVP Lengkap: **14/15 ✅**

| ID | Item | Status |
|----|------|--------|
| P1-01 | Draft server max 5 | ✅ |
| P1-02 | Smart tier recommendation | ✅ |
| P1-03 | Paket multi-bulan | ✅ |
| P1-04 | Export tree preview | ✅ |
| P1-05 | Chips Step 2 | ✅ |
| P1-06 | Revisi gratis Pro | ✅ |
| P1-07 | Starter WA upsell message | ✅ |
| P1-08 | Mini tools tier gating | ✅ |
| P1-09 | Legacy prompt cleanup | ✅ |
| P1-10 | Ledger reconciliation cron | ✅ |
| P1-11 | Sentry | ✅ |
| P1-12 | Test scripts CI-ready | ✅ |
| P1-13 | Deprecate `context-docs-v2.md` | 📋 Dokumentasi |
| P1-14 | Interview RLS | ✅ |
| P1-15 | Waitlist RLS | ✅ |

### P2 — Polish: **6/7 ✅**

Micro-interactions, a11y Feature Builder, mobile workspace, Pro Max bonus, pricing badges, admin metrics. Ngrok doc untuk webhook lokal: 📋 opsional.

### P3 — Mini Tools: **6/8 ✅**

| Tool | Route | Status |
|------|-------|--------|
| Stitch Prompt Composer | `/tools/stitch-composer` | ✅ |
| Prompt Doctor | `/tools/prompt-doctor` | ✅ |
| MVP Scope Cutter | `/tools/mvp-scope-cutter` | ✅ |
| README Generator | `/tools/readme-generator` | ✅ |
| Landing Copy | `/tools/landing-copy` | ✅ |
| Schema Visualizer | `/tools/schema-visualizer` | ✅ |
| Portfolio | `/tools/portfolio` | ✅ |
| Design Reference Scraper | — | ⏸ Post-MVP (Playwright) |
| WhatsApp bot otomatis | — | ⏸ Post-MVP |

---

## 7. API Endpoints v2 (Utama)

| Endpoint | Fungsi |
|----------|--------|
| `POST /api/generate` | Generate dengan reserve kredit |
| `GET /api/export` | Export ZIP + ownership |
| `POST /api/interview` | Mode Dipandu AI |
| `GET/POST/DELETE /api/project/draft` | Draft server |
| `POST /api/project/[id]/revise` | Revisi section |
| `POST /api/project/[id]/regen` | Regen satu file |
| `POST /api/payment/create` | Snap subscription |
| `POST /api/payment/topup` | Top-up kredit |
| `POST /api/payment/webhook` | Midtrans settlement |
| `GET /api/user/me` | Tier, kredit, kuota WA |
| `GET/POST /api/whatsapp/request` | Dukungan WA |
| `POST /api/tools/run` | Mini tools |
| `POST /api/cron/renew-credits` | Refresh bulanan |
| `POST /api/cron/reconcile-ledger` | Drift alert |

---

## 8. Eksplisit Post-MVP (Tidak Blocking Launch)

| Item | Alasan ditunda |
|------|----------------|
| Design Reference Scraper | Butuh infra Playwright |
| WhatsApp bot + slot scheduling | Layanan manual dulu via wa.me |
| `SystemConfig` tier dinamis via UI | Config di kode cukup untuk launch |
| Fase 2 max user (300/120/30) | Tetap Fase 1 (150/60/15) |
| Draft list UI di dashboard | API ada; UX lanjutan |
| Full QA Pro Max 14 dokumen | Prioritas setelah deploy |

---

## 9. File Kunci untuk Onboarding Developer

| Area | Path |
|------|------|
| Generate flow | `src/app/generate/page.tsx` |
| Dokumen & tier | `src/lib/config/documents.ts`, `tiers.ts` |
| AI orchestration | `src/lib/ai/orchestrator.ts` |
| Kredit & payment | `src/lib/services/credit.service.ts`, `payment.service.ts` |
| Tier capabilities | `src/lib/services/tier-capabilities.ts` |
| Workspace | `src/components/project/ProjectWorkspace.tsx` |
| Export | `src/lib/export-tree.ts`, `src/app/api/export/route.ts` |
| Testing | `scripts/test-production-automated.mjs`, `test-backend-v2.mjs` |
| Env template | `.env.example` |

---

## 10. Definition of Done — Status Launch

### Fungsional (F1–F10)

| # | Kriteria | Status |
|---|----------|--------|
| F1 | Anonymous → 401 generate/export | ✅ |
| F2 | Form lengkap tanpa subscription | ✅ |
| F3 | Paywall jelas | ✅ |
| F4 | Midtrans sandbox → kredit | ✅ Manual |
| F5 | Generate per tier | ✅ Starter + Pro manual |
| F6 | Kredit berkurang sesuai estimasi | ✅ |
| F7 | Revisi + regen per tier | ✅ |
| F8 | Export ownership | ✅ |
| F9 | Waitlist saat penuh | ✅ Kode |
| F10 | Copy marketing selaras | ✅ |

### Keamanan (S1–S8)

| # | Kriteria | Status |
|---|----------|--------|
| S1–S3 | RLS + cross-user + webhook | ✅ |
| S4 | Race condition kredit | ✅ Kode (stress test parsial) |
| S5 | Rate limit production | ✅ Upstash |
| S6 | Security headers | ✅ |
| S7–S8 | Secrets + rotate keys | ⏳ Deploy manual |

### Operasional (O1–O6)

| # | Kriteria | Status |
|---|----------|--------|
| O1–O2 | Cron expire + renew | ✅ Kode + vercel.json |
| O3 | Webhook production | ⏳ |
| O4 | `migrate deploy` production | ⏳ |
| O5 | Sentry | ✅ Opsional |
| O6 | Runbook rollback | 📋 |

---

## 11. Kesimpulan

**docs-v2 MVP sudah selesai diimplementasi.** Perombakan data, monetisasi, dan backend terintegrasi penuh. Testing otomatis hijau; alur Starter dan Pro sudah diverifikasi manual.

**Sebelum announce:**
1. Deploy + env production
2. Smoke test 1× di URL live
3. Opsional: QA Pro Max lengkap

**Dokumen terkait:**
- `PLAN-PENYELESAIAN-DOCS-V2.md` — plan asli + task ID
- `PANDUAN-TESTING-PRODUCTION.md` — skenario manual
- `HASIL-TESTING.md` — gabungan hasil test
- `docs-v2/DECISIONS.md` — keputusan bisnis final
