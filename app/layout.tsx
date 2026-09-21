import type { Metadata, Viewport } from 'next';
import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'GNUTS | Ghana National Union of Technical Students',
  description: 'Official portal of the Ghana National Union of Technical Students (GNUTS). Serving technical university and TVET students across Ghana.',
  icons: {
    icon: '/images/gnuts_fav.png',
    shortcut: '/images/gnuts_fav.png',
    apple: '/images/gnuts_fav.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="scroll-smooth">
      <head>
        {/* Google Fonts Preconnect & Stylesheet */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Montserrat:ital,wght@0,300..900;1,300..900&display=swap"
        />

        {/* Resource Hints for High-Speed CDN Asset Loading */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        {/* Preload High Priority Hero Image for Instant LCP Rendering */}
        <link rel="preload" as="image" href="https://res.cloudinary.com/dslngzls6/image/upload/v1786991593/photo_2026-08-17_18-24-49_bg2c1g.jpg" />

        {/* Favicon configurations */}
        <link rel="icon" type="image/png" href="/images/gnuts_fav.png" />
        <link rel="shortcut icon" href="/images/gnuts_fav.png" />
        <link rel="apple-touch-icon" href="/images/gnuts_fav.png" />
      </head>
      <body className="font-sans antialiased bg-[#f8f9fa] text-gray-900 flex flex-col min-h-screen">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
