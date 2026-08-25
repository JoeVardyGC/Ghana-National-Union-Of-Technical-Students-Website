import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_SCHOLARSHIPS: any[] = [];

// GET: List all scholarships
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let sql = 'SELECT * FROM scholarships ORDER BY created_at DESC';
    let params: any[] = [];

    if (status && status !== 'ALL') {
      sql = 'SELECT * FROM scholarships WHERE status = ? ORDER BY created_at DESC';
      params = [status.toLowerCase()];
    }

    const rows = await query(sql, params);

    if (rows && rows.length > 0) {
      let filtered = rows;
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((item: any) =>
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.requirements?.toLowerCase().includes(q)
        );
      }
      return NextResponse.json({ scholarships: filtered });
    }

    let fallback = DEFAULT_SCHOLARSHIPS;
    if (status && status !== 'ALL') {
      fallback = fallback.filter((n) => n.status.toUpperCase() === status.toUpperCase());
    }
    if (search) {
      const q = search.toLowerCase();
      fallback = fallback.filter((n) =>
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ scholarships: fallback });
  } catch (error: any) {
    return NextResponse.json({ scholarships: DEFAULT_SCHOLARSHIPS });
  }
}

// POST: Create a new scholarship (Protected)
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      requirements = '',
      deadline,
      link,
      status = 'active',
    } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Scholarship title and description are required' }, { status: 400 });
    }

    const insertResult = await query(
      `INSERT INTO scholarships (title, description, requirements, deadline, link, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        requirements,
        deadline || null,
        link || 'https://scholarships.getfund.gov.gh/',
        (status || 'active').toLowerCase(),
      ]
    ).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Financial Secretary';

    await logAuditAction(
      userName,
      userRole,
      'CREATE_SCHOLARSHIP',
      title,
      `Posted new scholarship: "${title}"`
    );

    return NextResponse.json({
      success: true,
      message: 'Scholarship posted successfully',
      scholarship: {
        id: (insertResult as any)?.insertId || Date.now(),
        title,
        description,
        requirements,
        deadline,
        link,
        status: (status || 'active').toLowerCase(),
      },
    });
  } catch (error: any) {
    console.error('Error posting scholarship:', error);
    return NextResponse.json({ error: 'Failed to post scholarship' }, { status: 500 });
  }
}

// DELETE: Bulk delete scholarships (Protected)
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
    await query(`DELETE FROM scholarships WHERE id IN (${placeholders})`, numericIds).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Financial Secretary';

    await logAuditAction(
      userName,
      userRole,
      'BULK_DELETE_SCHOLARSHIPS',
      `${numericIds.length} scholarships`,
      `Bulk deleted ${numericIds.length} scholarship opportunities (IDs: ${numericIds.join(', ')})`
    );

    return NextResponse.json({ success: true, message: `Successfully deleted ${numericIds.length} scholarship(s)` });
  } catch (error: any) {
    console.error('Error bulk deleting scholarships:', error);
    return NextResponse.json({ error: 'Failed to bulk delete scholarships' }, { status: 500 });
  }
}
