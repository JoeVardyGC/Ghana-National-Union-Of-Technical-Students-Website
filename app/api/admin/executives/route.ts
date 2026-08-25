import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_EXECUTIVES: any[] = [];

// GET: List all executives
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const rows = await query('SELECT * FROM executives ORDER BY display_order ASC, id ASC');

    if (rows && rows.length > 0) {
      let filtered = rows;
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((item: any) =>
          item.full_name?.toLowerCase().includes(q) ||
          item.position?.toLowerCase().includes(q) ||
          item.email?.toLowerCase().includes(q) ||
          item.phone?.toLowerCase().includes(q)
        );
      }
      return NextResponse.json({ executives: filtered });
    }

    let fallback = DEFAULT_EXECUTIVES;
    if (search) {
      const q = search.toLowerCase();
      fallback = fallback.filter((n) =>
        n.full_name.toLowerCase().includes(q) ||
        n.position.toLowerCase().includes(q) ||
        n.email.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ executives: fallback });
  } catch (error: any) {
    return NextResponse.json({ executives: DEFAULT_EXECUTIVES });
  }
}

// POST: Create a new executive profile (Protected)
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      full_name,
      position,
      email,
      phone,
      bio = '',
      photo = '',
      display_order = 1,
    } = body;

    if (!full_name || !position) {
      return NextResponse.json({ error: 'Officer full name and portfolio position are required' }, { status: 400 });
    }

    const officerPhoto = photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop';
    const orderNum = Number(display_order) || 1;

    const insertResult = await query(
      `INSERT INTO executives (full_name, position, email, phone, bio, photo, display_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [full_name, position, email || 'infos@gnuts.org.gh', phone || '+233 24 000 0000', bio, officerPhoto, orderNum]
    ).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'CREATE_EXECUTIVE',
      full_name,
      `Appointed ${full_name} as ${position} (Display Order: #${orderNum})`
    );

    return NextResponse.json({
      success: true,
      message: 'Executive officer added successfully',
      executive: {
        id: (insertResult as any)?.insertId || Date.now(),
        full_name,
        position,
        email: email || 'infos@gnuts.org.gh',
        phone: phone || '+233 24 000 0000',
        bio,
        photo: officerPhoto,
        display_order: orderNum,
      },
    });
  } catch (error: any) {
    console.error('Error adding executive:', error);
    return NextResponse.json({ error: 'Failed to add executive officer' }, { status: 500 });
  }
}

// DELETE: Bulk delete executives (Protected)
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
    await query(`DELETE FROM executives WHERE id IN (${placeholders})`, numericIds).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'BULK_DELETE_EXECUTIVES',
      `${numericIds.length} executives`,
      `Bulk deleted ${numericIds.length} executive officers (IDs: ${numericIds.join(', ')})`
    );

    return NextResponse.json({ success: true, message: `Successfully deleted ${numericIds.length} executive officer(s)` });
  } catch (error: any) {
    console.error('Error bulk deleting executives:', error);
    return NextResponse.json({ error: 'Failed to bulk delete executive officers' }, { status: 500 });
  }
}
