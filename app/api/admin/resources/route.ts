import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_RESOURCES: any[] = [];

// GET: Fetch all resources
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let sql = 'SELECT * FROM resources ORDER BY display_order ASC, created_at DESC';
    let params: any[] = [];

    if (category && category !== 'ALL') {
      sql = 'SELECT * FROM resources WHERE category = ? ORDER BY display_order ASC, created_at DESC';
      params = [category.toLowerCase()];
    }

    const rows = await query(sql, params);

    if (rows && rows.length > 0) {
      let filtered = rows;
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((item: any) =>
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.file_name?.toLowerCase().includes(q)
        );
      }
      return NextResponse.json({ resources: filtered });
    }

    let fallback = DEFAULT_RESOURCES;
    if (category && category !== 'ALL') {
      fallback = fallback.filter((n) => n.category.toUpperCase() === category.toUpperCase());
    }
    if (search) {
      const q = search.toLowerCase();
      fallback = fallback.filter((n) =>
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ resources: fallback });
  } catch (error: any) {
    return NextResponse.json({ resources: DEFAULT_RESOURCES });
  }
}

// POST: Create a new resource / document (Protected)
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description = '',
      category = 'constitution',
      file_path,
      file_name,
      file_size = 2048000,
      display_order = 1,
    } = body;

    if (!title || !file_path) {
      return NextResponse.json({ error: 'Document title and file are required' }, { status: 400 });
    }

    const insertResult = await query(
      `INSERT INTO resources (title, description, category, file_path, file_name, file_size, display_order, downloads) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        title,
        description,
        (category || 'constitution').toLowerCase(),
        file_path,
        file_name || 'document.pdf',
        file_size,
        display_order,
      ]
    ).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'CREATE_RESOURCE',
      title,
      `Uploaded official document: "${title}" (${category})`
    );

    return NextResponse.json({
      success: true,
      message: 'Document published successfully',
      resource: {
        id: (insertResult as any)?.insertId || Date.now(),
        title,
        description,
        category: (category || 'constitution').toLowerCase(),
        file_path,
        file_name: file_name || 'document.pdf',
        file_size,
        display_order,
        downloads: 0,
        created_at: new Date().toISOString().substring(0, 10),
      },
    });
  } catch (error: any) {
    console.error('Error creating resource:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}

// DELETE: Bulk delete resources / documents (Protected)
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
    await query(`DELETE FROM resources WHERE id IN (${placeholders})`, numericIds).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'BULK_DELETE_RESOURCES',
      `${numericIds.length} resources`,
      `Bulk deleted ${numericIds.length} official documents (IDs: ${numericIds.join(', ')})`
    );

    return NextResponse.json({ success: true, message: `Successfully deleted ${numericIds.length} document(s)` });
  } catch (error: any) {
    console.error('Error bulk deleting resources:', error);
    return NextResponse.json({ error: 'Failed to bulk delete documents' }, { status: 500 });
  }
}
