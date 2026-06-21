/**
 * Test Midtrans configuration — run: npm run test:midtrans
 */
import { config } from "dotenv";
config({ path: ".env.local" });

const serverKey = process.env.MIDTRANS_SERVER_KEY ?? "";
const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";

function detectMode() {
  if (process.env.MIDTRANS_IS_PRODUCTION === "true") return "production";
  if (process.env.MIDTRANS_IS_PRODUCTION === "false") return "sandbox";
  if (serverKey.startsWith("SB-") || serverKey.includes("-SB-")) return "sandbox";
  if (serverKey.startsWith("Mid-server-")) return "production";
  return "sandbox";
}

const mode = detectMode();
const snapBase =
  mode === "production"
    ? "https://app.midtrans.com"
    : "https://app.sandbox.midtrans.com";

console.log("Mode:", mode);
console.log("Server key length:", serverKey.length);
console.log("Client key length:", clientKey.length);
console.log("Client key ends with dash:", clientKey.endsWith("-"));

if (!serverKey || !clientKey || serverKey.length < 25 || clientKey.length < 20) {
  console.error("\n❌ Key Midtrans tidak lengkap. Salin ulang dari Midtrans Dashboard.");
  process.exit(1);
}

const auth = Buffer.from(`${serverKey}:`).toString("base64");
const orderId = `test-${Date.now()}`;

const res = await fetch(`${snapBase}/snap/v1/transactions`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Basic ${auth}`,
  },
  body: JSON.stringify({
    transaction_details: { order_id: orderId, gross_amount: 49000 },
    item_details: [
      { id: "starter", price: 49000, quantity: 1, name: "ArroBuild Starter" },
    ],
    customer_details: { email: "test@example.com", first_name: "Test" },
  }),
});

const data = await res.json();

if (data.token) {
  console.log("\n✅ Midtrans OK — Snap token berhasil dibuat");
  console.log("Order ID:", orderId);
} else {
  console.error("\n❌ Midtrans gagal:", res.status, data.error_messages ?? data);
  if (mode === "production") {
    console.error(
      "Tip: Key mungkin sandbox. Set MIDTRANS_IS_PRODUCTION=false untuk development lokal."
    );
  } else {
    console.error(
      "Tip: Key mungkin production. Set MIDTRANS_IS_PRODUCTION=true jika pakai key dari environment Production di dashboard."
    );
  }
  process.exit(1);
}
