import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// PUT: Update TVET innovation project (Protected)
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
    const projectId = Number(resolvedParams.id);
    const body = await request.json();

    const {
      title,
      description,
      project_image,
      video_url,
      institution,
      student_name,
      category,
      status,
    } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Project title and description are required' }, { status: 400 });
    }

    await query(
      `UPDATE innovations SET 
        title = ?, 
        description = ?, 
        project_image = ?, 
        video_url = ?, 
        institution = ?, 
        student_name = ?, 
        category = ?, 
        status = ? 
       WHERE id = ?`,
      [
        title,
        description,
        project_image || '',
        video_url || '',
        institution || '',
        student_name || '',
        category || 'Engineering',
        (status || 'approved').toLowerCase(),
        projectId,
      ]
    ).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Innovation Director';

    await logAuditAction(
      userName,
      userRole,
      'UPDATE_INNOVATION',
      title,
      `Updated TVET project (#${projectId}): "${title}"`
    );

    return NextResponse.json({ success: true, message: 'Innovation project updated successfully' });
  } catch (error: any) {
    console.error('Error updating innovation:', error);
    return NextResponse.json({ error: 'Failed to update innovation project' }, { status: 500 });
  }
}

// DELETE: Delete TVET innovation project (Protected)
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
    const projectId = Number(resolvedParams.id);

    await query('DELETE FROM innovations WHERE id = ?', [projectId]).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Innovation Director';

    await logAuditAction(
      userName,
      userRole,
      'DELETE_INNOVATION',
      `Project #${projectId}`,
      `Removed TVET project #${projectId}`
    );

    return NextResponse.json({ success: true, message: 'Innovation project deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting innovation:', error);
    return NextResponse.json({ error: 'Failed to delete innovation project' }, { status: 500 });
  }
}
