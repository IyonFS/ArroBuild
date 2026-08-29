import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  AI_PROMPT_VERSION,
  evaluateBenchmarkCase,
  validateBenchmarkDataset,
  type BenchmarkCaseResult,
  type BenchmarkDocuments,
  type BenchmarkInputCase,
  type BenchmarkUsage,
} from "../src/lib/ai/benchmark";

interface CandidateCase {
  documents: Partial<Record<keyof BenchmarkDocuments, string>>;
  usage?: BenchmarkUsage;
}

interface CandidateManifest {
  promptVersion: string;
  modelRoute: string;
  generatedAt?: string;
  cases: Record<string, CandidateCase>;
}

interface BenchmarkReport {
  schemaVersion: 1;
  generatedAt: string;
  promptVersion: string;
  currentPromptVersion: string;
  modelRoute: string;
  minimumScore: number;
  aggregateScore: number;
  passed: boolean;
  baseline?: { aggregateScore: number; regression: number; maximumRegression: number };
  cases: BenchmarkCaseResult[];
}

function argument(name: string): string | undefined {
  const prefix = `--${name}=`;
  const inline = process.argv.find((value) => value.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

function resolveInside(baseDirectory: string, relativePath: string): string {
  const base = path.resolve(baseDirectory);
  const resolved = path.resolve(base, relativePath);
  if (resolved !== base && !resolved.startsWith(`${base}${path.sep}`)) {
    throw new Error(`Document path keluar dari candidate directory: ${relativePath}`);
  }
  return resolved;
}

async function loadDocuments(
  candidateDirectory: string,
  candidateCase: CandidateCase,
): Promise<BenchmarkDocuments> {
  const documents: BenchmarkDocuments = {};
  for (const [fileKey, relativePath] of Object.entries(candidateCase.documents)) {
    if (!relativePath) continue;
    documents[fileKey as keyof BenchmarkDocuments] = await readFile(
      resolveInside(candidateDirectory, relativePath),
      "utf8",
    );
  }
  return documents;
}

async function main() {
  const projectRoot = process.cwd();
  const datasetPath = path.resolve(
    argument("inputs") ?? path.join(projectRoot, "benchmarks/ai-output/inputs.json"),
  );
  const cases = await readJson<BenchmarkInputCase[]>(datasetPath);
  const datasetErrors = validateBenchmarkDataset(cases);
  if (datasetErrors.length) {
    throw new Error(`Dataset benchmark tidak valid:\n- ${datasetErrors.join("\n- ")}`);
  }

  if (process.argv.includes("--validate-inputs")) {
    console.log(
      `Benchmark dataset valid: ${cases.length} kasus, ${new Set(cases.map((item) => item.category)).size} kategori.`,
    );
    return;
  }

  const candidateArg = argument("candidate");
  if (!candidateArg) {
    throw new Error(
      "Gunakan --candidate <directory>. Directory harus memiliki manifest.json dan file dokumen.",
    );
  }

  const candidateDirectory = path.resolve(candidateArg);
  const manifest = await readJson<CandidateManifest>(
    path.join(candidateDirectory, "manifest.json"),
  );
  if (!manifest.promptVersion || !manifest.modelRoute || !manifest.cases) {
    throw new Error("manifest.json wajib memuat promptVersion, modelRoute, dan cases");
  }

  const minimumScore = Number(argument("min-score") ?? 0.75);
  const maximumRegression = Number(argument("max-regression") ?? 0.02);
  const results: BenchmarkCaseResult[] = [];
  for (const benchmarkCase of cases) {
    const candidateCase = manifest.cases[benchmarkCase.id];
    if (!candidateCase) {
      results.push(evaluateBenchmarkCase(benchmarkCase, {}, undefined, minimumScore));
      continue;
    }
    results.push(
      evaluateBenchmarkCase(
        benchmarkCase,
        await loadDocuments(candidateDirectory, candidateCase),
        candidateCase.usage,
        minimumScore,
      ),
    );
  }

  const aggregateScore = Number(
    (results.reduce((total, result) => total + result.score, 0) / results.length).toFixed(4),
  );
  const baselinePath = argument("baseline");
  let baseline: BenchmarkReport["baseline"];
  if (baselinePath) {
    const baselineReport = await readJson<BenchmarkReport>(path.resolve(baselinePath));
    baseline = {
      aggregateScore: baselineReport.aggregateScore,
      regression: Number((baselineReport.aggregateScore - aggregateScore).toFixed(4)),
      maximumRegression,
    };
  }

  const passed =
    aggregateScore >= minimumScore &&
    results.every((result) => result.passed) &&
    (!baseline || baseline.regression <= maximumRegression);
  const report: BenchmarkReport = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    promptVersion: manifest.promptVersion,
    currentPromptVersion: AI_PROMPT_VERSION,
    modelRoute: manifest.modelRoute,
    minimumScore,
    aggregateScore,
    passed,
    ...(baseline ? { baseline } : {}),
    cases: results,
  };

  const outputPath = path.resolve(
    argument("output") ?? path.join(projectRoot, "artifacts/ai-benchmark/report.json"),
  );
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(
    `AI benchmark ${passed ? "LULUS" : "GAGAL"}: skor ${aggregateScore.toFixed(3)} (${manifest.promptVersion}, ${manifest.modelRoute})`,
  );
  console.log(`Report: ${outputPath}`);
  if (!passed) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
