import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// PUT: Update gallery item (Protected)
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
    const itemId = Number(resolvedParams.id);
    const body = await request.json();

    const {
      title,
      category,
      image,
      tenure_or_date,
      role_or_badge,
      description,
      display_order,
    } = body;

    if (!title || !image) {
      return NextResponse.json({ error: 'Title and image are required' }, { status: 400 });
    }

    await query(
      `UPDATE gallery SET 
        title = ?, 
        category = ?, 
        image = ?, 
        tenure_or_date = ?, 
        role_or_badge = ?, 
        description = ?, 
        display_order = ? 
       WHERE id = ?`,
      [
        title,
        (category || 'LEADERSHIP').toUpperCase(),
        image,
        tenure_or_date || '',
        role_or_badge || '',
        description || '',
        Number(display_order) || 1,
        itemId,
      ]
    ).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'UPDATE_GALLERY_ITEM',
      title,
      `Updated gallery archive item (#${itemId}): "${title}"`
    );

    return NextResponse.json({ success: true, message: 'Gallery item updated successfully' });
  } catch (error: any) {
    console.error('Error updating gallery item:', error);
    return NextResponse.json({ error: 'Failed to update gallery item' }, { status: 500 });
  }
}

// DELETE: Delete gallery item (Protected)
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
    const itemId = Number(resolvedParams.id);

    await query('DELETE FROM gallery WHERE id = ?', [itemId]).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'DELETE_GALLERY_ITEM',
      `Gallery Item #${itemId}`,
      `Removed gallery item #${itemId}`
    );

    return NextResponse.json({ success: true, message: 'Gallery item removed successfully' });
  } catch (error: any) {
    console.error('Error deleting gallery item:', error);
    return NextResponse.json({ error: 'Failed to delete gallery item' }, { status: 500 });
  }
}
