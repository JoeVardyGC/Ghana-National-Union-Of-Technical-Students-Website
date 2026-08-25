import { headers } from 'next/headers';
import AdminLayoutClient from './AdminLayoutClient';
import { getAdminSession } from '@/lib/auth';

export const metadata = {
  title: 'GNUTS Executive Admin Portal',
  description: 'National Executive Council Administration & Content Management Suite',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getAdminSession();
  
  return (
    <AdminLayoutClient sessionUser={sessionUser}>
      {children}
    </AdminLayoutClient>
  );
}
