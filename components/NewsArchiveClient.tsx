'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { NewsItem } from '@/lib/newsData';

interface NewsArchiveClientProps {
  newsList: NewsItem[];
}

import { resolveImgUrl, formatDate, stripHtml } from '@/lib/imageUtils';

export default function NewsArchiveClient({ newsList }: NewsArchiveClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(newsList.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNewsSlice = newsList.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      const gridElem = document.getElementById('news-grid-start');
      if (gridElem) {
        gridElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  if (newsList.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-3xl border border-gray-200 shadow-sm max-w-lg mx-auto space-y-3 font-['Montserrat',sans-serif]">
        <div className="text-4xl">📰</div>
        <h3 className="text-lg font-black text-gray-900 uppercase">No News Articles Found</h3>
        <p className="text-xs text-gray-500 font-medium">
          There are currently no published news articles or press communiqués in the database.
        </p>
      </div>
    );
  }

  return (
    <div id="news-grid-start" className="space-y-12 font-['Montserrat',sans-serif]">
      {/* Cards Grid — Identical in details, cards, images, and dimensions to Homepage NewsSection */}
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
