import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getAdminSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const bannerId = Number(resolvedParams.id);
    const body = await request.json();
    const { image_url, title, display_order, status } = body;

    await query(
      'UPDATE hero_banners SET image_url = ?, title = ?, display_order = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [image_url, title || '', Number(display_order) || 1, status || 'active', bannerId]
    );

    await logAuditAction(
      user.name || user.username,
      user.role,
      'UPDATE_HERO_BANNER',
      `Banner #${bannerId}`,
      `Updated banner image and settings for ID ${bannerId}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getAdminSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const bannerId = Number(resolvedParams.id);

    await query('DELETE FROM hero_banners WHERE id = ?', [bannerId]);

    await logAuditAction(
      user.name || user.username,
      user.role,
      'DELETE_HERO_BANNER',
      `Banner #${bannerId}`,
      `Deleted carousel banner #${bannerId}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
