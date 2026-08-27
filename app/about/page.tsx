import Link from 'next/link';
import { query } from '@/lib/db';
import ScrollAnimationProvider from '@/components/ScrollAnimationProvider';
import ResourcesSection from '@/components/ResourcesSection';
import { resolveImgUrl } from '@/lib/imageUtils';
import { 
  Target, 
  Eye, 
  ShieldCheck, 
  Mail, 
  Phone, 
  CheckCircle2,
  Award,
  Sparkles,
  Users,
  Globe,
  Scale
} from 'lucide-react';


// Exact fallback milestones matching pages/about.php and gnuts database
const DEFAULT_MILESTONES = [
  {
    year: '1987',
    title: 'Establishment of GNUPS',
    description: 'The Ghana National Union of Polytechnic Students (GNUPS) was established after technical students broke away from the National Union of Ghana Students (NUGS). This decision was driven by concerns of marginalization and the need for a dedicated national body to represent the unique academic, professional, and welfare interests of polytechnic students across Ghana.',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
    tag: 'UNION FOUNDING',
  },
  {
    year: '2000',
    title: 'The Tamale Declaration',
    description: 'GNUPS was formally operationalized at a national congress held in Tamale, where its first constitution was adopted. This historic congress, widely referred to as the Tamale Declaration, provided a legal and administrative framework for the Union and strengthened its legitimacy as the recognized voice of polytechnic students nationwide.',
    image: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=800&auto=format&fit=crop',
    tag: 'CONSTITUTIONAL CHARTER',
  },
  {
    year: '2016',
    title: 'Transition from GNUPS to GNUTS',
    description: 'Following the Government of Ghana’s conversion of polytechnics into technical universities, GNUPS was rebranded as the Ghana National Union of Technical Students (GNUTS). The change reflected the evolving identity of technical students and was ratified at the First Central Committee and Mini Congress held at Tamale Technical University from December 1–4, 2016.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop',
    tag: 'HISTORIC REBRANDING',
  },
  {
    year: '2017',
    title: 'Public Recognition and Rebranding',
    description: 'GNUTS issued official press statements to announce and affirm its new identity. The Union emphasized legal compliance, institutional continuity, and urged stakeholders, media organizations, and the general public to recognize GNUTS as the legitimate national representative body of technical university students.',
    image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787056252/choose_tvet_first_kwucvy.png',
    tag: 'NATIONAL RECOGNITION',
  },
];

