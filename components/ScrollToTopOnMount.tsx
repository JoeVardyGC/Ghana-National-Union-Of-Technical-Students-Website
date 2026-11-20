'use client';

import { useLayoutEffect } from 'react';

/** Scrolls the window to the top when it mounts, so an article (and its loading screen) opens at the header. */
export default function ScrollToTopOnMount() {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, []);
  return null;
}

/** Click handler for links to an article: glide to the top straight away while the next page loads. */
export function scrollToTopSmooth() {
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
}
