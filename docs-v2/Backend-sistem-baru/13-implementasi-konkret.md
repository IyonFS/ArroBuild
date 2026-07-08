# ✅ IMPLEMENTASI KONKRET — Backend Architecture ArroBuild

> Dokumentasi ini adalah **checklist & panduan langkah demi langkah** untuk mulai mengimplementasi redesain backend yang sudah divalidasi di dokumen 09-09A sebelumnya.

---

## Status Saat Ini (7 Juli 2026)

Kamu sudah punya:
- ✅ Validasi konsep (09-backend-architecture-keamanan.md)
- ✅ Risk assessment (09A-backend-validation-risk-assessment.md)
- ✅ Skeleton code siap copy-paste:
  - `10-tiers-config.ts` — tier & kredit config
  - `10A-prisma-schema-update.prisma` — tabel baru
  - `11-rls-policies.sql` — keamanan database
  - `12-credit-service.ts` — reserve/commit kredit
  - `12A-payment-service.ts` — payment & webhook
  
**Yang belum**: terintegrasi ke codebase kamu. Dokumen ini adalah panduan integrasi konkret.

---

## Checklist Phase-wise

### ⏰ Timeline Realistic (Estimasi)
- **Hari 1 (P0 Urgent)**: Setup config + Prisma schema
- **Hari 2-3**: Migration & testing di staging
- **Hari 4-5**: Rate limit + RLS + test keamanan
- **Hari 6-7**: Payment service + webhook test
- **Minggu 2**: Refactor route handler, setup Sentry/monitoring

Asumsi: 4-6 jam/hari development time.

---

## FASE 1: Setup Config & Schema (Hari 1)

### 1.1 Copy `tiers-config.ts`

```bash
# Di terminal, di root project
cp <source>/10-tiers-config.ts src/lib/config/tiers.ts
```

**Apa yang dilakukan:**
- Buka `src/lib/config/tiers.ts` (atau buat baru kalau belum ada)
- Paste isi dari `10-tiers-config.ts`
- **Test**: `npm run build` — harus compile tanpa error

**Verification:**
```bash
# Di Next.js API route atau pages, test:
import { getTierConfig, calculateGrossMarginForTier } from '@/lib/config/tiers';

const startConfig = getTierConfig('STARTER');
console.log(startConfig.priceIdr);  // 65000
console.log(calculateGrossMarginForTier('STARTER'));  // 98.6
```

### 1.2 Update Prisma Schema

```bash
# Backup schema lama dulu
cp prisma/schema.prisma prisma/schema.prisma.backup

# Merge konten dari 10A-prisma-schema-update.prisma ke schema existing kamu
# HATI-HATI: jangan overwrite, cuma tambah bagian baru:
# - Model baru: CreditLedger, PaymentEvent, SystemConfig, WhatsappChat, RateLimitEvent
# - Update User model: tambah relation creditLedger, payments, whatsappChat
# - Update Payment, Subscription model: sesuaikan field
```

**Manual checklist:**
- [ ] Enum `Tier` ada (STARTER, PRO, PRO_MAX)
- [ ] Enum `CreditLedgerType` ada (14 tipe)
- [ ] Model `CreditLedger` ada dengan index `@@index([userId, createdAt])`
- [ ] Model `PaymentEvent` ada dengan `@@unique([orderId])`
- [ ] Model `Subscription` update: field `expiresAt`, `status`, relation ke `User`
- [ ] Model `User` update: relation `creditLedger`, `payments`, `whatsappChat`

### 1.3 Buat & Jalankan Migration

```bash
npx prisma migrate dev --name add_credit_ledger_payment_system

# Output:
# ✅ Prisma Migrate created the migration folder
# ✅ Created migration: <timestamp>_add_credit_ledger_payment_system
# ✅ Database migrated
# ✅ Generated Prisma client
```

**Verification:**
```bash
# Check tabel baru ada di database
psql $DATABASE_URL -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"

# Harus ada:
# - public | credit_ledger
# - public | payment_event
# - public | system_config
# - public | whatsapp_chat
```

---

## FASE 2: Keamanan Database — RLS Policies (Hari 2 Pagi)

### 2.1 Setup Founder UUID

