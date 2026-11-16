import { cookies } from 'next/headers';
import { AdminSessionUser } from './authTypes';
import { SESSION_COOKIE_NAME, verifySessionToken } from './session';

export * from './authTypes';

export async function getAdminSession(): Promise<AdminSessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    return await verifySessionToken(sessionCookie?.value);
  } catch {
    return null;
  }
}
