import { query } from '@/lib/db';
import ExecutivesManagementClient from './ExecutivesManagementClient';

export const dynamic = 'force-dynamic';

export default async function AdminExecutivesPage() {
  const executivesRows = await query('SELECT * FROM executives ORDER BY display_order ASC, id ASC').catch(() => []);
  
  return (
    <ExecutivesManagementClient initialExecutives={executivesRows} />
  );
}
