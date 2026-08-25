import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// PUT: Update admin user (Protected)
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
    const userId = Number(resolvedParams.id);
    const body = await request.json();

    const {
      name,
      email,
      password,
      role,
      avatar,
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    if (password && password.trim() !== '') {
      await query(
        `UPDATE users SET 
          full_name = ?, 
          email = ?, 
          password = ?, 
          role = ?
         WHERE id = ?`,
        [
          name,
          email.toLowerCase().trim(),
          password,
          role || 'Super Admin',
          userId,
        ]
      );
    } else {
      await query(
        `UPDATE users SET 
          full_name = ?, 
          email = ?, 
          role = ?
         WHERE id = ?`,
        [
          name,
          email.toLowerCase().trim(),
          role || 'Super Admin',
          userId,
        ]
      );
    }

    const userName = session.name || session.username || 'Comrade Joe Vardy';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'UPDATE_USER',
      email,
      `Updated user account (#${userId}): "${name}" (${role})`
    );

    return NextResponse.json({ success: true, message: 'User account updated successfully' });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user account' }, { status: 500 });
  }
}

// DELETE: Delete admin user (Protected)
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
    const userId = Number(resolvedParams.id);

    // Safeguard: Never delete user ID 1 or the currently active user
    if (userId === 1 || session?.id === userId) {
      return NextResponse.json({ error: 'Cannot delete primary Super Admin or currently logged-in account' }, { status: 403 });
    }

    await query('DELETE FROM users WHERE id = ?', [userId]).catch(() => null);

    const userName = session.name || session.username || 'Comrade Joe Vardy';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'DELETE_USER',
      `User #${userId}`,
      `Removed admin user account #${userId}`
    );

    return NextResponse.json({ success: true, message: 'User account deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user account' }, { status: 500 });
  }
}
