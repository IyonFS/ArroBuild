import { buildBaseContext, summarizeForContext, GenerationInput } from "./shared";

export function buildScalePerformancePrompt(
  input: GenerationInput,
  contextMd: string,
  prdMd: string,
  planMd: string
): string {
  const base = buildBaseContext(input);
  const contextSummary = summarizeForContext(contextMd, 300);
  const prdSummary = summarizeForContext(prdMd, 200);
  const planSummary = summarizeForContext(planMd, 300);

  return `You are a senior performance engineer and scalability architect.

Generate a **scale-performance.md** — a scaling strategy and performance optimization guide.

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

1. **Current Architecture Assessment**
   - Bottleneck identification
   - Single points of failure
   - Resource utilization estimates

2. **Scaling Strategy by User Count**
   | Milestone | Changes Required |
   - 0–100 users (current)
   - 100–1,000 users
   - 1,000–10,000 users
   - 10,000–100,000 users

3. **Frontend Performance**
   - Code splitting & lazy loading strategy
   - Image optimization (WebP, lazy load, CDN)
   - Bundle analysis & tree shaking
   - Service worker / caching strategy
   - SSR vs SSG vs ISR decisions

4. **Backend Performance**
   - Database query optimization
   - Connection pooling
   - Caching layers (Redis, in-memory)
   - Background job processing
   - API pagination & rate limiting

5. **Infrastructure Scaling**
   - Horizontal vs vertical scaling plan
   - CDN configuration
   - Database read replicas
   - Serverless vs server-based trade-offs
   - Edge computing opportunities

6. **AI/LLM Optimization** (if applicable)
   - Prompt caching
   - Model selection by task complexity
   - Queue management for generation requests
   - Token usage monitoring & budgeting
   - Fallback model strategy

7. **Cost Optimization**
   - Resource right-sizing
   - Reserved vs on-demand pricing
   - Monthly cost projection table by user count

8. **Performance Monitoring**
   - Key metrics to track
   - Alerting thresholds
   - Dashboard setup (Vercel Analytics, custom)

Rules:
- Output only valid Markdown.
- Include specific configuration values and code snippets.
- Provide cost estimates in USD where applicable.
- Be practical — focus on what a solo developer can implement.`;
}
