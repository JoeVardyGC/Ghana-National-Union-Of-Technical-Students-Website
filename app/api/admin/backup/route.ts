import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Log backup activity
    await logAuditAction(
      session.name || session.username,
      session.role || 'Super Admin',
      'EXPORT_BACKUP',
      'Database Snapshot',
      'Full database snapshot exported'
    );

    // Fetch data from major tables
    const [innovations, scholarships, opportunities, news, executives, resources] = await Promise.all([
      query('SELECT * FROM innovations').catch(() => []),
      query('SELECT * FROM scholarships').catch(() => []),
      query('SELECT * FROM opportunities').catch(() => []),
      query('SELECT * FROM news').catch(() => []),
      query('SELECT * FROM executives').catch(() => []),
      query('SELECT * FROM resources').catch(() => []),
    ]);

    const backupPayload = {
      meta: {
        timestamp: new Date().toISOString(),
        exported_by: session.name || session.username,
        role: session.role,
        version: 'GNUTS Next.js Enterprise 2026',
      },
      data: {
        innovations,
        scholarships,
        opportunities,
        news,
        executives,
        resources,
      },
    };

    const jsonString = JSON.stringify(backupPayload, null, 2);

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="gnuts_db_backup_${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Backup generation failed' }, { status: 500 });
  }
}
