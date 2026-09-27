'use client';

import { useEffect } from 'react';

export default function ScrollAnimationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal-on-scroll');
    const windowHeight = typeof window !== 'undefined' ? (window.innerHeight || 800) : 800;

    // Eagerly reveal elements that are already within or just beneath the viewport on load
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= windowHeight + 150) {
        el.classList.add('visible');
      }
    });

    const observerCallback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    };

    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '150px 0px',
      threshold: 0.01,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Only observe elements not already marked visible
    elements.forEach((el) => {
      if (!el.classList.contains('visible')) {
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return <>{children}</>;
}
