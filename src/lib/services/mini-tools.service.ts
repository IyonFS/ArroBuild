import { prisma } from "@/lib/db/prisma";
import { TIER, type TierId } from "@/lib/config/tiers";
import {
  MINI_TOOLS,
  type MiniToolId,
  isToolAllowedForTier,
} from "@/lib/config/mini-tools";
import {
  assertTierCapability,
  TierCapabilityError,
  getUserTierId,
} from "@/lib/services/tier-capabilities";
import { CreditService, CreditServiceError } from "@/lib/services/credit.service";

const PRO_DEFAULT_TOOLS: MiniToolId[] = [
  "prompt-doctor",
  "mvp-scope-cutter",
  "stitch-composer",
];

export async function assertMiniToolAccess(
  userId: string,
  toolId: MiniToolId
): Promise<{ tierId: TierId; credits: number }> {
  const tool = MINI_TOOLS[toolId];
  if (!tool) {
    throw new TierCapabilityError("UNKNOWN_TOOL", "Mini tool tidak ditemukan.", 404);
  }

  const { config } = await assertTierCapability(userId, "mini_tools");
  const tierId = await getUserTierId(userId);
  if (!tierId) {
    throw new TierCapabilityError(
      "NO_SUBSCRIPTION",
      "Paket berlangganan belum aktif.",
      402
    );
  }

  if (!isToolAllowedForTier(toolId, tierId)) {
    const needed =
      tool.minTier === TIER.PRO_MAX
        ? "Prime"
        : tool.minTier === TIER.PRO
          ? "Core"
          : "Base";
    throw new TierCapabilityError(
      "TOOL_TIER_LOCKED",
      `${tool.name} membutuhkan paket ${needed} atau lebih tinggi.`,
      403
    );
  }

  if (config.miniToolsIncluded !== "all" && tierId === TIER.PRO) {
    if (!PRO_DEFAULT_TOOLS.includes(toolId)) {
      throw new TierCapabilityError(
        "TOOL_NOT_IN_PRO_BUNDLE",
        `${tool.name} hanya tersedia di Prime. Upgrade untuk akses semua mini tools.`,
        403
      );
    }
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  if (tierId === TIER.STARTER) {
    const used = await prisma.creditLedger.count({
      where: {
        userId,
        type: "TOOL_USAGE",
        createdAt: { gte: startOfMonth },
      },
    });
    const limit = config.miniToolTrialLimit ?? 3;
    if (used >= limit) {
      throw new TierCapabilityError(
        "MINI_TOOL_LIMIT",
        `Kuota trial mini tool bulan ini habis (${used}/${limit}). Upgrade ke Pro untuk akses penuh.`,
        429
      );
    }
  }

  return { tierId, credits: tool.credits };
}

export async function runMiniToolCharge(
  userId: string,
  toolId: MiniToolId
): Promise<{ balanceAfter: number }> {
  const tool = MINI_TOOLS[toolId];
  try {
    return await CreditService.chargeToolCredits(userId, tool.credits, toolId);
  } catch (err) {
    if (err instanceof CreditServiceError) {
      throw new TierCapabilityError(err.code, err.message, err.statusCode);
    }
    throw err;
  }
}
