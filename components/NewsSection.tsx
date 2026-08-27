'use client';

import { useState } from 'react';
import Link from 'next/link';

interface NewsItem {
  id?: number;
  title: string;
  content?: string;
  image?: string;
  published_at?: any;
  author?: string;
}

import { resolveImgUrl, formatDate, stripHtml } from '@/lib/imageUtils';

export default function NewsSection({ dbNews = [] }: { dbNews?: NewsItem[] }) {
  // Display only 6 news cards on homepage & mobile view
  const newsList = dbNews.slice(0, 6);

  return (
    <section className="py-10 sm:py-16 lg:py-24 bg-[#f8f9fa] font-['Montserrat',sans-serif]" id="news-section">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#014900] tracking-tight uppercase">News & Events</h2>
            <div className="w-16 h-1.5 bg-[#D9A000] rounded-full my-2.5 sm:my-3" />
            <p className="text-gray-500 text-xs sm:text-sm lg:text-base font-medium">
              Latest announcements, statements, and national activities
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-xs sm:text-sm lg:text-base font-black uppercase text-[#014900] hover:text-[#D9A000] transition-colors mt-1 md:mt-0"
          >
            More News →
          </Link>
        </div>

        {newsList.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm max-w-xl mx-auto">
            <div className="text-4xl mb-3">📰</div>
            <p className="text-gray-500 font-medium text-xs sm:text-sm">
              No news or press releases published yet. Check back soon for official union updates.
            </p>
          </div>
        ) : (
          /* Cards Grid — 6 news cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 reveal-on-scroll">
          {newsList.map((item, idx) => {
            const cleanContent = stripHtml(item.content || '');
            const imgUrl = resolveImgUrl(item.image);
            const authorName = item.author || 'GNUTS Secretariat';

            return (
              <Link
                key={item.id || idx}
                href={`/blog/${item.id || idx + 1}`}
                className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer h-full min-w-0 w-full"
              >
                {/* Poster Flyer Container — Responsive height with top curved corners */}
                <div className="w-full h-64 sm:h-80 md:h-[380px] lg:h-[420px] relative overflow-hidden bg-gray-900 shrink-0 rounded-t-2xl sm:rounded-t-3xl">
                  <img
                    src={imgUrl}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Gold Accent Bar */}
                  <div className="absolute bottom-0 inset-x-0 h-1.5 bg-[#D9A000] z-20" />
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-6 lg:p-7 flex flex-col justify-between flex-grow rounded-b-2xl sm:rounded-b-3xl min-w-0">
                  <div className="space-y-2.5 sm:space-y-3.5 min-w-0">
                    <h3 className="font-black text-base sm:text-lg lg:text-xl text-gray-900 leading-snug uppercase group-hover:text-[#014900] transition-colors line-clamp-2 break-words">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-medium line-clamp-3 sm:line-clamp-4 break-words">
                      {cleanContent}
                    </p>
                    <div className="pt-1 sm:pt-2">
                      <span className="text-[#D9A000] font-black text-xs uppercase tracking-wider group-hover:underline group-hover:text-[#014900] transition-colors inline-block">
                        READ MORE »
                      </span>
                    </div>
                  </div>

                  {/* Bottom Footer Date & Author Bar */}
                  <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 flex items-center justify-between text-[11px] sm:text-xs text-gray-500 font-medium">
                    <span>{formatDate(item.published_at)}</span>
                    <span>•</span>
                    <span className="truncate max-w-[140px] sm:max-w-none">{authorName}</span>
                  </div>
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
