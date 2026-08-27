'use client';

import Link from 'next/link';
import { Building2, User, ArrowRight, Zap } from 'lucide-react';
import { resolveImgUrl } from '@/lib/imageUtils';

export interface InnovationItem {
  id?: number;
  title: string;
  description?: string;
  project_image?: string;
  video_url?: string;
  institution?: string;
  student_name?: string;
  category?: string;
  created_at?: any;
  status?: string;
}

export default function InnovationsSection({ dbInnovations = [] }: { dbInnovations?: InnovationItem[] }) {
  // Display 3 innovation cards on homepage
  const innovations = dbInnovations.slice(0, 3);

  return (
    <section className="py-10 sm:py-16 lg:py-24 bg-white border-b border-gray-200 font-['Montserrat',sans-serif]" id="innovations-section">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#014900] tracking-tight uppercase">
              Student&apos;s Innovations
            </h2>
            <div className="w-16 h-1.5 bg-[#D9A000] rounded-full my-2.5 sm:my-3" />
            <p className="text-gray-500 text-xs sm:text-sm lg:text-base font-medium">
              Groundbreaking technical solutions and engineering projects created by Technical University students
            </p>
          </div>

          <Link
            href="/innovations"
            className="inline-flex items-center gap-1 text-xs sm:text-sm lg:text-base font-black uppercase text-[#014900] hover:text-[#D9A000] transition-colors mt-1 md:mt-0"
          >
            All Innovations →
          </Link>
        </div>

        {innovations.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm max-w-xl mx-auto">
            <div className="text-4xl mb-3">💡</div>
            <p className="text-gray-500 font-medium text-xs sm:text-sm">
              Student innovative projects directory is currently being updated. Check back soon for new student prototypes.
            </p>
          </div>
        ) : (
          /* Cards Grid — 3 innovation cards */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 reveal-on-scroll">
            {innovations.map((item, idx) => {
              const imgUrl = resolveImgUrl(item.project_image);
              const isGold = idx % 2 === 0;

              return (
                <Link
                  key={item.id || idx}
                  href={`/innovations/${item.id || idx + 1}`}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer min-w-0 w-full"
                >
                  <div className="min-w-0">
                    {/* Project Image Banner with Top Rounded Corners */}
                    <div className="relative w-full h-48 sm:h-56 md:h-60 bg-gray-900 overflow-hidden flex items-center justify-center rounded-t-2xl sm:rounded-t-3xl shrink-0">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <Zap className="w-12 h-12 text-white/40" />
                      )}

                      {/* Gold Accent Bar */}
                      <div className="absolute bottom-0 inset-x-0 h-1.5 bg-[#D9A000] z-10" />

                      {/* Category Badge Floating on Image */}
                      <div className="absolute top-3 left-3 z-20">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-lg backdrop-blur-md border border-white/20 ${
                          isGold ? 'bg-[#D9A000]/90' : 'bg-[#014900]/90'
                        }`}>
                          {item.category || 'Innovation'}
                        </span>
                      </div>
                    </div>

                    {/* Content Block */}
                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 min-w-0">
                      {/* Meta Tags: Institution & Student Developer */}
                      <div className="space-y-1.5 text-xs text-gray-500 font-semibold border-b border-gray-100 pb-3 min-w-0">
                        {item.institution && (
                          <div className="flex items-center gap-1.5 text-gray-800 font-bold min-w-0">
                            <Building2 className={`w-3.5 h-3.5 shrink-0 ${isGold ? 'text-[#D9A000]' : 'text-[#014900]'}`} />
                            <span className="truncate text-[11px] sm:text-xs">{item.institution}</span>
                          </div>
                        )}
                        {item.student_name && (
                          <div className="flex items-center gap-1.5 text-gray-500 min-w-0">
                            <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate text-[11px] sm:text-xs">Developer: {item.student_name}</span>
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className={`text-base sm:text-lg lg:text-xl font-black text-gray-900 leading-snug transition-colors uppercase break-words line-clamp-2 ${
                        isGold ? 'group-hover:text-[#D9A000]' : 'group-hover:text-[#014900]'
                      }`}>
                        {item.title}
                      </h3>

                      {/* Description Excerpt */}
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3 font-normal break-words">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer Action Button */}
                  <div className="p-4 sm:p-6 pt-0">
                    <span className={`inline-flex items-center justify-center w-full px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-black uppercase tracking-wider rounded-xl sm:rounded-2xl transition-all duration-300 shadow-xs ${
                      isGold
                        ? 'bg-[#D9A000] group-hover:bg-yellow-600 text-white'
                        : 'bg-[#014900] group-hover:bg-[#003300] text-white'
                    }`}>
                      <span className="inline-flex items-center gap-2">
                        <span>Explore Project</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
