import { Metadata } from 'next';
import ExecutivesClient from './ExecutivesClient';
import { query } from '@/lib/db';

export const metadata: Metadata = {
  title: 'National Executive Officers | GNUTS Ghana',
  description: 'Meet the National Executive Committee leading the Ghana National Union of Technical Students.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

  try {
    const dbRows: any[] = await query('SELECT * FROM executives ORDER BY display_order ASC, id ASC');
    if (dbRows && Array.isArray(dbRows)) {
      executives = dbRows.map((item: any) => ({
        id: Number(item.id),
        name: String(item.full_name || item.name || 'Executive Officer'),
        position: String(item.position || 'National Executive'),
        institution: String(item.institution || 'GNUTS National Secretariat'),
        bio: String(item.bio || 'Serving the Ghanaian technical student community with dedication, integrity, and proactive leadership.'),
        image_url: String(item.photo || item.image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop'),
        email: item.email ? String(item.email) : undefined,
        phone: item.phone ? String(item.phone) : undefined,
        display_order: Number(item.display_order || 1),
        tenure: String(item.tenure || '34th Administration (2025/2026)'),
      }));
    }
  } catch (e) {
    // Fallback data
  }

  return <ExecutivesClient initialExecutives={executives} />;
}
