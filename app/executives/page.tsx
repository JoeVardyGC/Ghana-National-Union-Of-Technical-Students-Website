import { permanentRedirect } from 'next/navigation';

/**
 * /executives has no page of its own: it sends visitors (and search engines)
 * to the "National Leadership" section of the About page, so the leaders are
 * shown and updated in one place. Old links to /executives keep working.
 * The real 308 redirect happens in proxy.ts; this is only a fallback.
 */
export default function ExecutivesPage() {
  permanentRedirect('/about#leadership');
}
