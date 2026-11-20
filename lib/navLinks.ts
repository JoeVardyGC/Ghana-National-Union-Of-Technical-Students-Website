/**
 * The main site menu. Used by both the navbar and the footer's "Quick Links",
 * so the two always show the same pages in the same order.
 */
export const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Scholarships & Opportunities', href: '/scholarships' },
  { name: 'Innovations', href: '/innovations' },
  { name: 'News & Events', href: '/blog' },
  { name: 'Contact Us', href: '/contact' },
] as const;
