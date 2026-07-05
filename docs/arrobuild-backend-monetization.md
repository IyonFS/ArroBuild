# ArroBuild — Backend Architecture, Monetization & Prompt Templates
**Version:** 3.0  
**Status:** Ready for Agent Execution  
**Last Updated:** June 2026  
**Scope:** AI API Architecture · Pricing System · Tier Logic · Prompt Templates per Dokumen

---

## Bagian 1 — Diagnosis Arsitektur Sekarang

### Yang Sudah Bagus (Jangan Diubah)
- SSE streaming sudah benar — tetap pakai ini
- Multi-provider support (Gemini, OpenAI, DeepSeek, Anthropic) — tetap
- Zod validation di endpoint — tetap
- Prisma + Supabase sebagai DB layer — tetap
- Sequential orchestration (Context → PRD → Plan → dst) — tetap, ini konsep yang benar

### Masalah yang Harus Diperbaiki

**Masalah 1: Orchestrator terlalu tebal**
`orchestrator.ts` sekarang menangani terlalu banyak hal sekaligus:
prompting + context state + stream management + retry logic + DB write.
Ini membuat debugging sulit dan satu bug bisa merusak semua.

**Masalah 2: Context management primitif**
`summarizeForContext` berbasis karakter potong — ini menyebabkan konteks
kehilangan informasi penting di dokumen ke-4, ke-5, dst.

**Masalah 3: DB write blocking stream**
`await prisma.generatedFile.create` di dalam loop stream bisa memperlambat
seluruh proses jika DB sedang berat.

**Masalah 4: Tidak ada fallback model**
Kalau Anthropic timeout atau rate limit, seluruh generate gagal.

**Masalah 5: Tidak ada tier enforcement yang ketat**
Tier check dilakukan di endpoint tapi tidak ada hard enforcement di
orchestrator — user bisa bypass jika ada bug validasi.

---

## Bagian 2 — Arsitektur Baru (v3.0)

### Prinsip Desain
- **Separation of Concerns** — tiap modul punya satu tanggung jawab
- **Fail gracefully** — satu dokumen gagal tidak menghentikan semua
- **Cost-efficient** — model mahal hanya dipakai jika tier membenarkan
- **Observable** — setiap langkah bisa di-log dan di-debug

### Struktur File Baru

```
src/lib/ai/
├── orchestrator.ts          ← SLIM: hanya koordinasi urutan
├── generator.ts             ← SLIM: hanya pemanggilan LLM
├── context-manager.ts       ← BARU: kelola accumulated context
├── retry-handler.ts         ← BARU: retry + fallback model logic
├── stream-writer.ts         ← BARU: abstraksi SSE stream
├── tier-enforcer.ts         ← BARU: hard enforcement tier & quota
├── db-writer.ts             ← BARU: non-blocking DB operations
└── prompts/
    ├── shared.ts            ← types, utils, token limits
    ├── context.ts           ← prompt template: context.md
    ├── prd.ts               ← prompt template: prd.md
    ├── plan.ts              ← prompt template: plan.md
    ├── design-system.ts     ← prompt template: design-system.md
    ├── agents.ts            ← prompt template: agents.md
    ├── hardening.ts         ← prompt template: production-hardening.md
    ├── scale.ts             ← prompt template: scale-performance.md
    └── growth.ts            ← prompt template: growth-quality.md
```

---

### Modul 1: `tier-enforcer.ts` (BARU)

Ini adalah gerbang pertama. Semua request harus lolos ini sebelum
orchestrator dijalankan.

