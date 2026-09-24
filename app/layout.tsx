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
    icon: '/images/gnuts_logo1_main.png',
    shortcut: '/images/gnuts_logo1_main.png',
    apple: '/images/gnuts_logo1_main.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        {/* Preload High Priority Hero Image for Instant LCP Rendering */}
        <link rel="preload" as="image" href="/images/carousel_1.jpg" />

        {/* Favicon configurations */}
        <link rel="icon" type="image/png" href="/images/gnuts_logo1_main.png" />
        <link rel="shortcut icon" href="/images/gnuts_logo1_main.png" />
        <link rel="apple-touch-icon" href="/images/gnuts_logo1_main.png" />
      </head>
      <body className="font-['Montserrat',sans-serif] antialiased bg-[#f8f9fa] text-gray-900 flex flex-col min-h-screen">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
