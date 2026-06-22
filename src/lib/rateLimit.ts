// Lightweight client-side rate limiter backed by localStorage.
// NOTE: This is a UX-level throttle — it deters casual abuse but cannot replace
// server-side rate limiting. The backend does not have a standard rate-limit
// primitive yet, so this is the pragmatic guard we ship today.

interface Attempt {
  count: number;
  windowStart: number;
  blockedUntil?: number;
}

export interface RateLimitResult {
  ok: boolean;
  retryAfterMs: number;
  reason?: string;
}

interface RateLimitOptions {
  key: string;
  max: number;
  windowMs: number;
  blockMs?: number;
}

const STORAGE_PREFIX = "rl:";

const read = (key: string): Attempt | null => {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? (JSON.parse(raw) as Attempt) : null;
  } catch {
    return null;
  }
};

const write = (key: string, value: Attempt): void => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
};

export const checkRateLimit = ({ key, max, windowMs, blockMs = windowMs }: RateLimitOptions): RateLimitResult => {
  const now = Date.now();
  const state = read(key);

  if (state?.blockedUntil && state.blockedUntil > now) {
    return { ok: false, retryAfterMs: state.blockedUntil - now, reason: "blocked" };
  }

  if (!state || now - state.windowStart > windowMs) {
    write(key, { count: 1, windowStart: now });
    return { ok: true, retryAfterMs: 0 };
  }

  if (state.count >= max) {
    const blockedUntil = now + blockMs;
    write(key, { ...state, blockedUntil });
    return { ok: false, retryAfterMs: blockMs, reason: "limit" };
  }

  write(key, { ...state, count: state.count + 1 });
  return { ok: true, retryAfterMs: 0 };
};

export const formatRetry = (ms: number): string => {
  const s = Math.ceil(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.ceil(s / 60);
  return `${m} min`;
};
