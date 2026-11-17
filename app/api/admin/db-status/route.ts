import { NextResponse } from 'next/server';
import { getDatabaseStatus } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Shows a database URL without its password, e.g. postgres.abc@aws-0-eu.pooler.supabase.com:6543/postgres */
function maskUrl(url: string): string {
  try {
    const parsed = new URL(url.replace(/^(mysql|postgres(ql)?):\/\//i, 'http://'));
    return `${parsed.username ? `${parsed.username}@` : ''}${parsed.hostname}${parsed.port ? `:${parsed.port}` : ''}${parsed.pathname}`;
  } catch {
    return 'Configured (masked)';
  }
}

export async function GET() {
  const session = await getAdminSession();
  if (!session || session.role !== 'Super Admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const connectionUri = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.SUPABASE_DB_URL,
    process.env.DATABASE_PUBLIC_URL,
    process.env.MYSQL_PUBLIC_URL,
    process.env.MYSQL_URL,
  ].find((url) => url && url.trim() !== '');

  const status = await getDatabaseStatus();
  const label = status.dialect === 'postgres' ? 'PostgreSQL (Supabase)' : status.dialect === 'mysql' ? 'MySQL' : 'Local JSON file';
  const live = status.connected && status.dialect !== 'local';

  return NextResponse.json({
    active_storage_mode: live ? (status.dialect === 'postgres' ? 'LIVE_POSTGRES_DATABASE' : 'LIVE_MYSQL_DATABASE') : 'LOCAL_JSON_FALLBACK',
    database_type: label,
    dialect: status.dialect,
    connected: live,
    // Kept for older admin screens: true whenever a live database (MySQL or PostgreSQL) is connected
    connected_to_mysql: live,
    environment_variable_detected: !!connectionUri,
    configured_host: connectionUri ? maskUrl(connectionUri.trim()) : 'None',
    database_version: status.version,
    mysql_version: status.version,
    total_users_in_active_db: status.userCount,
    tables_found: status.tables,
    error: status.error,
    guide: live
      ? { message: `Your live ${label} database is connected.` }
      : {
          issue: 'The site is not connected to a live database, so it is using the local JSON file (development only).',
          solution_steps: [
            '1. In Supabase: Project Settings > Database > Connection string > "Transaction pooler" (port 6543). Copy it and insert your database password.',
            '2. In Vercel: Settings > Environment Variables, set DATABASE_URL to that connection string, then Redeploy.',
            '3. Sign in at /admin/login with ADMIN_EMAIL and ADMIN_PASSWORD: on an empty database this creates the tables and your admin account automatically. To load your saved content, run supabase-import.sql in the Supabase SQL Editor (see SUPABASE_SETUP.md).',
          ],
        },
  });
}