```typescript
// tier-enforcer.ts

export type UserTier = 'FREE' | 'PRO' | 'PRO_MAX';

export interface TierConfig {
  maxDocuments: number;           // maks dokumen per generate
  allowedDocuments: DocType[];    // dokumen apa saja yang boleh
  maxProjectsPerMonth: number;    // -1 = unlimited
  allowedModels: ModelId[];       // model apa yang boleh dipilih
  defaultModel: ModelId;          // model default jika tidak pilih
  maxTokensPerDoc: number;        // token limit per dokumen
  streamingEnabled: boolean;      // real-time streaming atau batch
  exportFormats: ExportFormat[];  // format download yang tersedia
  customPresets: boolean;         // bisa custom framework/style
  projectHistory: boolean;        // akses dashboard history
  forkProject: boolean;           // bisa fork project lama
}

export const TIER_CONFIG: Record<UserTier, TierConfig> = {
  FREE: {
    maxDocuments: 3,
    allowedDocuments: ['context', 'prd', 'plan'],
    maxProjectsPerMonth: 5,
    allowedModels: ['gemini-2.5-flash', 'deepseek-chat'],
    defaultModel: 'gemini-2.5-flash',
    maxTokensPerDoc: 2000,
    streamingEnabled: true,
    exportFormats: ['zip'],
    customPresets: false,
    projectHistory: false,
    forkProject: false,
  },
  PRO: {
    maxDocuments: 5,
    allowedDocuments: ['context', 'prd', 'plan', 'design-system', 'agents'],
    maxProjectsPerMonth: 30,
    allowedModels: ['gemini-2.5-flash', 'deepseek-chat', 'gemini-2.5-pro', 'gpt-4o'],
    defaultModel: 'gemini-2.5-pro',
    maxTokensPerDoc: 4000,
    streamingEnabled: true,
    exportFormats: ['zip', 'cursorrules', 'claude-md', 'system-prompt'],
    customPresets: true,
    projectHistory: true,
    forkProject: true,
  },
  PRO_MAX: {
    maxDocuments: 8,
    allowedDocuments: ['context', 'prd', 'plan', 'design-system', 'agents',
                       'hardening', 'scale', 'growth'],
    maxProjectsPerMonth: -1, // unlimited
    allowedModels: ['gemini-2.5-flash', 'deepseek-chat', 'gemini-2.5-pro',
                    'gpt-4o', 'claude-sonnet-4'],
    defaultModel: 'claude-sonnet-4',
    maxTokensPerDoc: 8000,
    streamingEnabled: true,
    exportFormats: ['zip', 'cursorrules', 'claude-md', 'agents-json', 'system-prompt'],
    customPresets: true,
    projectHistory: true,
    forkProject: true,
  },
};

export function enforceTier(
  requestedDocs: DocType[],
  selectedModel: ModelId,
  userTier: UserTier
): { allowed: boolean; reason?: string; sanitizedDocs: DocType[] } {
  const config = TIER_CONFIG[userTier];

  // Filter dokumen yang tidak diizinkan
  const sanitizedDocs = requestedDocs.filter(doc =>
    config.allowedDocuments.includes(doc)
  );

  // Cek model
  if (!config.allowedModels.includes(selectedModel)) {
    return {
      allowed: false,
      reason: `Model ${selectedModel} tidak tersedia di tier ${userTier}`,
      sanitizedDocs,
    };
  }

  // Cek jumlah dokumen
  if (sanitizedDocs.length > config.maxDocuments) {
    return {
      allowed: false,
      reason: `Maksimal ${config.maxDocuments} dokumen untuk tier ${userTier}`,
      sanitizedDocs: sanitizedDocs.slice(0, config.maxDocuments),
    };
  }

  return { allowed: true, sanitizedDocs };
}
```

---

### Modul 2: `context-manager.ts` (BARU)

Menggantikan `summarizeForContext` yang primitif.

```typescript
// context-manager.ts

interface ContextEntry {
  docType: DocType;
  summary: string;        // ringkasan 300-500 kata
  keyFacts: string[];     // poin penting yang HARUS diingat
  generatedAt: number;    // timestamp untuk prioritas
}

export class ContextManager {
  private entries: ContextEntry[] = [];
  private readonly MAX_CONTEXT_TOKENS = 3000; // budget konteks

  // Tambah dokumen yang selesai ke context pool
  async addDocument(docType: DocType, fullContent: string): Promise<void> {
    const summary = this.extractSummary(docType, fullContent);
    const keyFacts = this.extractKeyFacts(docType, fullContent);
    this.entries.push({ docType, summary, keyFacts, generatedAt: Date.now() });
  }

  // Bangun konteks untuk prompt dokumen berikutnya
  buildContextString(forDocType: DocType): string {
    if (this.entries.length === 0) return '';

    // Prioritaskan: context.md selalu masuk, lalu prd.md, lalu sisanya
    const priority: DocType[] = ['context', 'prd', 'plan', 'design-system'];
    const sorted = [...this.entries].sort((a, b) => {
      const ai = priority.indexOf(a.docType);
      const bi = priority.indexOf(b.docType);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

    let result = '=== KONTEKS DARI DOKUMEN SEBELUMNYA ===\n\n';
    let tokenBudget = this.MAX_CONTEXT_TOKENS;

    for (const entry of sorted) {
      const block = this.formatEntry(entry);
      const blockTokens = Math.ceil(block.length / 4); // estimasi kasar
      if (tokenBudget - blockTokens < 500) break; // sisakan 500 untuk safety
      result += block;
      tokenBudget -= blockTokens;
    }

    return result;
  }

  private extractSummary(docType: DocType, content: string): string {
    // Ambil heading H2 dan paragraf pertama tiap section
    const lines = content.split('\n');
    const summaryLines: string[] = [];
    let inSection = false;

    for (const line of lines) {
      if (line.startsWith('## ')) {
        inSection = true;
        summaryLines.push(line);
        continue;
      }
      if (inSection && line.trim() && !line.startsWith('#')) {
        summaryLines.push(line);
        inSection = false; // hanya ambil paragraf pertama tiap section
      }
    }

    return summaryLines.join('\n').substring(0, 1500);
  }

  private extractKeyFacts(docType: DocType, content: string): string[] {
    // Ekstrak bullet points dan definisi penting
    const facts: string[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.match(/^[-*]\s+\*\*.+\*\*/)) {
        facts.push(line.replace(/^[-*]\s+/, '').substring(0, 150));
      }
    }

    return facts.slice(0, 10); // maks 10 key facts
  }

  private formatEntry(entry: ContextEntry): string {
    return `### ${entry.docType.toUpperCase()}\n${entry.summary}\n\nKey facts:\n${
      entry.keyFacts.map(f => `- ${f}`).join('\n')
    }\n\n`;
  }
}
```

---

### Modul 3: `retry-handler.ts` (BARU)

Fallback model strategy — kalau model utama gagal, otomatis pindah.

