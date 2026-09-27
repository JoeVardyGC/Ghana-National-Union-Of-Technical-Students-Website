import { Metadata } from 'next';
import OpportunitiesClient from './OpportunitiesClient';
import { query } from '@/lib/db';
import { resolveImgUrl } from '@/lib/imageUtils';

export const metadata: Metadata = {
  title: 'Student Opportunities & TVET Placements | GNUTS Ghana',
  description: 'Discover industrial attachments, TVET grants, skill competitions, and fellowships for technical university students in Ghana.',
};

export const revalidate = 15;

export interface OpportunityItem {
  id: number;
  title: string;
  partner: string;
  category: 'Industrial Attachment' | 'TVET Grant' | 'Skill Competition' | 'Fellowship' | string;
  description: string;
  eligibility: string;
  deadline: string;
  location: string;
  stipend_reward: string;
  application_url: string;
  status: 'open' | 'closing_soon' | 'closed' | string;
  created_at?: string;
}

export default async function OpportunitiesPage() {
  let opportunities: OpportunityItem[] = [];
  let heroImage = '/images/header_for_pages.jpg';
  let heroTitle = 'Student Opportunities & TVET Placements';
  let heroSubtitle = 'Empowering Ghanaian Technical University students with direct access to attachments, grants, and championships.';

  try {
    const [dbRows, bannerRows] = await Promise.all([
      query<any>('SELECT * FROM opportunities ORDER BY created_at DESC, id DESC'),
      query<any>("SELECT * FROM hero_banners WHERE page_key = 'opportunities_hero'").catch(() => []),
    ]);

    if (bannerRows && bannerRows.length > 0) {
      if (bannerRows[0].image_url) {
        heroImage = resolveImgUrl(bannerRows[0].image_url);
      }
      if (bannerRows[0].title && bannerRows[0].title !== 'Student Opportunities Hero Banner' && bannerRows[0].title !== 'Student Opportunities Page Header') {
        heroTitle = bannerRows[0].title;
      }
    }

    if (dbRows && Array.isArray(dbRows)) {
      opportunities = dbRows.map((item: any) => {
        let mappedCat = item.category;
        if (!mappedCat) {
          const t = String(item.type || '').toLowerCase();
          if (t === 'grant') mappedCat = 'TVET Grant';
          else if (t === 'skill_camp') mappedCat = 'Skill Competition';
          else if (t === 'fellowship') mappedCat = 'Fellowship';
          else mappedCat = 'Industrial Attachment';
        }

        return {
          id: Number(item.id),
          title: String(item.title || ''),
          partner: String(item.partner || 'GNUTS Industry Partner'),
          category: mappedCat,
          description: String(item.description || ''),
          eligibility: String(item.eligibility || 'Open to all technical and TVET students in Ghana'),
          deadline: item.deadline ? String(item.deadline).substring(0, 10) : 'Open',
          location: String(item.location || 'Ghana'),
          stipend_reward: String(item.stipend_reward || 'Allowance + Certificate of Training'),
          application_url: String(item.application_url || item.link || 'https://gnuts.org.gh'),
          status: String(item.status || 'open').toLowerCase() === 'closed' ? 'closed' : 'open',
          created_at: item.created_at ? String(item.created_at).substring(0, 10) : '',
        };
      });
    }
  } catch (e) {
    // Graceful fallback
  }

  return (
    <OpportunitiesClient 
      initialOpportunities={opportunities} 
      heroImage={heroImage}
      heroTitle={heroTitle}
      heroSubtitle={heroSubtitle}
    />
  );
}
