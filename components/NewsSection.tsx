'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, Copy, Check, Clock } from 'lucide-react';

interface NewsItem {
  id?: number;
  title: string;
  content?: string;
  image?: string;
  published_at?: any;
  author?: string;
}

const DEFAULT_NEWS: NewsItem[] = [
  {
    id: 1,
    title: '34TH GNUTS TECH SUMMIT & EXHIBITION — DR. ERIC KOFI ADZROE TO SPEAK',
    content: `The Ghana National Union of Technical Students (GNUTS) announces the 34th Administration 1st Central Committee Meeting Tech Summit & Exhibition!

Keynote Guest Speaker: Dr. Eric Kofi Adzroe (Director-General, Ghana TVET Service)
Theme: "From skills to solutions: driving innovation and sustainable livelihood through TVET."

Date: 7th May, 2026 at 10:00 AM
Venue: GNAT Auditorium, Greater Accra Region.

#GNUTS1stCC #BeTheDifference #ChooseTVETFirst`,
    image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787056250/gnuts_cc_tech-GUEST_jt8cge.png',
    published_at: '2026-05-07',
    author: 'GNUTS Secretariat',
  },
  {
    id: 2,
    title: 'SKILLS ARE THE FUTURE — #CHOOSE TVET FIRST CAMPAIGN',
    content: `Skills Are The Future! GNUTS officially launches the nationwide #CHOOSE TVET FIRST Campaign across all Technical Universities and TVET Institutions in Ghana.

The campaign highlights practical skills acquisition, robotics, engineering innovation, and hands-on technological expertise as the fundamental drivers of Ghana's industrial economic future.

#ChooseTVETFirst #SkillsAreTheFuture #GNUTS`,
    image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787056252/choose_tvet_first_kwucvy.png',
    published_at: '2026-05-05',
    author: 'GNUTS Secretariat',
  },
  {
    id: 3,
    title: 'MINISTER OF EDUCATION HON. HARUNA IDDRISU ESQ. TO ADDRESS TECH SUMMIT',
    content: `The 34th GNUTS 1st Central Committee Meeting Tech Summit & Exhibition is honored to announce Hon. Haruna Iddrisu Esq. (Minister of Education) as a Special Guest Speaker!

Theme: "From skills to solutions: driving innovation and sustainable livelihood through TVET."

Date: 7th May, 2026 at 10:00 AM
Venue: GNAT Auditorium, Greater Accra Region.

#GNUTS1stCC #BeTheDifference #ChooseTVETFirst`,
    image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787056247/haruna_ns6zfw.png',
    published_at: '2026-05-07',
    author: 'GNUTS Secretariat',
  },
];

const formatDate = (val: any) => {
  if (!val) return 'July 28, 2026';
  try {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  } catch {}
  return String(val);
};

const getCategory = (idx: number) => {
  const cats = ['ANNOUNCEMENT', 'PRESS RELEASE', 'EVENT'];
  return cats[idx % cats.length];
};

const getCategoryColor = (idx: number) => {
  const colors = ['bg-[#014900] text-white', 'bg-white text-[#D9A000] font-extrabold shadow-md', 'bg-[#003300] text-white'];
  return colors[idx % colors.length];
};

const getReadTime = (text: string) => {
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
};

const resolveImgUrl = (img?: string) => {
  if (!img) return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop';
  if (img.startsWith('http') || img.startsWith('/')) return img;
  return `/${img}`;
};

export default function NewsSection({ dbNews = [] }: { dbNews?: NewsItem[] }) {
  const newsList = dbNews.length > 0 ? dbNews : DEFAULT_NEWS;
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [copied, setCopied] = useState(false);

  const stripHtml = (htmlStr: string = '') => {
    return htmlStr.replace(/<[^>]*>?/gm, '').trim();
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const featuredArticle = newsList[0];
  const stackedArticles = newsList.slice(1, 3);

  return (
    <section className="py-16 sm:py-24 bg-[#f8f9fa]" id="news-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-3">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#014900] tracking-tight">News & Events</h2>
            <div className="w-16 h-1.5 bg-[#D9A000] rounded-full my-4" />
            <p className="text-gray-500 text-sm sm:text-base font-medium">
              Latest announcements, statements, and national activities
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm sm:text-base font-bold text-[#014900] hover:text-[#D9A000] transition-colors mt-2 md:mt-0"
          >
            More News →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 reveal-on-scroll">
          {newsList.map((item, idx) => {
            const cleanContent = stripHtml(item.content || '');
            const imgUrl = resolveImgUrl(item.image);
            const authorName = item.author || 'GNUTS Secretariat';

            return (
              <Link
                key={item.id || idx}
                href={`/blog/${item.id || idx + 1}`}
                className="bg-white rounded-none border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer h-full"
              >
                {/* Poster Flyer Container (Tall Portrait ratio matching NUGS) */}
                <div className="w-full h-80 sm:h-[380px] lg:h-[400px] relative overflow-hidden bg-gray-900 shrink-0">
                  <img
                    src={imgUrl}
                    alt={item.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Multi-color Ghana Accent Bar */}
                  <div className="absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 z-20" />
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div className="space-y-3.5">
                    <h3 className="font-extrabold text-xl text-gray-900 leading-snug uppercase group-hover:text-[#014900] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-6 sm:line-clamp-8">
                      {cleanContent}
                    </p>
                    <div className="pt-2">
                      <span className="text-[#D9A000] font-extrabold text-xs uppercase tracking-wider group-hover:underline group-hover:text-[#014900] transition-colors inline-block">
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
      </div>
    </section>
  );
}
