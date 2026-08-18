'use me';
'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';

interface Opportunity {
  id?: number;
  title: string;
  type?: string;
  description?: string;
  location?: string;
  deadline?: any;
  link?: string;
  organization?: string;
}

const DEFAULT_OPPORTUNITIES: Opportunity[] = [
  {
    id: 1,
    title: 'AmaliTech Immersive Internship Programme (IIP)',
    type: 'SKILL_CAMP',
    description: 'An intensive training and internship program for STEM students (Computer Science, IT, Engineering) focused on software development, cloud computing, a...',
    location: 'Takoradi / Accra (Virtual options available)',
    link: '/scholarships',
  },
  {
    id: 2,
    title: 'MEST Africa-Mastercard Foundation EdTech Fellowship 2026',
    type: 'SKILL_CAMP',
    description: 'This program provides acceleration support and funding for edtech startups and young entrepreneurs. It offers equity-free funding and intensive busine...',
    location: 'Accra (East Legon)',
    link: '/scholarships',
  },
  {
    id: 3,
    title: 'Next Generation Resource Governance Leaders Program',
    type: 'INTERNSHIP',
    description: 'A specialized program by the Africa Centre for Energy Policy (ACEP) for young Africans to gain hands-on experience in oil and gas, mining, and energy ...',
    location: 'Accra, Ghana',
    link: '/scholarships',
  },
];

export default function OpportunitiesSection({ dbOpportunities = [] }: { dbOpportunities?: Opportunity[] }) {
  const opportunities = dbOpportunities.length > 0 ? dbOpportunities : DEFAULT_OPPORTUNITIES;

  return (
    <section className="py-16 sm:py-20 bg-[#f8f9fa] border-b border-gray-200" id="opportunities-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header — matched 1:1 to PHP screenshot */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-3">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#014900] tracking-tight">Opportunities</h2>
            <div className="w-12 h-1 bg-[#014900] rounded-full my-2.5" />
            <p className="text-gray-400 text-sm sm:text-base font-medium">
              Internships, training programs, and competitions
            </p>
          </div>
          <Link
            href="/scholarships"
            className="inline-flex items-center gap-1 text-sm sm:text-base font-bold text-[#014900] hover:text-[#D9A000] transition-colors mt-2 md:mt-0"
          >
            View All →
          </Link>
        </div>

        {/* Cards Grid — 3 columns with gold top border matching screenshot 1:1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 reveal-on-scroll">
          {opportunities.slice(0, 3).map((opp, idx) => (
            <div
              key={opp.id || idx}
              className="bg-white rounded-2xl p-7 sm:p-8 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                {/* Gold Type Badge */}
                <div>
                  <span className="inline-block px-3 py-1 rounded-md bg-[#D9A000] text-white text-[11px] font-bold uppercase tracking-wider">
                    {(opp.type || 'OPPORTUNITY').replace(' ', '_').toUpperCase()}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 leading-snug">
                  {opp.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-4">
                  {opp.description}
                </p>
              </div>

              {/* Footer: Red Pin Location + Learn More Link */}
              <div className="pt-4 mt-6 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{opp.location || 'Ghana'}</span>
                </div>
                <div>
                  <a
                    href={opp.link || '/scholarships'}
                    className="text-sm font-bold text-[#014900] hover:text-[#D9A000] transition-colors inline-block"
                  >
                    Learn More →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
