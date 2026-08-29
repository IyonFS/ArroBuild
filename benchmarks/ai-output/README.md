# AI Output Benchmark

Benchmark ini memakai input sintetis di `inputs.json`; jangan menyalin brief atau output pengguna nyata ke folder ini.

## Format candidate

Buat directory hasil generation dengan `manifest.json`:

```json
{
  "promptVersion": "2026-08-29.1",
  "modelRoute": "FLAGSHIP:gpt-5.4",
  "cases": {
    "saas-short-invoice": {
      "documents": {
        "prd": "saas-short-invoice/prd.md",
        "architecture": "saas-short-invoice/architecture.md",
        "plan-task": "saas-short-invoice/plan-task.md"
      },
      "usage": {
        "estimatedCredits": 240,
        "actualCredits": 226,
        "estimatedOutputTokens": 6800,
        "actualOutputTokens": 6450
      }
    }
  }
}
```

Path dokumen harus relatif terhadap directory candidate dan tidak boleh keluar dari directory tersebut.

## Menjalankan

```bash
npm run benchmark:ai:validate
npm run benchmark:ai -- --candidate ./tmp/benchmark-candidate
npm run benchmark:ai -- --candidate ./tmp/benchmark-candidate --baseline ./artifacts/ai-benchmark/baseline.json
```

Runner menulis laporan JSON ke `artifacts/ai-benchmark/report.json`. Quality gate gagal bila satu kasus berada di bawah `0.75`, skor agregat di bawah `0.75`, atau regresi terhadap baseline lebih besar dari `0.02`. Threshold dapat diubah dengan `--min-score` dan `--max-regression`.

Evaluator memeriksa kelengkapan dokumen, FEAT-ID, konsistensi lintas dokumen, stack, actionability plan, Markdown/YAML, klaim kuantitatif yang perlu verifikasi, serta selisih estimated/actual token dan kredit.
