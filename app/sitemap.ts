import type { MetadataRoute } from 'next';
import { query } from '@/lib/db';
import { absoluteUrl } from '@/lib/siteUrl';

// Served at /sitemap.xml. Regenerated at most once an hour so new news posts
// and approved innovations are picked up without a redeploy.
export const revalidate = 3600;

type Row = { id: number | string; updated_at?: string | Date | null; created_at?: string | Date | null; published_at?: string | Date | null };

function lastModified(row: Row): Date | undefined {
  const value = row.updated_at || row.published_at || row.created_at;
  if (!value) return undefined;
  const date = new Date(value);
  return isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/about'), changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/scholarships'), changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/opportunities'), changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/innovations'), changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/blog'), changeFrequency: 'daily', priority: 0.8 },
    { url: absoluteUrl('/executives'), changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/gallery'), changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/resources'), changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/contact'), changeFrequency: 'yearly', priority: 0.5 },
  ];

  // If the database is unreachable, still serve the static pages
  const [news, innovations] = await Promise.all([
    query<Row>("SELECT id, published_at, created_at, updated_at FROM news WHERE status = 'published'").catch(() => [] as Row[]),
    query<Row>("SELECT id, created_at, updated_at FROM innovations WHERE status = 'approved'").catch(() => [] as Row[]),
  ]);

  const newsPages: MetadataRoute.Sitemap = news.map((row) => ({
    url: absoluteUrl(`/blog/${row.id}`),
    lastModified: lastModified(row),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const innovationPages: MetadataRoute.Sitemap = innovations.map((row) => ({
    url: absoluteUrl(`/innovations/${row.id}`),
    lastModified: lastModified(row),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...newsPages, ...innovationPages];
}
