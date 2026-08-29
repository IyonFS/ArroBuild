import { readFile } from "node:fs/promises";
import {
  evaluateBenchmarkCase,
  validateBenchmarkDataset,
  type BenchmarkInputCase,
} from "../src/lib/ai/benchmark";

let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${name}`);
  }
}

async function main() {
  const cases = JSON.parse(
    await readFile("benchmarks/ai-output/inputs.json", "utf8"),
  ) as BenchmarkInputCase[];
  const benchmarkCase = cases[0];
  const features = benchmarkCase.input.features.map((feature) => feature.id).join(", ");
  const filler =
    "Alur ini dibuat khusus untuk freelancer yang mengelola invoice dan status pembayaran secara mandiri. ".repeat(
      24,
    );

  const validDocuments = {
    prd: `---
features:
${benchmarkCase.input.features.map((feature) => `  - id: ${feature.id}`).join("\n")}
---
# Product Requirements Document
## Ringkasan Produk
${filler}
## Masalah yang Diselesaikan
${filler}
## Target Pengguna
${filler}
## Fitur Utama
${features}. ${filler}
## Cara Kerja
${features}. ${filler}
## Alur Pengguna
${filler}
## Batasan
${filler}
## Model Harga & Langganan
${filler}`,
    architecture: `# Architecture & Technical Blueprint
## Keputusan Teknis Utama
Next.js dan TypeScript digunakan untuk aplikasi di Vercel. ${features}. ${filler}
## Architecture Overview
Modul invoice dipisahkan dari modul notifikasi. ${features}. ${filler}
## Database Schema
PostgreSQL menyimpan invoice, pelanggan, dan status pembayaran. ${features}. ${filler}
## Struktur Folder Proyek
Struktur folder mengikuti batas domain invoice. ${features}. ${filler}
## Batasan Teknis
Operasi status pembayaran harus idempotent. ${filler}`,
    "plan-task": `# Plan / Task Roadmap
## Fase 1 — Fondasi
- [ ] Buat schema invoice untuk FEAT-001 (est: 3h)
- [ ] Implementasikan tautan publik FEAT-002 (est: 3h)
${filler}
## Fase 2 — Status
- [ ] Tambahkan status pembayaran FEAT-003 (est: 2h)
- [ ] Tambahkan test idempotensi FEAT-001 (est: 2h)
${filler}
## Urutan Pengerjaan & Ketergantungan
- [ ] Jalankan migrasi sebelum endpoint FEAT-001 (est: 2h)
${filler}`,
  };

  console.log("\n=== AI Benchmark Tests ===\n");

  assert("synthetic dataset passes validation", validateBenchmarkDataset(cases).length === 0);
  assert("dataset contains ten cases", cases.length === 10);

  const validResult = evaluateBenchmarkCase(
    benchmarkCase,
    validDocuments,
    {
      estimatedCredits: 200,
      actualCredits: 200,
      estimatedOutputTokens: 6000,
      actualOutputTokens: 6000,
    },
    0.75,
  );

  assert("complete grounded documents pass quality gate", validResult.passed);
  assert("complete documents score above 0.95", validResult.score >= 0.95);
  assert(
    "matching FEAT-IDs receive full consistency score",
    validResult.metrics.featureConsistency.score === 1,
  );

  const inventedResult = evaluateBenchmarkCase(benchmarkCase, {
    ...validDocuments,
    architecture: `${validDocuments.architecture}\nFEAT-999`,
  });
  assert(
    "invented FEAT-ID lowers cross-document score",
    inventedResult.metrics.crossDocumentConsistency.score < 1,
  );

  const incompleteResult = evaluateBenchmarkCase(benchmarkCase, {
    prd: validDocuments.prd,
  });
  assert("missing documents fail quality gate", !incompleteResult.passed);
  assert(
    "missing documents are reported by completeness metric",
    incompleteResult.metrics.completeness.reasons.some((reason) =>
      reason.includes("tidak tersedia"),
    ),
  );

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

void main();
