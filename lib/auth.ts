import { cookies } from 'next/headers';
import { AdminRole, AdminSessionUser, hasModulePermission } from './authTypes';

export * from './authTypes';

export async function getAdminSession(): Promise<AdminSessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('gnuts_admin_session');

    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    const userData: AdminSessionUser = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
    );

    return userData || null;
  } catch (error) {
    return null;
  }
}
