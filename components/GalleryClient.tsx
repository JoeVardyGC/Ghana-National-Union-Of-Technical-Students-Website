'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  Images, 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Maximize2,
  X, 
  Award,
  Layers,
  RefreshCw
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

const DEFAULT_GALLERY_DATA: GalleryItem[] = [
  {
    id: 1,
    title: 'H.E. Isaac Mensah & Leadership Executives',
    category: 'LEADERSHIP',
    image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991593/photo_2026-08-17_18-24-49_bg2c1g.jpg',
    tenure_or_date: '2025/2026 Administration',
    role_or_badge: 'National President & Council',
    description: 'The National Executive Council presiding over union advocacy and strategic initiatives for technical students.'
  },
  {
    id: 2,
    title: 'National TVET Policy & Advocacy Summit',
    category: 'ACTIVITIES',
    image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991595/photo_2026-08-17_18-24-46_w6zphs.jpg',
    tenure_or_date: 'March 2025',
    role_or_badge: 'Advocacy & Policy',
    description: 'Delegates and student representatives engaging national education stakeholders on TVET infrastructure and bursaries.'
  },
  {
    id: 3,
    title: 'Student Engineering & Prototype Exhibition',
    category: 'PROJECTS',
    image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991595/photo_2026-08-17_18-24-43_hkzlai.jpg',
    tenure_or_date: 'November 2024',
    role_or_badge: 'Technical Innovation',
    description: 'Technical University student innovators unveiling automated agricultural hardware and solar technologies.'
  },
  {
    id: 4,
    title: '34th National Delegates Congress - Inauguration',
    category: 'CONGRESS',
    image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg',
    tenure_or_date: 'Annual National Congress',
    role_or_badge: 'National Congress',
    description: 'Official swearing-in ceremony and constitutional proceedings of elected national union officers.'
  },
  {
    id: 5,
    title: 'National Women in TVET Leadership Seminar',
    category: 'ACTIVITIES',
    image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991593/photo_2026-08-17_18-24-49_bg2c1g.jpg',
    tenure_or_date: 'February 2025',
    role_or_badge: 'Women Commissioner Desk',
    description: 'Empowering female technical scholars and engineering innovators across member universities.'
  },
  {
    id: 6,
    title: 'Technical University Campus Tour & Engagement',
    category: 'LEADERSHIP',
    image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991595/photo_2026-08-17_18-24-46_w6zphs.jpg',
    tenure_or_date: '2024/2025 Tour',
    role_or_badge: 'Campus Outreach',
    description: 'Direct consultation sessions with student body leaders on academic affairs and welfare.'
  }
];

const CATEGORIES = [
  { id: 'ALL', label: 'All Media' },
  { id: 'LEADERSHIP', label: 'Executive Leadership' },
  { id: 'CONGRESS', label: 'National Congress' },
  { id: 'PROJECTS', label: 'Student Innovations' },
  { id: 'ACTIVITIES', label: 'Union Activities' },
];

export default function GalleryClient({ initialItems }: { initialItems?: GalleryItem[] }) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems !== undefined ? initialItems : []);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLightboxItem, setActiveLightboxItem] = useState<GalleryItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchGallery() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/admin/gallery', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.gallery && Array.isArray(data.gallery)) {
            setItems(data.gallery);
          }
        }
      } catch (err) {
        console.error('Error fetching gallery items:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGallery();
  }, []);

  // Filtered gallery results
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const itemCat = (item.category || '').toUpperCase();
      const matchesCat = selectedCategory === 'ALL' || itemCat === selectedCategory;
      const q = searchQuery.toLowerCase();
      const role = (item.role_or_badge || item.roleOrBadge || '').toLowerCase();
      const tenure = (item.tenure_or_date || item.tenureOrDate || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const matchesSearch = 
        item.title.toLowerCase().includes(q) ||
        role.includes(q) ||
        tenure.includes(q) ||
        desc.includes(q);
      
      return matchesCat && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  return (
    <div className="py-8 sm:py-12 space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* 1. FILTER & SEARCH CONTROL BAR */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/90 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Live Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search leaders, congresses, or institutions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-xs font-medium text-gray-900 focus:bg-white focus:border-[#014900] focus:ring-2 focus:ring-[#014900]/20 outline-none transition-all rounded-2xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

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
                    ? 'bg-[#014900] text-white border-[#014900] shadow-sm font-black'
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
          <h3 className="text-lg font-extrabold text-gray-900 uppercase">No Media Found</h3>
          <p className="text-xs text-gray-500 font-medium">
            We couldn't find any gallery records matching your search query.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
            className="px-5 py-2.5 bg-[#014900] hover:bg-[#D9A000] text-white hover:text-[#014900] text-xs font-extrabold uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => {
            const role = item.role_or_badge || item.roleOrBadge || 'Union Archive';
            const tenure = item.tenure_or_date || item.tenureOrDate || 'Archive Record';
            const resolvedImg = resolveImgUrl(item.image);

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl shadow-md hover:shadow-2xl border border-gray-200/90 hover:border-[#014900]/40 flex flex-col justify-between transition-all duration-300 group overflow-hidden hover:-translate-y-1.5"
              >
                <div>
                  {/* Photo Container with Zoom Overlay & Tall Portrait Height */}
                  <div 
                    onClick={() => setActiveLightboxItem(item)}
                    className="relative w-full h-80 sm:h-96 lg:h-[380px] bg-gray-900 overflow-hidden cursor-pointer group/img shrink-0 rounded-t-3xl"
                  >
                    <img
                      src={resolvedImg}
                      alt={item.title}
                      className="w-full h-full object-cover object-top group-hover/img:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Dark Gradient Overlay for Contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-80 group-hover/img:opacity-60 transition-opacity" />

                    {/* Badge Pill Header */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                      <span className="px-3 py-1 rounded-full bg-[#014900]/90 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider border border-white/20 shadow-sm">
                        {role}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-gray-200 text-[10px] font-bold flex items-center gap-1 border border-white/10">
                        <Calendar className="w-3 h-3 text-[#D9A000]" />
                        {tenure}
                      </span>
                    </div>

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
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#014900]">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-gray-900 group-hover:text-[#014900] transition-colors leading-snug uppercase">
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
                    className="w-full py-2.5 px-4 bg-gray-50 hover:bg-[#014900] text-gray-700 hover:text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 border border-gray-200 hover:border-[#014900] cursor-pointer"
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
                <span className="text-xs font-black uppercase tracking-wider">GNUTS Legacy & Leadership Archive</span>
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
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <span className="px-3 py-1 bg-[#D9A000] text-white text-[10px] font-black uppercase tracking-wider rounded-full">
                  {activeLightboxItem.role_or_badge || activeLightboxItem.roleOrBadge || 'Union Archive'}
                </span>
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#014900]" />
                  {activeLightboxItem.tenure_or_date || activeLightboxItem.tenureOrDate || 'Archive Record'}
                </span>
              </div>

              <h3 className="text-lg font-extrabold text-gray-900 uppercase">
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
