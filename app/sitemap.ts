import type { MetadataRoute } from 'next';
import { query } from '@/lib/db';
import { absoluteUrl } from '@/lib/siteUrl';
import { resolveInnovationImage } from '@/lib/imageUtils';

// Served at /sitemap.xml. Regenerated at most once an hour so new news posts,
// innovations and photos are picked up without a redeploy.
// Each page also lists its images (image sitemap), so Google Images can show
// GNUTS photos: executives, news covers, gallery, innovations and banners.
export const revalidate = 3600;

type Row = {
  id: number | string;
  updated_at?: string | Date | null;
  created_at?: string | Date | null;
  published_at?: string | Date | null;
  image?: string | null;
  image2?: string | null;
  image3?: string | null;
  project_image?: string | null;
  photo?: string | null;
  image_url?: string | null;
};

function lastModified(row: Row): Date | undefined {
  const value = row.updated_at || row.published_at || row.created_at;
  if (!value) return undefined;
  const date = new Date(value);
  return isNaN(date.getTime()) ? undefined : date;
}

/** Absolute image URL for the sitemap, or null (inline data: images can't be listed). */
function imageUrl(value?: string | null): string | null {
  const clean = (value || '').trim();
  if (!clean || clean.startsWith('data:')) return null;
  if (/^https?:\/\//i.test(clean)) return clean;
  return absoluteUrl(`/${clean.replace(/^\/+/, '')}`);
}

/** Unique, non-empty image URLs (Google allows up to 1,000 per page). */
function images(...values: (string | null | undefined)[]): string[] {
  return [...new Set(values.map(imageUrl).filter((u): u is string => !!u))].slice(0, 1000);
}

const LOGO = absoluteUrl('/images/gnuts_logo.png');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // If the database is unreachable, still serve the pages (without photos)
  const [news, innovations, executives, gallery, banners] = await Promise.all([
    query<Row>("SELECT id, published_at, created_at, updated_at, image, image2, image3 FROM news WHERE status = 'published'").catch(() => [] as Row[]),
    query<Row>("SELECT id, created_at, updated_at, project_image FROM innovations WHERE status = 'approved'").catch(() => [] as Row[]),
    query<Row>('SELECT id, photo FROM executives ORDER BY display_order ASC').catch(() => [] as Row[]),
    query<Row>('SELECT id, image FROM gallery').catch(() => [] as Row[]),
    query<Row>("SELECT id, image_url FROM hero_banners WHERE page_key = 'home_carousel'").catch(() => [] as Row[]),
  ]);

  const executivePhotos = executives.map((e) => e.photo);
  const newsCovers = news.map((n) => n.image);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      changeFrequency: 'daily',
      priority: 1,
      images: images(LOGO, ...banners.map((b) => b.image_url), ...executivePhotos, ...newsCovers),
    },
    { url: absoluteUrl('/about'), changeFrequency: 'monthly', priority: 0.8, images: images(LOGO, ...executivePhotos) },
    { url: absoluteUrl('/scholarships'), changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/opportunities'), changeFrequency: 'weekly', priority: 0.8 },
    {
      url: absoluteUrl('/innovations'),
      changeFrequency: 'weekly',
      priority: 0.8,
      images: images(...innovations.map((i) => resolveInnovationImage(i.project_image))),
    },
    { url: absoluteUrl('/blog'), changeFrequency: 'daily', priority: 0.8, images: images(...newsCovers) },
    // /executives is left out: it redirects to the About page's leadership section (listed above)
    { url: absoluteUrl('/gallery'), changeFrequency: 'monthly', priority: 0.5, images: images(...gallery.map((g) => g.image)) },
    { url: absoluteUrl('/resources'), changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/contact'), changeFrequency: 'yearly', priority: 0.5 },
  ];

  // Leave the gallery out until it has photos, so Google doesn't index an empty page
  const pages = gallery.length > 0 ? staticPages : staticPages.filter((p) => !p.url.endsWith('/gallery'));

  const newsPages: MetadataRoute.Sitemap = news.map((row) => ({
    url: absoluteUrl(`/blog/${row.id}`),
    lastModified: lastModified(row),
    changeFrequency: 'monthly',
    priority: 0.7,
    images: images(row.image, row.image2, row.image3),
  }));

  const innovationPages: MetadataRoute.Sitemap = innovations.map((row) => ({
    url: absoluteUrl(`/innovations/${row.id}`),
    lastModified: lastModified(row),
    changeFrequency: 'monthly',
    priority: 0.6,
    images: images(resolveInnovationImage(row.project_image)),
  }));

  // Drop empty image lists so the XML stays clean
  return [...pages, ...newsPages, ...innovationPages].map((page) =>
    page.images && page.images.length === 0 ? { ...page, images: undefined } : page
  );
}
