/**
 * Expiry of scholarships and opportunities.
 *
 * A listing stays on the public site up to and including its closing day, and is
 * hidden automatically from the day after (Ghana time, GMT). It is never deleted:
 * admins still see it, marked "Expired", and can change the date or remove it.
 * Listings with no date ("Ongoing", "Open", empty) never expire.
 *
 * Safe to import from both server and client components.
 */

/** Any stored deadline value -> "YYYY-MM-DD", or null when there is no real date. */
export function deadlineDay(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value.toISOString().slice(0, 10);
  }
  const text = String(value).trim();
  if (!text || text === '0000-00-00' || text.toLowerCase() === 'null') return null;
  const iso = text.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const parsed = new Date(text);
  return isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

/** Today's date in Ghana (GMT, no daylight saving) as "YYYY-MM-DD". */
export function todayInGhana(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** True once the closing day has passed (the day after the deadline onwards). */
export function isExpired(deadline: unknown, now: Date = new Date()): boolean {
  const day = deadlineDay(deadline);
  return day !== null && day < todayInGhana(now);
}

/** Keeps only listings whose closing day has not passed. */
export function withoutExpired<T>(rows: readonly T[] | null | undefined): T[] {
  return (rows || []).filter((row) => !isExpired((row as { deadline?: unknown } | null)?.deadline));
}
