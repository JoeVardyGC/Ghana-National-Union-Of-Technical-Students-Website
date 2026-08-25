import { Metadata } from 'next';
import { query } from '@/lib/db';
import { DEFAULT_NEWS, NewsItem } from '@/lib/newsData';
import NewsArchiveClient from '@/components/NewsArchiveClient';
import { resolveImgUrl } from '@/lib/imageUtils';

export const metadata: Metadata = {
  title: 'News & Press Releases | GNUTS Ghana',
  description: 'Official announcements, statements, and national activities from the Ghana National Union of Technical Students (GNUTS).',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NewsArchivePage() {
  let dbNews: NewsItem[] = [];
  let heroImage = 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg';

  try {
    const [rows, bannerRows] = await Promise.all([
      query<any>("SELECT * FROM news WHERE status = 'published' ORDER BY published_at DESC, created_at DESC, id DESC"),
      query<any>("SELECT * FROM hero_banners WHERE page_key = 'news_hero'").catch(() => []),
    ]);

    if (bannerRows && bannerRows.length > 0 && bannerRows[0].image_url) {
      heroImage = resolveImgUrl(bannerRows[0].image_url);
    }

    if (rows && rows.length > 0) {
      dbNews = rows.map((r: any) => ({
        id: Number(r.id),
        title: String(r.title || ''),
        content: String(r.content || ''),
        image: String(r.image || r.image_url || 'https://res.cloudinary.com/dslngzls6/image/upload/v1787056250/gnuts_cc_tech-GUEST_jt8cge.png'),
        published_at: r.published_at ? String(r.published_at) : new Date().toISOString().substring(0, 10),
        author: r.author ? String(r.author) : 'GNUTS Secretariat',
        category: r.category ? String(r.category) : 'NEWS',
      }));
    }
  } catch {}

  const newsList = dbNews;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] font-['Montserrat',sans-serif]">
      {/* Page Hero Header - 50% opacity green overlay & border-b-4 border-[#D9A000] */}
      <section className="relative text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b-4 border-[#D9A000] overflow-hidden bg-gray-900">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
        <div className="absolute inset-0 bg-[#014900]/50 backdrop-brightness-90" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mb-3 drop-shadow-md uppercase">
            News & Press Releases
          </h1>
          <p className="text-gray-100 text-sm sm:text-base max-w-2xl mx-auto font-medium drop-shadow-sm">
            Stay informed with official communiqués, event announcements, and national activities from the Ghana National Union of Technical Students (GNUTS).
          </p>
        </div>
      </section>

      {/* Main News Archive Container with 6 Cards & Pagination Tabs */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsArchiveClient newsList={newsList} />
        </div>
      </section>
    </div>
  );
}