```typescript
// retry-handler.ts

export const FALLBACK_CHAIN: Record<ModelId, ModelId[]> = {
  'claude-sonnet-4':   ['gpt-4o', 'gemini-2.5-pro', 'gemini-2.5-flash'],
  'gpt-4o':           ['gemini-2.5-pro', 'gemini-2.5-flash'],
  'gemini-2.5-pro':   ['gpt-4o', 'gemini-2.5-flash'],
  'gemini-2.5-flash': ['deepseek-chat'],
  'deepseek-chat':    ['gemini-2.5-flash'],
};

export async function withRetryAndFallback<T>(
  fn: (modelId: ModelId) => Promise<T>,
  primaryModel: ModelId,
  userTier: UserTier,
  maxRetries = 2
): Promise<{ result: T; usedModel: ModelId }> {
  const tierAllowed = TIER_CONFIG[userTier].allowedModels;
  const chain = [primaryModel, ...(FALLBACK_CHAIN[primaryModel] || [])]
    .filter(m => tierAllowed.includes(m));

  let lastError: Error | null = null;

  for (const model of chain) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await fn(model);
        return { result, usedModel: model };
      } catch (err) {
        lastError = err as Error;
        const isRateLimit = (err as any)?.status === 429;
        const backoff = isRateLimit
          ? Math.pow(2, attempt) * 1000 // exponential untuk rate limit
          : 500;                         // flat untuk error lain
        await new Promise(r => setTimeout(r, backoff));
      }
    }
    // Model ini habis retry-nya, coba model berikutnya
  }

  throw new Error(`Semua model gagal. Error terakhir: ${lastError?.message}`);
}
```

---

### Modul 4: `db-writer.ts` (BARU) — Non-blocking

```typescript
// db-writer.ts

// Queue sederhana berbasis Promise untuk hindari blocking stream
const writeQueue: Array<() => Promise<void>> = [];
let isProcessing = false;

async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;
  while (writeQueue.length > 0) {
    const task = writeQueue.shift();
    if (task) {
      await task().catch(err =>
        console.error('[db-writer] Failed to write:', err)
      );
    }
  }
  isProcessing = false;
}

export function queueFileWrite(
  projectId: string,
  docType: DocType,
  content: string
): void {
  writeQueue.push(async () => {
    await prisma.generatedFile.create({
      data: { projectId, docType, content, createdAt: new Date() },
    });
  });
  processQueue(); // fire and forget — tidak block stream
}

export function queueProjectStatusUpdate(
  projectId: string,
  status: 'GENERATING' | 'DONE' | 'FAILED'
): void {
  writeQueue.push(async () => {
    await prisma.project.update({
      where: { id: projectId },
      data: { status, updatedAt: new Date() },
    });
  });
  processQueue();
}
```

---

### Orchestrator Baru (Slim)

```typescript
// orchestrator.ts (v3 — slim version)

export async function runOrchestrator(
  config: GenerateConfig,
  userTier: UserTier,
  streamWriter: StreamWriter,
  projectId: string
): Promise<void> {
  const tierConfig = TIER_CONFIG[userTier];
  const contextManager = new ContextManager();

  // Urutan dokumen: context SELALU pertama
  const DOC_ORDER: DocType[] = [
    'context', 'prd', 'plan', 'design-system', 'agents',
    'hardening', 'scale', 'growth'
  ];
  const docsToGenerate = DOC_ORDER.filter(d =>
    config.selectedDocs.includes(d)
  );

  for (const docType of docsToGenerate) {
    streamWriter.sendStatus('file_start', { docType });

    const prompt = buildPrompt(docType, config, userTier, contextManager);

    try {
      const { result: content, usedModel } = await withRetryAndFallback(
        (model) => streamGenerateDoc(prompt, model, tierConfig.maxTokensPerDoc, streamWriter),
        config.selectedModel,
        userTier
      );

      // Update context untuk dokumen berikutnya
      await contextManager.addDocument(docType, content);

      // Simpan ke DB (non-blocking)
      queueFileWrite(projectId, docType, content);

      streamWriter.sendStatus('file_done', { docType, usedModel });

    } catch (err) {
      streamWriter.sendStatus('file_error', { docType, error: (err as Error).message });
      // Lanjut ke dokumen berikutnya meskipun satu gagal
    }
  }

  queueProjectStatusUpdate(projectId, 'DONE');
  streamWriter.sendStatus('all_done', { projectId });
}
```

---

## Bagian 3 — Monetisasi & Pricing

### Target Pasar & Positioning

**Target:** Developer Indonesia, vibe coder, indie hacker, mahasiswa teknik, startup early-stage.

**Positioning harga:** Jauh lebih murah dari tools luar (Notion AI, GitHub Copilot, dll) tapi terasa premium dari sisi kualitas. Harga dalam rupiah, bayar pakai QRIS/GoPay/OVO.

---

### Tiga Paket Harga

---

#### 🟢 FREE — Rp 0/bulan

**Tagline:** *"Cukup untuk mulai, sempurna untuk coba."*