Buka Supabase Dashboard:
1. **Authentication** → **Users**
2. Cari user dengan email founder kamu
3. Copy **ID** (format: uuid)
4. Edit `11-rls-policies.sql` — ganti semua `'INSERT_YOUR_FOUNDER_ID_HERE'` dengan ID itu

```sql
-- Contoh sebelum
USING (auth.uid()::text = 'INSERT_YOUR_FOUNDER_ID_HERE')

-- Contoh sesudah (ganti uuid-mu sendiri)
USING (auth.uid()::text = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')
```

### 2.2 Jalankan SQL di Supabase

1. Buka Supabase Dashboard → **SQL Editor**
2. Klik **New query**
3. Copy-paste seluruh isi `11-rls-policies.sql`
4. Klik **Run**

**Output yang diharapkan:**
```
✅ ALTER TABLE executed
✅ CREATE POLICY executed
... (14 policy creations)
```

### 2.3 Verify RLS Aktif

```bash
# Di Supabase SQL editor, jalankan:
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

# Harus return:
# tablename           | rowsecurity
# ─────────────────────┼─────────────
# project             | t
# generated_document  | t
# credit_ledger       | t
# payment             | t
# ... (t = true = RLS aktif)
```

### 2.4 Test RLS Security

```bash
# Manual test: create 2 test user di Supabase Auth, catat ID-nya
# User A ID: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
# User B ID: bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb

# Test: User A coba SELECT project user B
# Expected: empty result (RLS block)

# Di code (misal di API test):
const { data: projectsA } = await supabase
  .from('Project')
  .select('*')
  .eq('userId', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');  // User B's projects

console.log(projectsA);  // ✅ Should be [] (empty) if RLS working
```

---

## FASE 3: Credit Service Integration (Hari 2-3)

### 3.1 Copy Credit Service

```bash
cp <source>/12-credit-service.ts src/lib/services/credit.service.ts
```

**Review & customize:**
- [ ] Buka file, cek ada `TODO:` comment
- [ ] `import { logger }` — pastikan logger ada (atau buat simple `console.log` wrapper)
- [ ] Cek semua import path (prisma, tiers, etc) sesuai struktur project kamu

### 3.2 Setup Logger (Simple Version)

Jika belum ada logger, buat sederhana dulu:

```typescript
// lib/logger.ts
export const logger = {
  info: (event: string, data?: any) => {
    console.log(`[INFO] ${event}`, data);
  },
  warn: (event: string, data?: any) => {
    console.warn(`[WARN] ${event}`, data);
  },
  error: (event: string, data?: any) => {
    console.error(`[ERROR] ${event}`, data);
  },
};
```

(Nanti di Fase monitoring, upgrade ke Sentry proper)

### 3.3 Test Credit Service

Buat test file simple:

```typescript
// src/lib/services/__tests__/credit.service.test.ts
import { CreditService } from '../credit.service';
import { prisma } from '@/lib/prisma';

describe('CreditService', () => {
  const testUserId = 'test-user-1';

  beforeAll(async () => {
    // Create test user
    await prisma.user.create({
      data: {
        id: testUserId,
        supabaseId: 'supabase-' + testUserId,
        email: 'test-' + Date.now() + '@example.com',
      },
    });

    // Create Starter subscription
    await prisma.subscription.create({
      data: {
        userId: testUserId,
        tier: 'STARTER',
        startDate: new Date(),
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Refresh monthly credits
    await CreditService.refreshMonthlyCredits(testUserId);
  });

  it('should reserve credits', async () => {
    const result = await CreditService.reserveCredit(testUserId, 100, 'project-1');
    expect(result.reservationId).toBeDefined();
    expect(result.balanceAfter).toBe(2900);  // 3000 - 100
  });

  it('should fail reserve if insufficient balance', async () => {
    try {
      await CreditService.reserveCredit(testUserId, 5000, 'project-2');
      fail('Should throw error');
    } catch (e) {
      expect(e.code).toBe('INSUFFICIENT_CREDITS');
    }
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.delete({ where: { id: testUserId } });
  });
});
```

**Run:**
```bash
npm test -- credit.service.test.ts

# ✅ Expected output:
# ✓ should reserve credits
# ✓ should fail reserve if insufficient balance
```

---

## FASE 4: Payment Service + Webhook (Hari 3-4)

### 4.1 Copy Payment Service

```bash
cp <source>/12A-payment-service.ts src/lib/services/payment.service.ts
```

