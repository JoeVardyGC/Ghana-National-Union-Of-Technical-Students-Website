'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const footerElem = document.querySelector('footer');
      if (footerElem) {
        const footerTop = footerElem.getBoundingClientRect().top;
        // Visible only when footer top enters near viewport (within 100px of screen bottom)
        const reachedFooter = footerTop <= window.innerHeight + 100;
        setVisible(reachedFooter);
      } else {
        // Fallback: visible when scrolled to bottom 15% of document
        const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
        setVisible(totalScrollable > 0 && window.scrollY >= totalScrollable - 500);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#014900] text-white shadow-xl hover:shadow-2xl border border-[#D9A000]/60 hover:border-[#D9A000] hover:bg-[#013300] hover:scale-110 active:scale-95 transition-all duration-300 animate-fadeIn flex items-center justify-center group"
      title="Back to top"
    >
      <ArrowUp className="w-5 h-5 text-[#D9A000] group-hover:-translate-y-1 transition-transform duration-300" />
    </button>
  );
}
