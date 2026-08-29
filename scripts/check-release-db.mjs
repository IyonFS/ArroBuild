/**
 * Read-only release check for migration, provenance columns, and RLS coverage.
 * Loads .env.local but never prints connection strings or credentials.
 */
import { readdir } from "node:fs/promises";
import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local" });

// Pemeriksaan metadata read-only aman melalui pooled runtime URL; gunakan direct URL hanya sebagai fallback.
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
if (!connectionString) {
  console.error("DATABASE_URL atau DIRECT_URL belum dikonfigurasi.");
  process.exit(1);
}

const expectedTables = [
  "users",
  "subscriptions",
  "projects",
  "generated_files",
  "document_revisions",
  "payments",
  "payment_events",
  "credit_ledger",
  "system_config",
  "whatsapp_chats",
  "rate_limit_events",
  "interview_sessions",
  "waitlist_entries",
];

const expectedMigrations = (await readdir("prisma/migrations", { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const pool = new pg.Pool({
  connectionString,
  max: 1,
  connectionTimeoutMillis: 15_000,
  statement_timeout: 15_000,
  application_name: "arrobuild-release-check-read-only",
});

let client;
try {
  client = await pool.connect();
  await client.query("BEGIN READ ONLY");

  const migrationResult = await client.query(`
    SELECT migration_name AS "name",
           finished_at IS NOT NULL AS "finished",
           rolled_back_at IS NOT NULL AS "rolledBack"
    FROM _prisma_migrations
    ORDER BY started_at
  `);
  const migrationRows = migrationResult.rows;
  const appliedNames = new Set(
    migrationRows.filter((row) => row.finished && !row.rolledBack).map((row) => row.name),
  );
  const missingMigrations = expectedMigrations.filter((name) => !appliedNames.has(name));
  const failedMigrations = migrationRows
    .filter((row) => !row.finished && !row.rolledBack)
    .map((row) => row.name);

  const tableResult = await client.query(
    `
      SELECT c.relname AS "table",
             c.relrowsecurity AS "rlsEnabled",
             COUNT(p.policyname)::int AS "policyCount"
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      LEFT JOIN pg_policies p
        ON p.schemaname = n.nspname
       AND p.tablename = c.relname
      WHERE n.nspname = 'public'
        AND c.relkind = 'r'
        AND c.relname = ANY($1::text[])
      GROUP BY c.relname, c.relrowsecurity
      ORDER BY c.relname
    `,
    [expectedTables],
  );
  const tableRows = tableResult.rows;
  const presentTables = new Set(tableRows.map((row) => row.table));
  const missingTables = expectedTables.filter((name) => !presentTables.has(name));
  const rlsDisabled = tableRows.filter((row) => !row.rlsEnabled).map((row) => row.table);
  const withoutPolicies = tableRows
    .filter((row) => row.rlsEnabled && row.policyCount === 0)
    .map((row) => row.table);

  const provenanceResult = await client.query(`
    SELECT column_name AS "name"
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'generated_files'
      AND column_name IN ('promptVersion', 'modelRoute')
    ORDER BY column_name
  `);
  const provenanceColumns = provenanceResult.rows.map((row) => row.name);

  const report = {
    migration: {
      expected: expectedMigrations.length,
      applied: expectedMigrations.length - missingMigrations.length,
      missing: missingMigrations,
      failed: failedMigrations,
    },
    schema: {
      expectedTables: expectedTables.length,
      presentTables: tableRows.length,
      missingTables,
      provenanceColumns,
    },
    rls: {
      enabled: tableRows.filter((row) => row.rlsEnabled).length,
      disabled: rlsDisabled,
      enabledWithoutPolicies: withoutPolicies,
      tables: tableRows,
    },
  };

  console.log(JSON.stringify(report, null, 2));

  if (
    missingMigrations.length > 0 ||
    failedMigrations.length > 0 ||
    missingTables.length > 0 ||
    rlsDisabled.length > 0 ||
    withoutPolicies.length > 0 ||
    provenanceColumns.length !== 2
  ) {
    process.exitCode = 1;
  }
} catch (error) {
  const details = [];
  if (error instanceof Error) {
    details.push(error.name);
    if (error.message) details.push(error.message);
  } else {
    details.push(String(error));
  }
  if (error && typeof error === "object" && "code" in error && error.code) {
    details.push(`code=${String(error.code)}`);
  }
  if (error && typeof error === "object" && "errors" in error && Array.isArray(error.errors)) {
    for (const nested of error.errors) {
      if (nested && typeof nested === "object" && "code" in nested && nested.code) {
        details.push(`nested=${String(nested.code)}`);
      }
    }
  }
  console.error(`Release DB check gagal: ${details.join("; ") || "unknown error"}`);
  process.exitCode = 1;
} finally {
  if (client) {
    await client.query("ROLLBACK").catch(() => {});
    client.release();
  }
  await pool.end().catch(() => {});
}