| Fitur | Detail |
|---|---|
| Generate per bulan | **5 project** |
| Dokumen per generate | **3 dokumen** (Context + PRD + Plan) |
| Model AI | Gemini 2.5 Flash · DeepSeek V3 |
| Kualitas output | Standard (2.000 token/dok) |
| Export format | ZIP saja |
| Dashboard history | ❌ |
| Fork project | ❌ |
| Custom presets | ❌ |
| Export .cursorrules / CLAUDE.md | ❌ |
| Learn Hub | ✅ Full akses (selalu gratis) |
| Tools (Portfolio Generator) | ✅ Full akses |
| Support | Community only |

**Cocok untuk:** Pertama kali coba, mahasiswa, project iseng.

---

#### ⚡ PRO — Rp 49.000/bulan

**Tagline:** *"Untuk yang serius build."*

| Fitur | Detail |
|---|---|
| Generate per bulan | **30 project** |
| Dokumen per generate | **5 dokumen** (+ Design System + Agents) |
| Model AI | + Gemini 2.5 Pro · GPT-4o |
| Kualitas output | Enhanced (4.000 token/dok) |
| Export format | ZIP · .cursorrules · CLAUDE.md · system-prompt.txt |
| Dashboard history | ✅ |
| Fork project | ✅ |
| Custom presets | ✅ (framework + design style bebas) |
| Export .cursorrules / CLAUDE.md | ✅ |
| Learn Hub | ✅ Full akses |
| Priority generate | ✅ (antrian lebih cepat) |
| Support | Email support |

**Cocok untuk:** Indie hacker aktif, freelancer, developer yang rutin build project.

**Harga tahunan:** Rp 39.000/bulan (hemat Rp 120.000/tahun) — opsional.

---

#### 💎 PRO MAX — Rp 99.000/bulan

**Tagline:** *"Foundation engineering grade — siap production."*

| Fitur | Detail |
|---|---|
| Generate per bulan | **Unlimited** |
| Dokumen per generate | **8 dokumen** (semua termasuk Hardening + Scale + Growth) |
| Model AI | + Claude Sonnet 4 (terbaik untuk docs) |
| Kualitas output | Maximum (8.000 token/dok) — paling detail |
| Export format | Semua format + agents.json |
| Dashboard history | ✅ |
| Fork project | ✅ |
| Custom presets | ✅ |
| Regenerate per file | ✅ (generate ulang satu dokumen tanpa ulang semua) |
| Export semua format | ✅ |
| Learn Hub | ✅ Full akses |
| Priority generate | ✅ (antrian tertinggi) |
| Early access fitur baru | ✅ |
| Support | Priority chat support |

**Cocok untuk:** Tech lead, startup founder, developer yang butuh dokumentasi production-grade.

**Harga tahunan:** Rp 79.000/bulan (hemat Rp 240.000/tahun) — opsional.

---

### Perbandingan Visual Tabel

```
                    FREE        PRO         PRO MAX
                    Rp 0        Rp 49K      Rp 99K
                    ─────────   ─────────   ─────────
Generate/bulan      5           30          Unlimited
Dokumen/generate    3           5           8
Token/dokumen       2.000       4.000       8.000
Model terbaik       Flash       GPT-4o      Claude S4
Export formats      1           4           5
Dashboard           ✗           ✓           ✓
Custom presets      ✗           ✓           ✓
Regen per file      ✗           ✗           ✓
```

---

### Quota Enforcement Logic

```typescript
// Di tier-enforcer.ts — quota check

export async function checkMonthlyQuota(
  userId: string,
  userTier: UserTier
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const config = TIER_CONFIG[userTier];

  if (config.maxProjectsPerMonth === -1) {
    return { allowed: true, used: 0, limit: -1 }; // unlimited
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const used = await prisma.project.count({
    where: {
      userId,
      createdAt: { gte: startOfMonth },
      status: { not: 'FAILED' }, // project gagal tidak dihitung
    },
  });

  return {
    allowed: used < config.maxProjectsPerMonth,
    used,
    limit: config.maxProjectsPerMonth,
  };
}
```

---

### Payment Integration (Midtrans)

```typescript
// src/lib/payment/midtrans.ts

export const PLANS = {
  PRO_MONTHLY: {
    amount: 49000,
    name: 'ArroBuild Pro — Bulanan',
    tier: 'PRO' as UserTier,
    billingCycle: 'monthly',
  },
  PRO_YEARLY: {
    amount: 468000, // 39.000 × 12
    name: 'ArroBuild Pro — Tahunan',
    tier: 'PRO' as UserTier,
    billingCycle: 'yearly',
  },
  PRO_MAX_MONTHLY: {
    amount: 99000,
    name: 'ArroBuild Pro Max — Bulanan',
    tier: 'PRO_MAX' as UserTier,
    billingCycle: 'monthly',
  },
  PRO_MAX_YEARLY: {
    amount: 948000, // 79.000 × 12
    name: 'ArroBuild Pro Max — Tahunan',
    tier: 'PRO_MAX' as UserTier,
    billingCycle: 'yearly',
  },
};

// Payment methods yang diaktifkan:
// QRIS, GoPay, OVO, Dana, ShopeePay, BCA VA, BNI VA, Mandiri VA
// Kartu kredit/debit (opsional)
```

---

## Bagian 4 — Prompt Templates per Tier

### Prinsip Diferensiasi Kualitas

Perbedaan kualitas antar tier bukan hanya soal token — tapi soal **kedalaman instruksi**:

