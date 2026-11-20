import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { hasModulePermission } from '@/lib/authTypes';
import { deleteSubscriber } from '@/lib/subscribers';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

/** DELETE /api/admin/subscribers/:id removes one alert subscriber */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session || !hasModulePermission(session.role, '/admin/subscribers')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const subscriberId = Number(id);
  if (!Number.isInteger(subscriberId) || subscriberId <= 0) {
    return NextResponse.json({ error: 'Invalid subscriber.' }, { status: 400 });
  }

  try {
    await deleteSubscriber(subscriberId);
    await logAuditAction(session.name || session.username, session.role, 'DELETE_SUBSCRIBER', `Subscriber #${subscriberId}`, 'Removed an alert subscriber');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete subscriber error:', error);
    return NextResponse.json({ error: 'Could not remove the subscriber.' }, { status: 500 });
  }
}
