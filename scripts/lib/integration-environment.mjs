export function integrationEnvironmentViolations(env) {
  const violations = [];

  if (env.ALLOW_INTEGRATION_TESTS !== "true") {
    violations.push("ALLOW_INTEGRATION_TESTS=true wajib disetel");
  }
  if (env.INTEGRATION_TEST_ENV !== "test") {
    violations.push("INTEGRATION_TEST_ENV=test wajib disetel");
  }
  if (env.NODE_ENV === "production") {
    violations.push("NODE_ENV=production tidak diizinkan");
  }
  if (env.VERCEL_ENV === "production") {
    violations.push("VERCEL_ENV=production tidak diizinkan");
  }
  if (env.MIDTRANS_IS_PRODUCTION === "true") {
    violations.push("MIDTRANS production tidak diizinkan");
  }

  return violations;
}

export function assertSafeIntegrationEnvironment(env = process.env) {
  const violations = integrationEnvironmentViolations(env);
  if (violations.length > 0) {
    throw new Error(
      `Integration test dibatalkan untuk melindungi data production:\n- ${violations.join("\n- ")}`
    );
  }
}
