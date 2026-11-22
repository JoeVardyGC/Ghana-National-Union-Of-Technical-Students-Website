import { after } from 'next/server';
import { SITE_URL } from './siteUrl';

/**
 * IndexNow: tells Bing (and Yahoo, DuckDuckGo, Ecosia, Yandex and other engines that
 * share IndexNow) the moment public content changes, so new posts appear in hours
 * instead of waiting for the next crawl. Google does not use IndexNow; it relies on
 * the sitemap instead.
 *
 * The key is public by design: search engines confirm ownership by fetching
 * /<key>.txt from this site (public/080a692f4fe05bb9a90a73f020467ff6.txt).
 */
const INDEXNOW_KEY = '080a692f4fe05bb9a90a73f020467ff6';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

/** Public pages that show each table's content (the home page shows most of them). */
const PAGES_FOR_TABLE: Record<string, string[]> = {
  news: ['/', '/blog'],
  scholarships: ['/', '/scholarships'],
  opportunities: ['/', '/scholarships'],
  innovations: ['/', '/innovations'],
  resources: ['/resources', '/about'],
  executives: ['/about'],
  gallery: ['/gallery'],
  about_page: ['/about'],
  history_milestones: ['/about'],
  hero_banners: ['/'],
  site_settings: ['/', '/contact'],
};

/** Tables whose rows have their own page, e.g. /blog/12 or /innovations/4. */
const DETAIL_PATH: Record<string, string> = { news: '/blog', innovations: '/innovations' };

// Visitor actions that only bump a counter are not content changes
const COUNTER_ONLY = /\bSET\s+(upvotes|view_count|views|downloads)\s*=/i;

// One notification per table per minute is plenty, even during a burst of admin edits
const lastPing = new Map<string, number>();
const MIN_GAP_MS = 60_000;

function isLiveSite(): boolean {
  return (
    process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PHASE !== 'phase-production-build' &&
    SITE_URL.startsWith('https://') &&
    !/localhost|127\.0\.0\.1/.test(SITE_URL)
  );
}

async function send(urls: string[]): Promise<void> {
  const host = new URL(SITE_URL).host;
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok && res.status !== 202) {
    console.warn(`[IndexNow] ${res.status} ${await res.text().catch(() => '')}`.trim());
  }
}

/**
 * Called after a database write. Works out which public pages changed and notifies
 * IndexNow once the response has been sent, so admin saves are never slowed down.
 * `latestIds` loads the newest row ids so a brand-new post's own page is included.
 */
export function notifyIndexNow(sql: string, latestIds?: (table: string) => Promise<number[]>): void {
  const match = sql.match(/^\s*(?:INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+[`"]?(\w+)/i);
  if (!match || !isLiveSite()) return;
  const table = match[1].toLowerCase();
  const pages = PAGES_FOR_TABLE[table];
  if (!pages || COUNTER_ONLY.test(sql)) return;

  const now = Date.now();
  if (now - (lastPing.get(table) || 0) < MIN_GAP_MS) return;
  lastPing.set(table, now);

  const work = async () => {
    try {
      const paths = new Set(pages);
      const detail = DETAIL_PATH[table];
      if (detail && latestIds) {
        for (const id of await latestIds(table).catch(() => [])) paths.add(`${detail}/${id}`);
      }
      await send([...paths].map((p) => `${SITE_URL}${p === '/' ? '/' : p}`));
    } catch (error) {
      console.warn('[IndexNow] notification failed:', (error as Error)?.message || error);
    }
  };

  try {
    // Runs after the admin's request finishes (keeps serverless functions alive for it)
    after(work);
  } catch {
    // Outside a request (e.g. a script): just send it
    void work();
  }
}
