import { Metadata } from 'next';
import ExecutivesClient from './ExecutivesClient';
import { query } from '@/lib/db';
import { absoluteUrl, SITE_URL } from '@/lib/siteUrl';
import { resolveImgUrl } from '@/lib/imageUtils';

export const metadata: Metadata = {
  title: 'National Executive Officers | GNUTS Ghana',
  description: 'Meet the National Executive Committee leading the Ghana National Union of Technical Students.',
};

export const revalidate = 15;

export interface ExecutiveOfficer {
  id: number;
  name: string;
  position: string;
  institution: string;
  bio: string;
  image_url: string;
  email?: string;
  phone?: string;
  display_order?: number;
  tenure?: string;
}

export default async function ExecutivesPage() {
  let executives: ExecutiveOfficer[] = [];
  let heroImage = '/images/header_for_pages.jpg';
  let heroTitle = 'National Executive Officers';
  let heroSubtitle = 'Meet the visionary student leaders championing technical university education, TVET industrial advocacy, and student welfare across Ghana.';

  try {
    const [dbRows, bannerRows] = await Promise.all([
      query<any>('SELECT * FROM executives ORDER BY display_order ASC, id ASC'),
      query<any>("SELECT * FROM hero_banners WHERE page_key = 'executives_hero'").catch(() => []),
    ]);

    if (bannerRows && bannerRows.length > 0) {
      if (bannerRows[0].image_url) {
        heroImage = resolveImgUrl(bannerRows[0].image_url);
      }
      if (bannerRows[0].title && bannerRows[0].title !== 'National Executive Officers Hero Banner' && bannerRows[0].title !== 'National Executive Officers Page Header') {
        heroTitle = bannerRows[0].title;
      }
    }

    if (dbRows && Array.isArray(dbRows)) {
      executives = dbRows.map((item: any) => ({
        id: Number(item.id),
        name: String(item.full_name || item.name || 'Executive Officer'),
        position: String(item.position || 'National Executive'),
        institution: String(item.institution || 'GNUTS National Secretariat'),
        bio: String(item.bio || 'Serving the Ghanaian technical student community with dedication, integrity, and proactive leadership.'),
        image_url: resolveImgUrl(item.photo || item.image_url || '/images/gnuts_fav.png'),
        email: item.email ? String(item.email) : undefined,
        phone: item.phone ? String(item.phone) : undefined,
        display_order: Number(item.display_order || 1),
        tenure: String(item.tenure || '34th Administration (2025/2026)'),
      }));
    }
  } catch (e) {
    // Fallback data
  }

  // Structured data: each executive as a Person working for GNUTS, with their photo,
  // so searches like "GNUTS executives" or an officer's name can show these profiles
  const toAbsolute = (url: string) =>
    !url || url.startsWith('data:') ? undefined : /^https?:\/\//i.test(url) ? url : absoluteUrl(`/${url.replace(/^\/+/, '')}`);
  const executivesJsonLd = executives.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'GNUTS National Executive Officers',
        itemListElement: executives.map((officer, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Person',
            name: officer.name,
            jobTitle: `${officer.position}, GNUTS`,
            image: toAbsolute(officer.image_url),
            worksFor: { '@id': `${SITE_URL}/#organization`, '@type': 'Organization', name: 'Ghana National Union of Technical Students (GNUTS)' },
          },
        })),
      }
    : null;

  return (
    <>
      {executivesJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(executivesJsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      <ExecutivesClient
        initialExecutives={executives}
        heroImage={heroImage}
        heroTitle={heroTitle}
        heroSubtitle={heroSubtitle}
      />
    </>
  );
}
