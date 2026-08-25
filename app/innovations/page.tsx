import { Metadata } from 'next';
import { query } from '@/lib/db';
import InnovationsClient, { InnovationItem } from '@/components/InnovationsClient';
import { resolveImgUrl } from '@/lib/imageUtils';

export const metadata: Metadata = {
  title: 'Innovative Projects | GNUTS',
  description: 'Showcasing groundbreaking technical innovations and engineering solutions developed by TVET and Technical University students across Ghana.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function formatDate(dateVal: any): string {
  if (!dateVal) return '';
  if (typeof dateVal === 'string') return dateVal;
  if (dateVal instanceof Date) {
    return dateVal.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return String(dateVal);
}

export default async function InnovationsPage() {
  let innovationsList: InnovationItem[] = [];
  let heroImage = 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg';

  try {
    const [rawInnovations, bannerRows] = await Promise.all([
      query<any>("SELECT * FROM innovations WHERE status = 'approved' ORDER BY id ASC"),
      query<any>("SELECT * FROM hero_banners WHERE page_key = 'innovations_hero'").catch(() => []),
    ]);

    if (bannerRows && bannerRows.length > 0 && bannerRows[0].image_url) {
      heroImage = resolveImgUrl(bannerRows[0].image_url);
    }

    if (rawInnovations && rawInnovations.length > 0) {
      innovationsList = rawInnovations.map((row) => ({
        id: row.id,
        title: row.title || '',
        description: row.description || '',
        project_image: row.project_image || '',
        video_url: row.video_url || '',
        institution: row.institution || '',
        student_name: row.student_name || '',
        status: row.status || 'approved',
        created_at: formatDate(row.created_at),
        category: row.category || 'Renewable Energy',
        upvotes: row.upvotes || 150,
      }));
    }
  } catch (error) {
    console.error('Error fetching innovations from DB:', error);
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] font-sans">
      {/* Page Hero Header - 50% opacity green overlay & border-b-4 border-[#D9A000] */}
      <section className="relative text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b-4 border-[#D9A000] overflow-hidden bg-gray-900">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
        {/* Semi-transparent Green Overlay (50% Green Opacity) */}
        <div className="absolute inset-0 bg-[#014900]/50 backdrop-brightness-90" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mb-3 drop-shadow-md">
            Innovative Projects
          </h1>
          <p className="text-gray-100 text-sm sm:text-base max-w-2xl mx-auto font-medium drop-shadow-sm">
            Showcasing groundbreaking technical innovations and engineering solutions from students across Ghana
          </p>
        </div>
      </section>

      {/* Main Content Component */}
      <section className="py-8">
        <InnovationsClient dbInnovations={innovationsList} />
      </section>
    </div>
  );
}
