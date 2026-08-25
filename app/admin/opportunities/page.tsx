import { query } from '@/lib/db';
import OpportunitiesManagementClient from './OpportunitiesManagementClient';

export const dynamic = 'force-dynamic';

export default async function AdminOpportunitiesPage() {
  const opportunityRows = await query('SELECT * FROM opportunities ORDER BY created_at DESC, id DESC').catch(() => []);
  
  return (
    <OpportunitiesManagementClient initialOpportunities={opportunityRows} />
  );
}
