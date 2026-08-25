import { query } from '@/lib/db';
import UsersManagementClient from './UsersManagementClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminUsersPage() {
  const rawUsers = await query('SELECT * FROM users ORDER BY id ASC').catch(() => []);
  const usersRows = rawUsers.map((u: any) => ({
    id: u.id,
    name: u.full_name || u.name || 'Executive Officer',
    email: u.email,
    role: u.role || 'Super Admin',
    avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    created_at: u.created_at || new Date().toISOString(),
  }));
  
  return (
    <UsersManagementClient initialUsers={usersRows} />
  );
}
