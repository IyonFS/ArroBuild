import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getTierConfig, type TierId } from "@/lib/config/tiers";
import { logger } from "@/lib/logger";

function createRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = createRedis();

function isRateLimitRequired(): boolean {
  return (
    process.env.RATE_LIMIT_REQUIRED === "true" ||
    process.env.NODE_ENV === "production"
  );
}

function redisUnavailable(): boolean {
  if (redis) return false;
  if (isRateLimitRequired()) {
    logger.error("rate_limit_redis_missing", {
      message: "Upstash Redis tidak dikonfigurasi — rate limit tidak aktif",
    });
    return true;
  }
  return false;
}

export const ipLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      prefix: "arrobuild:ip",
    })
  : null;

const generateLimiters = new Map<TierId, Ratelimit>();

export function generateLimiter(tierId: TierId): Ratelimit | null {
  if (!redis) return null;

  const existing = generateLimiters.get(tierId);
  if (existing) return existing;

  const config = getTierConfig(tierId);
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.maxProjectsPerDay, "1 d"),
    prefix: `arrobuild:generate:${tierId}`,
  });
  generateLimiters.set(tierId, limiter);
  return limiter;
}

export async function checkIpRateLimit(ip: string): Promise<boolean> {
  if (redisUnavailable()) {
    return !isRateLimitRequired();
  }
  if (!ipLimiter) return true;
  const { success } = await ipLimiter.limit(ip);
  return success;
}

export async function checkGenerateRateLimit(
  userId: string,
  tierId: TierId
): Promise<{ ok: boolean; limit?: number }> {
  if (redisUnavailable()) {
    return { ok: !isRateLimitRequired(), limit: getTierConfig(tierId).maxProjectsPerDay };
  }
  const limiter = generateLimiter(tierId);
  if (!limiter) return { ok: true };
  const { success } = await limiter.limit(userId);
  return {
    ok: success,
    limit: getTierConfig(tierId).maxProjectsPerDay,
  };
}
