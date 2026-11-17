import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, Tag, Mail, Phone, Images } from 'lucide-react';
import { query } from '@/lib/db';
import { NewsItem } from '@/lib/newsData';
import { ReadingProgressBar, ShareToolbar, NextPrevNavigation } from '@/components/ArticleDetailClient';
import { resolveImgUrl, formatDate, stripHtml } from '@/lib/imageUtils';
import { getSiteSettings } from '@/lib/siteSettings';
import { absoluteUrl, SITE_URL } from '@/lib/siteUrl';
import { telHref } from '@/lib/siteSettingsShared';

export const revalidate = 15;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const numericId = Number(resolvedParams.id);

  try {
    const rows = await query<any>('SELECT * FROM news WHERE id = ? LIMIT 1', [numericId]);
    const art = (rows || []).find((row: any) => Number(row.id) === numericId);
    if (art) {
      const title = art.title ? `${art.title} | GNUTS News` : 'GNUTS News & Updates';
      const plain = stripHtml(String(art.content || '')).replace(/\s+/g, ' ').trim();
      const description = plain
        ? plain.length > 160 ? `${plain.slice(0, 157).trimEnd()}...` : plain
        : 'Official news release from Ghana National Union of Technical Students (GNUTS).';
      const url = `/blog/${numericId}`;

      // Share preview: the post's cover, resized to a light 1200x630 card by
      // /blog/[id]/cover-image. Posts without a cover use the GNUTS logo card.
      const image = art.image
        ? { url: `${url}/cover-image`, width: 1200, height: 630, alt: art.title || 'GNUTS news' }
        : { url: '/images/og-logo.png', width: 1200, height: 630, alt: 'GNUTS logo' };

      const published = art.published_at || art.created_at;
      const publishedTime = published && !isNaN(new Date(published).getTime()) ? new Date(published).toISOString() : undefined;

      return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
          type: 'article',
          url,
          siteName: 'GNUTS - Ghana National Union of Technical Students',
          title,
          description,
          images: [image],
          publishedTime,
          authors: art.author ? [String(art.author)] : undefined,
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [image.url],
        },
      };
    }
  } catch {
    // fallback
  }

  return {
    title: 'News Article | GNUTS',
    description: 'Official news release from Ghana National Union of Technical Students (GNUTS).',
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const numericId = Number(resolvedParams.id);
  const settings = await getSiteSettings();

  let article: NewsItem | null = null;
  let allPublished: NewsItem[] = [];
  let heroImage = '/images/header_for_pages.jpg';

  try {
    const [rows, bannerRows] = await Promise.all([
      query<any>('SELECT * FROM news WHERE status = "published" ORDER BY published_at DESC, created_at DESC, id DESC'),
      query<any>("SELECT * FROM hero_banners WHERE page_key = 'news_hero' LIMIT 1").catch(() => []),
    ]);

    if (bannerRows && bannerRows.length > 0 && bannerRows[0].image_url) {
      heroImage = resolveImgUrl(bannerRows[0].image_url);
    }

    if (rows && rows.length > 0) {
      allPublished = rows.map((r: any) => ({
        id: Number(r.id),
        title: String(r.title || ''),
        content: String(r.content || ''),
        image: String(r.image || r.image_url || ''),
        published_at: r.published_at ? String(r.published_at) : new Date().toISOString().substring(0, 10),
        author: r.author ? String(r.author) : 'GNUTS Secretariat',
        category: r.category ? String(r.category) : 'NEWS',
        images: r.image2 || r.image3 ? [r.image, r.image2, r.image3].filter(Boolean) : undefined,
      }));
      article = allPublished.find((item) => item.id === numericId) || null;
    }
  } catch (error) {
    console.error('Error querying article details:', error);
  }

  if (!article) {
    notFound();
  }

  const safeBgUrl = encodeURI(heroImage);
  const otherArticles = allPublished.filter((item) => item.id !== article!.id).slice(0, 5);
  
  // Calculate Previous and Next article for bottom navigation banner
  const currentIndex = allPublished.findIndex((item) => item.id === article!.id);
  const prevArticle: NewsItem | null = currentIndex > 0 ? allPublished[currentIndex - 1] : null;
  const nextArticle: NewsItem | null = currentIndex >= 0 && currentIndex < allPublished.length - 1 ? allPublished[currentIndex + 1] : null;

  const getReadTime = (text: string) => {
    return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
  };

  // Collect all images (primary image + optional additional images array)
  const allImages: string[] = [];
  if (article.image) allImages.push(resolveImgUrl(article.image));
  if (article.images && Array.isArray(article.images)) {
    article.images.forEach((img) => {
      const resolved = resolveImgUrl(img);
      if (resolved && !allImages.includes(resolved)) {
        allImages.push(resolved);
      }
    });
  }

  // NewsArticle structured data: lets Google show this post (and its photos) in
  // news and image results, credited to GNUTS
  const toAbsoluteImage = (img?: string) => {
    const clean = (img || '').trim();
    if (!clean || clean.startsWith('data:')) return null;
    return /^https?:\/\//i.test(clean) ? clean : absoluteUrl(`/${clean.replace(/^\/+/, '')}`);
  };
  const articleImages = [...new Set([article.image, ...(article.images || [])].map(toAbsoluteImage).filter(Boolean))];
  const publishedIso = !isNaN(new Date(article.published_at).getTime()) ? new Date(article.published_at).toISOString() : undefined;
  const newsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title.slice(0, 110),
    description: stripHtml(article.content).replace(/\s+/g, ' ').trim().slice(0, 200),
    image: articleImages.length ? articleImages : [absoluteUrl('/images/og-logo.png')],
    datePublished: publishedIso,
    dateModified: publishedIso,
    author: [{ '@type': 'Organization', name: article.author || 'GNUTS Secretariat', url: absoluteUrl('/') }],
    publisher: { '@id': `${SITE_URL}/#organization`, '@type': 'Organization', name: 'Ghana National Union of Technical Students (GNUTS)', logo: { '@type': 'ImageObject', url: absoluteUrl('/images/gnuts_logo.png') } },
    mainEntityOfPage: absoluteUrl(`/blog/${article.id}`),
    inLanguage: 'en-GH',
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsJsonLd).replace(/</g, '\\u003c') }}
      />
      {/* Sticky Reading Progress Indicator Bar */}
      <ReadingProgressBar />

      {/* Editorial Page Hero Header */}
      <section className="relative text-white pt-10 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden border-b-4 border-[#D9A000] bg-gray-900">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${safeBgUrl}')` }}
        />
        {/* Dark scrim so the title stays readable on any photo */}
        <div className="absolute inset-0 bg-[#0c1a10]/60" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Breadcrumb Navigation */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-300 mb-6 font-medium">
            <Link href="/" className="hover:text-[#D9A000] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#D9A000] transition-colors">News & Press Releases</Link>
            <span>/</span>
            <span className="text-[#D9A000] font-bold truncate max-w-[200px] sm:max-w-xs">{article.title}</span>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white/90 hover:text-[#D9A000] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All News
          </Link>

          <div>
            <span className="px-3.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider bg-[#D9A000] text-[#014900] inline-block mb-4 shadow-sm">
              {article.category || 'PRESS RELEASE'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight mb-4 drop-shadow-md">
            {article.title}
          </h1>

          {/* Author & Publication Metadata Bar */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-200 pt-5 border-t border-white/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#D9A000] text-[#014900] flex items-center justify-center font-semibold text-sm shadow-md">
                {article.author.charAt(0)}
              </div>
              <div>
                <span className="font-bold block text-white">{article.author}</span>
                <span className="text-xs text-gray-300">Official Communiqué</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-gray-300 font-medium">
              <Calendar className="w-4 h-4 text-[#D9A000]" />
              <span>{formatDate(article.published_at)}</span>
            </div>

            <div className="flex items-center gap-1.5 text-gray-300 font-medium">
              <Clock className="w-4 h-4 text-[#D9A000]" />
              <span>{getReadTime(article.content)} min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar Layout */}
      <section className="py-10 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Article Main Body Column (8 Cols) */}
            <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-xl shadow-sm border border-gray-200 space-y-8">
              
              {/* 1. TOP: Block Image / Multi-Image Gallery */}
              {allImages.length > 0 && (
                <div className="mb-8 space-y-4">
                  {/* Primary Featured Image Poster */}
                  <div id="article-main-image" className="rounded-lg overflow-hidden border border-gray-200 bg-gray-900 max-h-[550px] flex items-center justify-center relative shadow-sm">
                    <img
                      src={allImages[0]}
                      alt={article.title}
                      className="w-full h-auto max-h-[550px] object-contain"
                    />
                  </div>

                  {/* Multi-Image Gallery (If 2 or more images exist) */}
                  {allImages.length > 1 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-500">
                        <Images className="w-4 h-4 text-[#014900]" />
                        <span>EVENT GALLERY ({allImages.length} PHOTOS)</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {allImages.map((img, idx) => (
                          <div
                            key={idx}
                            className="h-32 sm:h-36 bg-gray-900 rounded-lg overflow-hidden border border-gray-200 group relative shadow-xs"
                          >
                            <img
                              src={img}
                              alt={`${article.title} - Photo ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. RIGHT AFTER BLOCK IMAGE: Article Content Text with Automatic Paragraphing */}
              <div className="space-y-4 text-gray-800 leading-relaxed text-sm sm:text-base font-medium font-sans">
                {(article.content || '')
                  .split(/\r?\n\s*\r?\n|\r?\n/)
                  .map((p) => p.trim())
                  .filter((p) => p.length > 0)
                  .map((paragraph, idx) => (
                    <p key={idx} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
              </div>

              {/* 3. UNDER CONTENT: Tags / Hashtags */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#014900]" />
                <span className="text-xs font-bold text-gray-500">TAGS:</span>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-bold text-[#014900] bg-[#FAF9F6] px-3 py-1 rounded-full border border-gray-200">
                    #GNUTS
                  </span>
                  <span className="text-xs font-bold text-[#014900] bg-[#FAF9F6] px-3 py-1 rounded-full border border-gray-200">
                    #ChooseTVETFirst
                  </span>
                  <span className="text-xs font-bold text-[#014900] bg-[#FAF9F6] px-3 py-1 rounded-full border border-gray-200">
                    #BeTheDifference
                  </span>
                </div>
              </div>

              {/* 4. RIGHT UNDER TAGS: Share Details Toolbar */}
              <ShareToolbar article={article} />

              {/* 5. NEXT / PREVIOUS ARTICLE NAVIGATION */}
              <NextPrevNavigation prevArticle={prevArticle} nextArticle={nextArticle} />
            </div>

            {/* Sidebar (4 Cols) */}
            <div className="lg:col-span-4 space-y-8">
              {/* Recent News & Events Widget */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-[#014900] pb-3 mb-5 border-b-2 border-[#D9A000]">
                  Recent News & Events
                </h3>

                <div className="space-y-5">
                  {otherArticles.map((item) => (
                    <Link
                      key={item.id}
                      href={`/blog/${item.id}`}
                      className="group flex items-start gap-3.5 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-900 shrink-0 border border-gray-200">
                        <img
                          src={resolveImgUrl(item.image)}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#014900] transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                        <span className="text-xs text-gray-400 font-medium mt-1.5 block">
                          {formatDate(item.published_at)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Secretariat Press Office Box */}
              <div className="bg-[#014900] text-white p-6 sm:p-7 rounded-xl shadow-md space-y-4 border border-[#014900]">
                <div>
                  <h4 className="font-semibold text-base text-[#D9A000]">GNUTS Press Office</h4>
                </div>
                <p className="text-xs text-gray-200 leading-relaxed font-medium">
                  For official press statements, media accreditation, or summit partnership inquiries, reach out to the National Secretariat.
                </p>
                <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-gray-300 font-medium">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#D9A000]" />
                    <a href={`mailto:${settings.secretariatEmail}`} className="hover:text-[#D9A000] transition-colors">
                      {settings.secretariatEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#D9A000]" />
                    <a href={telHref(settings.hotlinePhone)} className="hover:text-[#D9A000] transition-colors">
                      {settings.hotlinePhone}
                    </a>
                  </div>
                </div>
                <Link
                  href="/contact"
                  className="inline-block w-full text-center py-3 bg-[#D9A000] text-[#014900] text-xs font-semibold rounded-lg hover:bg-white transition-colors shadow-sm"
                >
                  Contact the secretariat
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
