import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { getAuditLogs } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [
      newsCountRes,
      activeScholarshipsRes,
      totalScholarshipsRes,
      approvedInnovationsRes,
      pendingInnovationsRes,
      executivesCountRes,
      unreadMessagesRes,
      totalMessagesRes,
      resourcesCountRes,
      opportunitiesCountRes,
      usersCountRes,
      galleryCountRes,
      recentNewsRes,
      pendingInnovationsListRes,
      recentMessagesRes,
      auditLogsRes
    ] = await Promise.all([
      query('SELECT COUNT(*) as count FROM news').catch(() => [{ count: 0 }]),
      query('SELECT COUNT(*) as count FROM scholarships WHERE status = "active"').catch(() => [{ count: 0 }]),
      query('SELECT COUNT(*) as count FROM scholarships').catch(() => [{ count: 0 }]),
      query('SELECT COUNT(*) as count FROM innovations WHERE status = "approved"').catch(() => [{ count: 0 }]),
      query('SELECT COUNT(*) as count FROM innovations WHERE status = "pending"').catch(() => [{ count: 0 }]),
      query('SELECT COUNT(*) as count FROM executives').catch(() => [{ count: 0 }]),
      query('SELECT COUNT(*) as count FROM contact_messages WHERE status = "unread"').catch(() => [{ count: 0 }]),
      query('SELECT COUNT(*) as count FROM contact_messages').catch(() => [{ count: 0 }]),
      query('SELECT COUNT(*) as count FROM resources').catch(() => [{ count: 0 }]),
      query('SELECT COUNT(*) as count FROM opportunities WHERE status = "active"').catch(() => [{ count: 0 }]),
      query('SELECT COUNT(*) as count FROM users').catch(() => [{ count: 0 }]),
      query('SELECT COUNT(*) as count FROM gallery').catch(() => [{ count: 0 }]),
      query('SELECT id, title, published_at, status, author, view_count FROM news ORDER BY published_at DESC, id DESC LIMIT 5').catch(() => []),
      query('SELECT id, title, student_name, institution, created_at, category FROM innovations WHERE status = "pending" ORDER BY created_at DESC LIMIT 5').catch(() => []),
      query('SELECT id, name, email, subject, message, created_at, status FROM contact_messages ORDER BY created_at DESC, id DESC LIMIT 5').catch(() => []),
      getAuditLogs(6).catch(() => [])
    ]);

    const stats = {
      news: Number(newsCountRes[0]?.count || 0),
      activeScholarships: Number(activeScholarshipsRes[0]?.count || 0),
      totalScholarships: Number(totalScholarshipsRes[0]?.count || 0),
      approvedInnovations: Number(approvedInnovationsRes[0]?.count || 0),
      pendingInnovations: Number(pendingInnovationsRes[0]?.count || 0),
      executives: Number(executivesCountRes[0]?.count || 0),
      unreadMessages: Number(unreadMessagesRes[0]?.count || 0),
      totalMessages: Number(totalMessagesRes[0]?.count || 0),
      resources: Number(resourcesCountRes[0]?.count || 0),
      opportunities: Number(opportunitiesCountRes[0]?.count || 0),
      users: Number(usersCountRes[0]?.count || 0),
      gallery: Number(galleryCountRes[0]?.count || 0),
    };

    return NextResponse.json({
      success: true,
      stats,
      recentNews: recentNewsRes || [],
      pendingInnovations: pendingInnovationsListRes || [],
      recentMessages: recentMessagesRes || [],
      auditLogs: auditLogsRes || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching dashboard real-time data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard metrics' }, { status: 500 });
  }
}
