'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Site-wide scroll animations (mounted once in LayoutWrapper).
 *
 * On every page it automatically:
 *  - fades each <section> inside <main> up into view as you scroll (except the page header),
 *  - staggers the cards of every grid inside <main> so they appear one after another,
 *  - also handles anything marked .reveal-on-scroll / .reveal-stagger by hand.
 *
 * Content stays visible until this runs: elements already on screen are revealed first and
 * only then is `reveal-ready` added to <html> (which enables the hidden state in globals.css).
 * Visitors with "reduce motion" switched on get no animation at all.
 */
const REVEAL = 'reveal-on-scroll';
const STAGGER = 'reveal-stagger';

function tagElements(main: HTMLElement) {
  // Fade-up for every content section except the first (the page header / hero)
  const sections = Array.from(main.querySelectorAll<HTMLElement>('section'));
  sections.slice(1).forEach((section) => section.classList.add(REVEAL));

  // Staggered entrance for card grids (grids with at least 2 items)
  main.querySelectorAll<HTMLElement>('.grid').forEach((grid) => {
    if (grid.children.length >= 2 && !grid.closest('form')) grid.classList.add(STAGGER);
  });
}

export default function ScrollAnimationProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const main = document.querySelector<HTMLElement>('main');
    if (!main) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const selector = `.${REVEAL}, .${STAGGER}`;

    if (reduceMotion) {
      root.classList.remove('reveal-ready');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      // Start just before the element reaches the screen so fast scrolling never shows blanks
      { root: null, rootMargin: '0px 0px 120px 0px', threshold: 0.05 }
    );

    const register = () => {
      tagElements(main);
      const windowHeight = window.innerHeight || 800;
      main.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        if (el.classList.contains('visible') || el.dataset.revealWatched) return;
        el.dataset.revealWatched = '1';
        // Already (even partly) on screen at load: show immediately (no flash, no delay)
        if (el.getBoundingClientRect().top < windowHeight) el.classList.add('visible');
        else observer.observe(el);
      });
    };

    register();
    root.classList.add('reveal-ready');

    // Content that streams in after the first paint, and lists rendered or filtered later
    // in the browser (search, categories). A timer, not requestAnimationFrame, so this also
    // runs for pages loaded in a background tab.
    let pending: ReturnType<typeof setTimeout> | undefined;
    const mutations = new MutationObserver(() => {
      clearTimeout(pending);
      pending = setTimeout(register, 50);
    });
    mutations.observe(main, { childList: true, subtree: true });

    return () => {
      clearTimeout(pending);
      mutations.disconnect();
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
