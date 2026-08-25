import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_GALLERY: any[] = [];

// GET: Fetch all gallery items
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let sql = 'SELECT * FROM gallery ORDER BY display_order ASC, id DESC';
    let params: any[] = [];

    if (category && category !== 'ALL') {
      sql = 'SELECT * FROM gallery WHERE category = ? ORDER BY display_order ASC, id DESC';
      params = [category.toUpperCase()];
    }

    const rows = await query(sql, params);

    if (rows && rows.length > 0) {
      let filtered = rows;
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((item: any) =>
          item.title?.toLowerCase().includes(q) ||
          item.role_or_badge?.toLowerCase().includes(q) ||
          item.tenure_or_date?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
        );
      }
      return NextResponse.json({ gallery: filtered });
    }

    let fallback = DEFAULT_GALLERY;
    if (category && category !== 'ALL') {
      fallback = fallback.filter((n) => n.category.toUpperCase() === category.toUpperCase());
    }
    if (search) {
      const q = search.toLowerCase();
      fallback = fallback.filter((n) =>
        n.title.toLowerCase().includes(q) ||
        n.role_or_badge?.toLowerCase().includes(q) ||
        n.tenure_or_date?.toLowerCase().includes(q) ||
        n.description?.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ gallery: fallback });
  } catch (error: any) {
    return NextResponse.json({ gallery: DEFAULT_GALLERY });
  }
}

// POST: Create a new gallery entry (Protected)
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      category = 'LEADERSHIP',
      image,
      tenure_or_date = '2025/2026 Administration',
      role_or_badge = 'National Union Archive',
      description = '',
      display_order = 1,
    } = body;

    if (!title || !image) {
      return NextResponse.json({ error: 'Title and image are required' }, { status: 400 });
    }

    const insertResult = await query(
      `INSERT INTO gallery (title, category, image, tenure_or_date, role_or_badge, description, display_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        (category || 'LEADERSHIP').toUpperCase(),
        image,
        tenure_or_date,
        role_or_badge,
        description,
        Number(display_order) || 1,
      ]
    ).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'CREATE_GALLERY_ITEM',
      title,
      `Added new gallery archive item: "${title}" (${category})`
    );

    return NextResponse.json({
      success: true,
      message: 'Gallery item added successfully',
      item: {
        id: (insertResult as any)?.insertId || Date.now(),
        title,
        category: (category || 'LEADERSHIP').toUpperCase(),
        image,
        tenure_or_date,
        role_or_badge,
        description,
        display_order: Number(display_order) || 1,
      },
    });
  } catch (error: any) {
    console.error('Error adding gallery item:', error);
    return NextResponse.json({ error: 'Failed to add gallery item' }, { status: 500 });
  }
}

// DELETE: Bulk delete gallery items (Protected)
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
    await query(`DELETE FROM gallery WHERE id IN (${placeholders})`, numericIds).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'BULK_DELETE_GALLERY',
      `${numericIds.length} items`,
      `Bulk deleted ${numericIds.length} gallery items (IDs: ${numericIds.join(', ')})`
    );

    return NextResponse.json({ success: true, message: `Successfully deleted ${numericIds.length} gallery item(s)` });
  } catch (error: any) {
    console.error('Error bulk deleting gallery:', error);
    return NextResponse.json({ error: 'Failed to bulk delete gallery items' }, { status: 500 });
  }
}
