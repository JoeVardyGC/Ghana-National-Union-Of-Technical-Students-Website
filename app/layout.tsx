import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
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
    <html lang="en" className={`${montserrat.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-[#f8f9fa] text-gray-900 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
