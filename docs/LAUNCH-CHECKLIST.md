# ArroBuild — Launch Checklist

> Gunakan checklist ini sebelum deploy production dan soft launch.

## 1. Supabase Auth

- [ ] **Email provider** aktif (Authentication → Providers → Email)
- [ ] **Google OAuth** aktif
- [ ] **Site URL:** `https://domain-kamu.com`
- [ ] **Redirect URLs:**
  ```
  https://domain-kamu.com/api/auth/callback
  https://domain-kamu.com/auth/callback
  http://localhost:3000/api/auth/callback
  ```
- [ ] SMTP dikonfigurasi (untuk konfirmasi email & reset password) — atau Confirm email OFF untuk testing

## 2. Midtrans

**Sandbox (testing):**
```env
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false
```

**Production (go-live):**
```env
MIDTRANS_IS_PRODUCTION=true
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=true
MIDTRANS_SERVER_KEY=Mid-server-...
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-...
```

- [ ] Notification URL: `https://domain-kamu.com/api/payment/webhook`
- [ ] Uji alur: upgrade → Snap → tier berubah di dashboard
- [ ] `npm run test:midtrans` sukses

## 3. Vercel Deploy

Env vars yang wajib:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
DIRECT_URL
GEMINI_API_KEY
NEXT_PUBLIC_APP_URL=https://domain-kamu.com
MIDTRANS_* (lihat atas)
```

- [ ] Push ke GitHub → import di Vercel
- [ ] `npm run build` sukses di CI
- [ ] Prisma migrate: `npx prisma migrate deploy`

## 4. Testing Manual

- [ ] Daftar email/password
- [ ] Login Google
- [ ] Lupa password → reset
- [ ] Generate PRD (free, tanpa login)
- [ ] Generate logged-in → muncul di dashboard
- [ ] Upgrade Midtrans sandbox
- [ ] Download .zip export
- [ ] Chrome, Firefox, mobile

## 5. Soft Launch

- [ ] OG image & meta tags OK
- [ ] Post ke komunitas (Discord/Telegram/X) dengan link live
- [ ] Monitor Vercel logs + Supabase auth errors
