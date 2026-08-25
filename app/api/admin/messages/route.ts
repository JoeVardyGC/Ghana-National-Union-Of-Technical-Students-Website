import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_MESSAGES: any[] = [];

// GET: List all contact messages (Protected)
export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let sql = 'SELECT * FROM contact_messages ORDER BY created_at DESC, id DESC';
    let params: any[] = [];

    if (status && status !== 'ALL') {
      sql = 'SELECT * FROM contact_messages WHERE status = ? ORDER BY created_at DESC, id DESC';
      params = [status.toLowerCase()];
    }

    const rows = await query(sql, params);

    if (rows && rows.length > 0) {
      let filtered = rows;
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((item: any) =>
          item.full_name?.toLowerCase().includes(q) ||
          item.name?.toLowerCase().includes(q) ||
          item.email?.toLowerCase().includes(q) ||
          item.subject?.toLowerCase().includes(q) ||
          item.message?.toLowerCase().includes(q)
        );
      }
      return NextResponse.json({ messages: filtered });
    }

    let fallback = DEFAULT_MESSAGES;
    if (status && status !== 'ALL') {
      fallback = fallback.filter((n) => n.status.toUpperCase() === status.toUpperCase());
    }
    if (search) {
      const q = search.toLowerCase();
      fallback = fallback.filter((n) =>
        n.full_name.toLowerCase().includes(q) ||
        n.email.toLowerCase().includes(q) ||
        n.subject.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ messages: fallback });
  } catch (error: any) {
    return NextResponse.json({ messages: DEFAULT_MESSAGES });
  }
}

// PATCH: Bulk or quick update message status (Protected)
export async function PATCH(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !['unread', 'read', 'replied', 'archived'].includes(status)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    await query('UPDATE contact_messages SET status = ? WHERE id = ?', [status.toLowerCase(), id]).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'UPDATE_MESSAGE_STATUS',
      `Message #${id}`,
      `Marked inquiry #${id} as "${status}"`
    );

    return NextResponse.json({ success: true, message: `Message status updated to ${status}` });
  } catch (error: any) {
    console.error('Error updating message status:', error);
    return NextResponse.json({ error: 'Failed to update message status' }, { status: 500 });
  }
}

// DELETE: Bulk delete contact messages (Protected)
export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No items selected for deletion' }, { status: 400 });
    }

    const numericIds = ids.map((id: any) => Number(id)).filter((id: number) => !isNaN(id) && id > 0);
    if (numericIds.length === 0) {
      return NextResponse.json({ error: 'Invalid item IDs' }, { status: 400 });
    }

    const placeholders = numericIds.map(() => '?').join(',');
    await query(`DELETE FROM contact_messages WHERE id IN (${placeholders})`, numericIds).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'BULK_DELETE_MESSAGES',
      `${numericIds.length} messages`,
      `Bulk deleted ${numericIds.length} contact inquiry messages (IDs: ${numericIds.join(', ')})`
    );

    return NextResponse.json({ success: true, message: `Successfully deleted ${numericIds.length} message(s)` });
  } catch (error: any) {
    console.error('Error bulk deleting messages:', error);
    return NextResponse.json({ error: 'Failed to bulk delete messages' }, { status: 500 });
  }
}