### 4.2 Setup Midtrans API (TODO di code)

Di `callMidtransApi()` function:

```typescript
// lib/services/payment.service.ts — find callMidtransApi function

import { MidtransClient } from 'midtrans-nodejs-client';  // atau pakai https://www.npmjs.com/package/midtrans-nodejs-client

const snap = new MidtransClient.Snap({
  isProduction: process.env.NODE_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

async function callMidtransApi(method: string, path: string, data?: any) {
  if (path === '/snap/v1/transactions' && method === 'POST') {
    return await snap.createTransaction(data);
  }
  // ... handle other paths
}
```

### 4.3 Webhook Route Handler

Update `/app/api/payment/webhook/route.ts`:

```typescript
import { PaymentService } from '@/lib/services/payment.service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const signatureFromHeader = req.headers.get('X-Midtrans-Signature') || '';

    // Verify signature — WAJIB
    if (!signatureFromHeader) {
      return NextResponse.json(
        { error: 'Missing X-Midtrans-Signature header' },
        { status: 401 }
      );
    }

    // Handle webhook
    const result = await PaymentService.handleWebhook(
      payload,
      JSON.stringify(payload),
      signatureFromHeader,
      process.env.MIDTRANS_SERVER_KEY!
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    // Log security events
    console.error('Webhook processing failed:', error);

    // Return 500 — Midtrans akan retry
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 4.4 Test Webhook (Manual)

```bash
# Terminal — generate test signature
PAYLOAD='{"order_id":"test-1","transaction_status":"settlement","gross_amount":"145000"}'
SERVER_KEY="your_midtrans_server_key"

# Calculate signature (bash)
SIGNATURE=$(echo -n "test-1settlementI45000$SERVER_KEY" | sha256sum | cut -d' ' -f1)

# POST ke webhook
curl -X POST http://localhost:3000/api/payment/webhook \
  -H "Content-Type: application/json" \
  -H "X-Midtrans-Signature: $SIGNATURE" \
  -d "$PAYLOAD"

# ✅ Expected response:
# {"status":"success","message":"Payment processed: SETTLEMENT"}
```

---

## FASE 5: Rate Limiting (Hari 4)

### 5.1 Setup Upstash Redis

1. Buka https://console.upstash.com
2. Create new Redis database (free tier cukup)
3. Copy Redis URL dari dashboard
4. Tambah ke `.env.local`:
   ```
   UPSTASH_REDIS_URL="redis://..."
   UPSTASH_REDIS_TOKEN="..."  # Ambil dari Upstash, bukan REST API
   ```

### 5.2 Update Middleware

```typescript
// src/middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSession } from './lib/auth';
import { ipLimiter, generateLimiter } from './lib/rate-limit';

