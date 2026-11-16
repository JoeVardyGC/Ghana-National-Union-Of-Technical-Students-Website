import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/dbInit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Creates missing tables. Allowed for a signed-in Super Admin, or (for first-time
 * setup before any admin exists) with the INIT_DB_TOKEN env var sent as
 * the "x-init-token" header.
 */
async function isAuthorized(request: Request): Promise<boolean> {
  const session = await getAdminSession();
  if (session && session.role === 'Super Admin') return true;

  const setupToken = process.env.INIT_DB_TOKEN;
  const provided = request.headers.get('x-init-token');
  return !!(setupToken && setupToken.length >= 16 && provided === setupToken);
}

// POST only: a GET must never change the database (links, crawlers, prefetching)
export async function POST(request: Request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const result = await initializeDatabase();
  return NextResponse.json(result);
}
