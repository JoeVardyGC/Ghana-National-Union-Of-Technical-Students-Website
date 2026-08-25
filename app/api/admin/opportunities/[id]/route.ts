import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// PUT: Update opportunity (Protected)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const resolvedParams = await params;
    const oppId = Number(resolvedParams.id);
    const body = await request.json();

    const {
      title,
      description,
      type,
      location,
      deadline,
      link,
      status,
    } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Opportunity title and description are required' }, { status: 400 });
    }

    await query(
      `UPDATE opportunities SET 
        title = ?, 
        description = ?, 
        type = ?, 
        location = ?, 
        deadline = ?, 
        link = ?, 
        status = ? 
       WHERE id = ?`,
      [
        title,
        description,
        (type || 'internship').toLowerCase(),
        location || 'Ghana',
        deadline || null,
        link || '',
        (status || 'active').toLowerCase(),
        oppId,
      ]
    ).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'UPDATE_OPPORTUNITY',
      title,
      `Updated opportunity (#${oppId}): "${title}"`
    );

    return NextResponse.json({ success: true, message: 'Opportunity updated successfully' });
  } catch (error: any) {
    console.error('Error updating opportunity:', error);
    return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 });
  }
}

// DELETE: Delete opportunity (Protected)
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
    const oppId = Number(resolvedParams.id);

    await query('DELETE FROM opportunities WHERE id = ?', [oppId]).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'DELETE_OPPORTUNITY',
      `Opportunity #${oppId}`,
      `Removed opportunity #${oppId}`
    );

    return NextResponse.json({ success: true, message: 'Opportunity deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting opportunity:', error);
    return NextResponse.json({ error: 'Failed to delete opportunity' }, { status: 500 });
  }
}
