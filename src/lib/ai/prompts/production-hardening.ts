import { buildBaseContext, summarizeForContext, GenerationInput } from "./shared";

export function buildProductionHardeningPrompt(
  input: GenerationInput,
  contextMd: string,
  prdMd: string,
  planMd: string
): string {
  const base = buildBaseContext(input);
  const contextSummary = summarizeForContext(contextMd, 300);
  const prdSummary = summarizeForContext(prdMd, 200);
  const planSummary = summarizeForContext(planMd, 300);

  return `You are a senior DevOps/SRE engineer preparing a product for production deployment.

Generate a **production-hardening.md** — a comprehensive guide to make this product production-ready.

${base}

<previous_docs>
${contextSummary}
---
${prdSummary}
---
${planSummary}
</previous_docs>

---

Generate with these sections:

1. **Pre-Launch Security Checklist**
   - Input validation (all endpoints)
   - Authentication & authorization hardening
   - CORS, CSP, rate limiting configuration
   - Environment variable security
   - SQL injection / XSS prevention
   - API key rotation strategy

2. **Error Handling & Monitoring**
   - Global error boundary (frontend)
   - API error response standardization
   - Sentry / error tracking setup
   - Logging strategy (structured logs)
   - Health check endpoints

3. **Database Hardening**
   - Connection pooling configuration
   - Backup strategy (automated daily)
   - Migration safety checklist
   - Index optimization for common queries
   - Row-level security (if using Supabase)

4. **Performance Baseline**
   - Lighthouse audit targets (>90 all categories)
   - Core Web Vitals targets
   - API response time targets (<200ms p95)
   - Bundle size budget
   - Image optimization

5. **CI/CD Pipeline**
   - Build & deploy workflow
   - Preview deployments for PRs
   - Environment promotion (staging → production)
   - Automated testing in pipeline
   - Rollback strategy

6. **Incident Response**
   - On-call procedures
   - Severity classification
   - Communication templates
   - Post-mortem template

Rules:
- Output only valid Markdown.
- Provide specific commands and configuration snippets.
- Include checkboxes for actionable items.
- Prioritize by impact — most critical first.`;
}
