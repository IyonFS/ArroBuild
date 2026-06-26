/**
 * context-manager.ts
 * Mengelola accumulated context antar dokumen secara cerdas.
 * Menggantikan fungsi summarizeForContext() yang berbasis karakter potong sederhana.
 */

import type { FileKey } from "./prompts/shared";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ContextEntry {
  docType: FileKey;
  summary: string;       // ringkasan 300-500 kata per section
  keyFacts: string[];    // bullet point penting yang HARUS diingat
  generatedAt: number;   // timestamp untuk ordering
}

// ─── ContextManager ─────────────────────────────────────────────────────────

export class ContextManager {
  private entries: ContextEntry[] = [];

  // Budget karakter untuk konteks (estimasi: 1 token ≈ 4 karakter)
  // 3000 token budget = ~12000 karakter
  private readonly MAX_CONTEXT_CHARS = 12000;

  // Urutan prioritas dokumen saat membangun konteks
  private readonly PRIORITY_ORDER: FileKey[] = [
    "context",
    "prd",
    "plan",
    "design-system",
    "agents",
    "production-hardening",
    "scale-performance",
    "growth-quality",
  ];

  /**
   * Tambah dokumen yang selesai ke context pool.
   */
  addDocument(docType: FileKey, fullContent: string): void {
    const summary = this.extractSummary(fullContent);
    const keyFacts = this.extractKeyFacts(fullContent);
    this.entries.push({ docType, summary, keyFacts, generatedAt: Date.now() });
  }

  /**
   * Bangun string konteks untuk dimasukkan ke prompt dokumen berikutnya.
   * Prioritas: context → prd → plan → design-system → ...
   */
  buildContextString(forDocType?: FileKey): string {
    if (this.entries.length === 0) return "";

    // Sort berdasarkan priority order
    const sorted = [...this.entries].sort((a, b) => {
      const ai = this.PRIORITY_ORDER.indexOf(a.docType);
      const bi = this.PRIORITY_ORDER.indexOf(b.docType);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

    let result = "=== KONTEKS DARI DOKUMEN SEBELUMNYA ===\n\n";
    let charBudget = this.MAX_CONTEXT_CHARS;

    for (const entry of sorted) {
      // Jangan masukkan dokumen yang sedang di-generate sebagai konteksnya sendiri
      if (forDocType && entry.docType === forDocType) continue;

      const block = this.formatEntry(entry);
      if (charBudget - block.length < 2000) break; // sisakan 2000 chars safety margin

      result += block;
      charBudget -= block.length;
    }

    return result;
  }

  /**
   * Apakah ada konteks yang tersedia?
   */
  hasContext(): boolean {
    return this.entries.length > 0;
  }

  /**
   * Berapa banyak dokumen yang sudah dikumpulkan.
   */
  get documentCount(): number {
    return this.entries.length;
  }

  // ─── Private Helpers ────────────────────────────────────────────────────

  /**
   * Ekstrak ringkasan: ambil heading H2 dan paragraf pertama per section.
   */
  private extractSummary(content: string): string {
    const lines = content.split("\n");
    const summaryLines: string[] = [];
    let afterHeading = false;
    let charCount = 0;
    const MAX_SUMMARY = 1500;

    for (const line of lines) {
      if (charCount >= MAX_SUMMARY) break;

      // Heading H1/H2 selalu diambil
      if (line.startsWith("## ") || line.startsWith("# ")) {
        afterHeading = true;
        summaryLines.push(line);
        charCount += line.length;
        continue;
      }

      // Heading H3 diambil jika masih ada budget
      if (line.startsWith("### ") && charCount < MAX_SUMMARY * 0.8) {
        summaryLines.push(line);
        charCount += line.length;
        afterHeading = true;
        continue;
      }

      // Ambil paragraf pertama yang tidak kosong setelah heading
      const trimmed = line.trim();
      if (
        afterHeading &&
        trimmed &&
        !trimmed.startsWith("|") &&
        !trimmed.startsWith("```") &&
        !trimmed.startsWith("#")
      ) {
        // Hanya kalimat pertama
        const firstSentence = trimmed.split(/[.!?]\s/)[0] + ".";
        summaryLines.push(firstSentence);
        charCount += firstSentence.length;
        afterHeading = false;
      }
    }

    return summaryLines.join("\n");
  }

  /**
   * Ekstrak key facts dari bullet points dengan bold (**text**).
   */
  private extractKeyFacts(content: string): string[] {
    const facts: string[] = [];
    const lines = content.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      // Cari bullet points dengan bold marker
      if (trimmed.match(/^[-*]\s+\*\*.+\*\*/)) {
        const cleaned = trimmed
          .replace(/^[-*]\s+/, "")
          .substring(0, 200);
        facts.push(cleaned);
      }
      if (facts.length >= 10) break; // maks 10 key facts
    }

    return facts;
  }

  /**
   * Format satu context entry menjadi string yang siap dimasukkan ke prompt.
   */
  private formatEntry(entry: ContextEntry): string {
    const docLabel = entry.docType.toUpperCase().replace(/-/g, "_");
    let block = `### [${docLabel}]\n`;
    block += entry.summary;

    if (entry.keyFacts.length > 0) {
      block += "\n\n**Key Facts:**\n";
      block += entry.keyFacts.map((f) => `- ${f}`).join("\n");
    }

    block += "\n\n";
    return block;
  }
}
