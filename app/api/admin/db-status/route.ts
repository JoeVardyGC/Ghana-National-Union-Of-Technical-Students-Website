import { NextResponse } from 'next/server';
import { getDatabasePool, query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const connectionUri = 
    process.env.DATABASE_PUBLIC_URL ||
    process.env.MYSQL_PUBLIC_URL ||
    process.env.DATABASE_URL ||
    process.env.MYSQL_URL;

  const hasEnvConfigured = !!(connectionUri && connectionUri.trim() !== '');
  const pool = getDatabasePool();

  let isConnectedToMysql = false;
  let mysqlError: string | null = null;
  let tablesList: string[] = [];
  let userCount = 0;
  let serverVersion = '';

  if (pool) {
    try {
      const [testRows]: any = await pool.execute('SELECT 1 + 1 AS test, VERSION() as version');
      if (testRows && testRows.length > 0) {
        isConnectedToMysql = true;
        serverVersion = testRows[0].version || 'MySQL';
      }

      const [tables]: any = await pool.execute('SHOW TABLES');
      if (Array.isArray(tables)) {
        tablesList = tables.map((t: any) => Object.values(t)[0] as string);
      }

      const [userRows]: any = await pool.execute('SELECT COUNT(*) as count FROM users').catch(() => [{ count: 0 }]);
      if (userRows && userRows.length > 0) {
        userCount = Number(userRows[0].count) || 0;
      }
    } catch (err: any) {
      mysqlError = err?.message || String(err);
    }
  }

  // Sanitized Host preview (hiding passwords)
  let hostPreview = 'None / Localhost';
  if (connectionUri) {
    try {
      const parsed = new URL(connectionUri.replace(/^mysql:\/\//, 'http://'));
      hostPreview = `${parsed.username ? parsed.username + '@' : ''}${parsed.hostname}:${parsed.port || 3306}${parsed.pathname}`;
    } catch {
      hostPreview = 'Configured (Masked)';
    }
  }

  return NextResponse.json({
    active_storage_mode: isConnectedToMysql ? 'LIVE_MYSQL_DATABASE' : 'LOCAL_JSON_FALLBACK',
    connected_to_mysql: isConnectedToMysql,
    environment_variable_detected: hasEnvConfigured,
    configured_host: hostPreview,
    mysql_version: serverVersion || null,
    total_users_in_active_db: isConnectedToMysql ? userCount : (await query('SELECT COUNT(*) as count FROM users'))[0]?.count || 0,
    tables_found: tablesList,
    error: mysqlError,
    guide: !isConnectedToMysql ? {
      issue: 'The application is running in local JSON fallback mode because it cannot reach the MySQL database.',
      solution_steps: [
        '1. Ensure you copied the PUBLIC TCP connection URL from Railway (not the internal .railway.internal URL).',
        '2. In Railway MySQL -> Settings -> Public Networking, make sure TCP Proxy / Public Domain is ENABLED.',
        '3. In Vercel -> Settings -> Environment Variables, ensure DATABASE_URL is set and click REDEPLOY.',
        '4. Visit /api/admin/init-db once to create the tables in Railway MySQL.'
      ]
    } : {
      message: 'Your live Railway MySQL database is fully connected and active!'
    }
  });
}
