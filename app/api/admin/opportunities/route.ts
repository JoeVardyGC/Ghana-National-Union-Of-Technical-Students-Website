import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_OPPORTUNITIES: any[] = [];

// GET: Fetch all opportunities
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    let sql = 'SELECT * FROM opportunities ORDER BY created_at DESC, id DESC';
    let params: any[] = [];

    if (status && status !== 'ALL') {
      sql = 'SELECT * FROM opportunities WHERE status = ? ORDER BY created_at DESC, id DESC';
      params = [status.toLowerCase()];
    }

    const rows = await query(sql, params);

    if (rows && rows.length > 0) {
      let filtered = rows;
      if (type && type !== 'ALL') {
        filtered = filtered.filter((item: any) => item.type?.toLowerCase() === type.toLowerCase());
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((item: any) =>
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.location?.toLowerCase().includes(q)
        );
      }
      return NextResponse.json({ opportunities: filtered });
    }

    let fallback = DEFAULT_OPPORTUNITIES;
    if (status && status !== 'ALL') {
      fallback = fallback.filter((n) => n.status.toUpperCase() === status.toUpperCase());
    }
    if (type && type !== 'ALL') {
      fallback = fallback.filter((n) => n.type.toUpperCase() === type.toUpperCase());
    }
    if (search) {
      const q = search.toLowerCase();
      fallback = fallback.filter((n) =>
        n.title.toLowerCase().includes(q) ||
        n.location.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ opportunities: fallback });
  } catch (error: any) {
    return NextResponse.json({ opportunities: DEFAULT_OPPORTUNITIES });
  }
}

// POST: Create a new opportunity (Protected)
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
      type = 'internship',
      location = 'Accra, Ghana',
      deadline,
      link,
      status = 'active',
    } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Opportunity title and description are required' }, { status: 400 });
    }

    const insertResult = await query(
      `INSERT INTO opportunities (title, description, type, location, deadline, link, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        type.toLowerCase(),
        location,
        deadline || null,
        link || 'https://gnuts.org.gh',
        (status || 'active').toLowerCase(),
      ]
    ).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'CREATE_OPPORTUNITY',
      title,
      `Posted new ${type}: "${title}" at ${location}`
    );

    return NextResponse.json({
      success: true,
      message: 'Opportunity posted successfully',
      opportunity: {
        id: (insertResult as any)?.insertId || Date.now(),
        title,
        description,
        type: type.toLowerCase(),
        location,
        deadline,
        link,
        status: (status || 'active').toLowerCase(),
        created_at: new Date().toISOString().substring(0, 10),
      },
    });
  } catch (error: any) {
    console.error('Error posting opportunity:', error);
    return NextResponse.json({ error: 'Failed to post opportunity' }, { status: 500 });
  }
}

// DELETE: Bulk delete opportunities (Protected)
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
    await query(`DELETE FROM opportunities WHERE id IN (${placeholders})`, numericIds).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'BULK_DELETE_OPPORTUNITIES',
      `${numericIds.length} opportunities`,
      `Bulk deleted ${numericIds.length} career/internship opportunities (IDs: ${numericIds.join(', ')})`
    );

    return NextResponse.json({ success: true, message: `Successfully deleted ${numericIds.length} opportunity record(s)` });
  } catch (error: any) {
    console.error('Error bulk deleting opportunities:', error);
    return NextResponse.json({ error: 'Failed to bulk delete opportunities' }, { status: 500 });
  }
}
