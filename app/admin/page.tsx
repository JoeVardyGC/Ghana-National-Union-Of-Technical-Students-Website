import { query } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { getAuditLogs } from '@/lib/audit';
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await getAdminSession();

  // Fetch live statistics and recent records in parallel directly from MariaDB
  const [
    newsCountResult,
    activeScholarshipsResult,
    totalScholarshipsResult,
    approvedInnovationsResult,
    pendingInnovationsResult,
    executivesCountResult,
    unreadMessagesResult,
    totalMessagesResult,
    resourcesCountResult,
    opportunitiesCountResult,
    usersCountResult,
    recentNews,
    pendingInnovationsList,
    recentMessages,
    auditLogs
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
    query('SELECT id, title, published_at, status, author, view_count FROM news ORDER BY published_at DESC, id DESC LIMIT 5').catch(() => []),
    query('SELECT id, title, student_name, institution, created_at, category FROM innovations WHERE status = "pending" ORDER BY created_at DESC LIMIT 5').catch(() => []),
    query('SELECT id, name, email, subject, message, created_at, status FROM contact_messages ORDER BY created_at DESC, id DESC LIMIT 5').catch(() => []),
    getAuditLogs(6).catch(() => []),
  ]);

  const initialStats = {
    news: Number(newsCountResult[0]?.count || 0),
    activeScholarships: Number(activeScholarshipsResult[0]?.count || 0),
    totalScholarships: Number(totalScholarshipsResult[0]?.count || 0),
    approvedInnovations: Number(approvedInnovationsResult[0]?.count || 0),
    pendingInnovations: Number(pendingInnovationsResult[0]?.count || 0),
    executives: Number(executivesCountResult[0]?.count || 0),
    unreadMessages: Number(unreadMessagesResult[0]?.count || 0),
    totalMessages: Number(totalMessagesResult[0]?.count || 0),
    resources: Number(resourcesCountResult[0]?.count || 0),
    opportunities: Number(opportunitiesCountResult[0]?.count || 0),
    users: Number(usersCountResult[0]?.count || 0),
  };

  return (
    <AdminDashboardClient
      initialStats={initialStats}
      initialRecentNews={recentNews || []}
      initialPendingInnovations={pendingInnovationsList || []}
      initialRecentMessages={recentMessages || []}
      initialAuditLogs={auditLogs || []}
      userName={session?.name || 'Executive Officer'}
      userRole={session?.role || 'Super Admin'}
    />
  );
}
