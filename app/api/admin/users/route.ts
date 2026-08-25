import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_USERS = [
  {
    id: 1,
    name: 'Comrade Joe Vardy',
    email: 'admin@gnuts.org.gh',
    role: 'Super Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    created_at: '2026-01-01',
  },
];

// GET: List all admin users (Protected)
export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    let sql = 'SELECT * FROM users ORDER BY id ASC';
    let params: any[] = [];

    if (role && role !== 'ALL') {
      sql = 'SELECT * FROM users WHERE UPPER(role) = UPPER(?) ORDER BY id ASC';
      params = [role];
    }

    const rows = await query(sql, params);

    if (rows && rows.length > 0) {
      let filtered = rows.map((u: any) => ({
        id: u.id,
        name: u.full_name || u.name || 'Executive Officer',
        email: u.email,
        role: u.role || 'Super Admin',
        avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
        created_at: u.created_at || new Date().toISOString(),
      }));

      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((item: any) =>
          item.name?.toLowerCase().includes(q) ||
          item.email?.toLowerCase().includes(q) ||
          item.role?.toLowerCase().includes(q)
        );
      }
      return NextResponse.json({ users: filtered });
    }

    return NextResponse.json({ users: [] });
  } catch (error: any) {
    return NextResponse.json({ users: [] });
  }
}

// POST: Create a new admin user (Protected)
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      email,
      password,
      role = 'Press & Media',
      avatar = '',
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const avatarUrl = avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop';

    // Insert user into MySQL users table (full_name, email, password, role)
    const insertResult = await query(
      `INSERT INTO users (full_name, email, password, role) 
       VALUES (?, ?, ?, ?)`,
      [
        name,
        email.toLowerCase().trim(),
        password,
        role || 'Super Admin',
      ]
    );

    const userName = session.name || session.username || 'Comrade Joe Vardy';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'CREATE_USER',
      email,
      `Created admin user account: "${name}" (${role})`
    );

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: (insertResult as any)?.insertId || Date.now(),
        name,
        email: email.toLowerCase().trim(),
        role,
        avatar: avatarUrl,
        created_at: new Date().toISOString().substring(0, 10),
      },
    });
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 });
  }
}

// DELETE: Bulk delete admin users (Protected)
export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No users selected for deletion' }, { status: 400 });
    }

    // Filter out root user ID 1 and current user ID
    const currentUserId = session.id;
    const numericIds = ids
      .map((id: any) => Number(id))
      .filter((id: number) => !isNaN(id) && id > 1 && id !== currentUserId);

    if (numericIds.length === 0) {
      return NextResponse.json({ error: 'Primary Super Administrator or your active session cannot be deleted.' }, { status: 400 });
    }

    const placeholders = numericIds.map(() => '?').join(',');
    await query(`DELETE FROM users WHERE id IN (${placeholders})`, numericIds).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'BULK_DELETE_USERS',
      `${numericIds.length} users`,
      `Bulk deleted ${numericIds.length} administrative user accounts (IDs: ${numericIds.join(', ')})`
    );

    return NextResponse.json({ success: true, message: `Successfully deleted ${numericIds.length} user account(s)` });
  } catch (error: any) {
    console.error('Error bulk deleting users:', error);
    return NextResponse.json({ error: 'Failed to bulk delete user accounts' }, { status: 500 });
  }
}
