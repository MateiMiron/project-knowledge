const DAILY_LIMIT = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const entry = store.get(identifier);

  // Clean expired entry
  if (entry && entry.resetAt < now) {
    store.delete(identifier);
  }

  const current = store.get(identifier);

  if (!current) {
    const resetAt = now + DAY_MS;
    store.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: DAILY_LIMIT - 1, resetAt };
  }

  if (current.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count++;
  return {
    allowed: true,
    remaining: DAILY_LIMIT - current.count,
    resetAt: current.resetAt,
  };
}

export function getRemainingQueries(identifier: string): number {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || entry.resetAt < now) {
    return DAILY_LIMIT;
  }

  return Math.max(0, DAILY_LIMIT - entry.count);
}
