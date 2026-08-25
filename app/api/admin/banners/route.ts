import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getAdminSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get('page_key');

    let banners: any[] = [];
    if (pageKey) {
      banners = await query('SELECT * FROM hero_banners WHERE page_key = ? ORDER BY display_order ASC, id ASC', [pageKey]);
    } else {
      banners = await query('SELECT * FROM hero_banners ORDER BY display_order ASC, id ASC');
    }

    return NextResponse.json({ banners });
  } catch (error) {
    console.error('Error fetching hero banners:', error);
    return NextResponse.json({ error: 'Failed to fetch hero banners' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAdminSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      page_key = 'home_carousel', 
      title = '', 
      image_url, 
      display_order = 1, 
      status = 'active'
    } = body;

    if (!image_url) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // For single page hero headers (about_hero, news_hero, innovations_hero, scholarships_hero), check if one already exists
    if (page_key !== 'home_carousel') {
      const existing = await query('SELECT * FROM hero_banners WHERE page_key = ?', [page_key]);
      if (existing && existing.length > 0) {
        await query(
          'UPDATE hero_banners SET image_url = ?, title = ?, status = ?, updated_at = NOW() WHERE page_key = ?',
          [image_url, title || `${page_key} banner`, status, page_key]
        );

        await logAuditAction(
          user.name || user.username,
          user.role,
          'UPDATE_HERO_BANNER',
          page_key,
          `Updated hero header banner for ${page_key}`
        );

        return NextResponse.json({ success: true, updated: true });
      }
    }

    // Insert new slide / banner
    const result: any = await query(
      'INSERT INTO hero_banners (page_key, title, image_url, display_order, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [page_key, title, image_url, Number(display_order) || 1, status]
    );

    await logAuditAction(
      user.name || user.username,
      user.role,
      'CREATE_HERO_BANNER',
      page_key,
      `Created new slide image for ${page_key}`
    );

    return NextResponse.json({ 
      success: true, 
      banner: {
        id: result.insertId,
        page_key,
        title,
        image_url,
        display_order,
        status
      }
    });
  } catch (error) {
    console.error('Error creating/updating hero banner:', error);
    return NextResponse.json({ error: 'Failed to save banner' }, { status: 500 });
  }
}

// DELETE: Bulk delete hero banners (Protected)
export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No items selected for deletion' }, { status: 400 });
    }

    const numericIds = ids.map((id: any) => Number(id)).filter((id: number) => !isNaN(id) && id > 0);
    if (numericIds.length === 0) {
      return NextResponse.json({ error: 'Invalid item IDs' }, { status: 400 });
    }

    const placeholders = numericIds.map(() => '?').join(',');
    await query(`DELETE FROM hero_banners WHERE id IN (${placeholders})`, numericIds).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'BULK_DELETE_BANNERS',
      `${numericIds.length} banners`,
      `Bulk deleted ${numericIds.length} hero banner slides (IDs: ${numericIds.join(', ')})`
    );

    return NextResponse.json({ success: true, message: `Successfully deleted ${numericIds.length} banner(s)` });
  } catch (error: any) {
    console.error('Error bulk deleting banners:', error);
    return NextResponse.json({ error: 'Failed to bulk delete hero banners' }, { status: 500 });
  }
}
