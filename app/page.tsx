import type { Metadata } from 'next';
import Link from 'next/link';
import { query } from '@/lib/db';
import HeroSlider from '@/components/HeroSlider';
import OpportunitiesSection from '@/components/OpportunitiesSection';
import InnovationsSection from '@/components/InnovationsSection';
import UnionCtaBanner from '@/components/UnionCtaBanner';
import NewsSection from '@/components/NewsSection';
import { resolveImgUrl } from '@/lib/imageUtils';
import { ArrowRight, Mail, Phone } from 'lucide-react';

export const revalidate = 15; // Incremental Static Regeneration for instant <5ms loads

export const metadata: Metadata = {
  // Both "GNUTS" and the full name up front, so the result matches either search
  title: { absolute: 'GNUTS | Ghana National Union of Technical Students - Official Website' },
  description:
    'Official website of GNUTS, the Ghana National Union of Technical Students: scholarships, student innovations, news, executives and advocacy for technical university and TVET students across Ghana.',
  alternates: { canonical: '/' },
  // When gnuts.org itself is shared, the preview shows the union's logo
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'GNUTS - Ghana National Union of Technical Students',
    title: 'GNUTS | Ghana National Union of Technical Students',
    description: 'Official website of the Ghana National Union of Technical Students (GNUTS).',
    images: [{ url: '/images/og-logo.png', width: 1200, height: 630, alt: 'GNUTS logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GNUTS | Ghana National Union of Technical Students',
    description: 'Official website of the Ghana National Union of Technical Students (GNUTS).',
    images: ['/images/og-logo.png'],
  },
};

/** "2026-12-31T00:00:00.000Z" -> "31 Dec 2026" (falls back to the raw date text) */
function formatDeadline(value: unknown): string {
  const raw = String(value).split('T')[0];
  const date = new Date(`${raw}T00:00:00Z`);
  if (isNaN(date.getTime())) return raw;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export default async function HomePage() {
  // Fetch dynamic data in parallel for maximum server performance
  const [
    scholarships,
    opportunities,
    innovations,
    executives,
    news,
    statsResult,
    scholarshipsCountResult,
    carouselSlidesResult
  ] = await Promise.all([
    query('SELECT * FROM scholarships WHERE status = "active" ORDER BY created_at DESC LIMIT 3').catch(() => []),
    query('SELECT * FROM opportunities WHERE status = "active" ORDER BY created_at DESC LIMIT 4').catch(() => []),
    query('SELECT * FROM innovations WHERE status = "approved" ORDER BY created_at DESC, id DESC LIMIT 3').catch(() => []),
    query('SELECT * FROM executives ORDER BY display_order ASC, created_at DESC LIMIT 8').catch(() => []),
    query('SELECT * FROM news WHERE status = "published" ORDER BY published_at DESC, created_at DESC, id DESC LIMIT 6').catch(() => []),
    query('SELECT COUNT(*) as count FROM innovations WHERE status = "approved"').catch(() => [{ count: 0 }]),
    query('SELECT COUNT(*) as count FROM scholarships WHERE status = "active"').catch(() => [{ count: 0 }]),
    query('SELECT * FROM hero_banners WHERE page_key = "home_carousel" ORDER BY display_order ASC, id ASC').catch(() => []),
  ]);

  const projectsCount = statsResult[0]?.count ?? 0;
  const dbScholarshipsCount = scholarshipsCountResult[0]?.count ?? 0;
  const scholarshipsCount = dbScholarshipsCount > 0 ? dbScholarshipsCount : 1;
  const carouselSlides = carouselSlidesResult || [];

  // Background color palette for executive cards matching GNUTS brand
  const cardBgColors = [
    '#014900', // Primary Green
    '#D9A000', // Gold
    '#003300', // Deep Forest Green
    '#016a02', // Vibrant Green
  ];

  return (
    <>
      <div className="flex flex-col min-h-screen bg-[#FAF9F6] overflow-x-hidden">
        {/* 1. Hero Section + Floating Stats Overlay */}
        <HeroSlider stats={{ projectsCount, scholarshipsCount }} carouselSlides={carouselSlides} />

        {/* 2. About GNUTS Section */}
        <section className="py-16 sm:py-24 bg-[#FAF9F6]" id="about-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 reveal-on-scroll">
              <div className="lg:col-span-5">
                <span className="eyebrow">About the union</span>
                <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-[#16201A] leading-tight">
                  The national voice of Ghana&rsquo;s technical students
                </h2>
                <p className="text-[#5B6560] text-base leading-relaxed">
                  Representing technical students since 1987, first as GNUPS and, since 2016, as GNUTS. We are the
                  national body for students in Technical Universities and TVET institutions across Ghana.
                </p>
                <Link
                  href="/about"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#014900] border-b-2 border-[#D9A000] pb-0.5 hover:text-[#013300] transition-colors"
                >
                  Read our history
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>

              <dl className="lg:col-span-7 border-t border-[#E4E2DA]">
                <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-x-8 gap-y-2 py-6 border-b border-[#E4E2DA]">
                  <dt className="font-display font-semibold text-[#014900]">Who we are</dt>
                  <dd className="text-[#5B6560] leading-relaxed">
                    A democratic, non-partisan union that speaks for technical students on academic, welfare and
                    professional issues.
                  </dd>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-x-8 gap-y-2 py-6 border-b border-[#E4E2DA]">
                  <dt className="font-display font-semibold text-[#014900]">Our history</dt>
                  <dd className="text-[#5B6560] leading-relaxed">
                    Formed in 1987 when polytechnic students felt unrepresented, and formally constituted at the Tamale
                    congress in 2000.
                  </dd>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-x-8 gap-y-2 py-6 border-b border-[#E4E2DA]">
                  <dt className="font-display font-semibold text-[#014900]">What we push for</dt>
                  <dd className="text-[#5B6560] leading-relaxed">
                    Quality technical education, fair funding, safe campuses and real routes into work for graduates.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

      {/* 3. Available Scholarships Section */}
      <section className="py-10 sm:py-16 lg:py-24 bg-white border-y border-gray-200" id="scholarships-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#16201A]">Available Scholarships</h2>
              <p className="text-gray-500 text-xs sm:text-sm lg:text-base font-medium">
                Funding opportunities for technical and vocational students
              </p>
            </div>
            <Link
              href="/scholarships"
              className="inline-flex items-center gap-1 text-xs sm:text-sm lg:text-base font-semibold text-[#014900] hover:text-gold-ink transition-colors mt-1 md:mt-0"
            >
              All scholarships
            </Link>
          </div>

          {scholarships.length === 0 ? (
            <div className="text-center py-12 px-6 bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm max-w-xl mx-auto">
              <p className="text-gray-600 text-sm">
                No active scholarships at the moment. Check back soon for new bursary announcements.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 reveal-on-scroll">
              {scholarships.slice(0, 3).map((item: any, idx: number) => {
                const isActive = (item.status || 'active').toLowerCase() === 'active';
                const isGold = false;

                return (
                  <Link
                    key={item.id || idx}
                    href={`/scholarships#scholarship-${item.id}`}
                    className="group relative bg-white rounded-lg sm:rounded-xl p-5 sm:p-7 lg:p-8 shadow-md border border-gray-200/90 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-md min-w-0 w-full cursor-pointer"
                  >
                    <div className="space-y-3 sm:space-y-4 relative z-10 min-w-0">
                      <div className="flex justify-between items-start gap-2 flex-wrap min-w-0">
                        <span
                          className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold shrink-0 shadow-xs ${
                            isGold ? 'bg-[#D9A000] text-[#014900]' : 'bg-[#014900] text-white'
                          }`}
                        >
                          {item.status ? item.status.toUpperCase() : 'ACTIVE'}
                        </span>
                      </div>

                      <h3
                        className={`font-semibold text-base sm:text-lg lg:text-xl text-gray-900 leading-snug transition-colors break-words ${
                          isGold ? 'group-hover:text-gold-ink' : 'group-hover:text-[#014900]'
                        }`}
                      >
                        {item.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium line-clamp-4 break-words">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 sm:pt-4 mt-4 sm:mt-6 border-t border-gray-100 relative z-10 flex flex-col gap-2">
                      {item.deadline && (
                        <span className="text-xs font-semibold text-gray-500">
                          Deadline: {formatDeadline(item.deadline)}
                        </span>
                      )}
                      <span
                        className={`text-xs font-semibold transition-colors inline-flex items-center gap-1 ${
                          isGold ? 'text-gold-ink group-hover:text-[#014900]' : 'text-[#014900] group-hover:text-gold-ink'
                        }`}
                      >
                        <span>View Requirements & Apply</span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. Opportunities Section */}
      <OpportunitiesSection dbOpportunities={opportunities} />

      {/* 5. Student Innovations Section (Latest 2 Projects) */}
      <InnovationsSection dbInnovations={innovations} />

      {/* 6. News & Events Section */}
      <NewsSection dbNews={news} />

      {/* 7. Executive Leadership Section (always shown; the menu's "Our Leadership" links here) */}
        <section id="executives-section" className="py-16 sm:py-24 bg-white border-b border-gray-200 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 pb-4 border-b border-gray-100 gap-3">
              <div>
                <div className="relative inline-block pb-2">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#16201A]">GNUTS Executives</h2>
                </div>
                <p className="text-gray-500 text-sm sm:text-base mt-2 font-medium">The National Executive Committee</p>
              </div>
              <a
                href="/executives"
                className="inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-[#014900] hover:text-gold-ink transition-colors mt-2 md:mt-0"
              >
                All executives
              </a>
            </div>

            {!executives || executives.length === 0 ? (
              <div className="text-center py-12 px-6 bg-[#FAF9F6] rounded-lg sm:rounded-xl border border-gray-200 shadow-sm max-w-xl mx-auto">
                <p className="text-gray-600 text-sm">
                  Profiles of the National Executive Committee are coming soon.
                </p>
              </div>
            ) : (
            /* Responsive Grid: 1 per row on Mobile, 2 on Tablet, 4 on Desktop with smooth rounded-xl corners */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 lg:gap-8 reveal-on-scroll">
              {executives.map((exec: any, index: number) => {
                const bgCol = cardBgColors[index % cardBgColors.length];
                const photoUrl = resolveImgUrl(exec.photo || exec.image_url || exec.image || '/images/gnuts_fav.png');

                return (
                  <div key={exec.id || index} className="group flex flex-col bg-white rounded-xl border border-[#E4E2DA] hover:border-[#C9C6BA] transition-all duration-300 overflow-hidden max-w-[290px] mx-auto sm:max-w-none w-full">
                    {/* Photo container with balanced square aspect ratio */}
                    <div className="relative aspect-[1/1] w-full overflow-hidden bg-gray-900 rounded-t-xl" style={{ backgroundColor: bgCol }}>
                      <img
                        src={photoUrl}
                        alt={`${exec.full_name || exec.name}, ${exec.position || 'National Executive'}, GNUTS`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    </div>

                    {/* Name / Position Card Block */}
                    <div className="p-5 sm:p-5 text-center flex flex-col justify-between flex-grow bg-white border-t border-gray-100 rounded-b-xl">
                      <div>
                        <h3 className="text-base sm:text-sm lg:text-base font-semibold text-[#014900] group-hover:text-gold-ink transition-colors leading-snug">
                          {exec.full_name || exec.name}
                        </h3>
                        <p className="text-xs sm:text-xs lg:text-xs font-semibold text-gold-ink mt-1">
                          {exec.position}
                        </p>
                      </div>
                      
                      {/* Socials / Contacts */}
                      {(exec.email || exec.phone) && (
                        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-gray-100">
                          {exec.email && (
                            <a href={`mailto:${exec.email}`} className="text-gray-400 hover:text-[#014900] transition-colors p-1.5 rounded-full hover:bg-gray-100" title="Email">
                              <Mail className="w-4 h-4" />
                            </a>
                          )}
                          {exec.phone && (
                            <a href={`tel:${exec.phone}`} className="text-gray-400 hover:text-[#014900] transition-colors p-1.5 rounded-full hover:bg-gray-100" title="Phone">
                              <Phone className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </section>

      {/* 8. Join the Movement CTA Banner */}
      <UnionCtaBanner />
    </div>
    </>
  );
}
