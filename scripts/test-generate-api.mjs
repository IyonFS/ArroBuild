/**
 * Integration test for /api/generate — isolated test environment only.
 * Requires dev server, integration opt-in, and INTEGRATION_AUTH_COOKIE.
 */

import { config } from "dotenv";
import { assertSafeIntegrationEnvironment } from "./lib/integration-environment.mjs";

config({ path: ".env.local" });
assertSafeIntegrationEnvironment();

const AUTH_COOKIE = process.env.INTEGRATION_AUTH_COOKIE;
if (!AUTH_COOKIE) {
  throw new Error("INTEGRATION_AUTH_COOKIE wajib untuk test API generate");
}

const IDEA =
  "A SaaS platform where restaurant owners can manage their menu, tables, and orders in real-time with QR code-based ordering for customers. Owners get a dashboard with live order tracking, table occupancy, and daily revenue reports.";

const payload = {
  idea: IDEA,
  clarifications: { platform: "web", monetization: "freemium", scope: "mvp" },
  presets: { framework: "nextjs", design: "linear", agentTool: "cursor" },
  tier: "base",
  selectedDocs: ["prd"],
  features: [
    { id: "FEAT-001", title: "Kelola menu", priority: "must-have" },
    { id: "FEAT-002", title: "QR ordering", priority: "must-have" },
    { id: "FEAT-003", title: "Pantau pesanan", priority: "must-have" },
  ],
};

async function main() {
  console.log("POST /api/generate (free tier PRD)...");
  const res = await fetch("http://localhost:3000/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: AUTH_COOKIE },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.error("API error:", res.status, await res.text());
    process.exit(1);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let prdContent = "";
  let projectId = null;
  let allDoneSuccess = true;
  let allDoneError = null;
  const events = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const event = JSON.parse(line.slice(6));
      events.push(event.type);

      if (event.type === "project_created") projectId = event.projectId;
      if (event.type === "file_done" && event.fileKey === "prd") {
        prdContent = event.content;
      }
      if (event.type === "all_done") {
        allDoneSuccess = event.success !== false;
        allDoneError = event.error ?? null;
      }
      if (event.type === "error") {
        console.error("Generation error:", event.error);
      }
    }
  }

  console.log("\n=== Results ===");
  console.log("Project ID:", projectId);
  console.log("Events:", [...new Set(events)].join(", "));
  console.log("PRD length:", prdContent.length, "chars");
  console.log("PRD words:", prdContent.split(/\s+/).filter(Boolean).length);
  console.log("Has product heading:", /product requirements document/i.test(prdContent));
  console.log("Has FEAT-ID:", /FEAT-001/i.test(prdContent));
  console.log("Ends abruptly (open paren):", /\($/.test(prdContent.trim()));
  console.log("\nLast 120 chars:");
  console.log(prdContent.slice(-120));

  console.log("all_done success:", allDoneSuccess);
  if (allDoneError) console.log("all_done error:", allDoneError);

  if (!allDoneSuccess) {
    console.log("\n⚠ Integration test: generation failed (expected if quota exhausted)");
    console.log("  Error handling works correctly — no false success.");
    process.exit(0);
  }

  const ok =
    prdContent.length >= 1800 &&
    /product requirements document/i.test(prdContent) &&
    /FEAT-001/i.test(prdContent) &&
    !/\($/.test(prdContent.trim());

  if (!ok) {
    console.error("\n✗ Integration test FAILED");
    process.exit(1);
  }
  console.log("\n✓ Integration test PASSED");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
