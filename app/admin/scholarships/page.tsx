import { query } from '@/lib/db';
import ScholarshipsManagementClient from './ScholarshipsManagementClient';

export const dynamic = 'force-dynamic';

export default async function AdminScholarshipsPage() {
  const scholarshipRows = await query('SELECT * FROM scholarships ORDER BY created_at DESC').catch(() => []);
  
  return (
    <ScholarshipsManagementClient initialScholarships={scholarshipRows} />
  );
}
