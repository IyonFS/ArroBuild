# Master Implementation Plan — Checkpoint

> Diperbarui: 8 Juli 2026 (setelah Gelombang 4 inti)

## Ringkas status

ArroBuild v2 gelombang 0–4 (inti launch prep) sudah diimplementasikan.

### Selesai

- [x] Gelombang 0–3.3 (form, backend, monetisasi, interview, workspace, polish)
- [x] Gelombang 4 inti:
  - Security headers / CSP diperluas
  - Capacity soft-cap + waitlist API/UI
  - Cron expire subscriptions
  - Checklist launch docs

### Sisa opsional / manual

- [ ] Checklist QA manual + staging E2E diisi human
- [ ] Env production: CRON_SECRET, Midtrans prod, key rotation
- [ ] README GitHub publik dari nol

## Catatan

- Cap: Starter 150 / Pro 60 / Pro Max 15
- Waitlist: `/api/waitlist`
- Cron: `/api/cron/expire-subscriptions` + `vercel.json`
