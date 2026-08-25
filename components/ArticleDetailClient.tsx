'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Share2, 
  Link2, 
  Check, 
  Printer, 
  ArrowLeft, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { NewsItem } from '@/lib/newsData';

export function ReadingProgressBar() {
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const updateScrollCompletion = () => {
      const currentProgress = window.scrollY;
      const scrollHeight = document.body.scrollHeight - window.innerHeight;
      if (scrollHeight) {
        setCompletion(
          Number((currentProgress / scrollHeight).toFixed(2)) * 100
        );
      }
    };

    window.addEventListener('scroll', updateScrollCompletion);
    return () => {
      window.removeEventListener('scroll', updateScrollCompletion);
    };
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-1 bg-[#D9A000] z-50 transition-all duration-150"
      style={{ width: `${completion}%` }}
    />
  );
}

export function SocialShareBar({ article }: { article: NewsItem }) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return `https://gnuts.org.gh/blog/${article.id}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${article.title}\n\nRead official communiqué from GNUTS:\n${getShareUrl()}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`${article.title} - Official communiqué from GNUTS Ghana`);
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}&via=gnutsonline`, '_blank');
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-['Montserrat',sans-serif]">
      <div className="flex items-center gap-2 text-xs font-black text-gray-700 uppercase tracking-wider">
        <Share2 className="w-4 h-4 text-[#014900]" />
        <span>Share Communiqué:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm border cursor-pointer ${
            copied
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white text-gray-800 border-gray-200 hover:border-[#014900] hover:text-[#014900]'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4 text-gray-500" />
              <span>Copy Link</span>
            </>
          )}
        </button>

        {/* WhatsApp Button */}
        <button
          onClick={handleShareWhatsApp}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold bg-[#25D366] text-white hover:bg-[#1DA851] transition-colors border border-[#25D366] shadow-sm cursor-pointer"
          title="Share on WhatsApp"
        >
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span>WhatsApp</span>
        </button>

        {/* 𝕏 Button */}
        <button
          onClick={handleShareTwitter}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold bg-black text-white hover:bg-gray-800 transition-colors border border-black shadow-sm cursor-pointer"
          title="Share on X"
        >
          <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>Share</span>
        </button>

        {/* Facebook Button */}
        <button
          onClick={handleShareFacebook}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold bg-[#1877F2] text-white hover:bg-[#0d65d9] transition-colors border border-[#1877F2] shadow-sm cursor-pointer"
          title="Share on Facebook"
        >
          <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span className="hidden sm:inline">Facebook</span>
        </button>

        {/* LinkedIn Button */}
        <button
          onClick={handleShareLinkedIn}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold bg-[#0A66C2] text-white hover:bg-[#084e96] transition-colors border border-[#0A66C2] shadow-sm cursor-pointer"
          title="Share on LinkedIn"
        >
          <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.6 1.6 0 1 0 1.6 1.6 1.6 1.6 0 0 0-1.6-1.6z" />
          </svg>
          <span className="hidden sm:inline">LinkedIn</span>
        </button>

        {/* Print Button */}
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors border border-gray-200 shadow-sm cursor-pointer"
          title="Print Press Release"
        >
          <Printer className="w-3.5 h-3.5 shrink-0" />
          <span>Print</span>
        </button>
      </div>
    </div>
  );
}

// Export ShareToolbar as alias for SocialShareBar for backwards-compatibility
export const ShareToolbar = SocialShareBar;

export function NextPrevNavigation({ prevArticle, nextArticle }: { prevArticle?: NewsItem | null; nextArticle?: NewsItem | null }) {
  if (!prevArticle && !nextArticle) return null;

  return (
    <div className="mt-10 pt-8 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {prevArticle ? (
        <Link
          href={`/blog/${prevArticle.id}`}
          className="group p-5 bg-white border border-gray-200 rounded-3xl shadow-sm hover:border-[#014900] hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 group-hover:text-[#014900] transition-colors mb-2 uppercase tracking-wider">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>PREVIOUS PRESS RELEASE</span>
          </div>
          <h4 className="text-sm font-extrabold text-gray-900 group-hover:text-[#014900] transition-colors line-clamp-2 leading-snug">
            {prevArticle.title}
          </h4>
        </Link>
      ) : (
        <div />
      )}

      {nextArticle && (
        <Link
          href={`/blog/${nextArticle.id}`}
          className="group p-5 bg-white border border-gray-200 rounded-3xl shadow-sm hover:border-[#014900] hover:shadow-md transition-all flex flex-col justify-between sm:text-right"
        >
          <div className="flex items-center justify-end gap-2 text-xs font-bold text-gray-400 group-hover:text-[#014900] transition-colors mb-2 uppercase tracking-wider">
            <span>NEXT PRESS RELEASE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-sm font-extrabold text-gray-900 group-hover:text-[#014900] transition-colors line-clamp-2 leading-snug">
            {nextArticle.title}
          </h4>
        </Link>
      )}
    </div>
  );
}
