'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, ChevronLeft, ChevronRight, Search, X, SlidersHorizontal, Sparkles } from 'lucide-react';
import { NewsItem } from '@/lib/newsData';
import { resolveImgUrl, formatDate, stripHtml } from '@/lib/imageUtils';

interface NewsArchiveClientProps {
  newsList: NewsItem[];
}

const NEWS_CATEGORIES = [
  { id: 'ALL', label: 'All Releases' },
  { id: 'COMMUNIQUE', label: 'Communiqués' },
  { id: 'PRESS', label: 'Press Releases' },
  { id: 'POLICY', label: 'TVET Policy' },
  { id: 'CONGRESS', label: 'Congress' },
];

export default function NewsArchiveClient({ newsList }: NewsArchiveClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredNews = useMemo(() => {
    return newsList.filter((item) => {
      const q = searchQuery.toLowerCase();
      const title = (item.title || '').toLowerCase();
      const content = (item.content || '').toLowerCase();
      const author = (item.author || '').toLowerCase();
      const cat = (item.category || '').toUpperCase();

      const matchesSearch = title.includes(q) || content.includes(q) || author.includes(q);

      let matchesCat = true;
      if (selectedCategory !== 'ALL') {
        if (selectedCategory === 'COMMUNIQUE') {
          matchesCat = cat.includes('COMMUNIQUE') || title.includes('COMMUNIQUÉ') || title.includes('COMMUNIQUE');
        } else if (selectedCategory === 'PRESS') {
          matchesCat = cat.includes('PRESS') || title.includes('PRESS');
        } else if (selectedCategory === 'POLICY') {
          matchesCat = cat.includes('POLICY') || title.includes('POLICY') || content.includes('TVET');
        } else if (selectedCategory === 'CONGRESS') {
          matchesCat = cat.includes('CONGRESS') || title.includes('CONGRESS');
        }
      }

      return matchesSearch && matchesCat;
    });
  }, [newsList, searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNewsSlice = filteredNews.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      const gridElem = document.getElementById('news-grid-start');
      if (gridElem) {
        gridElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div id="news-grid-start" className="space-y-10 font-['Montserrat',sans-serif]">
      
      {/* 1. Responsive Search & Category Filter Toolbar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Box */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search news, statements, authors..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-medium outline-none focus:border-[#014900] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Chips with Horizontal Mobile Swipe */}
        <div className="flex items-center gap-2 overflow-x-auto touch-pan-x w-full md:w-auto pb-1 md:pb-0 no-scrollbar scrollbar-none">
          {NEWS_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#014900] text-white shadow-md font-black'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {filteredNews.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white rounded-3xl border border-gray-200 shadow-sm max-w-lg mx-auto space-y-3">
          <div className="text-4xl">📰</div>
          <h3 className="text-lg font-black text-gray-900 uppercase">No Articles Found</h3>
          <p className="text-xs text-gray-500 font-medium">
            {searchQuery || selectedCategory !== 'ALL'
              ? `No releases found matching "${searchQuery || selectedCategory}". Try clearing your filters.`
              : 'There are currently no published news articles in the database.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentNewsSlice.map((item, idx) => {
          const cleanContent = stripHtml(item.content || '');
          const imgUrl = resolveImgUrl(item.image);
          const authorName = item.author || 'GNUTS Secretariat';

          return (
            <Link
              key={item.id || idx}
              href={`/blog/${item.id}`}
              className="bg-white rounded-3xl border border-gray-200/90 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer h-full"
            >
              {/* Poster Flyer Container — Tall generous height matching Home page */}
              <div className="w-full h-80 sm:h-[400px] lg:h-[440px] relative overflow-hidden bg-gray-900 shrink-0 rounded-t-3xl">
                <img
                  src={imgUrl}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  onError={(e: any) => {
                    e.currentTarget.src = 'https://res.cloudinary.com/dslngzls6/image/upload/v1787056250/gnuts_cc_tech-GUEST_jt8cge.png';
                  }}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                {/* Gold Accent Bar */}
                <div className="absolute bottom-0 inset-x-0 h-1.5 bg-[#D9A000] z-20" />
              </div>

              {/* Content Section */}
              <div className="p-6 sm:p-7 flex flex-col justify-between flex-grow rounded-b-3xl">
                <div className="space-y-3.5">
                  <h3 className="font-black text-lg sm:text-xl text-gray-900 leading-snug uppercase group-hover:text-[#014900] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-medium line-clamp-4 sm:line-clamp-5">
                    {cleanContent}
                  </p>
                  <div className="pt-2">
                    <span className="text-[#D9A000] font-black text-xs uppercase tracking-wider group-hover:underline group-hover:text-[#014900] transition-colors inline-block">
                      READ MORE »
                    </span>
                  </div>
                </div>

                {/* Bottom Footer Date & Author Bar */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span>{formatDate(item.published_at)}</span>
                  <span>•</span>
                  <span>{authorName}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    )}

      {/* Pagination Controls Bar */}
      {totalPages > 1 && (
        <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-500 font-medium">
            Showing <strong className="text-gray-900">{startIndex + 1}</strong> to <strong className="text-gray-900">{Math.min(endIndex, newsList.length)}</strong> of <strong className="text-gray-900">{newsList.length}</strong> news articles
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-4 py-2 text-xs font-extrabold uppercase rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Page Number Tabs */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 flex items-center justify-center text-xs font-extrabold rounded-xl border transition-all ${
                    isActive
                      ? 'bg-[#014900] text-white border-[#014900] shadow-md scale-105'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[#014900] hover:text-[#014900]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 px-4 py-2 text-xs font-extrabold uppercase rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
