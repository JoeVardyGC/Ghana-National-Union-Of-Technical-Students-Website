import type { Metadata, Viewport } from 'next';
// Self-hosted fonts (bundled with the site, no request to Google): Inter for body
// text, Montserrat for headings, logo and navigation (see globals.css).
import '@fontsource-variable/inter';
import '@fontsource-variable/montserrat';
import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';
import { getSiteSettings } from '@/lib/siteSettings';
import { query } from '@/lib/db';
import { SITE_URL } from '@/lib/siteUrl';
import StructuredData from '@/components/StructuredData';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// Share preview (WhatsApp, Facebook, X, LinkedIn): the union's logo on a white card
const OG_LOGO = {
  url: '/images/og-logo.png',
  width: 1200,
  height: 630,
  alt: 'Ghana National Union of Technical Students (GNUTS) logo',
};

const SITE_DESCRIPTION =
  'Official portal of the Ghana National Union of Technical Students (GNUTS). Serving technical university and TVET students across Ghana.';

export const metadata: Metadata = {
  // Makes relative image and page URLs in metadata absolute (needed for share previews)
  metadataBase: new URL(SITE_URL),
  title: 'GNUTS | Ghana National Union of Technical Students',
  description: SITE_DESCRIPTION,
  applicationName: 'GNUTS',
  // Default preview when a page is shared on WhatsApp, Facebook, X, LinkedIn
  openGraph: {
    type: 'website',
    siteName: 'GNUTS - Ghana National Union of Technical Students',
    title: 'GNUTS | Ghana National Union of Technical Students',
    description: SITE_DESCRIPTION,
    url: '/',
    locale: 'en_GH',
    images: [OG_LOGO],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GNUTS | Ghana National Union of Technical Students',
    description: SITE_DESCRIPTION,
    images: [OG_LOGO.url],
  },
  // Icons come from app/favicon.ico, app/icon.png and app/apple-icon.png
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Secretariat contacts and social links, managed in Admin > Settings
  const settings = await getSiteSettings();
  // Hide the Gallery link in the menu and footer until at least one photo exists
  const galleryCount = await query<{ count: number | string }>('SELECT COUNT(*) as count FROM gallery')
    .then((rows) => Number(rows[0]?.count) || 0)
    .catch(() => 1);

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className="scroll-smooth"
    >
      <head>
        {/* Resource Hints for High-Speed CDN Asset Loading */}
        <link rel="preconnect" href="https://ik.imagekit.io" />
        <link rel="dns-prefetch" href="https://ik.imagekit.io" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        {/* Preload High Priority Hero Image for Instant LCP Rendering */}
        <link rel="preload" as="image" href="/images/carousel_1.jpg" />
      </head>
      <body className="font-sans antialiased bg-[#f8f9fa] text-gray-900 flex flex-col min-h-screen">
        <StructuredData settings={settings} />
        <LayoutWrapper settings={settings} hasGallery={galleryCount > 0}>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
