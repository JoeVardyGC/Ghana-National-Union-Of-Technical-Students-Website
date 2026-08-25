import { query } from '@/lib/db';
import NewsManagementClient from './NewsManagementClient';

export const dynamic = 'force-dynamic';

export default async function AdminNewsPage() {
  const newsRows = await query('SELECT * FROM news ORDER BY published_at DESC, created_at DESC, id DESC').catch(() => []);
  
  return (
    <NewsManagementClient initialNews={newsRows} />
  );
}
