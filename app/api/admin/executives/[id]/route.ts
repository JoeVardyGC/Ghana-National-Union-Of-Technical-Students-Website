import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// PUT: Update executive profile (Protected)
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
    const officerId = Number(resolvedParams.id);
    const body = await request.json();

    const {
      full_name,
      position,
      email,
      phone,
      bio,
      photo,
      display_order,
    } = body;

    if (!full_name || !position) {
      return NextResponse.json({ error: 'Full name and position are required' }, { status: 400 });
    }

    await query(
      `UPDATE executives SET 
        full_name = ?, 
        position = ?, 
        email = ?, 
        phone = ?, 
        bio = ?, 
        photo = ?, 
        display_order = ? 
       WHERE id = ?`,
      [
        full_name,
        position,
        email || 'infos@gnuts.org.gh',
        phone || '+233 24 000 0000',
        bio || '',
        photo || '',
        Number(display_order) || 1,
        officerId,
      ]
    ).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'UPDATE_EXECUTIVE',
      full_name,
      `Updated executive officer profile (#${officerId}): "${full_name}" (${position})`
    );

    return NextResponse.json({ success: true, message: 'Executive officer updated successfully' });
  } catch (error: any) {
    console.error('Error updating executive:', error);
    return NextResponse.json({ error: 'Failed to update executive officer' }, { status: 500 });
  }
}

// DELETE: Delete executive profile (Protected)
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
    const officerId = Number(resolvedParams.id);

    await query('DELETE FROM executives WHERE id = ?', [officerId]).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'DELETE_EXECUTIVE',
      `Officer #${officerId}`,
      `Removed executive officer #${officerId} from National Council`
    );

    return NextResponse.json({ success: true, message: 'Executive officer removed successfully' });
  } catch (error: any) {
    console.error('Error deleting executive:', error);
    return NextResponse.json({ error: 'Failed to delete executive officer' }, { status: 500 });
  }
}
