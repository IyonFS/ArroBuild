# AI Prompt Modules (v2)

Dispatcher aktif: `shared.ts` → `buildPromptForTier()`.

| File | Dokumen |
|------|---------|
| `prd.ts` | PRD |
| `architecture.ts` | Architecture |
| `plan-task.ts` | Plan / Task |
| `design-system.ts` | Design System |
| `agent-rules.ts` | Agent Rules (re-export `agents-prompt.ts`) |
| `adaptive-document.ts` | Adaptive Document (Pro Max) |
| `optional-modules.ts` | Modul opsional (cost, analytics, QA, dll.) |
| `yaml-metadata.ts` | FEAT-ID registry helper |

File lama (`plan.md`, `tasks.md`, `mvp-roadmap`, dll.) sudah dihapus — diganti key v2 di `lib/config/documents.ts`.
