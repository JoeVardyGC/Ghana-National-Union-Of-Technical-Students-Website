import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { DEFAULT_NEWS } from '@/lib/newsData';

export const revalidate = 60;

export default function NewsArchivePage() {
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
      {/* Page Hero Header */}
      <section className="relative text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b-4 border-[#D9A000] overflow-hidden bg-gray-900">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg')` }}
        />
        {/* Semi-transparent Green Overlay (50% Green Opacity) */}
        <div className="absolute inset-0 bg-[#014900]/50 backdrop-brightness-90" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-md">
            News & Press Releases
          </h1>
          <p className="text-gray-100 text-base sm:text-lg max-w-2xl mx-auto font-medium drop-shadow-sm">
            Stay informed with official communiqués, event announcements, and policy statements from the Ghana National Union of Technical Students (GNUTS).
          </p>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {DEFAULT_NEWS.map((item, idx) => (
              <Link
                key={item.id}
                href={`/blog/${item.id}`}
                className="bg-white rounded-none border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer h-full"
              >
                {/* Poster Flyer Container */}
                <div className="w-full h-80 sm:h-[380px] lg:h-[400px] relative overflow-hidden bg-gray-900 shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 z-20" />
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div className="space-y-3.5">
                    <h3 className="font-extrabold text-xl text-gray-900 leading-snug uppercase group-hover:text-[#014900] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-6 sm:line-clamp-8">
                      {item.content}
                    </p>
                    <div className="pt-2">
                      <span className="text-[#D9A000] font-extrabold text-xs uppercase tracking-wider group-hover:underline group-hover:text-[#014900] transition-colors inline-block">
                        READ MORE »
                      </span>
                    </div>
                  </div>

                  {/* Bottom Footer Bar */}
                  <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 font-medium">
                    <span>{formatDate(item.published_at)}</span>
                    <span>•</span>
                    <span>{item.author || 'GNUTS Secretariat'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
