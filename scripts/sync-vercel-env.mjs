/**
 * Sync .env.local to Vercel (production, preview, development).
 * Usage: node scripts/sync-vercel-env.mjs
 */
import { config } from "dotenv";
import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";

config({ path: ".env.local" });

const SKIP = new Set([
  "",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "RESEND_API_KEY",
]);

const ENVS = ["production", "preview", "development"];

function parseEnvFile(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const fileVars = parseEnvFile(".env.local");
const appUrl = process.env.VERCEL_APP_URL ?? fileVars.NEXT_PUBLIC_APP_URL;

const vars = {
  ...fileVars,
  NEXT_PUBLIC_APP_URL: appUrl?.startsWith("http") ? appUrl : `https://${appUrl}`,
};

for (const [key, value] of Object.entries(vars)) {
  if (SKIP.has(key) || !value) continue;

  for (const env of ENVS) {
    try {
      execSync(`npx vercel env rm ${key} ${env} --yes`, {
        stdio: "ignore",
        shell: true,
      });
    } catch {
      /* not set yet */
    }

    try {
      execSync(`npx vercel env add ${key} ${env}`, {
        input: value,
        stdio: ["pipe", "inherit", "inherit"],
        shell: true,
      });
      console.log(`✓ ${key} → ${env}`);
    } catch (err) {
      console.error(`✗ ${key} → ${env}:`, err.message);
    }
  }
}

console.log("\nDone. Redeploy with: npx vercel --prod");
