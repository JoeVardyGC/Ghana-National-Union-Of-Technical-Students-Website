import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// PUT: Update resource / document (Protected)
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
    const resourceId = Number(resolvedParams.id);
    const body = await request.json();

    const {
      title,
      description,
      category,
      file_path,
      file_name,
      file_size,
      display_order,
    } = body;

    if (!title || !file_path) {
      return NextResponse.json({ error: 'Document title and file are required' }, { status: 400 });
    }

    await query(
      `UPDATE resources SET 
        title = ?, 
        description = ?, 
        category = ?, 
        file_path = ?, 
        file_name = ?, 
        file_size = ?, 
        display_order = ? 
       WHERE id = ?`,
      [
        title,
        description || '',
        (category || 'constitution').toLowerCase(),
        file_path,
        file_name || 'document.pdf',
        file_size || 2048000,
        display_order || 1,
        resourceId,
      ]
    ).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'UPDATE_RESOURCE',
      title,
      `Updated official document (#${resourceId}): "${title}"`
    );

    return NextResponse.json({ success: true, message: 'Document updated successfully' });
  } catch (error: any) {
    console.error('Error updating resource:', error);
    return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
  }
}

// DELETE: Delete resource (Protected)
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
    const resourceId = Number(resolvedParams.id);

    await query('DELETE FROM resources WHERE id = ?', [resourceId]).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'DELETE_RESOURCE',
      `Document #${resourceId}`,
      `Removed official document #${resourceId}`
    );

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting resource:', error);
    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
  }
}
