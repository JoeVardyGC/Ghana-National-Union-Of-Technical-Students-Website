'use client';

import { useState, useMemo } from 'react';
import { 
  Images, 
  SlidersHorizontal, 
  Sparkles, 
  ShieldCheck, 
  Maximize2,
  X
} from 'lucide-react';
import { resolveImgUrl } from '@/lib/imageUtils';

export interface GalleryItem {
  id: number;
  title: string;
  category: 'LEADERSHIP' | 'CONGRESS' | 'PROJECTS' | 'ACTIVITIES' | string;
  image: string;
  tenure_or_date?: string;
  tenureOrDate?: string;
  role_or_badge?: string;
  roleOrBadge?: string;
  description?: string;
  display_order?: number;
}

const CATEGORIES = [
  { id: 'ALL', label: 'All Media' },
  { id: 'LEADERSHIP', label: 'Executive Leadership' },
  { id: 'CONGRESS', label: 'National Congress' },
  { id: 'PROJECTS', label: 'Student Innovations' },
  { id: 'ACTIVITIES', label: 'Union Activities' },
];

export default function GalleryClient({ initialItems }: { initialItems?: GalleryItem[] }) {
  // Photos are loaded on the server (app/gallery/page.tsx); no second load in the browser
  const items = useMemo(() => initialItems ?? [], [initialItems]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeLightboxItem, setActiveLightboxItem] = useState<GalleryItem | null>(null);

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) => selectedCategory === 'ALL' || (item.category || '').toUpperCase() === selectedCategory
      ),
    [items, selectedCategory]
  );

  // Nothing uploaded yet: a friendly placeholder instead of an empty filter bar
  if (items.length === 0) {
    return (
      <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16 px-6 bg-white rounded-3xl border border-gray-200 shadow-sm max-w-md mx-auto space-y-3">
          <Images className="w-12 h-12 text-[#014900] mx-auto opacity-40" />
          <h2 className="text-lg font-extrabold text-gray-900">Photos coming soon</h2>
          <p className="text-sm text-gray-600">
            Photos from National Congresses, leadership and union activities will appear here shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">

      {/* 1. CATEGORY FILTER BAR */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/90 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto touch-pan-x w-full md:w-auto pb-1 md:pb-0 no-scrollbar scrollbar-none -mx-1 px-1 sm:mx-0 sm:px-0">
            <SlidersHorizontal className="w-4 h-4 text-[#014900] shrink-0 hidden sm:block" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 hidden sm:block">Category:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-xs font-extrabold rounded-2xl uppercase tracking-wider whitespace-nowrap transition-all border cursor-pointer shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-[#014900] text-white border-[#014900] shadow-sm font-extrabold'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* 2. GALLERY GRID SECTION */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white rounded-3xl border border-gray-200 shadow-sm max-w-md mx-auto space-y-3">
          <Sparkles className="w-12 h-12 text-[#014900] mx-auto opacity-40" />
          <h3 className="text-lg font-extrabold text-gray-900">No photos in this category yet</h3>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className="px-5 py-2.5 bg-[#014900] hover:bg-[#D9A000] text-white hover:text-[#014900] text-xs font-extrabold uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
          >
            Show all photos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => {
            const resolvedImg = resolveImgUrl(item.image);

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl shadow-md hover:shadow-2xl border border-gray-200/90 hover:border-[#014900]/40 flex flex-col justify-between transition-all duration-300 group overflow-hidden"
              >
                <div>
                  {/* Photo Container with Zoom Overlay & Tall Portrait Height */}
                  <div 
                    onClick={() => setActiveLightboxItem(item)}
                    className="relative w-full h-80 sm:h-96 lg:h-[380px] bg-gray-900 overflow-hidden cursor-pointer group/img shrink-0 rounded-t-3xl"
                  >
                    <img
                      src={resolvedImg}
                      alt={`${item.title} | GNUTS`}
                      className="w-full h-full object-cover object-top group-hover/img:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Dark Gradient Overlay for Contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-80 group-hover/img:opacity-60 transition-opacity" />

                    {/* Zoom Icon Hint on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-[#D9A000] text-[#014900] flex items-center justify-center shadow-xl transform scale-75 group-hover/img:scale-100 transition-transform duration-300">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Bottom Gold Accent Bar */}
                    <div className="absolute bottom-0 inset-x-0 h-1.5 bg-[#D9A000]" />
                  </div>

                  {/* Text Details & Category */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#014900]" />
                      <span className="text-xs font-extrabold uppercase tracking-widest text-[#014900]">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-gray-900 group-hover:text-[#014900] transition-colors leading-snug">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-gray-600 font-normal leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => setActiveLightboxItem(item)}
                    className="w-full py-2.5 px-4 bg-gray-50 hover:bg-[#014900] text-gray-700 hover:text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 border border-gray-200 hover:border-[#014900] cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>View High Resolution</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 3. LIGHTBOX PREVIEW MODAL */}
      {activeLightboxItem && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setActiveLightboxItem(null)}
        >
          <div 
            className="relative bg-white max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl space-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#014900] text-white border-b border-[#013300]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D9A000]" />
                <span className="text-xs font-extrabold uppercase tracking-wider">GNUTS Legacy & Leadership Archive</span>
              </div>
              <button
                onClick={() => setActiveLightboxItem(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-Res Photo View */}
            <div className="relative w-full max-h-[60vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={resolveImgUrl(activeLightboxItem.image)}
                alt={activeLightboxItem.title}
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>

            {/* Photo Details Footer */}
            <div className="p-6 space-y-3 bg-white">
              <h3 className="text-lg font-extrabold text-gray-900">
                {activeLightboxItem.title}
              </h3>

              {activeLightboxItem.description && (
                <p className="text-xs text-gray-600 leading-relaxed font-normal">
                  {activeLightboxItem.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
