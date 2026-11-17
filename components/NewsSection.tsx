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
    <section className="py-10 sm:py-16 lg:py-24 bg-[#FAF9F6]" id="news-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#16201A]">News & Events</h2>
            <p className="text-gray-500 text-xs sm:text-sm lg:text-base font-medium">
              Latest announcements, statements, and national activities
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-xs sm:text-sm lg:text-base font-semibold text-[#014900] hover:text-gold-ink transition-colors mt-1 md:mt-0"
          >
            All news
          </Link>
        </div>

        {newsList.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm max-w-xl mx-auto">
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
                className="bg-white rounded-lg sm:rounded-xl border border-[#E4E2DA] hover:border-[#C9C6BA] transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer h-full min-w-0 w-full"
              >
                {/* Poster Flyer Container — Responsive height with top curved corners */}
                <div className="w-full h-64 sm:h-80 md:h-[380px] lg:h-[420px] relative overflow-hidden bg-gray-900 shrink-0 rounded-t-lg sm:rounded-t-xl">
                  <img
                    src={imgUrl}
                    alt={`${item.title} | GNUTS`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-700"
                  />
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-6 lg:p-7 flex flex-col justify-between flex-grow rounded-b-lg sm:rounded-b-xl min-w-0">
                  <div className="space-y-2.5 sm:space-y-3.5 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg lg:text-xl text-gray-900 leading-snug group-hover:text-[#014900] transition-colors line-clamp-3 break-words">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-medium line-clamp-3 sm:line-clamp-4 break-words">
                      {cleanContent}
                    </p>
                    <div className="pt-1 sm:pt-2">
                      <span className="text-gold-ink font-semibold text-xs group-hover:underline group-hover:text-[#014900] transition-colors inline-block">
                        Read more
                      </span>
                    </div>
                  </div>

                  {/* Bottom Footer Date & Author Bar */}
                  <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 flex items-center justify-between text-xs sm:text-xs text-gray-500 font-medium">
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
