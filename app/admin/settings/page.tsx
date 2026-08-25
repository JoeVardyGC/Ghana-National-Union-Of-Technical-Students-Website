import { query } from '@/lib/db';
import { getAuditLogs } from '@/lib/audit';
import SettingsManagementClient from './SettingsManagementClient';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const counts = {
    users: 1,
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
    if (u?.[0]?.count) counts.users = u[0].count;
    const e = await query<any>('SELECT COUNT(*) as count FROM executives');
    if (e?.[0]?.count) counts.executives = e[0].count;
    const n = await query<any>('SELECT COUNT(*) as count FROM news');
    if (n?.[0]?.count) counts.news = n[0].count;
    const s = await query<any>('SELECT COUNT(*) as count FROM scholarships');
    if (s?.[0]?.count) counts.scholarships = s[0].count;
    const i = await query<any>('SELECT COUNT(*) as count FROM innovations');
    if (i?.[0]?.count) counts.innovations = i[0].count;
    const o = await query<any>('SELECT COUNT(*) as count FROM opportunities');
    if (o?.[0]?.count) counts.opportunities = o[0].count;
    const r = await query<any>('SELECT COUNT(*) as count FROM resources');
    if (r?.[0]?.count) counts.resources = r[0].count;
    const m = await query<any>('SELECT COUNT(*) as count FROM contact_messages');
    if (m?.[0]?.count) counts.messages = m[0].count;
    const a = await query<any>('SELECT COUNT(*) as count FROM audit_logs');
    if (a?.[0]?.count) counts.audit_logs = a[0].count;
  } catch (err) {
    // Graceful fallback
  }

  const logs = await getAuditLogs(30).catch(() => []);

  return (
    <SettingsManagementClient initialCounts={counts} initialLogs={logs} />
  );
}
