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

const DEFAULT_OPPORTUNITIES: Opportunity[] = [];

export default function OpportunitiesSection({ dbOpportunities = [] }: { dbOpportunities?: Opportunity[] }) {
  const opportunities = dbOpportunities;

  return (
    <section className="py-10 sm:py-16 lg:py-24 bg-[#f8f9fa] border-b border-gray-200 font-['Montserrat',sans-serif]" id="opportunities-section">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#014900] tracking-tight uppercase">Opportunities</h2>
            <div className="w-16 h-1.5 bg-[#D9A000] rounded-full my-2.5 sm:my-3" />
            <p className="text-gray-500 text-xs sm:text-sm lg:text-base font-medium">
              Internships, training programs, and competitions
            </p>
          </div>
          <Link
            href="/scholarships"
            className="inline-flex items-center gap-1 text-xs sm:text-sm lg:text-base font-black uppercase text-[#014900] hover:text-[#D9A000] transition-colors mt-1 md:mt-0"
          >
            View All →
          </Link>
        </div>

        {opportunities.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm max-w-xl mx-auto">
            <div className="text-4xl mb-3">💼</div>
            <p className="text-gray-500 font-medium text-xs sm:text-sm">
              No active student opportunities or attachments available at the moment. Check back soon.
            </p>
          </div>
        ) : (
          /* Cards Grid — 3 columns with rounded-2xl sm:rounded-3xl and curved badges */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 reveal-on-scroll">
          {opportunities.slice(0, 3).map((opp, idx) => {
            const isGold = idx % 2 === 1;
            return (
              <div
                key={opp.id || idx}
                className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 shadow-md border border-gray-200/90 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 min-w-0 w-full"
              >
                <div className="space-y-3 sm:space-y-4 min-w-0">
                  {/* Type Badge */}
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs ${
                      isGold ? 'bg-[#D9A000] text-white' : 'bg-[#014900] text-white'
                    }`}>
                      {(opp.type || 'OPPORTUNITY').replace(' ', '_').toUpperCase()}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-['Montserrat'] font-black text-base sm:text-lg lg:text-xl text-gray-900 leading-snug group-hover:text-[#014900] transition-colors break-words">
                    {opp.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium line-clamp-4 break-words">
                    {opp.description}
                  </p>
                </div>

                {/* Footer: Red Pin Location + Learn More Link */}
                <div className="pt-3 sm:pt-4 mt-4 sm:mt-6 border-t border-gray-100 space-y-2.5 sm:space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="truncate">{opp.location || 'Takoradi / Accra'}</span>
                  </div>
                  <div>
                    <Link
                      href={opp.link || '/scholarships'}
                      className="text-xs font-black uppercase tracking-wider text-[#014900] hover:text-[#D9A000] transition-colors inline-flex items-center gap-1"
                    >
                      Learn More →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
}