| Aspek | FREE | PRO | PRO MAX |
|---|---|---|---|
| Token/dok | 2.000 | 4.000 | 8.000 |
| Instruksi detail | Ringkas | Menengah | Sangat spesifik |
| Contoh & template dalam output | Minimal | Ada beberapa | Lengkap dengan contoh nyata |
| Framework-specific | Generic | Spesifik | Sangat spesifik + best practices |
| Persona AI | General assistant | Senior dev | Principal engineer |

---

### Template: `context.md`

```typescript
// src/lib/ai/prompts/context.ts

export function buildContextPrompt(
  config: GenerateConfig,
  tier: UserTier
): string {
  const personas = {
    FREE:    'a helpful software assistant',
    PRO:    'a senior software engineer with 8 years experience',
    PRO_MAX: 'a principal engineer and technical architect',
  };

  const depthInstructions = {
    FREE: `
Buat dokumen context.md yang ringkas dan jelas.
Cukup 3-4 section utama: Overview, Tech Stack, Key Features, Constraints.
Gunakan bahasa yang mudah dipahami.`,

    PRO: `
Buat dokumen context.md yang komprehensif.
Sertakan: Project Overview, Goals & Success Metrics, Target User Persona,
Tech Stack dengan alasan pemilihan, Core Features dengan prioritas (P0/P1/P2),
Non-functional Requirements, dan Known Constraints.
Gunakan format yang siap di-copy ke AI agent sebagai system context.`,

    PRO_MAX: `
Buat dokumen context.md yang production-grade dan sangat detail.
Sertakan semua section PRO, ditambah:
- Domain Model: entitas utama dan relasinya
- System Boundaries: apa yang IN scope dan OUT of scope  
- Technical Decisions Log: keputusan arsitektur dan alasannya
- Integration Points: API eksternal, third-party services
- Security Considerations: autentikasi, otorisasi, data sensitivity
- Performance Targets: response time, throughput, uptime SLA
Format harus optimal sebagai CLAUDE.md atau .cursorrules context.
Setiap section harus actionable untuk AI agent.`,
  };

  return `You are ${personas[tier]}.

Your task is to generate a context.md file for an AI-assisted development project.
This file will be used as the primary context document for AI coding agents
(Cursor, Claude Code, Windsurf, etc).

${depthInstructions[tier]}

=== PROJECT INPUT ===
Product Type: ${config.productType}
Stage: ${config.stage}
Target User: ${config.targetUser}
Problem: ${config.problem}
Core Features: ${config.coreFeatures}
Framework: ${config.framework || 'To be determined'}
Design Style: ${config.designStyle || 'To be determined'}
AI Tool Target: ${config.aiToolTarget}
${config.additionalContext ? `Additional Context: ${config.additionalContext}` : ''}

