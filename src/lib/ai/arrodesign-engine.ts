/**
 * ArroDesign Engine — Fase 2 MVP
 * Orchestrates: Context Gathering → Analysis Engine → Output Generator
 *
 * Path A (image): vision call langsung via Qwen3-VL (OpenRouter)
 * Path B (url): fetch HTML + Tavily search → text analysis via Flagship model
 */

import {
  generateVision,
  isOpenRouterConfigured,
  OPENROUTER_VISION_MODEL,
} from "@/lib/ai/openrouter-vision";
import { generateWithFallback } from "@/lib/ai/generate-with-fallback";
import {
  fetchPageHtml,
  formatTavilyContext,
  isTavilyConfigured,
  tavilySearch,
} from "@/lib/ai/tavily";
import {
  buildArroDesignAnalysisPrompt,
  buildArroDesignUrlContextPrompt,
  parseArroDesignOutput,
  type ArroDesignInput,
  type ArroDesignInputType,
  type ArroDesignResult,
  ARRODESIGN_CREDITS,
} from "@/lib/config/arrodesign-prompt";

export type ArroDesignProgressStep =
  | "init"
  | "fetching"
  | "searching"
  | "analyzing"
  | "generating"
  | "done"
  | "error";

export interface ArroDesignProgress {
  step: ArroDesignProgressStep;
  message: string;
}

type OnProgress = (p: ArroDesignProgress) => void;

// ─── Path A: Image → Vision ──────────────────────────────────────────────────

async function gatherImageContext(params: {
  imageDataUrl: string;
  projectContext?: string;
  onProgress: OnProgress;
}): Promise<string> {
  const { imageDataUrl, onProgress } = params;

  if (!isOpenRouterConfigured()) {
    throw new Error(
      "OPENROUTER_API_KEY belum dikonfigurasi. Tambahkan ke .env.local untuk mengaktifkan analisis gambar."
    );
  }

  onProgress({ step: "analyzing", message: "Analysis Engine sedang membaca gambar..." });

  // Untuk mode gambar, kita kirim langsung ke vision model dengan full analysis prompt
  const analysisPrompt = buildArroDesignAnalysisPrompt({
    inputType: "image",
    referenceContext: "[Gambar referensi dilampirkan sebagai image attachment di bawah]",
    projectContext: params.projectContext,
  });

  const output = await generateVision({
    prompt: analysisPrompt,
    images: [{ url: imageDataUrl }],
    model: OPENROUTER_VISION_MODEL,
    temperature: 0.4,
    maxOutputTokens: 5000,
  });

  return output;
}

// ─── Path B: URL → Fetch + Search → Text Analysis ────────────────────────────

async function gatherUrlContext(params: {
  url: string;
  onProgress: OnProgress;
}): Promise<string> {
  const { url, onProgress } = params;

  // Step 1: Fetch HTML
  onProgress({ step: "fetching", message: "Mengambil konten halaman referensi..." });
  const { html, error: fetchError } = await fetchPageHtml(url);

  if (fetchError && !html) {
    throw new Error(`Gagal mengambil halaman: ${fetchError}. Coba paste konten teks manual.`);
  }

  // Step 2: Tavily search (opsional — graceful degrade jika tidak ada key)
  let tavilyContext = "";
  if (isTavilyConfigured()) {
    onProgress({ step: "searching", message: "Mencari konteks tambahan via web search..." });
    try {
      const domain = new URL(url).hostname.replace("www.", "");
      const searchResult = await tavilySearch({
        query: `${domain} design system branding style guide`,
        maxResults: 3,
      });
      tavilyContext = formatTavilyContext(searchResult);
    } catch {
      // Bukan error fatal — lanjut tanpa Tavily
      tavilyContext = "";
    }
  }

  // Step 3: Pre-extraction — rangkum HTML jadi konteks yang bisa dibaca model text
  onProgress({ step: "analyzing", message: "Mengekstrak token desain dari halaman..." });

  const extractPrompt = buildArroDesignUrlContextPrompt({
    url,
    fetchedHtml: html,
    tavilySearchResult: tavilyContext || undefined,
  });

  const extractedContext = await generateWithFallback(extractPrompt, {
    modelClass: "MENENGAH",
    temperature: 0.3,
    maxOutputTokens: 2000,
  });

  return extractedContext;
}

// ─── Main Engine ─────────────────────────────────────────────────────────────

export async function runArroDesignEngine(
  input: ArroDesignInput,
  onProgress?: OnProgress
): Promise<ArroDesignResult> {
  const progress = onProgress ?? (() => {});

  progress({ step: "init", message: "ArroDesign menyiapkan pipeline..." });

  const { inputType, imageDataUrl, referenceUrl, projectContext } = input;
  let rawOutput: string;

  if (inputType === "image") {
    if (!imageDataUrl?.trim()) {
      throw new Error("Mode gambar membutuhkan file gambar yang diupload.");
    }

    rawOutput = await gatherImageContext({
      imageDataUrl,
      projectContext,
      onProgress: progress,
    });
  } else {
    // mode url
    if (!referenceUrl?.trim()) {
      throw new Error("Mode URL membutuhkan URL yang valid.");
    }

    // Validasi URL
    try {
      new URL(referenceUrl);
    } catch {
      throw new Error(`URL tidak valid: ${referenceUrl}`);
    }

    const urlContext = await gatherUrlContext({
      url: referenceUrl,
      onProgress: progress,
    });

    // Final analysis dengan konteks URL
    progress({ step: "generating", message: "Analysis Engine menyusun design.md..." });

    const analysisPrompt = buildArroDesignAnalysisPrompt({
      inputType: "url",
      referenceContext: `URL: ${referenceUrl}\n\n## Konteks Terekstrak dari Halaman:\n${urlContext}`,
      projectContext,
    });

    rawOutput = await generateWithFallback(analysisPrompt, {
      modelClass: "FLAGSHIP",
      temperature: 0.4,
      maxOutputTokens: 5000,
    });
  }

  progress({ step: "done", message: "Selesai! design.md siap." });

  const { designMd, stitchPrompt } = parseArroDesignOutput(rawOutput);

  return {
    designMd,
    stitchPrompt,
    rawOutput,
    inputType,
    creditsUsed: ARRODESIGN_CREDITS[inputType],
  };
}

// ─── Config check helpers ─────────────────────────────────────────────────────

export function getArroDesignCapabilities(): {
  imageSupported: boolean;
  urlSupported: boolean;
  tavilyConfigured: boolean;
  missingKeys: string[];
} {
  const imageSupported = isOpenRouterConfigured();
  const urlSupported = true; // URL path hanya butuh Flagship model, sudah ada
  const tavilyConfigured = isTavilyConfigured();

  const missingKeys: string[] = [];
  if (!imageSupported) missingKeys.push("OPENROUTER_API_KEY");
  if (!tavilyConfigured) missingKeys.push("TAVILY_API_KEY (opsional — URL path tetap jalan)");

  return { imageSupported, urlSupported, tavilyConfigured, missingKeys };
}
