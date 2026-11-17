import type { Metadata, Viewport } from 'next';
import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';
import { getSiteSettings } from '@/lib/siteSettings';
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

  return (
    <html lang="en" data-scroll-behavior="smooth" className="scroll-smooth font-['Montserrat',sans-serif]">
      <head>
        {/* Google Fonts Preconnect & Stylesheet — Exclusively Montserrat */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300..900;1,300..900&display=swap"
        />

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
      <body className="font-['Montserrat',sans-serif] antialiased bg-[#f8f9fa] text-gray-900 flex flex-col min-h-screen">
        <StructuredData settings={settings} />
        <LayoutWrapper settings={settings}>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
