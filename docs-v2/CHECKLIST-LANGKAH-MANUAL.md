# Launch Checklist — ArroBuild v2 (Gelombang 4)

> Update: 8 Juli 2026

## Security

- [x] CSP diperluas (script/connect/frame Midtrans + Supabase + Upstash)
- [x] `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`
- [x] HSTS di production
- [x] Export ownership 403 (`/api/export`)
- [x] Project GET/PATCH ownership
- [ ] Rotate API keys (AI providers + Midtrans) sebelum go-live
- [ ] Supabase leaked-password protection aktif — **hanya Supabase Pro ($25/bulan)**; di Free plan matikan toggle ini dan abaikan warning advisor ([docs](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection))
- [x] RLS `_prisma_migrations` diaktifkan (advisor)
- [ ] Review RLS policies di Dashboard sekali lagi

## Capacity / Waitlist (Fase 1)

- [x] Soft cap: Starter 150 / Pro 60 / Pro Max 15 (`maxActiveSeats`)
- [x] Gate di `POST /api/payment/create` saat penuh → 409 `TIER_FULL`
- [x] `GET/POST /api/waitlist` + UI dashboard "Masuk waitlist"
- [x] Tabel `waitlist_entries` + RLS

## Ops

- [x] Cron endpoint `/api/cron/expire-subscriptions` (butuh `CRON_SECRET`)
- [x] `vercel.json` cron harian 01:00 UTC
- [x] `CRON_SECRET` di `.env.local` (lokal)
- [ ] Copy `CRON_SECRET` yang sama ke Vercel env (hanya saat deploy production)
- [ ] Midtrans webhook URL production
- [ ] `MIDTRANS_IS_PRODUCTION=true` + key production

## QA smoke (manual)

- [ ] Signup → login → `/generate` Mode Cepat
- [ ] Mode Dipandu AI 3 giliran → lanjut stack
- [ ] Confirm menampilkan saldo vs biaya batch
- [ ] Generate → Live Build Log → DocPreview → Buka workspace
- [ ] Workspace: resize panel, FEAT jump, preview revisi section
- [ ] Dashboard upgrade: slot tersisa terlihat; waitlist jika penuh
- [ ] Export ZIP hanya untuk project sendiri (403 jika ID orang lain)

## Staging E2E (3 skenario)

- [ ] Starter: bayar sandbox → generate 3 dokumen → kredit berkurang
- [ ] Pro: generate + revisi section
- [ ] Pro Max: (opsional) model kelas lebih tinggi jika key tersedia
