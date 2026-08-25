'use client';

export interface NewsArticleItem {
  id: number;
  title: string;
  category: string;
  author: string;
  author_role?: string;
  summary: string;
  content: string;
  image_url: string;
  published_at: string;
  read_time: string;
  views?: number;
  status: string;
  is_featured?: boolean;
}

import { useState } from 'react';
import { 
  Newspaper, 
  FileText, 
  Megaphone, 
  Sparkles, 
  Calendar, 
  Clock, 
  User, 
  Search, 
  ArrowUpRight, 
  X, 
  Share2, 
  CheckCircle2, 
  Building2,
  AlertCircle
} from 'lucide-react';

interface NewsClientProps {
  initialArticles: NewsArticleItem[];
}

const resolveImg = (url?: string) => {
  if (!url || url.trim() === '') {
    return 'https://res.cloudinary.com/dslngzls6/image/upload/v1787056250/gnuts_cc_tech-GUEST_jt8cge.png';
  }
  const clean = url.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
    return clean;
  }
  if (clean.startsWith('/')) {
    return clean;
  }
  return `/${clean}`;
};

export default function NewsClient({ initialArticles }: NewsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticleItem | null>(null);
  const [isReaderModalOpen, setIsReaderModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const categories = [
    { name: 'All', icon: Sparkles },
    { name: 'Official Communiqué', icon: FileText },
    { name: 'Press Release', icon: Megaphone },
    { name: 'TVET Policy', icon: Newspaper },
    { name: 'Congress Updates', icon: Building2 },
  ];

  const featuredArticle = initialArticles.find((a) => a.is_featured) || initialArticles[0];

  const filteredArticles = initialArticles.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      (item.summary && item.summary.toLowerCase().includes(q)) ||
      (item.content && item.content.toLowerCase().includes(q)) ||
      (item.author && item.author.toLowerCase().includes(q));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenReader = (article: NewsArticleItem) => {
    setSelectedArticle(article);
    setIsReaderModalOpen(true);
    setCopiedLink(false);
  };

  const handleShareArticle = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-['Montserrat',sans-serif] pb-24 text-gray-900">
      
      {/* 1. HERO BANNER: Forest Green Curved Shell */}
      <section className="px-4 sm:px-6 lg:px-8 pt-8 pb-10 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#014900] via-[#013500] to-[#012000] rounded-3xl p-8 sm:p-12 lg:p-14 text-white relative overflow-hidden shadow-2xl border border-emerald-800/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D9A000]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-black uppercase tracking-widest text-[#D9A000]">
              <Megaphone className="w-4 h-4" />
              <span>Authoritative Secretariat Publications</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-tight text-white">
              Official <span className="text-[#D9A000]">News</span> & Press Center
            </h1>

            <p className="text-sm sm:text-base text-gray-200 font-medium leading-relaxed pt-1">
              Read authoritative press releases, official national executive communiqués, Congress resolutions, and TVET policy updates directly from the GNUTS Secretariat.
            </p>
          </div>
        </div>
      </section>

      {/* 2. FEATURED HEADLINE ARTICLE (IF NO SEARCH QUERY ACTIVE) */}
      {!searchQuery && selectedCategory === 'All' && featuredArticle && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-gradient-to-r from-emerald-950 via-[#014900] to-[#013000] rounded-3xl overflow-hidden shadow-2xl border border-emerald-800/50 text-white grid grid-cols-1 lg:grid-cols-12 gap-0 group">
            
            {/* Image Column */}
            <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-[420px] overflow-hidden bg-gray-900">
              <img
                src={resolveImg(featuredArticle.image_url)}
                alt={featuredArticle.title}
                onError={(e: any) => {
                  e.currentTarget.src = 'https://res.cloudinary.com/dslngzls6/image/upload/v1787056250/gnuts_cc_tech-GUEST_jt8cge.png';
                }}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent lg:hidden" />
              <div className="absolute bottom-0 inset-x-0 h-1.5 bg-[#D9A000] z-20" />
              <span className="absolute top-4 left-4 px-3.5 py-1 bg-[#D9A000] text-[#014900] font-black text-xs uppercase tracking-wider rounded-full shadow-md">
                Featured Headline
              </span>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs font-extrabold text-emerald-300">
                  <span className="bg-white/10 px-3 py-1 rounded-full border border-white/20 uppercase tracking-wider text-[#D9A000]">
                    {featuredArticle.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{featuredArticle.published_at}</span>
                  </span>
                </div>

                <h2 className="font-black text-2xl sm:text-3xl text-white leading-tight group-hover:text-[#D9A000] transition-colors">
                  {featuredArticle.title}
                </h2>

                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-normal line-clamp-4">
                  {featuredArticle.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                  <User className="w-4 h-4 text-[#D9A000]" />
                  <span>{featuredArticle.author}</span>
                </div>

                <button
                  onClick={() => handleOpenReader(featuredArticle)}
                  className="px-5 py-2.5 bg-white text-[#014900] font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg hover:bg-[#D9A000] hover:text-[#014900] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Read Communiqué</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </section>
      )}

      {/* 3. FILTER TABS & SEARCH BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/90 shadow-sm">
          
          {/* Keyword Search */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news, communiqués, authors..."
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium text-gray-900 outline-none focus:bg-white focus:border-[#014900] focus:ring-2 focus:ring-[#014900]/20 transition-all placeholder-gray-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#014900] text-white shadow-md font-black'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-[#D9A000]' : 'text-gray-500'}`} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

        </div>

      </section>

      {/* 4. ARTICLES GRID — Homepage Curvy Poster Flyer Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        <div className="flex items-center justify-between pb-6">
          <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
            Showing <span className="text-[#014900] font-black">{filteredArticles.length}</span> Published Articles
          </p>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white rounded-3xl border border-gray-200 shadow-sm max-w-xl mx-auto">
            <div className="text-4xl mb-3">📰</div>
            <p className="text-gray-500 font-medium text-sm">
              {searchQuery ? `No matching articles found for "${searchQuery}". Try clearing your search term.` : 'No news or press releases published yet. Check back soon for official union updates.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredArticles.map((article) => {
              const imgUrl = resolveImg(article.image_url);
              return (
                <div
                  key={article.id}
                  onClick={() => handleOpenReader(article)}
                  className="bg-white rounded-3xl border border-gray-200/90 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer h-full"
                >
                  <div>
                    {/* Poster Flyer Container — Tall generous height matching Home page */}
                    <div className="w-full h-72 sm:h-80 lg:h-[380px] relative overflow-hidden bg-gray-900 shrink-0 rounded-t-3xl">
                      <img
                        src={imgUrl}
                        alt={article.title}
                        loading="lazy"
                        decoding="async"
                        onError={(e: any) => {
                          e.currentTarget.src = 'https://res.cloudinary.com/dslngzls6/image/upload/v1787056250/gnuts_cc_tech-GUEST_jt8cge.png';
                        }}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                      />
                      {/* Top Category Badge */}
                      <span className="absolute top-4 left-4 px-3.5 py-1 bg-[#014900] text-white font-black text-[10px] uppercase tracking-wider rounded-full shadow-md border border-white/20 z-10">
                        {article.category}
                      </span>
                      {/* Gold Accent Bar */}
                      <div className="absolute bottom-0 inset-x-0 h-1.5 bg-[#D9A000] z-20" />
                    </div>

                    {/* Content Section */}
                    <div className="p-6 sm:p-7 space-y-3.5">
                      <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500">
                        <span className="flex items-center gap-1 text-[#014900]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{article.published_at}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{article.read_time}</span>
                        </span>
                      </div>

                      <h3 className="font-black text-lg sm:text-xl text-gray-900 leading-snug uppercase group-hover:text-[#014900] transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed line-clamp-4">
                        {article.summary}
                      </p>

                      <div className="pt-2">
                        <span className="text-[#D9A000] font-black text-xs uppercase tracking-wider group-hover:underline group-hover:text-[#014900] transition-colors inline-flex items-center gap-1">
                          <span>READ MORE</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer Date & Author Bar */}
                  <div className="p-6 pt-0 mt-4">
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                      <div className="flex items-center gap-1.5 font-bold text-gray-700">
                        <User className="w-3.5 h-3.5 text-[#014900]" />
                        <span className="truncate max-w-[150px]">{article.author}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#014900] uppercase">Official Notice</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* 5. INTERACTIVE ARTICLE READER MODAL (CURVY HOME-STYLE PREVIEW) */}
      {isReaderModalOpen && selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-fadeInUp">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#014900] to-[#013500] text-white flex items-start justify-between gap-4 rounded-t-3xl border-b-4 border-b-[#D9A000]">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#D9A000] bg-white/10 px-3 py-1 rounded-full border border-white/20 inline-block">
                  {selectedArticle.category}
                </span>
                <h2 className="font-black text-lg sm:text-2xl text-white leading-snug">
                  {selectedArticle.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-emerald-200 font-bold pt-1">
                  <span>By {selectedArticle.author}</span>
                  <span>•</span>
                  <span>{selectedArticle.published_at}</span>
                </div>
              </div>

              <button
                onClick={() => setIsReaderModalOpen(false)}
                className="p-2 text-white/80 hover:text-white rounded-2xl hover:bg-white/10 transition-colors shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-sm text-gray-800 leading-relaxed rounded-b-3xl">
              
              {/* Featured Image */}
              <div className="h-64 sm:h-96 rounded-2xl overflow-hidden shadow-md bg-gray-900 border border-gray-200">
                <img
                  src={resolveImg(selectedArticle.image_url)}
                  alt={selectedArticle.title}
                  onError={(e: any) => {
                    e.currentTarget.src = 'https://res.cloudinary.com/dslngzls6/image/upload/v1787056250/gnuts_cc_tech-GUEST_jt8cge.png';
                  }}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Full Article Content */}
              <div className="prose max-w-none text-xs sm:text-sm font-normal text-gray-700 whitespace-pre-line leading-relaxed space-y-4">
                {selectedArticle.content}
              </div>

              {/* Official Stamp Box */}
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase text-[#014900]">Ghana National Union of Technical Students</p>
                  <p className="text-[11px] font-bold text-gray-600">Official Executive Secretariat Press Office</p>
                </div>
                
                <button
                  onClick={handleShareArticle}
                  className="px-5 py-2.5 bg-white text-[#014900] border border-emerald-300 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-[#014900] hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-[#D9A000]" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Share Article'}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
