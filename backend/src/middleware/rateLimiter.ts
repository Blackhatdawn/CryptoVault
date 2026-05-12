import { Request, Response } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Simple in-process rate limiter — no external package needed.
 * @param maxRequests   Max allowed requests per window
 * @param windowMs      Window duration in milliseconds
 */
export function createRateLimiter(maxRequests: number, windowMs: number) {
  // Prune stale entries every 5 minutes to prevent memory growth
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key);
    }
  }, 5 * 60_000);

  return (req: Request, res: Response, next: Function) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count += 1;

    if (entry.count > maxRequests) {
      const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        error: 'Too many requests. Please wait before trying again.',
        retryAfter: retryAfterSec,
      });
    }

    next();
  };
}

/** Strict limiter for auth endpoints: 10 attempts per 15 minutes */
export const authLimiter = createRateLimiter(10, 15 * 60_000);

/** General API limiter: 120 requests per minute */
export const apiLimiter = createRateLimiter(120, 60_000);
