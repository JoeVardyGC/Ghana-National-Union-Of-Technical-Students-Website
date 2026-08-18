import Link from 'next/link';
import { query } from '@/lib/db';
import HeroSlider from '@/components/HeroSlider';
import OpportunitiesSection from '@/components/OpportunitiesSection';
import UnionCtaBanner from '@/components/UnionCtaBanner';
import NewsSection from '@/components/NewsSection';
import ScrollAnimationProvider from '@/components/ScrollAnimationProvider';
import { Layers, Clock, MessageSquare, Mail, Phone, Share2, Globe } from 'lucide-react';

export const revalidate = 60; // Refresh data every 60s

export default async function HomePage() {
  // Fetch dynamic data from MariaDB
  const scholarships = await query('SELECT * FROM scholarships WHERE status = "active" ORDER BY created_at DESC LIMIT 2').catch(() => []);
  const opportunities = await query('SELECT * FROM opportunities WHERE status = "active" ORDER BY created_at DESC LIMIT 3').catch(() => []);
  const executives = await query('SELECT * FROM executives ORDER BY display_order ASC, created_at DESC LIMIT 8').catch(() => []);
  const news = await query('SELECT * FROM news WHERE status = "published" ORDER BY published_at DESC LIMIT 3').catch(() => []);
  const statsResult = await query('SELECT COUNT(*) as count FROM innovations WHERE status = "approved"').catch(() => [{ count: 0 }]);
  const scholarshipsCountResult = await query('SELECT COUNT(*) as count FROM scholarships WHERE status = "active"').catch(() => [{ count: 0 }]);

  const projectsCount = statsResult[0]?.count ?? 0;
  const dbScholarshipsCount = scholarshipsCountResult[0]?.count ?? 0;
  const scholarshipsCount = dbScholarshipsCount > 0 ? dbScholarshipsCount : 1;

  // Background color palette for executive cards matching GNUTS brand
  const cardBgColors = [
    '#014900', // Primary Green
    '#D9A000', // Gold
    '#003300', // Deep Forest Green
    '#016a02', // Vibrant Green
  ];

  return (
    <ScrollAnimationProvider>
      <div className="flex flex-col min-h-screen bg-[#f8f9fa] font-sans overflow-x-hidden">
        {/* 1. Hero Section + Floating Stats Overlay */}
        <HeroSlider stats={{ projectsCount, scholarshipsCount }} />

        {/* 2. About GNUTS Section */}
        <section className="relative py-16 sm:py-24 bg-white overflow-hidden" id="about-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center reveal-on-scroll">
            {/* Left side */}
            <div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-[#014900] tracking-tight leading-tight">
                About GNUTS
              </h2>
              <div className="w-16 h-1.5 bg-[#D9A000] rounded-full my-6" />
              <p className="text-gray-600 text-lg sm:text-xl leading-relaxed mb-8">
                Protecting the interests of all technical students in Ghana since 1962. We are the national representative body of students in Technical Universities and Technical and Vocational Education and Training (TVET) institutions across Ghana.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-bold rounded-md text-white bg-[#014900] hover:bg-[#003300] transition-colors shadow-sm hover:shadow-md"
              >
                Discover Our Story →
              </Link>
            </div>

            {/* Right side: 3 stacked cards */}
            <div className="flex flex-col gap-5">
              {/* Card 1 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-5 hover:shadow-md hover:border-[#014900]/20 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#f8f9fa] group-hover:bg-[#014900] group-hover:text-white text-[#014900] flex items-center justify-center shrink-0 transition-colors">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 mb-2">Who We Are</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    A unified voice advancing the academic, social, and professional interests of technical students in national educational discourse.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-5 hover:shadow-md hover:border-[#014900]/20 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#f8f9fa] group-hover:bg-[#014900] group-hover:text-white text-[#014900] flex items-center justify-center shrink-0 transition-colors">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 mb-2">Our History</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Emerging in 1987 to address the marginalization of polytechnic students, fully operationalized with the Tamale Declaration in 2000.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-5 hover:shadow-md hover:border-[#014900]/20 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#f8f9fa] group-hover:bg-[#014900] group-hover:text-white text-[#014900] flex items-center justify-center shrink-0 transition-colors">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 mb-2">Policy & Advocacy</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Championing student-centered policies for quality technical education, funding, campus safety, and graduate employability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Available Scholarships Section */}
      <section className="py-16 sm:py-24 bg-white border-y border-gray-200" id="scholarships-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-3">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#014900] tracking-tight">Available Scholarships</h2>
              <div className="w-16 h-1.5 bg-[#D9A000] rounded-full my-4" />
              <p className="text-gray-500 text-sm sm:text-base font-medium">
                Funding opportunities for technical and vocational students
              </p>
            </div>
            <Link
              href="/scholarships"
              className="inline-flex items-center gap-1 text-sm sm:text-base font-bold text-[#014900] hover:text-[#D9A000] transition-colors mt-2 md:mt-0"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 reveal-on-scroll">
            {/* Card 1: Active */}
            <div className="group relative bg-white rounded-2xl p-7 sm:p-8 shadow-sm border border-gray-100 border-l-4 border-l-[#014900] flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-none z-0"></div>
              
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-start gap-3">
                  <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 leading-snug">
                    No-Fees-Stress Tertiary Intervention
                  </h3>
                  <span className="px-3 py-1 rounded-md bg-[#014900] text-white text-[11px] font-bold uppercase tracking-wider shrink-0">
                    ACTIVE
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  This is a government initiative aimed at ensuring that no student is denied higher education due to an inability to pay upfront admission fees. It specifically targets first-year (Level 100) Ghanaian students admitted to public tertiary institutions, including universities, polytechnics, colleges of...
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-gray-100 relative z-10">
                <Link href="/scholarships" className="text-sm font-bold text-[#014900] group-hover:text-[#D9A000] transition-colors inline-flex items-center gap-1">
                  Apply Now →
                </Link>
              </div>
            </div>

            {/* Card 2: Inactive */}
            <div className="group relative bg-white rounded-2xl p-7 sm:p-8 shadow-sm border border-gray-100 border-l-4 border-l-gray-300 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-none z-0"></div>
              
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-start gap-3">
                  <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 leading-snug">
                    Student Loan Trust Fund (SLTF)
                  </h3>
                  <span className="px-3 py-1 rounded-md bg-[#D9A000] text-white text-[11px] font-bold uppercase tracking-wider shrink-0">
                    INACTIVE
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  The SLTF provides financial resources to Ghanaian students in accredited tertiary institutions (both public and private). The fund is designed to cover academic fees, books, and living expenses. A major feature of the current system is the &quot;No Guarantor&quot; policy, which allows students to access the l...
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-gray-100 relative z-10">
                <Link href="/scholarships" className="text-sm font-bold text-gray-400 group-hover:text-[#D9A000] transition-colors inline-flex items-center gap-1">
                  Learn More →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Opportunities Section */}
      <OpportunitiesSection dbOpportunities={opportunities} />

      {/* 6. News & Events Section */}
      <NewsSection dbNews={news} />

      {/* 7. Executive Leadership */}
      <section id="executives-section" className="py-16 sm:py-24 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-4 border-b border-gray-100 gap-3">
            <div>
              <div className="relative inline-block pb-2">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#014900] tracking-tight">GNUTS Executives</h2>
                <div className="absolute left-0 bottom-0 w-16 h-1.5 bg-[#D9A000] rounded-full" />
              </div>
              <p className="text-gray-500 text-sm sm:text-base mt-4 font-medium">The National Executive Committee</p>
            </div>
            <Link
              href="/about#leadership"
              className="inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-[#014900] hover:text-[#D9A000] transition-colors mt-2 md:mt-0"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-x-8 sm:gap-y-12 reveal-on-scroll">
            {(executives.length > 0 ? executives : [
              { name: 'National President', position: 'President', email: 'president@gnuts.org.gh', phone: '+233 20 000 0001', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop' },
              { name: 'Vice President', position: 'Vice President', email: 'vp@gnuts.org.gh', phone: '+233 20 000 0002', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop' },
              { name: 'General Secretary', position: 'General Secretary', email: 'gensec@gnuts.org.gh', phone: '+233 20 000 0003', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop' },
              { name: 'Financial Controller', position: 'Financial Controller', email: 'finance@gnuts.org.gh', phone: '+233 20 000 0004', photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop' },
            ]).map((exec: any, index: number) => {
              const bgCol = cardBgColors[index % cardBgColors.length];
              const demoPhotos = [
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop',
              ];
              const photoUrl = exec.photo 
                ? (exec.photo.startsWith('http') ? exec.photo : `/${exec.photo}`)
                : demoPhotos[index % demoPhotos.length];

              return (
                <div key={exec.id || index} className="group flex flex-col bg-white rounded-none border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  {/* Photo container with sharp edges */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-900" style={{ backgroundColor: bgCol }}>
                    <img
                      src={photoUrl}
                      alt={exec.full_name || exec.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Name / Position Card Block */}
                  <div className="p-3 sm:p-4.5 text-center flex flex-col justify-between flex-grow bg-white border-t border-gray-100">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#014900] transition-colors truncate">
                        {exec.full_name || exec.name}
                      </h3>
                      <p className="text-[11px] font-semibold text-[#D9A000] uppercase tracking-wider mt-0.5 truncate">
                        {exec.position}
                      </p>
                    </div>
                    
                    {/* Socials / Contacts */}
                    <div className="flex items-center justify-center gap-3 mt-3 pt-2.5 border-t border-gray-100">
                      {exec.email && (
                        <a href={`mailto:${exec.email}`} className="text-gray-400 hover:text-[#014900] transition-colors p-0.5" title="Email">
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {exec.phone && (
                        <a href={`tel:${exec.phone}`} className="text-gray-400 hover:text-[#014900] transition-colors p-0.5" title="Phone">
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <a href="#" className="text-gray-400 hover:text-[#014900] transition-colors p-0.5" title="Website">
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Join the Movement CTA Banner */}
      <UnionCtaBanner />
    </div>
    </ScrollAnimationProvider>
  );
}
