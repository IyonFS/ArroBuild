/**
 * Simulates Midtrans webhook settlement — credits + subscription grant
 * Usage: node scripts/test-payment-settlement.mjs
 */
import { config } from "dotenv";
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

config({ path: ".env.local" });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const TEST_USER_ID = crypto.randomUUID();
const TEST_EMAIL = `pay-test-${Date.now()}@arrobuild.local`;

function signWebhook(orderId, statusCode, grossAmount) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY ?? "";
  return createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex");
}

async function main() {
  console.log("\n=== Payment Settlement Test ===\n");

  await admin.auth.admin.createUser({
    id: TEST_USER_ID,
    email: TEST_EMAIL,
    password: "TestPay2026!",
    email_confirm: true,
  });

  await prisma.user.create({
    data: {
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      tier: "STARTER",
      creditBalance: 0,
    },
  });

  const orderId = `arro-test-${Date.now()}`;
  const amount = 65_000;

  const payment = await prisma.payment.create({
    data: {
      orderId,
      userId: TEST_USER_ID,
      tier: "STARTER",
      amount,
      status: "PENDING",
    },
  });

  const grossAmount = String(amount);
  const statusCode = "200";
  const signature = signWebhook(orderId, statusCode, grossAmount);

  const res = await fetch("http://localhost:3000/api/payment/webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      order_id: orderId,
      transaction_id: `txn-${Date.now()}`,
      transaction_status: "settlement",
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signature,
    }),
  });

  const body = await res.json();
  console.log("Webhook response:", res.status, body);

  if (res.status !== 200) {
    console.error("❌ Webhook failed");
    process.exit(1);
  }

  const sub = await prisma.subscription.findUnique({ where: { userId: TEST_USER_ID } });
  const ledger = await prisma.creditLedger.findMany({ where: { userId: TEST_USER_ID } });
  const updatedPayment = await prisma.payment.findUnique({ where: { id: payment.id } });

  console.log("Subscription:", sub?.status, sub?.tier);
  console.log("Payment status:", updatedPayment?.status);
  console.log("Credit ledger entries:", ledger.length);
  console.log("Credits granted:", ledger.reduce((s, e) => s + e.amount, 0));

  const ok =
    sub?.status === "ACTIVE" &&
    updatedPayment?.status === "SETTLEMENT" &&
    ledger.some((e) => e.type === "MONTHLY_REFRESH" && e.amount > 0);

  if (ok) {
    console.log("\n✅ Payment settlement test PASSED\n");
  } else {
    console.error("\n❌ Payment settlement test FAILED\n");
    process.exit(1);
  }

  await prisma.creditLedger.deleteMany({ where: { userId: TEST_USER_ID } });
  await prisma.paymentEvent.deleteMany({ where: { paymentId: payment.id } });
  await prisma.payment.delete({ where: { id: payment.id } });
  await prisma.subscription.deleteMany({ where: { userId: TEST_USER_ID } });
  await prisma.user.delete({ where: { id: TEST_USER_ID } });
  await admin.auth.admin.deleteUser(TEST_USER_ID);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect().catch(() => {});
  await pool.end().catch(() => {});
  process.exit(1);
});
