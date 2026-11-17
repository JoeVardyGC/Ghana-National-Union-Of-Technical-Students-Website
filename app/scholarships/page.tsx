import type { Metadata } from 'next';
import { GraduationCap } from 'lucide-react';
import { query } from '@/lib/db';
import ScholarshipsClient from '@/components/ScholarshipsClient';
import { resolveImgUrl } from '@/lib/imageUtils';

export const revalidate = 15; // Fast ISR caching

export const metadata: Metadata = {
  title: 'Scholarships & Bursaries for Technical Students | GNUTS Ghana',
  description:
    'Active scholarships, bursaries and funding opportunities for technical university and TVET students in Ghana, with requirements and deadlines.',
  alternates: { canonical: '/scholarships' },
  openGraph: {
    title: 'Scholarships & Bursaries for Technical Students | GNUTS Ghana',
    description: 'Active scholarships and funding opportunities for technical and TVET students in Ghana.',
    url: '/scholarships',
    images: ['/images/og-logo.png'],
  },
};

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
  let heroImage = '/images/header_for_pages.jpg';

  const [dbActiveScholarships, dbClosedScholarships, dbActiveOpportunities, dbClosedOpportunities, bannerRows] = await Promise.all([
    query<any>("SELECT * FROM scholarships WHERE status = 'active' ORDER BY created_at DESC").catch(() => []),
    query<any>("SELECT * FROM scholarships WHERE status = 'closed' ORDER BY updated_at DESC LIMIT 5").catch(() => []),
    query<any>("SELECT * FROM opportunities WHERE status = 'active' ORDER BY created_at DESC").catch(() => []),
    query<any>("SELECT * FROM opportunities WHERE status = 'closed' ORDER BY updated_at DESC LIMIT 5").catch(() => []),
    query<any>("SELECT * FROM hero_banners WHERE page_key = 'scholarships_hero'").catch(() => []),
  ]);

  let heroTitle = 'Scholarships and opportunities';
  let heroSubtitle = 'Training and funding opportunities to support your technical and vocational education journey';

  if (bannerRows && bannerRows.length > 0) {
    if (bannerRows[0].image_url) {
      heroImage = resolveImgUrl(bannerRows[0].image_url);
    }
    if (bannerRows[0].title && bannerRows[0].title !== 'Scholarships & Opportunities Hero Banner' && bannerRows[0].title !== 'Scholarships & Aid Page Header') {
      heroTitle = bannerRows[0].title;
    }
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

  const safeBgUrl = encodeURI(heroImage);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] w-full max-w-full overflow-x-hidden">
      {/* 1. Hero Section - 50% opacity green overlay & border-b-4 border-[#D9A000] */}
      <section className="relative text-white py-14 sm:py-20 px-3 sm:px-6 lg:px-8 border-b-4 border-[#D9A000] overflow-hidden bg-gray-900 w-full">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${safeBgUrl}')` }}
        />
        {/* Dark scrim so the title stays readable on any photo */}
        <div className="absolute inset-0 bg-[#0c1a10]/60" />

        <div className="max-w-7xl mx-auto text-center relative z-10 px-2 sm:px-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-2.5 sm:mb-3 drop-shadow-md break-words">
            {heroTitle}
          </h1>
          <p className="text-gray-100 text-xs sm:text-sm md:text-base max-w-2xl mx-auto font-medium drop-shadow-sm break-words">
            {heroSubtitle}
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
