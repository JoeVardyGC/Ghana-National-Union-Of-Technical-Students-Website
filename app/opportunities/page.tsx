import { Metadata } from 'next';
import OpportunitiesClient from './OpportunitiesClient';
import { query } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Student Opportunities & TVET Placements | GNUTS Ghana',
  description: 'Discover industrial attachments, TVET grants, skill competitions, and fellowships for technical university students in Ghana.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

  try {
    const dbRows: any[] = await query('SELECT * FROM opportunities ORDER BY created_at DESC, id DESC');
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

  return <OpportunitiesClient initialOpportunities={opportunities} />;
}
