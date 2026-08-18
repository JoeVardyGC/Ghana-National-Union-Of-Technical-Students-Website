import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, User, ArrowLeft, Share2, MapPin, Tag } from 'lucide-react';
import { DEFAULT_NEWS, getNewsById } from '@/lib/newsData';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NewsDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const article = await getNewsById(resolvedParams.id);

  if (!article) {
    notFound();
  }

  const otherArticles = DEFAULT_NEWS.filter((item) => item.id !== article.id);

  const formatDate = (val: string) => {
    try {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
    } catch {}
    return val;
  };

  const getReadTime = (text: string) => {
    return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] font-sans">
      {/* Header Breadcrumb & Title Section */}
      <section className="relative text-white pt-10 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden border-b-4 border-[#D9A000] bg-gray-900">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg')` }}
        />
        {/* Semi-transparent Green Overlay (50% Green Opacity) */}
        <div className="absolute inset-0 bg-[#014900]/50 backdrop-brightness-90" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 mb-6">
            <Link href="/" className="hover:text-[#D9A000] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#D9A000] transition-colors">News & Events</Link>
            <span>/</span>
            <span className="text-[#D9A000] truncate max-w-[200px] sm:max-w-xs">{article.title}</span>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white/90 hover:text-[#D9A000] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to News
          </Link>

          <span className="px-3.5 py-1 text-xs font-extrabold rounded-md uppercase tracking-wider bg-[#D9A000] text-[#014900] inline-block mb-4 shadow-sm">
            {article.category || 'NEWS & EVENTS'}
          </span>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            {article.title}
          </h1>

          {/* Meta Bar */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-200 pt-4 border-t border-white/15">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#D9A000] text-[#014900] flex items-center justify-center font-bold">
                {article.author.charAt(0)}
              </div>
              <span className="font-semibold">{article.author}</span>
            </div>

            <div className="flex items-center gap-1.5 text-gray-300">
              <Calendar className="w-4 h-4 text-[#D9A000]" />
              <span>{formatDate(article.published_at)}</span>
            </div>

            <div className="flex items-center gap-1.5 text-gray-300">
              <Clock className="w-4 h-4 text-[#D9A000]" />
              <span>{getReadTime(article.content)} min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar Layout */}
      <section className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Article Content (8 Cols) */}
            <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-gray-100">
              {/* Featured Image Flyer */}
              {article.image && (
                <div className="mb-8 rounded-xl overflow-hidden shadow-md border border-gray-100 bg-gray-900 max-h-[550px] flex items-center justify-center">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-auto max-h-[550px] object-contain"
                  />
                </div>
              )}

              {/* Article Content Text */}
              <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed space-y-5 whitespace-pre-line text-sm sm:text-base font-medium font-sans">
                {article.content}
              </div>

              {/* Social Share & Tags */}
              <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#014900]" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">TAGS:</span>
                  <span className="text-xs font-semibold text-[#014900] bg-[#f8f9fa] px-2.5 py-1 rounded-md border border-gray-200">
                    #GNUTS #TVET #GhanaStudents
                  </span>
                </div>
              </div>
            </div>

            {/* Sidebar (4 Cols) */}
            <div className="lg:col-span-4 space-y-8">
              {/* Other Recent News Widget */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-extrabold text-[#014900] pb-3 mb-5 border-b-2 border-[#D9A000]">
                  Recent News & Events
                </h3>

                <div className="space-y-5">
                  {otherArticles.map((item) => (
                    <Link
                      key={item.id}
                      href={`/blog/${item.id}`}
                      className="group flex items-start gap-3.5 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-900 shrink-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#014900] transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                        <span className="text-[11px] text-gray-400 font-medium mt-1.5 block">
                          {formatDate(item.published_at)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Secretariat Info Box */}
              <div className="bg-[#014900] text-white p-6 rounded-2xl shadow-md space-y-3">
                <h4 className="font-extrabold text-base text-[#D9A000]">GNUTS National Secretariat</h4>
                <p className="text-xs text-gray-200 leading-relaxed">
                  For press inquiries, official statements, or event partnerships, contact the National Secretariat.
                </p>
                <Link
                  href="/contact"
                  className="inline-block mt-2 px-4 py-2 bg-[#D9A000] text-[#014900] text-xs font-bold rounded-md hover:bg-white transition-colors"
                >
                  Contact Secretariat →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
