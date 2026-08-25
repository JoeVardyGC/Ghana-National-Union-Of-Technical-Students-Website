import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// PUT: Update scholarship (Protected)
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
    const scholarshipId = Number(resolvedParams.id);
    const body = await request.json();

    const {
      title,
      description,
      requirements,
      deadline,
      link,
      status,
    } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Scholarship title and description are required' }, { status: 400 });
    }

    await query(
      `UPDATE scholarships SET 
        title = ?, 
        description = ?, 
        requirements = ?, 
        deadline = ?, 
        link = ?, 
        status = ? 
       WHERE id = ?`,
      [
        title,
        description,
        requirements || '',
        deadline || null,
        link || '',
        (status || 'active').toLowerCase(),
        scholarshipId,
      ]
    ).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Financial Secretary';

    await logAuditAction(
      userName,
      userRole,
      'UPDATE_SCHOLARSHIP',
      title,
      `Updated scholarship (#${scholarshipId}): "${title}"`
    );

    return NextResponse.json({ success: true, message: 'Scholarship updated successfully' });
  } catch (error: any) {
    console.error('Error updating scholarship:', error);
    return NextResponse.json({ error: 'Failed to update scholarship' }, { status: 500 });
  }
}

// DELETE: Delete scholarship (Protected)
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
    const scholarshipId = Number(resolvedParams.id);

    await query('DELETE FROM scholarships WHERE id = ?', [scholarshipId]).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Financial Secretary';

    await logAuditAction(
      userName,
      userRole,
      'DELETE_SCHOLARSHIP',
      `Scholarship #${scholarshipId}`,
      `Removed scholarship opportunity #${scholarshipId}`
    );

    return NextResponse.json({ success: true, message: 'Scholarship deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting scholarship:', error);
    return NextResponse.json({ error: 'Failed to delete scholarship' }, { status: 500 });
  }
}
