/**
 * production-hardening.ts — Tier-aware production-hardening.md prompt builder (v3)
 *
 * PRO_MAX only: Security, Monitoring, DB Hardening, CI/CD, Incident Response.
 */

import { buildBaseContext, type GenerationInput } from "./shared";
import type { V3Tier } from "../tier-enforcer";

export function buildProductionHardeningPrompt(
  input: GenerationInput,
  tier: V3Tier = "PRO_MAX", // eslint-disable-line @typescript-eslint/no-unused-vars
  accumulatedContext = ""
): string {
  const base = buildBaseContext(input);
  const contextBlock = accumulatedContext
    ? `\n<accumulated_context>\n${accumulatedContext}\n</accumulated_context>\n`
    : "";

  return `You are a senior DevOps/SRE engineer and security architect preparing a product for production deployment.

Generate a **production-hardening.md** — a comprehensive guide to make this product production-ready.

${base}
${contextBlock}
---

Create a comprehensive production hardening guide covering:

**1. Pre-Launch Security Checklist**
- Input validation (all endpoints)
- Authentication & authorization hardening (specific to ${input.presets.framework})
- CORS, CSP, rate limiting configuration
- Environment variable management
- Secrets handling (never commit, use vault)
- OWASP Top 10 checklist for this specific tech stack

**2. Error Handling & Monitoring**
- Global error boundary (frontend)
- API error response standardization
- Sentry / error tracking setup
- Logging strategy (what to log, what NOT to log, structured logs)
- Health check endpoints
- Alerting thresholds

**3. Database Hardening**
- Connection pooling configuration
- Backup strategy (automated daily)
- Migration safety checklist
- Index optimization for common queries
- Row-level security (if applicable)

**4. CI/CD Pipeline & Infrastructure**
- Pipeline stages: lint → test → build → deploy
- Branch strategy recommendation
- Automated security scanning in pipeline
- Rollback strategy
- Deployment platform recommendation for this stack
- Environment separation (dev/staging/prod)

**5. Incident Response**
- On-call procedures
- Severity classification
- Post-mortem template

=== OUTPUT RULES ===
- Output ONLY raw markdown. No code block wrapping.
- Start directly with: # Production Hardening Guide — [product name]
- Include actual commands and configuration snippets where relevant.
- Include checkboxes for actionable items.
- Prioritize by impact — most critical first.`;
}
