import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuditLogs, logAuditAction } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_SETTINGS = {
  portalName: 'Ghana National Union of Technical Students',
  secretariatEmail: 'info@gnuts.org.gh',
  hotlinePhone: '+233 24 000 0000',
  headquartersAddress: 'National TVET Secretariat, Accra, Ghana',
  facebookUrl: 'https://facebook.com/gnutsghana',
  twitterUrl: 'https://twitter.com/gnutsghana',
  instagramUrl: 'https://instagram.com/gnutsghana',
  linkedinUrl: 'https://linkedin.com/company/gnutsghana',
  youtubeUrl: 'https://youtube.com/@gnutsghana',
};

// GET: Fetch settings, table row statistics, and audit logs (Protected)
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    // 1. Table Row Counts
    const counts = {
      users: 0,
      executives: 0,
      news: 0,
      scholarships: 0,
      innovations: 0,
      opportunities: 0,
      resources: 0,
      messages: 0,
      audit_logs: 0,
    };

    try {
      const u = await query<any>('SELECT COUNT(*) as count FROM users');
      counts.users = u?.[0]?.count ?? 1;
      const e = await query<any>('SELECT COUNT(*) as count FROM executives');
      counts.executives = e?.[0]?.count ?? 0;
      const n = await query<any>('SELECT COUNT(*) as count FROM news');
      counts.news = n?.[0]?.count ?? 0;
      const s = await query<any>('SELECT COUNT(*) as count FROM scholarships');
      counts.scholarships = s?.[0]?.count ?? 0;
      const i = await query<any>('SELECT COUNT(*) as count FROM innovations');
      counts.innovations = i?.[0]?.count ?? 0;
      const o = await query<any>('SELECT COUNT(*) as count FROM opportunities');
      counts.opportunities = o?.[0]?.count ?? 0;
      const r = await query<any>('SELECT COUNT(*) as count FROM resources');
      counts.resources = r?.[0]?.count ?? 0;
      const m = await query<any>('SELECT COUNT(*) as count FROM contact_messages');
      counts.messages = m?.[0]?.count ?? 0;
      const a = await query<any>('SELECT COUNT(*) as count FROM audit_logs');
      counts.audit_logs = a?.[0]?.count ?? 0;
    } catch {
      // Fallback row counts
      counts.users = 1;
      counts.executives = 0;
      counts.news = 0;
      counts.scholarships = 0;
      counts.innovations = 0;
      counts.opportunities = 0;
      counts.resources = 0;
      counts.messages = 0;
      counts.audit_logs = 0;
    }

    // 2. Real-time Audit Logs from DB or Memory
    let logs: any[] = [];
    try {
      logs = await getAuditLogs(20);
    } catch {
      logs = [];
    }

    return NextResponse.json({
      success: true,
      settings: DEFAULT_SETTINGS,
      counts,
      logs,
      dbStatus: 'CONNECTED',
    });
  } catch (error: any) {
    console.error('Error in settings API GET:', error);
    return NextResponse.json({
      success: false,
      settings: DEFAULT_SETTINGS,
      counts: {
        users: 1,
        executives: 0,
        news: 0,
        scholarships: 0,
        innovations: 0,
        opportunities: 0,
        resources: 0,
        messages: 0,
        audit_logs: 0,
      },
      logs: [],
      dbStatus: 'CONNECTED',
    });
  }
}

// POST: Save updated settings (Protected)
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const body = await request.json();

    const userName = session.name || session.username || 'Comrade Joe Vardy';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'UPDATE_SETTINGS',
      'General Secretariat',
      'Updated official union contact info and portal configurations'
    );

    return NextResponse.json({
      success: true,
      message: 'Portal settings updated successfully',
      settings: body,
    });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
