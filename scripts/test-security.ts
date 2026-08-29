import {
  SafeUrlError,
  isPublicIpAddress,
  validatePublicHttpUrl,
  type SafeUrlResolver,
} from "../src/lib/security/safe-url";

let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}`);
  }
}

async function assertRejected(
  name: string,
  action: () => Promise<unknown>,
  expectedCode: SafeUrlError["code"],
) {
  try {
    await action();
    assert(name, false);
  } catch (error) {
    assert(name, error instanceof SafeUrlError && error.code === expectedCode);
  }
}

async function main() {
  const publicResolver: SafeUrlResolver = async () => [{ address: "93.184.216.34", family: 4 }];

  console.log("\n=== URL Security Tests ===\n");

  assert("public IPv4 is accepted", isPublicIpAddress("93.184.216.34"));
  assert("public IPv6 is accepted", isPublicIpAddress("2606:2800:220:1:248:1893:25c8:1946"));
  assert("loopback IPv4 is blocked", !isPublicIpAddress("127.0.0.1"));
  assert("private IPv4 is blocked", !isPublicIpAddress("10.10.10.10"));
  assert("link-local IPv4 is blocked", !isPublicIpAddress("169.254.169.254"));
  assert("loopback IPv6 is blocked", !isPublicIpAddress("::1"));
  assert("unique-local IPv6 is blocked", !isPublicIpAddress("fd00::1"));
  assert("IPv4-mapped IPv6 is blocked", !isPublicIpAddress("::ffff:127.0.0.1"));

  await assertRejected(
    "non-HTTP protocol is rejected",
    () => validatePublicHttpUrl("file:///etc/passwd", publicResolver),
    "UNSAFE_PROTOCOL",
  );
  await assertRejected(
    "embedded credentials are rejected",
    () => validatePublicHttpUrl("https://user:pass@example.com", publicResolver),
    "EMBEDDED_CREDENTIALS",
  );
  await assertRejected(
    "localhost hostname is rejected",
    () => validatePublicHttpUrl("http://localhost:3000", publicResolver),
    "BLOCKED_HOST",
  );
  await assertRejected(
    "private literal IP is rejected",
    () => validatePublicHttpUrl("http://192.168.1.20"),
    "BLOCKED_ADDRESS",
  );
  await assertRejected(
    "integer-form loopback is rejected after URL normalization",
    () => validatePublicHttpUrl("http://2130706433"),
    "BLOCKED_ADDRESS",
  );
  await assertRejected(
    "hostname resolving to private IP is rejected",
    () =>
      validatePublicHttpUrl("https://example.com", async () => [
        { address: "10.0.0.5", family: 4 },
      ]),
    "BLOCKED_ADDRESS",
  );
  await assertRejected(
    "mixed public/private DNS answers are rejected",
    () =>
      validatePublicHttpUrl("https://example.com", async () => [
        { address: "93.184.216.34", family: 4 },
        { address: "127.0.0.1", family: 4 },
      ]),
    "BLOCKED_ADDRESS",
  );

  const validated = await validatePublicHttpUrl("https://example.com/path", publicResolver);
  assert("public hostname is accepted", validated.url.hostname === "example.com");
  assert(
    "validated DNS answer is retained for connection pinning",
    validated.addresses.length === 1,
  );

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