export async function middleware(req: NextRequest) {
  // 1. Rate limit per IP (semua request)
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    await ipLimiter.limit(ip);
  } catch (error) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // 2. Auth check untuk protected routes
  const session = await getSupabaseSession(req);
  if (!session && isProtectedRoute(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

function isProtectedRoute(pathname: string): boolean {
  const protectedPaths = ['/api/generate', '/api/export', '/api/payment/create'];
  return protectedPaths.some(path => pathname.startsWith(path));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
```

### 5.3 Per-user Rate Limit di Route Handler

```typescript
// app/api/generate/route.ts

import { generateLimiter } from '@/lib/rate-limit';
import { getTierConfig } from '@/lib/config/tiers';

export async function POST(req: NextRequest) {
  const session = await getSupabaseSession(req);
  const userId = session?.user.id;

  // Get tier
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const config = getTierConfig(user.tier);

  // Rate limit check
  try {
    const limiter = generateLimiter(user.tier);
    await limiter.limit(userId);  // Key: userId
  } catch (error) {
    return NextResponse.json(
      { error: `Sudah generate ${config.maxProjectsPerDay}x hari ini` },
      { status: 429 }
    );
  }

  // ... continue dengan generate logic
}
```

---

## FASE 6: Testing Keseluruhan (Hari 5-6)

### 6.1 Run Testing Checklist dari 09A

Buka dokumen `09A-backend-validation-risk-assessment.md` Bagian 3.1-3.5:

```bash
# P0 tests (mandatory)
[ ] bash test-rls.sh              # ✅ RLS active
[ ] npm test -- credit.*.test.ts  # ✅ Race condition safe
[ ] bash test-webhook-sig.sh      # ✅ Signature validation
[ ] bash test-rate-limit.sh       # ✅ Daily limit enforced
[ ] bash test-export-auth.sh      # ✅ Ownership check working
```

### 6.2 Staging Deployment

```bash
# Deploy schema ke staging database
npx prisma migrate deploy --url "postgres://staging-db-url"

# Run tests di staging
npm test

# Deploy code ke staging environment
# (misal: `git push staging main`, atau manual deploy ke Vercel preview)

# Test end-to-end di staging
# 1. Sign up as test user
# 2. Upgrade to Pro tier
# 3. Make payment via Midtrans sandbox
# 4. Verify credits added
# 5. Generate project, verify kredit berkurang
```

---

## FASE 7: Monitoring & Observability (Minggu 2)

### 7.1 Setup Sentry

```bash
npm install @sentry/nextjs

# Di app root, generate Sentry config
npx @sentry/wizard@latest -i nextjs
```

Config di `sentry.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  environment: process.env.NODE_ENV,
});
```

### 7.2 Setup Dashboard `/admin/dashboard`

Buat halaman private:

```typescript
// app/admin/dashboard/page.tsx

import { getSupabaseSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function AdminDashboard() {
  const session = await getSupabaseSession();
  
  // Verify founder
  if (session?.user.id !== process.env.FOUNDER_USER_ID) {
    redirect('/');
  }

  // Fetch metrics
  const [generatedToday, creditsUsedToday, marginToday] = await Promise.all([
    prisma.generatedDocument.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
    // ... more queries
  ]);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div>Generated today: {generatedToday}</div>
      <div>Credits used: {creditsUsedToday}</div>
      <div>Margin: {marginToday}%</div>
    </div>
  );
}
```

---

## Checklist Akhir Sebelum Go-Live

```
🔴 P0 — TIDAK BOLEH ADA YANG FAIL
  [ ] Rotate semua API keys (sudah sebelum mulai implementasi)
  [ ] RLS policy test passed
  [ ] Race condition test passed (50 concurrent)
  [ ] Webhook signature validation bekerja
  [ ] Rate limit ditegakkan
  [ ] Export route punya ownership check
  [ ] Payment ledger idempotent test passed

🟡 P1 — STRONGLY RECOMMENDED
  [ ] Generate dengan context ringkasan tested (5 proyek)
  [ ] Margin tracking di dashboard
  [ ] Sentry alerts setup & tested
  [ ] Load test 10 concurrent user
  [ ] Staging environment fully tested

🟢 P2 — NICE TO HAVE
  [ ] Cron job subscription expiry tested
  [ ] Dashboard metrik akurat
  [ ] Upstash Redis fallback tested
```

---

## Troubleshooting Common Issues

### Issue: Prisma migration error "relation already exists"

**Solusi**: Migration history ketukar atau schema sudah partial. 
```bash
npx prisma migrate resolve --rolled-back <migration_name>
npx prisma migrate deploy
```

### Issue: RLS policy syntax error

**Solusi**: Check typo di SQL (case-sensitive, quote). Jalankan 1 policy di satu time di Supabase SQL editor, lihat error lebih detail.

### Issue: Webhook test signature tidak match

**Solusi**: Hitung ulang signature, pastikan:
- order_id, status, amount persis sama dengan di payload
- Server key: jangan ada space/newline
- Hash algorithm: SHA256 (bukan MD5)

### Issue: Race condition test failure

**Solusi**: Check Prisma `isolationLevel` set ke `Serializable` di transaction. Mungkin versi Postgres lama, perlu upgrade.

---

## Next: Form Flow Implementation

Setelah backend solid (Fase 7 selesai), lanjut ke:
- **`08-form-flow-redesign-v2.md` Fase 1-3** — restructure form plan
- Integrate dengan service layer yang sudah dibuat di backend
- Frontend tidak perlu tahu detail credit/ledger — cuma call service

---

## Support & Escalation

Kalau ada blocker:
1. Check section "Troubleshooting" di atas
2. Lihat error message — biasanya cukup clear
3. Review testing checklist dari 09A — mana yang fail?
4. Log everything ke Sentry/console — jangan guessing

Dokumentasi ini dibuat untuk bisa diikuti solo — setiap step punya verification konkret.

Good luck! 🚀
