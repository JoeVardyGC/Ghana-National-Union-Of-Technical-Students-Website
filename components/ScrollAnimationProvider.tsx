'use client';

import { useEffect } from 'react';

/**
 * Fades sections in as they scroll into view.
 * Content stays visible until this runs: elements already on screen are marked
 * visible first, and only then is `reveal-ready` added to <html> (which enables
 * the hidden state in globals.css), so nothing flashes or disappears.
 */
export default function ScrollAnimationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const elements = document.querySelectorAll('.reveal-on-scroll');

    // Respect "reduce motion": show everything, no animation
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((el) => el.classList.add('visible'));
      return;
    }

    const windowHeight = window.innerHeight || 800;
    elements.forEach((el) => {
      if (el.getBoundingClientRect().top <= windowHeight + 150) {
        el.classList.add('visible');
      }
    });

    root.classList.add('reveal-ready');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      // Start the fade well before the section reaches the screen, so fast
      // scrolling never lands on a blank area
      { root: null, rootMargin: '0px 0px 400px 0px', threshold: 0 }
    );

    elements.forEach((el) => {
      if (!el.classList.contains('visible')) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      root.classList.remove('reveal-ready');
    };
  }, []);

  return <>{children}</>;
}
