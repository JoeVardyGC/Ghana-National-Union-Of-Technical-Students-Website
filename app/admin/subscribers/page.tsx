import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { hasModulePermission } from '@/lib/authTypes';
import { listSubscribers } from '@/lib/subscribers';
import SubscribersManagementClient from './SubscribersManagementClient';

export const dynamic = 'force-dynamic';

export default async function AdminSubscribersPage() {
  const session = await getAdminSession();
  if (!session || !hasModulePermission(session.role, '/admin/subscribers')) redirect('/admin');

  const subscribers = await listSubscribers().catch(() => []);
  return <SubscribersManagementClient initialSubscribers={subscribers} />;
}