=== OUTPUT RULES ===
- Output ONLY the markdown content, no preamble
- Start with: # Project Context — [Project Name]
- Use proper markdown headers (##, ###)
- Be specific and actionable, not generic
- Max tokens: ${TIER_CONFIG[tier].maxTokensPerDoc}`;
}
```

---

### Template: `prd.md`

```typescript
// src/lib/ai/prompts/prd.ts

export function buildPrdPrompt(
  config: GenerateConfig,
  tier: UserTier,
  contextSummary: string
): string {
  const depthInstructions = {
    FREE: `
Buat PRD sederhana dengan section:
- Problem Statement
- Target Users
- Core Features (buat sebagai user stories sederhana)
- Out of Scope
Fokus pada MVP, singkat dan actionable.`,

    PRO: `
Buat PRD komprehensif dengan section:
- Executive Summary
- Problem & Opportunity
- Target Users dengan Persona detail
- User Stories (format: As a [user], I want [action] so that [benefit])
  Sertakan Acceptance Criteria per story
- Feature Prioritization (MoSCoW: Must/Should/Could/Won't)
- Success Metrics (KPI yang measurable)
- Out of Scope & Future Considerations
Format harus bisa digunakan langsung sebagai referensi AI agent.`,

    PRO_MAX: `
Buat PRD engineering-grade yang sangat detail:
- Executive Summary dengan business case
- Problem Statement dengan market context
- User Personas (2-3 persona dengan goals, frustrations, behaviors)
- User Journey Map per persona (step-by-step flow)
- Functional Requirements (terformat sebagai FR-001, FR-002, dst)
  Tiap requirement: Description + Acceptance Criteria + Priority + Complexity
- Non-Functional Requirements (performance, security, scalability, accessibility)
- Edge Cases & Error Scenarios per fitur utama
- Data Requirements: entitas, validasi, business rules
- Integration Requirements: API eksternal yang dibutuhkan
- Success Metrics dengan baseline dan target
- Risk Assessment: technical risks dan mitigation
PRD ini harus cukup lengkap untuk dieksekusi langsung oleh AI agent
tanpa butuh klarifikasi tambahan.`,
  };

  return `You are a product manager and software architect.

Generate a prd.md (Product Requirements Document) file.

${contextSummary ? contextSummary + '\n' : ''}

${depthInstructions[tier]}

=== PROJECT INPUT ===
Product Type: ${config.productType}
Target User: ${config.targetUser}
Problem: ${config.problem}
Core Features: ${config.coreFeatures}
Framework: ${config.framework}

=== OUTPUT RULES ===
- Output ONLY the markdown content
- Start with: # Product Requirements Document — [Project Name]
- Be specific to THIS project, not generic templates
- All user stories must be realistic for this specific product
- Max tokens: ${TIER_CONFIG[tier].maxTokensPerDoc}`;
}
```

---

### Template: `plan.md`

```typescript
// src/lib/ai/prompts/plan.ts

export function buildPlanPrompt(
  config: GenerateConfig,
  tier: UserTier,
  contextSummary: string
): string {
  const depthInstructions = {
    FREE: `
Buat development plan sederhana:
- Phase 1: Setup & Foundation (list task setup project)
- Phase 2: Core Features (task per fitur utama)
- Phase 3: Polish & Deploy
Format sebagai checklist markdown yang bisa langsung diikuti.`,

    PRO: `
Buat development plan yang terstruktur:
- Phase breakdown dengan estimasi waktu
- Per phase: daftar task spesifik dengan acceptance criteria
- Tech stack setup instructions per framework yang dipilih
- Dependency order (task mana yang harus selesai sebelum task lain)
- Testing checkpoints per phase
- Deployment checklist di akhir`,

    PRO_MAX: `
Buat development plan production-grade:
- Sprint breakdown (1-2 minggu per sprint)
- Per sprint: Goals + Tasks + Definition of Done
- Task granularity: tiap task harus bisa diselesaikan dalam 1 sesi coding (2-4 jam)
- Setup instructions spesifik per tech stack yang dipilih
  (misal: jika Next.js + Supabase, berikan command exacts)
- Database schema initialization tasks
- API endpoint checklist per fitur
- Testing strategy: unit test + integration test per layer
- CI/CD setup tasks
- Production deployment checklist dengan security hardening
- Post-launch monitoring setup
Format harus optimal sebagai task list untuk AI agent — tiap task
harus cukup spesifik sehingga AI bisa langsung eksekusi tanpa ambiguitas.`,
  };

  return `You are a senior engineering manager and technical lead.

Generate a plan.md (Development Plan) file.

${contextSummary}

${depthInstructions[tier]}

=== PROJECT INPUT ===
Product Type: ${config.productType}
Framework: ${config.framework}
Core Features: ${config.coreFeatures}
Stage: ${config.stage}
AI Tool Target: ${config.aiToolTarget}

=== OUTPUT RULES ===
- Output ONLY the markdown content
- Start with: # Development Plan — [Project Name]
- Tasks must be specific to ${config.framework} ecosystem
- Include actual commands where relevant (npm install, etc)
- Max tokens: ${TIER_CONFIG[tier].maxTokensPerDoc}`;
}
```

---

### Template: `design-system.md` (PRO & PRO MAX only)

```typescript
// src/lib/ai/prompts/design-system.ts

export function buildDesignSystemPrompt(
  config: GenerateConfig,
  tier: UserTier,
  contextSummary: string
): string {
  // Dokumen ini hanya untuk PRO dan PRO_MAX

  const depthInstructions = {
    PRO: `
Buat design system document dengan:
- Color palette (primary, secondary, neutral, semantic)
  Sertakan hex values yang konsisten dengan ${config.designStyle} style
- Typography: font family, size scale, weight guide
- Spacing system (base unit)
- Component patterns: Button, Card, Input, Badge, Navigation
  Format sebagai CSS custom properties yang siap dipakai
- Responsive breakpoints`,

    PRO_MAX: `
Buat design system document yang sangat lengkap:
- Color system dengan dark/light mode tokens
  Semua sebagai CSS custom properties (--color-primary, dll)
- Typography scale lengkap dengan line-height dan letter-spacing
- Spacing & layout system (grid, container, breakpoints)
- Component library dengan spesifikasi lengkap:
  Button (semua variants + states), Card (semua variants),
  Input/Form (dengan validation states), Badge/Tag, Navigation,
  Modal/Dialog, Toast/Alert, Loading states
- Animation & transition tokens
- Icon system recommendation
- Accessibility requirements (contrast ratio, focus states)
- Implementation-ready: semua token dalam format CSS variables
  yang langsung bisa dipakai di ${config.framework}
- Tailwind config extension jika menggunakan Tailwind CSS
Dokumen ini harus bisa digunakan AI agent sebagai referensi
saat membuat komponen baru tanpa bertanya-tanya soal warna/font.`,
  };

  const instruction = tier === 'PRO_MAX'
    ? depthInstructions.PRO_MAX
    : depthInstructions.PRO;

  return `You are a senior UI engineer and design systems expert.

Generate a design-system.md file.

${contextSummary}

${instruction}

=== PROJECT INPUT ===
Design Style: ${config.designStyle}
Framework: ${config.framework}
Product Type: ${config.productType}

=== OUTPUT RULES ===
- Output ONLY the markdown content
- Start with: # Design System — [Project Name]
- All colors must be hex values, not color names
- CSS custom properties must follow --color-[name] convention
- Max tokens: ${TIER_CONFIG[tier].maxTokensPerDoc}`;
}
```

---

### Template: `agents.md` (PRO & PRO MAX only)

```typescript
// src/lib/ai/prompts/agents.ts

export function buildAgentsPrompt(
  config: GenerateConfig,
  tier: UserTier,
  contextSummary: string
): string {
  const aiToolInstructions: Record<string, string> = {
    'cursor': `Format output agar optimal untuk file .cursorrules di Cursor IDE.
Gunakan format rules yang Cursor kenali (system prompt style).`,
    'claude-code': `Format output agar optimal untuk file CLAUDE.md.
Ikuti struktur yang Claude Code gunakan: project overview, then specific instructions.`,
    'windsurf': `Format output agar optimal untuk .windsurfrules di Windsurf IDE.`,
    'default': `Format sebagai universal system prompt yang bisa dipakai di tools apapun.`,
  };

  const toolInstruction = aiToolInstructions[config.aiToolTarget] ||
    aiToolInstructions.default;

  const depthInstructions = {
    PRO: `
Buat agents.md dengan:
- AI Agent Role Definition: persona dan tanggung jawab agent
- Project-specific coding rules (naming convention, file structure)
- Tech stack rules: hal yang HARUS dan TIDAK BOLEH dilakukan
  spesifik untuk ${config.framework}
- Response format preferences
${toolInstruction}`,

    PRO_MAX: `
Buat agents.md yang sangat detail dan production-grade:
- Agent Persona: role, expertise level, communication style
- Architectural Rules: pattern yang dipakai, anti-patterns yang dihindari
- Code Quality Standards: formatting, naming, documentation
- Framework-Specific Rules untuk ${config.framework}:
  - File structure conventions
  - State management approach
  - Error handling patterns
  - Performance optimization rules
  - Security rules (SQL injection, XSS, CSRF prevention)
- Git & Version Control conventions
- Testing requirements per layer
- Review checklist yang agent jalankan sebelum submit code
- Escalation rules: kapan agent harus bertanya sebelum lanjut
${toolInstruction}
Dokumen ini harus bisa di-paste langsung sebagai system prompt
dan membuat AI agent langsung memahami konteks penuh project.`,
  };

  const instruction = tier === 'PRO_MAX'
    ? depthInstructions.PRO_MAX
    : depthInstructions.PRO;

  return `You are a principal engineer specializing in AI-assisted development.

Generate an agents.md file — this is the AI coding agent's "instruction manual" for this project.

${contextSummary}

${instruction}

=== PROJECT INPUT ===
Product Type: ${config.productType}
Framework: ${config.framework}
Design Style: ${config.designStyle}
AI Tool Target: ${config.aiToolTarget}
Core Features: ${config.coreFeatures}

=== OUTPUT RULES ===
- Output ONLY the markdown content  
- Start with: # AI Agent Instructions — [Project Name]
- Be extremely specific — avoid generic advice
- Every rule must be actionable
- Max tokens: ${TIER_CONFIG[tier].maxTokensPerDoc}`;
}
```

---

### Template: `production-hardening.md` (PRO MAX only)

```typescript
// src/lib/ai/prompts/hardening.ts

export function buildHardeningPrompt(
  config: GenerateConfig,
  contextSummary: string
): string {
  return `You are a DevSecOps engineer and security architect.

Generate a production-hardening.md file for this project.

${contextSummary}

Create a comprehensive production hardening guide covering:

**Security:**
- Authentication & authorization implementation (specific to ${config.framework})
- Input validation & sanitization rules
- Rate limiting strategy
- CORS configuration
- Environment variables management
- Secrets handling (never commit, use vault)
- OWASP Top 10 checklist for this specific tech stack

**Monitoring & Observability:**
- Error tracking setup (Sentry or equivalent)
- Performance monitoring (Core Web Vitals if web)
- Logging strategy (what to log, what NOT to log)
- Uptime monitoring
- Alerting thresholds

**CI/CD Pipeline:**
- Pipeline stages: lint → test → build → deploy
- Branch strategy recommendation
- Pre-commit hooks
- Automated security scanning
- Rollback strategy

**Infrastructure:**
- Deployment platform recommendation for this stack
- Environment separation (dev/staging/prod)
- Database backup strategy
- CDN configuration (if applicable)

=== PROJECT INPUT ===
Framework: ${config.framework}
Product Type: ${config.productType}

=== OUTPUT RULES ===
- Output ONLY the markdown content
- Start with: # Production Hardening Guide — [Project Name]
- Include actual commands and configuration examples
- Max tokens: 8000`;
}
```

---

## Bagian 5 — Database Schema (Prisma)

```prisma
// prisma/schema.prisma — perubahan untuk v3.0

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  tier          UserTier  @default(FREE)
  tierExpiresAt DateTime?           // null = free permanent
  stripeId      String?             // atau midtrans customer id
  createdAt     DateTime  @default(now())
  projects      Project[]
  subscriptions Subscription[]
}

enum UserTier {
  FREE
  PRO
  PRO_MAX
}

model Project {
  id            String          @id @default(cuid())
  userId        String
  user          User            @relation(fields: [userId], references: [id])
  name          String          // auto-generated dari product type + timestamp
  productType   String
  framework     String?
  designStyle   String?
  aiToolTarget  String?
  selectedDocs  String[]        // array of DocType
  modelUsed     String          // model yang actual digunakan
  tierAtGenerate UserTier       // tier user saat generate (audit)
  status        ProjectStatus   @default(GENERATING)
  generatedFiles GeneratedFile[]
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}

enum ProjectStatus {
  GENERATING
  DONE
  FAILED
  PARTIAL  // sebagian dokumen berhasil, sebagian gagal
}

model GeneratedFile {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id])
  docType   String   // 'context' | 'prd' | 'plan' | dst
  content   String   @db.Text
  modelUsed String   // model yang dipakai untuk file ini (bisa berbeda karena fallback)
  tokenCount Int?    // estimasi token yang digunakan
  createdAt DateTime @default(now())
}

model Subscription {
  id                String    @id @default(cuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id])
  plan              String    // 'PRO_MONTHLY' | 'PRO_YEARLY' | dst
  tier              UserTier
  status            SubStatus @default(ACTIVE)
  currentPeriodStart DateTime
  currentPeriodEnd  DateTime
  midtransOrderId   String?
  midtransToken     String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

enum SubStatus {
  ACTIVE
  EXPIRED
  CANCELLED
  PAST_DUE
}
```

---

## Bagian 6 — Urutan Eksekusi untuk Agent

```
FASE A — Refactor Core Modules (lakukan dulu sebelum yang lain)
────────────────────────────────────────────────────────────────
1. Buat tier-enforcer.ts dengan TIER_CONFIG dan enforceTier()
2. Buat context-manager.ts dengan ContextManager class
3. Buat retry-handler.ts dengan FALLBACK_CHAIN dan withRetryAndFallback()
4. Buat db-writer.ts dengan queue system non-blocking
5. Buat stream-writer.ts sebagai abstraksi SSE
6. Refactor orchestrator.ts menjadi slim (gunakan modul baru)
7. Update route.ts untuk gunakan checkMonthlyQuota dan enforceTier

FASE B — Prompt Templates
────────────────────────────────────────────────────────────────
8.  context.ts — FREE/PRO/PRO_MAX variants
9.  prd.ts — FREE/PRO/PRO_MAX variants
10. plan.ts — FREE/PRO/PRO_MAX variants
11. design-system.ts — PRO/PRO_MAX only
12. agents.ts — PRO/PRO_MAX only (dengan tool-specific format)
13. hardening.ts — PRO_MAX only
14. scale.ts — PRO_MAX only
15. growth.ts — PRO_MAX only
16. Update shared.ts: buildPrompt() dispatcher per docType + tier

FASE C — Database & Monetisasi
────────────────────────────────────────────────────────────────
17. Update prisma/schema.prisma (tambah Subscription model, tierAtGenerate)
18. Run prisma migrate
19. Buat src/lib/payment/midtrans.ts dengan PLANS config
20. Buat API endpoint POST /api/payment/create-transaction
21. Buat API endpoint POST /api/payment/webhook (handle Midtrans notification)
22. Buat webhook handler: update user.tier dan buat Subscription record
23. Buat API endpoint GET /api/user/subscription (status langganan)

FASE D — UI Integration
────────────────────────────────────────────────────────────────
24. Update /generate step 4: tampilkan dokumen locked sesuai tier
25. Update /dashboard: tampilkan tier badge dan usage counter
26. Buat /pricing page dengan tabel tiga paket
27. Buat upgrade flow: klik upgrade → pilih plan → Midtrans payment → redirect
28. Tambah tier badge di navbar setelah login

FASE E — Testing & Hardening
────────────────────────────────────────────────────────────────
29. Mock layer di generator.ts untuk testing tanpa hit API eksternal
30. Integration test: full generate flow per tier
31. Test quota enforcement: pastikan free user tidak bisa generate ke-6
32. Test tier enforcement: pastikan free user tidak dapat claude-sonnet-4
33. Load test SSE streaming dengan concurrent requests
```

---

## Catatan Biaya Operasional (Estimasi)

Untuk membantu keputusan pricing, ini estimasi biaya per generate:

| Tier | Model | Dok | Est. Token Total | Est. Biaya/Generate |
|---|---|---|---|---|
| FREE | Gemini Flash | 3 | ~6.000 | ~$0.001 (Rp 16) |
| PRO | Gemini 2.5 Pro | 5 | ~20.000 | ~$0.05 (Rp 780) |
| PRO MAX | Claude Sonnet 4 | 8 | ~64.000 | ~$0.25 (Rp 3.900) |

**Break-even analysis:**
- PRO: Rp 49.000/bulan ÷ Rp 780/generate = ~63 generate untuk break even
  User PRO hanya dibatasi 30 generate → margin ~60%
- PRO MAX: Rp 99.000/bulan ÷ Rp 3.900/generate = ~25 generate untuk break even
  User PRO MAX unlimited, tapi rata-rata user aktif generate ~20-40x/bulan
  Pastikan ada soft throttle jika ada user yang generate 100+ kali sebulan.

**Rekomendasi:** Tambahkan soft rate limit di PRO MAX: maksimal 10 generate/hari
(bukan kuota bulanan, tapi daily throttle) untuk mencegah abuse.

---

*Dokumen ini siap dieksekusi oleh AI agent secara modular per fase.*
*Jangan eksekusi semua sekaligus — ikuti urutan Fase A → B → C → D → E.*
```