// Fallback resources matching pages/about.php
const DEFAULT_RESOURCES = [
  {
    id: 1,
    title: 'GNUTS Supreme Constitution',
    category: 'CONSTITUTION',
    description: 'The supreme governing constitution of the Ghana National Union of Technical Students, detailing fundamental student rights, electoral guidelines, and union governance.',
    file_name: 'GNUTS_Supreme_Constitution.pdf',
    file_size: 2450000,
    created_at: '2024-01-15',
    file_path: 'uploads/resources/gnuts_constitution.pdf',
  },
  {
    id: 2,
    title: '34th CC Communiqué & Policy Resolution',
    category: 'POLICY BRIEF',
    description: 'Official policy resolutions passed at the 34th Central Committee meeting regarding industrial attachment allowances and TVET lab funding.',
    file_name: 'GNUTS_34th_CC_Communique.pdf',
    file_size: 1820000,
    created_at: '2026-05-10',
    file_path: 'uploads/resources/communique_2026.pdf',
  },
  {
    id: 3,
    title: 'Industrial Attachment Policy & Safety Guide',
    category: 'GUIDELINES',
    description: 'National framework outlining practical training standards, occupational safety regulations, and stipend entitlements for technical students.',
    file_name: 'Industrial_Attachment_Framework.pdf',
    file_size: 1420000,
    created_at: '2025-11-20',
    file_path: 'uploads/resources/attachment_guide.pdf',
  },
];

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AboutPage() {
  // Fetch dynamic data in parallel from MariaDB for maximum server performance
  const [
    aboutDataResult,
    milestonesResult,
    executivesResult,
    resourcesResult,
    aboutHeroResult
  ] = await Promise.all([
    query('SELECT * FROM about_page WHERE id=1').catch(() => []),
    query('SELECT * FROM history_milestones ORDER BY year ASC, display_order ASC').catch(() => []),
    query('SELECT * FROM executives ORDER BY display_order ASC, created_at DESC LIMIT 12').catch(() => []),
    query('SELECT * FROM resources ORDER BY display_order ASC, created_at DESC').catch(() => []),
    query('SELECT * FROM hero_banners WHERE page_key = "about_hero"').catch(() => []),
  ]);

  const aboutData = aboutDataResult[0] || {};
  const milestones = milestonesResult;
  const executives = executivesResult;
  const resources = resourcesResult;
  const designatedHero = aboutHeroResult[0]?.image_url;
  const heroImage = resolveImgUrl(designatedHero || aboutData.hero_image || 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg');

  let coreValues = [
    { title: 'Integrity', desc: 'Upholding honesty, transparency, and ethical leadership in all union activities.', num: '01' },
    { title: 'Professionalism', desc: 'Conducting our affairs with discipline, competence, and respect.', num: '02' },
    { title: 'Accountability', desc: 'Being responsible to our members and stakeholders at all levels.', num: '03' },
    { title: 'Inclusiveness', desc: 'Ensuring equal representation and participation of all technical students, regardless of background or gender.', num: '04' },
    { title: 'Innovation', desc: 'Embracing creativity and digital solutions to enhance engagement and advocacy.', num: '05' },
    { title: 'Unity', desc: 'Strengthening solidarity among technical institutions to speak with one national voice.', num: '06' },
  ];

  if (aboutData.values_json) {
    try {
      const parsed = typeof aboutData.values_json === 'string' ? JSON.parse(aboutData.values_json) : aboutData.values_json;
      if (Array.isArray(parsed) && parsed.length > 0) {
        coreValues = parsed;
      }
    } catch {}
  }

  const valueIcons = [
    <ShieldCheck key="1" className="w-6 h-6" />,
    <Award key="2" className="w-6 h-6" />,
    <Scale key="3" className="w-6 h-6" />,
    <Users key="4" className="w-6 h-6" />,
    <Sparkles key="5" className="w-6 h-6" />,
    <Globe key="6" className="w-6 h-6" />,
  ];

  return (
    <ScrollAnimationProvider>
      <div className="w-full min-h-screen bg-[#f8f9fa] font-sans text-gray-900 overflow-x-hidden">
        
        {/* Page Hero Header — Connected to live DB hero image, title and subtitle */}
        <section className="relative text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b-4 border-[#D9A000] overflow-hidden bg-gray-900">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('${heroImage}')`,
            }}
          />
          {/* Semi-transparent Green Overlay (50% Green Opacity) */}
          <div className="absolute inset-0 bg-[#014900]/50 backdrop-brightness-90" />

          <div className="max-w-7xl mx-auto text-center relative z-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3 drop-shadow-md font-montserrat">
              {aboutData.hero_title || 'About GNUTS'}
            </h1>
            <p className="text-gray-100 text-sm sm:text-base max-w-2xl mx-auto font-medium drop-shadow-sm font-montserrat">
              {aboutData.hero_subtitle || 'Empowering Technical & TVET Students Across Ghana'}
            </p>
          </div>
        </section>

        {/* 2. Who We Are — Premium Split Bento Section */}
        <section id="who-we-are" className="py-20 sm:py-28 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Narrative Content */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#014900] tracking-tight font-montserrat uppercase">
                    {aboutData.who_we_are_title || 'Who We Are'}
                  </h2>
                  <div className="w-16 h-1.5 bg-[#D9A000] rounded-full my-3" />
                </div>

                <div className="prose text-gray-700 text-base sm:text-lg leading-relaxed space-y-4 font-montserrat">
                  <p className="font-semibold text-[#014900]">
                    The Ghana National Union of Technical Students (GNUTS) is the sole democratic, non-partisan representative council for all technical and vocational education students across Ghana.
                  </p>
                  <p className="whitespace-pre-line">
                    {aboutData.who_we_are_content || `From advocating for industrial training allowances and modern laboratory equipment to participating in national education policy reform, GNUTS empowers technical students to become skilled engineers, tech pioneers, and industrial leaders.`}
                  </p>
                </div>

                {/* Key Pillars Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="p-4 rounded-xl bg-[#f8f9fa] border border-gray-200 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#D9A000] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-sm text-[#014900]">Policy & Legal Advocacy</h4>
                      <p className="text-xs text-gray-600 font-medium mt-0.5">Defending technical student rights in Parliament and Ministry of Education.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#f8f9fa] border border-gray-200 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#014900] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-sm text-[#014900]">Industrial Attachment</h4>
                      <p className="text-xs text-gray-600 font-medium mt-0.5">Securing practical industry placements & stipends for students.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Visual Graphic */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-gray-900 group">
                  <img
                    src={aboutData.who_we_are_image || aboutData.about_image || "https://res.cloudinary.com/dslngzls6/image/upload/v1786991593/photo_2026-08-17_18-24-49_bg2c1g.jpg"}
                    alt="GNUTS Delegation"
                    className="w-full h-[450px] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                    <h3 className="font-extrabold text-xl text-white leading-snug">
                      Uniting Ghana's Technical Universities Under One Flag
                    </h3>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 4. Mission, Vision & Core Values — Sleek Bento Grid */}
        <section id="mission" className="py-20 sm:py-28 bg-[#f8f9fa] border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#014900] tracking-tight font-montserrat uppercase">
                Mission, Vision & Core Values
              </h2>
              <div className="w-16 h-1.5 bg-[#D9A000] rounded-full mx-auto my-3" />
            </div>

            {/* Mission & Vision 2-Card Bento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Mission */}
              <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-[#014900] transition-all">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#014900]" />
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#014900]/10 text-[#014900] flex items-center justify-center font-bold">
                    <Target className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#014900] font-montserrat">
                    {aboutData.mission_title || 'Our Mission'}
                  </h3>
                  <p className="text-gray-700 text-base leading-relaxed font-montserrat whitespace-pre-line">
                    {aboutData.mission_content || `To represent, unite, and empower technical students across Ghana by advocating for quality and inclusive technical education, promoting student welfare and leadership development, engaging stakeholders for national progress, and strengthening communication and participation within the union.\n\nGNUTS is committed to ensuring that the concerns, aspirations, and contributions of technical students are reflected in national educational policies and development frameworks.`}
                  </p>
                </div>
              </div>

              {/* Vision */}
              <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-200 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-[#D9A000] transition-all">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#D9A000]" />
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#D9A000]/15 text-[#014900] flex items-center justify-center font-bold">
                    <Eye className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#014900] font-montserrat">
                    {aboutData.vision_title || 'Our Vision'}
                  </h3>
                  <p className="text-gray-700 text-base leading-relaxed font-montserrat whitespace-pre-line">
                    {aboutData.vision_content || `To build a strong, credible, united, and nationally respected student union that effectively represents the collective interests of students in Technical Universities and Technical and Vocational Education and Training (TVET) institutions across Ghana; a union that champions excellence, innovation, professionalism, accountability, and integrity in technical education, actively influences national educational policies, promotes skills development and employability, and positions technical students as indispensable contributors to Ghana’s industrial growth, socio-economic transformation, and sustainable national development.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Core Values Section — Modern Institutional UI */}
            <div className="pt-10 space-y-10">
              <div className="text-center max-w-2xl mx-auto">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#014900] tracking-tight font-montserrat uppercase">
                  {aboutData.values_title || 'Our Core Values'}
                </h3>
                <div className="w-12 h-1 bg-[#D9A000] rounded-full mx-auto my-2.5" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {coreValues.map((val: any, idx: number) => {
                  const isGreen = idx % 2 === 0;
                  const icon = valueIcons[idx % valueIcons.length];
                  return (
                    <div
                      key={val.id || idx}
                      className="bg-white p-7 rounded-3xl border border-gray-200/80 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative group flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-colors ${
                            isGreen ? 'bg-[#014900]/10 text-[#014900] group-hover:bg-[#D9A000]/20' : 'bg-[#D9A000]/15 text-[#014900] group-hover:bg-[#014900]/10'
                          }`}>
                            {icon}
                          </div>
                          <div className={`w-9 h-9 rounded-md text-white flex items-center justify-center font-black text-xs shadow-md ${
                            isGreen ? 'bg-[#014900]' : 'bg-[#D9A000]'
                          }`}>
                            {val.num || `0${idx + 1}`}
                          </div>
                        </div>

                        <h4 className="font-extrabold text-xl text-[#014900] font-montserrat group-hover:text-[#D9A000] transition-colors pt-1">
                          {val.title}
                        </h4>

                        <p className="text-sm text-gray-700 font-medium leading-relaxed font-montserrat">
                          {val.desc || val.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </section>

        {/* 5. Union History Timeline — Interactive Animated Timeline */}
        <section id="history" className="py-20 sm:py-28 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#014900] tracking-tight font-montserrat uppercase">
                Union History Timeline
              </h2>
              <div className="w-16 h-1.5 bg-[#D9A000] rounded-full mx-auto my-3" />
              <p className="text-gray-600 text-sm sm:text-base font-medium">
                Three decades of national policy breakthroughs, student activism, and technical education reform.
              </p>
            </div>

            {/* Alternating Centered Vertical Timeline */}
            <div className="relative max-w-5xl mx-auto py-8">
              {/* Central Glowing Line */}
              <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#014900] via-[#D9A000] to-[#014900] sm:-translate-x-1/2" />

              <div className="space-y-16">
                {milestones.map((item: any, idx: number) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <div 
                      key={idx} 
                      className={`relative flex flex-col sm:flex-row items-center gap-8 ${
                        isEven ? 'sm:flex-row-reverse' : ''
                      }`}
                    >
                      {/* Year Badge Pill Center */}
                      <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 z-20 bg-[#D9A000] text-white px-5 py-2 rounded-full font-black text-base shadow-2xl border-4 border-white hover:scale-110 transition-transform">
                        {item.year}
                      </div>

                      {/* Content Card */}
                      <div className="w-full sm:w-1/2 pl-12 sm:pl-0 sm:pr-8 sm:odd:pl-8 sm:odd:pr-0">
                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 hover:border-[#014900] transition-all space-y-4 group">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                            <h3 className="text-xl font-extrabold text-[#014900] font-montserrat">
                              {item.title}
                            </h3>
                            {item.tag && (
                              <span className="text-[10px] font-black uppercase tracking-wider text-[#D9A000] bg-[#f8f9fa] px-2.5 py-1 rounded border border-gray-200 inline-block shrink-0">
                                {item.tag}
                              </span>
                            )}
                          </div>

                          <p className="text-gray-700 text-sm sm:text-base leading-relaxed font-montserrat">
                            {item.description}
                          </p>

                          {item.image && (
                            <div className="mt-4 rounded-xl overflow-hidden h-48 bg-gray-900 shadow border border-gray-100">
                              <img
                                src={item.image.startsWith('http') ? item.image : `/${item.image}`}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Empty Spacer Column for 2-column grid balance */}
                      <div className="hidden sm:block w-1/2" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 6. Executive Leadership — Executive Cards (Surpassing NUGS) */}
        <section id="leadership" className="py-20 sm:py-28 bg-[#f8f9fa] border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-6 mb-12 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#014900] tracking-tight font-['Montserrat',sans-serif] uppercase">
                  National Leadership
                </h2>
                <div className="w-16 h-1.5 bg-[#D9A000] rounded-full my-3" />
              </div>
              <p className="text-gray-600 text-sm font-medium">The 34th National Executive Council</p>
            </div>

            {/* Responsive Grid: 1 per row on Mobile, 2 on Tablet, 4 on Desktop */}
            {executives.length === 0 ? (
              <div className="text-center py-12 px-6 bg-white rounded-3xl border border-gray-200 shadow-sm max-w-xl mx-auto">
                <div className="text-4xl mb-3">👥</div>
                <p className="text-gray-500 font-medium text-sm">
                  National Executive Council directory is currently being updated. Check back soon.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 lg:gap-8">
                {executives.map((exec: any, idx: number) => {
                  const cardBgColors = ['#014900', '#013300', '#025202', '#012800'];
                  const bgCol = cardBgColors[idx % cardBgColors.length];
                  const photoUrl = resolveImgUrl(exec.photo || exec.image_url || exec.image);

                  return (
                    <div 
                      key={exec.id || idx}
                      className="group flex flex-col bg-white rounded-3xl border border-gray-200/90 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden max-w-[290px] mx-auto sm:max-w-none w-full"
                    >
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
                          <h4 className="text-base sm:text-sm lg:text-base font-black text-[#014900] group-hover:text-[#D9A000] transition-colors leading-snug">
                            {exec.full_name || exec.name}
                          </h4>
                          <p className="text-xs sm:text-[11px] lg:text-xs font-black text-[#D9A000] uppercase tracking-wider mt-1">
                            {exec.position}
                          </p>
                        </div>

                        {/* Socials / Contacts */}
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
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 7. Resources Section */}
        <ResourcesSection dbResources={resources} />

      </div>
    </ScrollAnimationProvider>
  );
}
