'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import type { SiteSettings } from '@/lib/siteSettingsShared';

export default function LayoutWrapper({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: SiteSettings;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <main className="flex-grow min-h-screen">{children}</main>;
  }

  return (
    <>
      <Navbar settings={settings} />
      <main className="flex-grow">{children}</main>
      <Footer settings={settings} />
      <BackToTop />
    </>
  );
}
