'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import ScrollAnimationProvider from '@/components/ScrollAnimationProvider';
import type { SiteSettings } from '@/lib/siteSettingsShared';

export default function LayoutWrapper({
  children,
  settings,
  hasGallery = true,
}: {
  children: React.ReactNode;
  settings: SiteSettings;
  /** False hides the Gallery link until photos have been uploaded */
  hasGallery?: boolean;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <main className="flex-grow min-h-screen">{children}</main>;
  }

  return (
    <>
      <Navbar settings={settings} hasGallery={hasGallery} />
      <main className="flex-grow">{children}</main>
      <Footer settings={settings} hasGallery={hasGallery} />
      <BackToTop />
      <ScrollAnimationProvider />
    </>
  );
}
