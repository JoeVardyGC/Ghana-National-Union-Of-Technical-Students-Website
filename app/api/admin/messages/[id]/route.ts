import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// PATCH: Update specific message status (Protected)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const resolvedParams = await params;
    const messageId = Number(resolvedParams.id);
    const body = await request.json();
    const { status } = body;

    if (!['unread', 'read', 'replied', 'archived'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    await query('UPDATE contact_messages SET status = ? WHERE id = ?', [status.toLowerCase(), messageId]).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'UPDATE_MESSAGE_STATUS',
      `Message #${messageId}`,
      `Marked inquiry #${messageId} as "${status}"`
    );

    return NextResponse.json({ success: true, message: `Message status updated to ${status}` });
  } catch (error: any) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

// DELETE: Delete contact message (Protected)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const resolvedParams = await params;
    const messageId = Number(resolvedParams.id);

    await query('DELETE FROM contact_messages WHERE id = ?', [messageId]).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'DELETE_MESSAGE',
      `Message #${messageId}`,
      `Deleted student contact inquiry #${messageId}`
    );

    return NextResponse.json({ success: true, message: 'Message deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
