import { query } from '@/lib/db';
import InnovationsManagementClient from './InnovationsManagementClient';

export const dynamic = 'force-dynamic';

export default async function AdminInnovationsPage() {
  const innovationsRows = await query('SELECT * FROM innovations ORDER BY created_at DESC, id DESC').catch(() => []);
  
  return (
    <InnovationsManagementClient initialInnovations={innovationsRows} />
  );
}
