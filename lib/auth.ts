import { cookies } from 'next/headers';
import { AdminRole, AdminSessionUser, hasModulePermission } from './authTypes';

export * from './authTypes';

const DEFAULT_ADMIN_USER: AdminSessionUser = {
  id: 1,
  username: 'admin@gnuts.org.gh',
  name: 'GNUTS Secretariat',
  role: 'Super Admin',
  email: 'admin@gnuts.org.gh'
};

export async function getAdminSession(): Promise<AdminSessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('gnuts_admin_session');

    if (!sessionCookie || !sessionCookie.value) {
      return DEFAULT_ADMIN_USER;
    }

    const userData: AdminSessionUser = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
    );

    return userData || DEFAULT_ADMIN_USER;
  } catch (error) {
    return DEFAULT_ADMIN_USER;
  }
}
