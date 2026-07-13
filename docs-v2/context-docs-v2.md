# Context Handover: ArroBuild v2

> Checkpoint untuk agent berikutnya. Diperbarui: 8 Juli 2026.

## Status

| Gelombang | Status |
|---|---|
| 0–3.3 | Selesai |
| **4 — Launch prep (inti)** | **Selesai (sesi ini)** |
| 4 — Manual QA / staging E2E / prod env | Pending human |

## Gelombang 4 yang baru

- CSP + security headers di `next.config.ts` (HSTS prod)
- `maxActiveSeats` di tiers: 150 / 60 / 15
- `capacity.service.ts` + gate payment create
- `WaitlistEntry` model + `/api/waitlist` + UI dashboard
- Cron `/api/cron/expire-subscriptions` + `vercel.json`
- Checklist: `docs-v2/CHECKLIST-LANGKAH-MANUAL.md`

## Next

1. Isi checklist QA manual / staging
2. Set `CRON_SECRET` + Midtrans production
3. README GitHub publik
