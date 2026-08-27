import { GraduationCap } from 'lucide-react';
import { query } from '@/lib/db';
import ScholarshipsClient from '@/components/ScholarshipsClient';
import { resolveImgUrl } from '@/lib/imageUtils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface Scholarship {
  id: number;
  title: string;
  description: string;
  requirements?: string;
  deadline?: string;
  createdAt?: string;
  link?: string;
  status: 'active' | 'closed' | string;
}

export interface Opportunity {
  id: number;
  title: string;
  description: string;
  type: string;
  location?: string;
  deadline?: string;
  createdAt?: string;
  link?: string;
  status: string;
}

export default async function ScholarshipsPage() {
  let heroImage = 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg';

  const [dbActiveScholarships, dbClosedScholarships, dbActiveOpportunities, dbClosedOpportunities, bannerRows] = await Promise.all([
    query<any>("SELECT * FROM scholarships WHERE status = 'active' ORDER BY created_at DESC").catch(() => []),
    query<any>("SELECT * FROM scholarships WHERE status = 'closed' ORDER BY updated_at DESC LIMIT 5").catch(() => []),
    query<any>("SELECT * FROM opportunities WHERE status = 'active' ORDER BY created_at DESC").catch(() => []),
    query<any>("SELECT * FROM opportunities WHERE status = 'closed' ORDER BY updated_at DESC LIMIT 5").catch(() => []),
    query<any>("SELECT * FROM hero_banners WHERE page_key = 'scholarships_hero'").catch(() => []),
  ]);

  if (bannerRows && bannerRows.length > 0 && bannerRows[0].image_url) {
    heroImage = resolveImgUrl(bannerRows[0].image_url);
  }

  const formatDateStr = (val: any) => {
    if (!val) return '';
    if (val instanceof Date) {
      if (isNaN(val.getTime())) return '';
      return val.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    const str = String(val).trim();
    if (str === '0000-00-00' || str === '' || str === 'null') return '';
    try {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch {}
    return str;
  };

  const activeScholarships: Scholarship[] = dbActiveScholarships.map((s: any) => ({
    id: Number(s.id),
    title: String(s.title || ''),
    description: String(s.description || ''),
    requirements: s.requirements ? String(s.requirements) : '',
    deadline: formatDateStr(s.deadline) || 'Ongoing',
    createdAt: formatDateStr(s.created_at) || '',
    link: s.link ? String(s.link) : '',
    status: 'active',
  }));

  const closedScholarships: Scholarship[] = dbClosedScholarships.map((s: any) => ({
    id: Number(s.id),
    title: String(s.title || ''),
    description: String(s.description || ''),
    requirements: s.requirements ? String(s.requirements) : '',
    deadline: formatDateStr(s.deadline) || 'Closed',
    createdAt: formatDateStr(s.created_at) || '',
    link: s.link ? String(s.link) : '',
    status: 'closed',
  }));

  const activeOpportunities: Opportunity[] = dbActiveOpportunities.map((o: any) => ({
    id: Number(o.id),
    title: String(o.title || ''),
    description: String(o.description || ''),
    type: String(o.type || 'INTERNSHIP'),
    location: o.location ? String(o.location) : 'Ghana',
    deadline: formatDateStr(o.deadline) || 'Open',
    createdAt: formatDateStr(o.created_at) || '',
    link: o.link ? String(o.link) : '',
    status: 'active',
  }));

  const closedOpportunities: Opportunity[] = dbClosedOpportunities.map((o: any) => ({
    id: Number(o.id),
    title: String(o.title || ''),
    description: String(o.description || ''),
    type: String(o.type || 'INTERNSHIP'),
    location: o.location ? String(o.location) : 'Ghana',
    deadline: formatDateStr(o.deadline) || 'Closed',
    createdAt: formatDateStr(o.created_at) || '',
    link: o.link ? String(o.link) : '',
    status: 'closed',
  }));

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] font-sans">
      {/* 1. Hero Section - 50% opacity green overlay & border-b-4 border-[#D9A000] */}
      <section className="relative text-white py-12 sm:py-16 lg:py-20 px-3 sm:px-6 lg:px-8 border-b-4 border-[#D9A000] overflow-hidden bg-gray-900">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
        {/* Semi-transparent Green Overlay (50% Green Opacity) */}
        <div className="absolute inset-0 bg-[#014900]/50 backdrop-brightness-90" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mb-3 drop-shadow-md">
            GNUTS Opportunities Hub
          </h1>
          <p className="text-gray-100 text-sm sm:text-base max-w-2xl mx-auto font-medium drop-shadow-sm">
            Training and funding opportunities to support your technical and vocational education journey
          </p>
        </div>
      </section>

      {/* 2. Main Page Content */}
      <ScholarshipsClient
        activeScholarships={activeScholarships}
        closedScholarships={closedScholarships}
        activeOpportunities={activeOpportunities}
        closedOpportunities={closedOpportunities}
      />
    </div>
  );
}
