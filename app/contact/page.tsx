import { Metadata } from 'next';
import ContactClient from '@/components/ContactClient';
import { query } from '@/lib/db';
import { resolveImgUrl } from '@/lib/imageUtils';
import { getSiteSettings } from '@/lib/siteSettings';

export const revalidate = 15;

export const metadata: Metadata = {
  title: 'Contact Us | GNUTS - Ghana National Union of Technical Students',
  description: 'Get in touch with the National Secretariat of GNUTS. Reach out for student welfare inquiries, scholarship support, innovation programs, or union membership.',
};

export default async function ContactPage() {
  let heroImage = '/images/header_for_pages.jpg';
  let heroTitle = 'Contact Us';
  let heroSubtitle = 'Get in touch with the Ghana National Union of Technical Students National Secretariat';

  try {
    const bannerRows = await query<any>("SELECT * FROM hero_banners WHERE page_key = 'contact_hero'").catch(() => []);
    if (bannerRows && bannerRows.length > 0) {
      if (bannerRows[0].image_url) {
        heroImage = resolveImgUrl(bannerRows[0].image_url);
      }
      if (bannerRows[0].title && bannerRows[0].title !== 'Contact Hero Banner' && bannerRows[0].title !== 'Contact Page Header') {
        heroTitle = bannerRows[0].title;
      }
    }
  } catch (error) {
    console.error('Error fetching contact hero banner:', error);
  }

  const safeBgUrl = encodeURI(heroImage);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6]">
      {/* Page Hero Header - 50% opacity green overlay & border-b-4 border-[#D9A000] */}
      <section className="relative text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b-4 border-[#D9A000] overflow-hidden bg-gray-900">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${safeBgUrl}')` }}
        />
        {/* Dark scrim so the title stays readable on any photo */}
        <div className="absolute inset-0 bg-[#0c1a10]/60" />

        <div className="max-w-7xl mx-auto text-center relative z-10 space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-md">
            {heroTitle}
          </h1>
          <p className="text-gray-100 text-sm sm:text-base max-w-xl mx-auto font-medium drop-shadow-sm">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Main Content Component */}
      <section className="py-6 flex-grow">
        <ContactClient settings={await getSiteSettings()} />
      </section>
    </div>
  );
}
