import { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ArrowLeft, Download, ShieldCheck, Scale, Layers } from 'lucide-react';
import { query } from '@/lib/db';
import ResourcesPageClient, { ResourceItem } from '@/components/ResourcesPageClient';
import { resolveImgUrl } from '@/lib/imageUtils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Resources & Supreme Constitution | GNUTS',
  description:
    'Access and download official constitutional documents, Central Committee communiqués, policy frameworks, and audited records of the Ghana National Union of Technical Students (GNUTS).',
  openGraph: {
    title: 'Resources & Supreme Constitution | GNUTS',
    description:
      'Official public records, constitutional charter, TVET advocacy briefs, and policy documents.',
    images: [
      {
        url: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg',
        width: 1200,
        height: 630,
        alt: 'GNUTS Resources & Constitution',
      },
    ],
  },
};

const DEFAULT_RESOURCES_SEED: ResourceItem[] = [
  {
    id: 1,
    title: 'GNUTS Supreme National Constitution (2025 Revised Edition)',
    category: 'constitution',
    description:
      'The supreme governing constitutional charter of the Ghana National Union of Technical Students. Sets out fundamental student rights, election protocols, national council duties, and administrative structures.',
    file_name: 'GNUTS_Supreme_Constitution_2025.pdf',
    file_size: 2450000,
    file_path: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg',
    display_order: 1,
    downloads: 420,
    created_at: '2025-01-15',
  },
  {
    id: 2,
    title: '34th National Delegates Congress Communiqué & Policy Brief',
    category: 'communique',
    description:
      'Official resolutions and union policy statements passed at the 34th Annual Delegates Congress addressing industrial attachment stipends, university infrastructure, and academic calendar harmonization.',
    file_name: '34th_Congress_Communique.pdf',
    file_size: 1820000,
    file_path: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg',
    display_order: 2,
    downloads: 310,
    created_at: '2025-06-20',
  },
  {
    id: 3,
    title: 'Industrial Attachment Policy & Safety Regulations Guide',
    category: 'academic',
    description:
      'Comprehensive national guidelines for technical students undertaking mandatory internship and industrial attachments across mechanical, electrical, civil, and computing sectors.',
    file_name: 'Attachment_Policy_Safety_Guide.pdf',
    file_size: 1420000,
    file_path: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg',
    display_order: 3,
    downloads: 580,
    created_at: '2025-09-12',
  },
];

export default async function ResourcesPage() {
  let resourcesList: ResourceItem[] = [];
  let heroImage = 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg';

  try {
    const [rows, bannerRows] = await Promise.all([
      query<any>('SELECT * FROM resources ORDER BY display_order ASC, created_at DESC'),
      query<any>('SELECT image_url FROM hero_banners WHERE page_key = "resources_hero" AND status = "active" LIMIT 1').catch(() => []),
    ]);

    if (rows && rows.length > 0) {
      resourcesList = rows.map((r: any) => ({
        id: Number(r.id),
        title: String(r.title || ''),
        description: String(r.description || ''),
        category: String(r.category || 'constitution'),
        file_path: String(r.file_path || ''),
        file_name: String(r.file_name || 'Document.pdf'),
        file_size: Number(r.file_size || 2048000),
        display_order: Number(r.display_order || 1),
        downloads: Number(r.downloads || 0),
        created_at: r.created_at ? String(r.created_at) : undefined,
      }));
    } else {
      resourcesList = DEFAULT_RESOURCES_SEED;
    }

    if (bannerRows && bannerRows.length > 0 && bannerRows[0].image_url) {
      heroImage = resolveImgUrl(bannerRows[0].image_url);
    }
  } catch (err) {
    resourcesList = DEFAULT_RESOURCES_SEED;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] font-['Montserrat',sans-serif]">
      {/* Editorial Page Hero Header */}
      <section className="relative text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b-4 border-[#D9A000] bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
        <div className="absolute inset-0 bg-[#014900]/75 backdrop-brightness-75" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-4">
          {/* Breadcrumbs */}
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-300 font-medium">
            <Link href="/" className="hover:text-[#D9A000] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#D9A000] font-bold">Resources & Constitution</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md uppercase">
            Constitutional Registry & Public Resources
          </h1>

          <p className="text-sm sm:text-base text-gray-200 max-w-2xl mx-auto font-medium leading-relaxed">
            Download official union charters, Central Committee communiqués, TVET policy resolutions, and institutional publications.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="py-12 sm:py-16 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ResourcesPageClient initialResources={resourcesList} />
        </div>
      </main>
    </div>
  );
}
