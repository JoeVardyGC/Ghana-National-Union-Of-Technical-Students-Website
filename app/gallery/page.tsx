import { Metadata } from 'next';
import GalleryClient, { GalleryItem } from '@/components/GalleryClient';
import { query } from '@/lib/db';
import { resolveImgUrl } from '@/lib/imageUtils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Legacy & Leadership Gallery | GNUTS - Ghana National Union of Technical Students',
  description: 'Explore the historic leadership gallery of GNUTS National Presidents, Secretariat Leaders, TVET Pioneer Alumni, and National Congress Photos.',
};

export default async function GalleryPage() {
  let heroImage = 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg';
  let initialItems: GalleryItem[] = [];

  try {
    const [bannerRows, galleryRows] = await Promise.all([
      query<any>("SELECT image_url FROM hero_banners WHERE page_key = 'gallery_hero' OR page_key = 'about_hero' ORDER BY (page_key = 'gallery_hero') DESC LIMIT 1"),
      query<any>('SELECT * FROM gallery ORDER BY display_order ASC, id DESC'),
    ]);

    if (bannerRows && bannerRows.length > 0 && bannerRows[0].image_url) {
      heroImage = bannerRows[0].image_url;
    }

    if (galleryRows && galleryRows.length > 0) {
      initialItems = galleryRows.map((r: any) => ({
        id: Number(r.id),
        title: String(r.title || ''),
        category: String(r.category || 'LEADERSHIP'),
        image: String(r.image || ''),
        tenure_or_date: r.tenure_or_date ? String(r.tenure_or_date) : 'Archive',
        role_or_badge: r.role_or_badge ? String(r.role_or_badge) : 'Union Archive',
        description: r.description ? String(r.description) : '',
        display_order: Number(r.display_order) || 1,
      }));
    }
  } catch (error) {
    console.error('Error fetching gallery data on server:', error);
  }

  const resolvedHeroImage = resolveImgUrl(heroImage);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] font-sans">
      
      {/* Secondary Hero Header */}
      <section className="relative text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b-4 border-[#D9A000] overflow-hidden bg-gray-900">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: `url('${resolvedHeroImage}')` }}
        />
        <div className="absolute inset-0 bg-[#014900]/60 backdrop-brightness-90" />

        <div className="max-w-7xl mx-auto text-center relative z-10 space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md uppercase">
            GNUTS Legacy & Leadership Gallery
          </h1>
          <p className="text-gray-100 text-xs sm:text-sm max-w-2xl mx-auto font-medium drop-shadow-sm">
            Honoring past National Union Leaders, TVET Pioneer Alumni, and historic National Student Congresses
          </p>
        </div>
      </section>

      {/* Main Client Content */}
      <section className="py-6 flex-grow">
        <GalleryClient initialItems={initialItems} />
      </section>

    </div>
  );
}
