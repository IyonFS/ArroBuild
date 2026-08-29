import {
  isLocalDevelopmentIp,
  isProtectedPath,
} from "../src/lib/security/request-policy";
import { getRedisCredentials, isRedisConfigured } from "../src/lib/rate-limit";

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

console.log("\n=== Request Policy Tests ===\n");

assert("payment webhook is public for signature authentication", !isProtectedPath("/api/payment/webhook"));
assert("payment config is public", !isProtectedPath("/api/payment/config"));
assert("payment create remains login protected", isProtectedPath("/api/payment/create"));
assert("payment topup remains login protected", isProtectedPath("/api/payment/topup"));
assert("project API remains login protected", isProtectedPath("/api/project/project-a"));
assert("prefix collision is not treated as a protected route", !isProtectedPath("/api/payment-malicious"));

assert("IPv4 loopback is local in development", isLocalDevelopmentIp("127.0.0.1", "development"));
assert(
  "IPv4-mapped loopback is local in development",
  isLocalDevelopmentIp("::ffff:127.0.0.1", "development")
);
assert("private 172.16 address is local in development", isLocalDevelopmentIp("172.16.1.2", "development"));
assert("public IP is not local", !isLocalDevelopmentIp("8.8.8.8", "development"));
assert("loopback is not exempt in production", !isLocalDevelopmentIp("127.0.0.1", "production"));

const marketplaceRedis = {
  UPSTASH_REDIS_REST_KV_REST_API_URL: "https://marketplace-redis.example",
  UPSTASH_REDIS_REST_KV_REST_API_TOKEN: "marketplace-token",
};
assert(
  "Vercel Marketplace Redis credentials are supported",
  isRedisConfigured(marketplaceRedis),
);
assert(
  "Vercel Marketplace Redis credentials take precedence over legacy values",
  getRedisCredentials({
    ...marketplaceRedis,
    UPSTASH_REDIS_REST_URL: "https://legacy-redis.example",
    UPSTASH_REDIS_REST_TOKEN: "legacy-token",
  })?.url === marketplaceRedis.UPSTASH_REDIS_REST_KV_REST_API_URL,
);
assert(
  "partial Redis credentials are rejected",
  !isRedisConfigured({ UPSTASH_REDIS_REST_KV_REST_API_URL: "https://redis.example" }),
);

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
