# Checklist Langkah Manual — ArroBuild v2

> **Untuk:** Developer (kamu) — langkah yang tidak bisa sepenuhnya diotomasi oleh agent.  
> **Terakhir diperbarui:** 8 Juli 2026

Centang (`[x]`) setiap item setelah selesai.

---

## A. Setup Awal (Sekali)

- [ ] **Simpan `.env.local`** — pastikan file tersimpan (bukan hanya di editor)
- [ ] **Upstash Redis** — `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` sudah aktif
- [ ] **Database URL** — `DATABASE_URL` port **6543** (transaction pooler), `DIRECT_URL` port **5432** (session pooler)
- [ ] **Midtrans sandbox** — `MIDTRANS_SERVER_KEY`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION=false`
- [ ] **AI API keys** — minimal satu provider aktif (Gemini / OpenAI / DeepSeek) untuk test generate penuh

---

## B. Test Manual End-to-End (Wajib Sebelum Launch)

### 1. Akun & Login
- [ ] Buka http://localhost:3000/signup → daftar akun baru
- [ ] Verifikasi email (jika Supabase minta konfirmasi)
- [ ] Login → redirect ke dashboard berhasil

### 2. Form Generate (Gratis — Tanpa Kredit)
- [ ] Buka `/generate` — harus bisa akses setelah login
- [ ] Isi Step 1–4 (Tipe → Cerita → Stack → Dokumen)
- [ ] Sampai Confirm Screen — review ringkasan tampil benar

### 3. Paywall
- [ ] Klik **Generate** tanpa subscription → muncul CTA upgrade / redirect pricing
- [ ] Tidak boleh mulai generate AI tanpa paket aktif

### 4. Pembayaran (Midtrans Sandbox)
- [ ] Dashboard → **Upgrade paket** → pilih **Starter**
- [ ] Snap popup terbuka
- [ ] Bayar dengan kartu test: `4811 1111 1111 1114`, CVV `123`, exp `01/28`
- [ ] Setelah bayar → status paket aktif di dashboard
- [ ] Kredit bulanan masuk (cek `/api/user/credits` atau UI saldo)

> **Catatan webhook lokal:** Midtrans webhook butuh URL publik. Untuk dev lokal pakai **ngrok** atau tombol konfirmasi di `/api/payment/confirm` (polling) yang sudah ada di app.

### 5. Generate Penuh
- [ ] Kembali ke `/generate` → isi form → Confirm → **Generate**
- [ ] Progress streaming jalan, dokumen selesai
- [ ] Saldo kredit berkurang sesuai estimasi
- [ ] Download/export project berhasil

---

## C. Supabase (Keamanan — Sebelum Production)

- [ ] **RLS policies** — agent sudah apply dasar; review di Supabase Dashboard → Authentication → Policies
- [ ] **Founder policy** (opsional) — kirim UUID akun Supabase kamu ke agent untuk policy admin read-all
- [ ] **Leaked password protection** — aktifkan di Supabase Auth → Settings → Security
- [ ] **Service role key** — jangan pernah commit ke git atau expose di frontend

---

## D. Deploy & Launch

- [ ] Set env production di Vercel (semua key dari `.env.local`)
- [ ] `MIDTRANS_IS_PRODUCTION=true` + key production saat go-live
- [ ] Set **Midtrans webhook URL** → `https://domain-kamu.com/api/payment/webhook`
- [ ] Jalankan `npx prisma migrate deploy` di CI/CD
- [ ] Smoke test production: signup → bayar → generate

---

## E. Opsional / Nanti

- [ ] Ngrok untuk test webhook settlement lokal
- [ ] Cron job `processExpiredSubscriptions()` (belum dijadwalkan)
- [ ] Monitoring: Sentry / log alerts untuk payment gagal

---

## Kartu Test Midtrans Sandbox

| Metode | Detail |
|---|---|
| Kartu sukses | `4811 1111 1111 1114` |
| CVV | `123` |
| Exp | `01/28` |
| OTP (3DS) | `112233` |

Docs: https://docs.midtrans.com/docs/testing-payment-on-sandbox
