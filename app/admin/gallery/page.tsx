import { Metadata } from 'next';
import { query } from '@/lib/db';
import GalleryManagementClient, { AdminGalleryItem } from './GalleryManagementClient';

export const metadata: Metadata = {
  title: 'Legacy & Leadership Gallery | GNUTS Executive Portal',
  description: 'Manage the GNUTS Legacy & Leadership archive, historic congress photos, and executive milestones.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminGalleryPage() {
  let items: AdminGalleryItem[] = [];

  try {
    const rows = await query<any>('SELECT * FROM gallery ORDER BY display_order ASC, id DESC');
    if (rows && rows.length > 0) {
      items = rows.map((r: any) => ({
        id: Number(r.id),
        title: String(r.title || ''),
        category: String(r.category || 'LEADERSHIP'),
        image: String(r.image || ''),
        tenure_or_date: r.tenure_or_date ? String(r.tenure_or_date) : 'Archive',
        role_or_badge: r.role_or_badge ? String(r.role_or_badge) : 'Union Archive',
        description: r.description ? String(r.description) : '',
        display_order: Number(r.display_order) || 1,
        created_at: r.created_at ? String(r.created_at) : undefined,
      }));
    }
  } catch (error) {
    console.error('Error loading gallery items in admin:', error);
  }

  return (
    <div className="space-y-6">
      <GalleryManagementClient initialItems={items} />
    </div>
  );
}
