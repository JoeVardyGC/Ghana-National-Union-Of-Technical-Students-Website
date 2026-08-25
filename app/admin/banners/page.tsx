import { Metadata } from 'next';
import { query } from '@/lib/db';
import BannersManagementClient, { BannerItem } from './BannersManagementClient';

export const metadata: Metadata = {
  title: 'Hero Banners & Carousel Media | GNUTS Executive Portal',
  description: 'Manage homepage hero carousel images and page-specific header banners.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminBannersPage() {
  let banners: BannerItem[] = [];

  try {
    const rows = await query<any>('SELECT * FROM hero_banners ORDER BY display_order ASC, id ASC');
    if (rows && rows.length > 0) {
      banners = rows.map((r: any) => ({
        id: Number(r.id),
        page_key: String(r.page_key || 'home_carousel'),
        title: String(r.title || ''),
        image_url: String(r.image_url || ''),
        display_order: Number(r.display_order) || 1,
        status: String(r.status || 'active'),
      }));
    }
  } catch (error) {
    console.error('Error loading hero banners in admin:', error);
  }

  return <BannersManagementClient initialBanners={banners} />;
}
