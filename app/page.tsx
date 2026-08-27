import Link from 'next/link';
import { query } from '@/lib/db';
import HeroSlider from '@/components/HeroSlider';
import OpportunitiesSection from '@/components/OpportunitiesSection';
import InnovationsSection from '@/components/InnovationsSection';
import UnionCtaBanner from '@/components/UnionCtaBanner';
import NewsSection from '@/components/NewsSection';
import ScrollAnimationProvider from '@/components/ScrollAnimationProvider';
import { resolveImgUrl } from '@/lib/imageUtils';
import { Layers, Clock, Calendar, MessageSquare, Mail, Phone, Share2 } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Fresh real-time data on every visit

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
    <ScrollAnimationProvider>
      <div className="flex flex-col min-h-screen bg-[#f8f9fa] font-['Montserrat',sans-serif] overflow-x-hidden">
        {/* 1. Hero Section + Floating Stats Overlay */}
        <HeroSlider stats={{ projectsCount, scholarshipsCount }} carouselSlides={carouselSlides} />

        {/* 2. About GNUTS Section */}
        <section className="relative py-16 sm:py-24 bg-white overflow-hidden" id="about-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center reveal-on-scroll">
            {/* Left side */}
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#014900] tracking-tight leading-tight uppercase">
                About GNUTS
              </h2>
              <div className="w-16 h-1.5 bg-[#D9A000] rounded-full my-4" />
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-8 font-medium">
                Protecting the interests of all technical students in Ghana since 1962. We are the national representative body of students in Technical Universities and Technical and Vocational Education and Training (TVET) institutions across Ghana.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-7 py-3.5 border border-transparent text-sm font-black uppercase tracking-wider rounded-2xl text-white bg-[#014900] hover:bg-[#D9A000] hover:text-[#014900] transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
              >
                Discover Our Story →
              </Link>
            </div>

            {/* Right side: 3 stacked curved cards (rounded-2xl) */}
            <div className="flex flex-col gap-5">
              {/* Card 1 */}
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl border border-gray-200/90 flex gap-5 hover:border-[#014900]/30 hover:-translate-y-1 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#f8f9fa] group-hover:bg-[#014900] group-hover:text-white text-[#014900] flex items-center justify-center shrink-0 transition-colors border border-gray-200/60 shadow-xs">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 mb-1.5 group-hover:text-[#014900] transition-colors">Who We Are</h3>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">
                    A unified voice advancing the academic, social, and professional interests of technical students in national educational discourse.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl border border-gray-200/90 flex gap-5 hover:border-[#D9A000]/40 hover:-translate-y-1 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#f8f9fa] group-hover:bg-[#D9A000] group-hover:text-[#014900] text-[#014900] flex items-center justify-center shrink-0 transition-colors border border-gray-200/60 shadow-xs">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 mb-1.5 group-hover:text-[#D9A000] transition-colors">Our History</h3>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">
                    Emerging in 1987 to address the marginalization of polytechnic students, fully operationalized with the Tamale Declaration in 2000.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl border border-gray-200/90 flex gap-5 hover:border-[#014900]/30 hover:-translate-y-1 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#f8f9fa] group-hover:bg-[#014900] group-hover:text-white text-[#014900] flex items-center justify-center shrink-0 transition-colors border border-gray-200/60 shadow-xs">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 mb-1.5 group-hover:text-[#014900] transition-colors">Policy & Advocacy</h3>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">
                    Championing student-centered policies for quality technical education, funding, campus safety, and graduate employability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Available Scholarships Section — Connected to Live Database */}
      <section className="py-10 sm:py-16 lg:py-24 bg-white border-y border-gray-200" id="scholarships-section">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#014900] tracking-tight uppercase">Available Scholarships</h2>
              <div className="w-16 h-1.5 bg-[#D9A000] rounded-full my-2.5 sm:my-3" />
              <p className="text-gray-500 text-xs sm:text-sm lg:text-base font-medium">
                Funding opportunities for technical and vocational students
              </p>
            </div>
            <Link
              href="/scholarships"
              className="inline-flex items-center gap-1 text-xs sm:text-sm lg:text-base font-black uppercase text-[#014900] hover:text-[#D9A000] transition-colors mt-1 md:mt-0"
            >
              View All →
            </Link>
          </div>

          {scholarships.length === 0 ? (
            <div className="text-center py-12 px-6 bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm max-w-xl mx-auto">
              <div className="text-4xl mb-3">🎓</div>
              <p className="text-gray-500 font-medium text-xs sm:text-sm">
                No active scholarships currently available. Check back soon for new bursary announcements.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 reveal-on-scroll">
              {scholarships.slice(0, 3).map((item: any, idx: number) => {
                const isActive = (item.status || 'active').toLowerCase() === 'active';
                const isGold = idx % 2 === 1;

                return (
                  <div
                    key={item.id || idx}
                    className="group relative bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 shadow-md border border-gray-200/90 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 min-w-0 w-full"
                  >
                    <div className="space-y-3 sm:space-y-4 relative z-10 min-w-0">
                      <div className="flex justify-between items-start gap-2 flex-wrap min-w-0">
                        <span
                          className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 shadow-xs text-white ${
                            isGold ? 'bg-[#D9A000]' : 'bg-[#014900]'
                          }`}
                        >
                          {item.status ? item.status.toUpperCase() : 'ACTIVE'}
                        </span>
                      </div>

                      <h3
                        className={`font-black text-base sm:text-lg lg:text-xl text-gray-900 leading-snug transition-colors break-words ${
                          isGold ? 'group-hover:text-[#D9A000]' : 'group-hover:text-[#014900]'
                        }`}
                      >
                        {item.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium line-clamp-4 break-words">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3.5 sm:pt-4 mt-4 sm:mt-6 border-t border-gray-100 relative z-10 flex flex-wrap items-center justify-between gap-2.5">
                      <Link
                        href={item.link || item.application_url || '/scholarships'}
                        className={`text-xs sm:text-sm font-black uppercase tracking-wider transition-colors inline-flex items-center gap-1 shrink-0 ${
                          isGold ? 'text-[#D9A000] hover:text-[#014900]' : 'text-[#014900] hover:text-[#D9A000]'
                        }`}
                      >
                        {isActive ? 'Apply Now →' : 'Learn More →'}
                      </Link>
                      {item.deadline && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-xl shrink-0">
                          <Calendar className="w-3.5 h-3.5 text-[#D9A000] shrink-0" />
                          <span>Deadline: {String(item.deadline).split('T')[0]}</span>
                        </span>
                      )}
                    </div>
                  </div>
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

      {/* 7. Executive Leadership Section — Curved Cards (rounded-3xl), 1 Card per row on Mobile */}
      <section id="executives-section" className="py-16 sm:py-24 bg-white border-b border-gray-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 pb-4 border-b border-gray-100 gap-3">
            <div>
              <div className="relative inline-block pb-2">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#014900] tracking-tight uppercase">GNUTS Executives</h2>
                <div className="absolute left-0 bottom-0 w-16 h-1.5 bg-[#D9A000] rounded-full" />
              </div>
              <p className="text-gray-500 text-sm sm:text-base mt-2 font-medium">The National Executive Committee</p>
            </div>
            <a
              href="/executives"
              className="inline-flex items-center gap-1.5 text-sm sm:text-base font-black uppercase text-[#014900] hover:text-[#D9A000] transition-colors mt-2 md:mt-0"
            >
              Our Leadership →
            </a>
          </div>

          {executives.length === 0 ? (
            <div className="text-center py-12 px-6 bg-white rounded-3xl border border-gray-200 shadow-sm max-w-xl mx-auto">
              <div className="text-4xl mb-3">👥</div>
              <p className="text-gray-500 font-medium text-sm">
                National Executive Committee directory is currently being updated. Check back soon.
              </p>
            </div>
          ) : (
            /* Responsive Grid: 1 per row on Mobile, 2 on Tablet, 4 on Desktop with smooth rounded-3xl corners */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 lg:gap-8 reveal-on-scroll">
              {executives.map((exec: any, index: number) => {
                const bgCol = cardBgColors[index % cardBgColors.length];
                const photoUrl = resolveImgUrl(exec.photo || exec.image_url || exec.image);

                return (
                  <div key={exec.id || index} className="group flex flex-col bg-white rounded-3xl border border-gray-200/90 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden max-w-[290px] mx-auto sm:max-w-none w-full">
                    {/* Photo container with balanced square aspect ratio */}
                    <div className="relative aspect-[1/1] w-full overflow-hidden bg-gray-900 rounded-t-3xl" style={{ backgroundColor: bgCol }}>
                      <img
                        src={photoUrl}
                        alt={exec.full_name || exec.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Name / Position Card Block */}
                    <div className="p-5 sm:p-5 text-center flex flex-col justify-between flex-grow bg-white border-t border-gray-100 rounded-b-3xl">
                      <div>
                        <h3 className="text-base sm:text-sm lg:text-base font-black text-[#014900] group-hover:text-[#D9A000] transition-colors leading-snug">
                          {exec.full_name || exec.name}
                        </h3>
                        <p className="text-xs sm:text-[11px] lg:text-xs font-black text-[#D9A000] uppercase tracking-wider mt-1">
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
    </ScrollAnimationProvider>
  );
}
