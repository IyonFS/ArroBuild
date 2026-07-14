/**
 * context-manager.ts — accumulated context between v2 documents
 */

import type { DocumentFileKey } from "@/lib/config/documents";
import { DOCUMENT_GENERATION_ORDER } from "@/lib/config/documents";

interface ContextEntry {
  docType: DocumentFileKey;
  summary: string;
  keyFacts: string[];
  generatedAt: number;
}

export class ContextManager {
  private entries: ContextEntry[] = [];
  private readonly MAX_CONTEXT_CHARS: number;
  private readonly PRIORITY_ORDER: DocumentFileKey[] = DOCUMENT_GENERATION_ORDER;

  constructor(maxContextTokens = 3000) {
    this.MAX_CONTEXT_CHARS = Math.max(2000, maxContextTokens * 4);
  }

  addDocument(docType: DocumentFileKey, fullContent: string): void {
    const summary = this.extractSummary(fullContent);
    const keyFacts = this.extractKeyFacts(fullContent);
    this.entries.push({ docType, summary, keyFacts, generatedAt: Date.now() });
  }

  buildContextString(forDocType?: DocumentFileKey): string {
    if (this.entries.length === 0) return "";

    const sorted = [...this.entries].sort((a, b) => {
      const ai = this.PRIORITY_ORDER.indexOf(a.docType);
      const bi = this.PRIORITY_ORDER.indexOf(b.docType);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

    let result = "=== KONTEKS DARI DOKUMEN SEBELUMNYA ===\n\n";
    let charBudget = this.MAX_CONTEXT_CHARS;

    for (const entry of sorted) {
      if (forDocType && entry.docType === forDocType) continue;
      const block = this.formatEntry(entry);
      if (charBudget - block.length < 2000) break;
      result += block;
      charBudget -= block.length;
    }

    return result;
  }

  hasContext(): boolean {
    return this.entries.length > 0;
  }

  get documentCount(): number {
    return this.entries.length;
  }

  private extractSummary(content: string): string {
    const lines = content.split("\n");
    const summaryLines: string[] = [];
    let afterHeading = false;
    let charCount = 0;
    const MAX_SUMMARY = 1500;

    for (const line of lines) {
      if (charCount >= MAX_SUMMARY) break;
      if (line.startsWith("## ") || line.startsWith("# ")) {
        afterHeading = true;
        summaryLines.push(line);
        charCount += line.length;
        continue;
      }
      if (line.startsWith("### ") && charCount < MAX_SUMMARY * 0.8) {
        summaryLines.push(line);
        charCount += line.length;
        afterHeading = true;
        continue;
      }
      const trimmed = line.trim();
      if (
        afterHeading &&
        trimmed &&
        !trimmed.startsWith("|") &&
        !trimmed.startsWith("```") &&
        !trimmed.startsWith("#")
      ) {
        const firstSentence = trimmed.split(/[.!?]\s/)[0] + ".";
        summaryLines.push(firstSentence);
        charCount += firstSentence.length;
        afterHeading = false;
      }
    }

    return summaryLines.join("\n");
  }

  private extractKeyFacts(content: string): string[] {
    const facts: string[] = [];
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.match(/^[-*]\s+\*\*.+\*\*/)) {
        facts.push(trimmed.replace(/^[-*]\s+/, "").substring(0, 200));
      }
      if (facts.length >= 10) break;
    }
    return facts;
  }

  private formatEntry(entry: ContextEntry): string {
    const docLabel = entry.docType.toUpperCase().replace(/-/g, "_");
    let block = `### [${docLabel}]\n${entry.summary}`;
    if (entry.keyFacts.length > 0) {
      block += "\n\n**Key Facts:**\n";
      block += entry.keyFacts.map((f) => `- ${f}`).join("\n");
    }
    return block + "\n\n";
  }
}
