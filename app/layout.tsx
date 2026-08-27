import type { Metadata, Viewport } from 'next';
import { Montserrat, Inter } from 'next/font/google';
import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GNUTS | Ghana National Union of Technical Students',
  description: 'Official portal of the Ghana National Union of Technical Students (GNUTS). Serving technical university and TVET students across Ghana.',
  icons: {
    icon: 'https://res.cloudinary.com/dslngzls6/image/upload/v1786982867/gnuts_fav_htclbt.png',
    shortcut: 'https://res.cloudinary.com/dslngzls6/image/upload/v1786982867/gnuts_fav_htclbt.png',
    apple: 'https://res.cloudinary.com/dslngzls6/image/upload/v1786982867/gnuts_fav_htclbt.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${montserrat.variable} ${inter.variable} scroll-smooth`}>
      <head>
        {/* Resource Hints for High-Speed CDN Asset Loading */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        {/* Preload High Priority Hero Image for Instant LCP Rendering */}
        <link rel="preload" as="image" href="https://res.cloudinary.com/dslngzls6/image/upload/v1786991593/photo_2026-08-17_18-24-49_bg2c1g.jpg" />

        {/* Favicon configurations */}
        <link rel="icon" type="image/png" href="https://res.cloudinary.com/dslngzls6/image/upload/v1786982867/gnuts_fav_htclbt.png" />
        <link rel="shortcut icon" href="https://res.cloudinary.com/dslngzls6/image/upload/v1786982867/gnuts_fav_htclbt.png" />
        <link rel="apple-touch-icon" href="https://res.cloudinary.com/dslngzls6/image/upload/v1786982867/gnuts_fav_htclbt.png" />
      </head>
      <body className="font-sans antialiased bg-[#f8f9fa] text-gray-900 flex flex-col min-h-screen">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
