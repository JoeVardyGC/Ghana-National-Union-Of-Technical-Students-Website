/**
 * The public address of the site, used for the sitemap, robots.txt and
 * share previews. Set NEXT_PUBLIC_APP_URL on the host to override it
 * (for example while testing on a *.vercel.app address).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://gnuts.org').replace(/\/+$/, '');

/** "/about" -> "https://gnuts.org/about" */
export function absoluteUrl(path = '/'): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
