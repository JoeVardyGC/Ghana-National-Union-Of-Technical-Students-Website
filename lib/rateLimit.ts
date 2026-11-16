// Fixed-window, in-memory rate limiter for public endpoints.
// State is per server instance: on serverless hosts each warm instance keeps its
// own counters, so this slows down abuse rather than enforcing a hard global cap.

type Entry = { count: number; first: number };

const buckets = new Map<string, Entry>();
const MAX_TRACKED_KEYS = 5000;

export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-nf-client-connection-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Counts one hit for `key` and reports whether it is still within the limit.
 * Returns false once more than `max` hits land inside `windowMs`.
 */
export function consumeRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now - entry.first > windowMs) {
    if (buckets.size >= MAX_TRACKED_KEYS) {
      for (const [k, v] of buckets) {
        if (now - v.first > windowMs) buckets.delete(k);
      }
      if (buckets.size >= MAX_TRACKED_KEYS) buckets.clear();
    }
    buckets.set(key, { count: 1, first: now });
    return true;
  }

  entry.count += 1;
  return entry.count <= max;
}
