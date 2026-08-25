import { query } from '@/lib/db';
import UsersManagementClient from './UsersManagementClient';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const usersRows = await query('SELECT id, name, email, role, avatar, created_at FROM users ORDER BY id ASC').catch(() => []);
  
  return (
    <UsersManagementClient initialUsers={usersRows} />
  );
}
