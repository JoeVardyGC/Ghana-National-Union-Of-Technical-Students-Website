import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET: Fetch all history milestones
export async function GET() {
  try {
    const milestones = await query(
      'SELECT * FROM history_milestones ORDER BY display_order ASC, year ASC'
    );
    return NextResponse.json({ success: true, milestones: milestones || [] });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch milestones' },
      { status: 500 }
    );
  }
}

// POST: Create a new history milestone (Protected)
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const body = await request.json();
    const { year, title, description, image, tag, display_order } = body;

    if (!year || !title || !description) {
      return NextResponse.json(
        { success: false, message: 'Year, title, and description are required.' },
        { status: 400 }
      );
    }

    const result: any = await query(
      `INSERT INTO history_milestones (year, title, description, image, tag, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        year.trim(),
        title.trim(),
        description.trim(),
        image || '',
        tag || '',
        display_order ? Number(display_order) : 1,
      ]
    );

    const userName = session.name || session.username || 'Administrator';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'CREATE_MILESTONE',
      `Milestone: ${title} (${year})`,
      `Created union history milestone #${result?.insertId || ''}`
    );

    return NextResponse.json({
      success: true,
      message: 'History milestone created successfully.',
      id: result?.insertId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to create history milestone' },
      { status: 500 }
    );
  }
}
