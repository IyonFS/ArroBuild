/**
 * scale-performance.ts — Tier-aware scale-performance.md prompt builder (v3)
 *
 * PRO_MAX only: Scale Strategy, Frontend/Backend Performance, DB Scaling, Caching.
 */

import { buildBaseContext, type GenerationInput } from "./shared";
import type { V3Tier } from "../tier-enforcer";

export function buildScalePerformancePrompt(
  input: GenerationInput,
  tier: V3Tier = "PRO_MAX", // eslint-disable-line @typescript-eslint/no-unused-vars
  accumulatedContext = ""
): string {
  const base = buildBaseContext(input);
  const contextBlock = accumulatedContext
    ? `\n<accumulated_context>\n${accumulatedContext}\n</accumulated_context>\n`
    : "";

  return `You are a senior performance engineer and scalability architect.

Generate a **scale-performance.md** — a scaling strategy and performance optimization guide.

${base}
${contextBlock}
---

Create a comprehensive scaling and performance guide covering:

**1. Current Architecture Assessment**
- Bottleneck identification (probable limits of MVP)
- Single points of failure
- Resource utilization estimates (CPU, Memory, DB Storage)

**2. Scaling Strategy by User Count**
Provide a concrete milestone table: | Milestone | Changes Required | Estimated Cost Increase |
- 0–1,000 users (current)
- 1,000–10,000 users
- 10,000–100,000 users
- 100,000+ users

**3. Frontend Performance**
- Code splitting & lazy loading strategy
- Image optimization (WebP, lazy load, CDN)
- Bundle analysis & tree shaking
- Service worker / caching strategy
- Rendering strategy (SSR vs SSG vs ISR vs CSR decisions)

**4. Backend Performance**
- Database query optimization (N+1 problems, indexing)
- Connection pooling
- Caching layers (Redis, in-memory)
- Background job processing (queues for heavy tasks)
- API pagination & rate limiting

**5. Infrastructure Scaling**
- Horizontal vs vertical scaling plan
- CDN configuration
- Database read replicas strategy
- Serverless vs server-based trade-offs for this specific app
- Edge computing opportunities

**6. AI/LLM Optimization (If applicable)**
- Prompt caching
- Token usage monitoring & budgeting
- Fallback model strategy

=== OUTPUT RULES ===
- Output ONLY raw markdown. No code block wrapping.
- Start directly with: # Scalability & Performance — [product name]
- Include specific configuration values and code snippets.
- Provide cost estimates in USD where applicable.
- Be practical — focus on what a solo developer/small team can implement.`;
}
