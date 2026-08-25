import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// PUT: Update history milestone (Protected)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const { id } = await params;
    const milestoneId = Number(id);

    if (!milestoneId) {
      return NextResponse.json({ success: false, message: 'Invalid milestone ID' }, { status: 400 });
    }

    const body = await request.json();
    const { year, title, description, image, tag, display_order } = body;

    await query(
      `UPDATE history_milestones SET
        year = ?,
        title = ?,
        description = ?,
        image = ?,
        tag = ?,
        display_order = ?
      WHERE id = ?`,
      [
        year || '',
        title || '',
        description || '',
        image || '',
        tag || '',
        display_order ? Number(display_order) : 1,
        milestoneId,
      ]
    );

    const userName = session.name || session.username || 'Administrator';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'UPDATE_MILESTONE',
      `Milestone #${milestoneId}`,
      `Updated milestone details (${year} - ${title})`
    );

    return NextResponse.json({
      success: true,
      message: 'History milestone updated successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update milestone' },
      { status: 500 }
    );
  }
}

// DELETE: Remove history milestone (Protected)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const { id } = await params;
    const milestoneId = Number(id);

    if (!milestoneId) {
      return NextResponse.json({ success: false, message: 'Invalid milestone ID' }, { status: 400 });
    }

    await query('DELETE FROM history_milestones WHERE id = ?', [milestoneId]);

    const userName = session.name || session.username || 'Administrator';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'DELETE_MILESTONE',
      `Milestone #${milestoneId}`,
      `Deleted history milestone #${milestoneId}`
    );

    return NextResponse.json({
      success: true,
      message: 'History milestone deleted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete milestone' },
      { status: 500 }
    );
  }
}
