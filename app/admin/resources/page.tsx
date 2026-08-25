import { query } from '@/lib/db';
import ResourcesManagementClient from './ResourcesManagementClient';

export const dynamic = 'force-dynamic';

export default async function AdminResourcesPage() {
  const resourcesRows = await query('SELECT * FROM resources ORDER BY display_order ASC, created_at DESC').catch(() => []);
  
  return (
    <ResourcesManagementClient initialResources={resourcesRows} />
  );
}
