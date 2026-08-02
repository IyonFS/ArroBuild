/**
 * Prompt dispatcher for ArroBuild v2 documents.
 *
 * Kept in a dedicated module (rather than `shared.ts`) so that the document
 * builders can import shared helpers/types without creating a circular import
 * back through the dispatcher.
 */

import type { DocumentFileKey, PromptDepthTier } from "@/lib/config/documents";
import type { GenerationInput } from "./shared";
import { buildPrdPrompt } from "./prd";
import { buildArchitecturePrompt } from "./architecture";
import { buildPlanTaskPrompt } from "./plan-task";
import { buildDesignSystemPrompt } from "./design-system";
import { buildAgentRulesPrompt } from "./agent-rules";
import { buildAdaptiveDocumentPrompt } from "./adaptive-document";
import {
  buildCostInfrastructurePrompt,
  buildAnalyticsMetricsPrompt,
  buildTestingQaPrompt,
  buildOnboardingEmailPrompt,
  buildCompetitiveAnalysisPrompt,
  buildSecurityLaunchPrompt,
  buildDatabaseDeepDivePrompt,
  buildComplianceLegalPrompt,
} from "./optional-modules";

export function buildPromptForTier(
  fileKey: DocumentFileKey,
  input: GenerationInput,
  tier: PromptDepthTier,
  accumulatedContext: string
): string {
  const depth: PromptDepthTier = tier;

  switch (fileKey) {
    case "prd":
      return buildPrdPrompt(input, depth, accumulatedContext);
    case "architecture":
      return buildArchitecturePrompt(input, depth, accumulatedContext);
    case "plan-task":
      return buildPlanTaskPrompt(input, depth, accumulatedContext);
    case "design-system":
      return buildDesignSystemPrompt(input, depth as "CORE" | "PRIME", accumulatedContext);
    case "agent-rules":
      return buildAgentRulesPrompt(input, depth as "CORE" | "PRIME", accumulatedContext);
    case "adaptive-document":
      return buildAdaptiveDocumentPrompt(input, depth, accumulatedContext);
    case "cost-infrastructure":
      return buildCostInfrastructurePrompt(input, depth, accumulatedContext);
    case "analytics-metrics":
      return buildAnalyticsMetricsPrompt(input, depth, accumulatedContext);
    case "testing-qa":
      return buildTestingQaPrompt(input, depth, accumulatedContext);
    case "onboarding-email":
      return buildOnboardingEmailPrompt(input, depth, accumulatedContext);
    case "competitive-analysis":
      return buildCompetitiveAnalysisPrompt(input, depth, accumulatedContext);
    case "security-launch":
      return buildSecurityLaunchPrompt(input, depth, accumulatedContext);
    case "database-deep-dive":
      return buildDatabaseDeepDivePrompt(input, depth, accumulatedContext);
    case "compliance-legal":
      return buildComplianceLegalPrompt(input, depth, accumulatedContext);
    default:
      throw new Error(`Unknown fileKey: ${fileKey}`);
  }
}
