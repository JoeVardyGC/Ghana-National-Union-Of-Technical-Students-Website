'use client';

import { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

export default function ShareButtons({ title, id }: { title: string; id: number }) {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = (platform: string) => {
    const projectUrl = typeof window !== 'undefined' ? `${window.location.origin}/innovations/${id}` : '';
    const shareText = encodeURIComponent(`Check out this student innovation project from GNUTS: ${title}`);

    let shareLink = '';
    switch (platform) {
      case 'wa':
        shareLink = `https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(projectUrl)}`;
        break;
      case 'fb':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(projectUrl)}`;
        break;
      case 'tw':
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(projectUrl)}&text=${shareText}`;
        break;
      case 'li':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(projectUrl)}`;
        break;
      case 'tg':
        shareLink = `https://t.me/share/url?url=${encodeURIComponent(projectUrl)}&text=${shareText}`;
        break;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = () => {
    const projectUrl = typeof window !== 'undefined' ? `${window.location.origin}/innovations/${id}` : '';
    navigator.clipboard.writeText(projectUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    });
  };

  return (
    <div className="pt-6 border-t border-gray-200 space-y-3">
      <h4 className="text-xs font-extrabold text-[#014900] uppercase tracking-wider flex items-center gap-2">
        <Share2 className="w-4 h-4 text-[#D9A000]" />
        <span>Share This Project</span>
      </h4>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* WhatsApp Button */}
        <button
          onClick={() => handleShare('wa')}
          className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 group"
        >
          <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          <span>WhatsApp</span>
        </button>

        {/* Facebook Button */}
        <button
          onClick={() => handleShare('fb')}
          className="px-4 py-2.5 bg-[#1877F2] hover:bg-[#1466d3] active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 group"
        >
          <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Facebook</span>
        </button>

        {/* X (Twitter) Button */}
        <button
          onClick={() => handleShare('tw')}
          className="px-4 py-2.5 bg-black hover:bg-gray-900 active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 group"
        >
          <svg className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <span>X (Twitter)</span>
        </button>

        {/* LinkedIn Button */}
        <button
          onClick={() => handleShare('li')}
          className="px-4 py-2.5 bg-[#0077B5] hover:bg-[#006093] active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 group"
        >
          <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
          <span>LinkedIn</span>
        </button>

        {/* Telegram Button */}
        <button
          onClick={() => handleShare('tg')}
          className="px-4 py-2.5 bg-[#0088cc] hover:bg-[#0077b3] active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 group"
        >
          <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.196 1.006.128.832.942z"/>
          </svg>
          <span>Telegram</span>
        </button>

        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          className="px-4 py-2.5 bg-gray-700 hover:bg-gray-800 active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 group"
        >
          {copiedLink ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-300 group-hover:scale-110 transition-transform" />
          )}
          <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
        </button>
      </div>
    </div>
  );
}
