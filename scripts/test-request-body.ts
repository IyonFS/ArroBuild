import {
  readJsonBody,
  RequestBodyError,
} from "../src/lib/http/read-json-body";

let passed = 0;
let failed = 0;

async function test(name: string, run: () => Promise<boolean>) {
  try {
    if (await run()) {
      passed++;
      console.log(`  ✓ ${name}`);
    } else {
      failed++;
      console.error(`  ✗ ${name}`);
    }
  } catch (error) {
    failed++;
    console.error(`  ✗ ${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function bodyError(request: Request, maxBytes: number) {
  try {
    await readJsonBody(request, maxBytes);
    return null;
  } catch (error) {
    return error instanceof RequestBodyError ? error : null;
  }
}

async function main() {
  console.log("\n=== Bounded JSON Body Tests ===\n");

await test("valid JSON below limit is parsed", async () => {
  const value = await readJsonBody(
    new Request("https://example.test", { method: "POST", body: JSON.stringify({ ok: true }) }),
    64
  );
  return (value as { ok?: boolean }).ok === true;
});

await test("declared oversized body is rejected with 413", async () => {
  const error = await bodyError(
    new Request("https://example.test", {
      method: "POST",
      headers: { "content-length": "1000" },
      body: "{}",
    }),
    100
  );
  return error?.code === "PAYLOAD_TOO_LARGE" && error.statusCode === 413;
});

await test("actual oversized body is rejected when header is absent", async () => {
  const error = await bodyError(
    new Request("https://example.test", { method: "POST", body: JSON.stringify({ x: "a".repeat(80) }) }),
    32
  );
  return error?.code === "PAYLOAD_TOO_LARGE" && error.statusCode === 413;
});

await test("actual size wins over a false small content-length", async () => {
  const error = await bodyError(
    new Request("https://example.test", {
      method: "POST",
      headers: { "content-length": "2" },
      body: JSON.stringify({ x: "a".repeat(80) }),
    }),
    32
  );
  return error?.code === "PAYLOAD_TOO_LARGE";
});

await test("invalid JSON is rejected with 400", async () => {
  const error = await bodyError(
    new Request("https://example.test", { method: "POST", body: "{broken" }),
    100
  );
  return error?.code === "INVALID_JSON" && error.statusCode === 400;
});

await test("UTF-8 byte length, not character count, enforces the limit", async () => {
  const body = JSON.stringify({ value: "🚀🚀🚀" });
  const error = await bodyError(
    new Request("https://example.test", { method: "POST", body }),
    body.length
  );
  return error?.code === "PAYLOAD_TOO_LARGE";
});

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
