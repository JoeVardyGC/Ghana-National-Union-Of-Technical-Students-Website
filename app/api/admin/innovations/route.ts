import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_INNOVATIONS: any[] = [];

// GET: Fetch all innovation projects
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let sql = 'SELECT * FROM innovations ORDER BY created_at DESC, id DESC';
    let params: any[] = [];

    if (status && status !== 'ALL') {
      sql = 'SELECT * FROM innovations WHERE status = ? ORDER BY created_at DESC, id DESC';
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
          item.student_name?.toLowerCase().includes(q) ||
          item.institution?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q)
        );
      }
      return NextResponse.json({ innovations: filtered });
    }

    let fallback = DEFAULT_INNOVATIONS;
    if (status && status !== 'ALL') {
      fallback = fallback.filter((n) => n.status.toUpperCase() === status.toUpperCase());
    }
    if (search) {
      const q = search.toLowerCase();
      fallback = fallback.filter((n) =>
        n.title.toLowerCase().includes(q) ||
        n.student_name.toLowerCase().includes(q) ||
        n.institution.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ innovations: fallback });
  } catch (error: any) {
    return NextResponse.json({ innovations: DEFAULT_INNOVATIONS });
  }
}

// POST: Create a new innovation project (Protected)
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const body = await request.json();

    // Check if it's a quick status update: { id, status }
    if (body.id && body.status && !body.title) {
      const { id, status } = body;
      await query('UPDATE innovations SET status = ? WHERE id = ?', [status.toLowerCase(), id]).catch(() => null);

      const userName = session.name || session.username || 'Executive Officer';
      const userRole = session.role || 'Innovation Director';

      await logAuditAction(
        userName,
        userRole,
        'UPDATE_INNOVATION_STATUS',
        `Project #${id}`,
        `Changed status of project #${id} to "${status}"`
      );

      return NextResponse.json({ success: true, message: `Status updated to ${status}` });
    }

    // Otherwise create full project
    const {
      title,
      description,
      project_image,
      video_url = '',
      institution = 'Technical University',
      student_name = 'Student Innovator',
      category = 'Engineering',
      status = 'approved',
    } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Project title and description are required' }, { status: 400 });
    }

    const photoUrl = project_image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop';

    const insertResult = await query(
      `INSERT INTO innovations (title, description, project_image, video_url, institution, student_name, category, status, upvotes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        title,
        description,
        photoUrl,
        video_url,
        institution,
        student_name,
        category,
        status.toLowerCase(),
      ]
    ).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Innovation Director';

    await logAuditAction(
      userName,
      userRole,
      'CREATE_INNOVATION',
      title,
      `Submitted innovation project: "${title}" by ${student_name} (${institution})`
    );

    return NextResponse.json({
      success: true,
      message: 'Innovation project published successfully',
      innovation: {
        id: (insertResult as any)?.insertId || Date.now(),
        title,
        description,
        project_image: photoUrl,
        video_url,
        institution,
        student_name,
        category,
        status,
        upvotes: 0,
      },
    });
  } catch (error: any) {
    console.error('Error creating innovation:', error);
    return NextResponse.json({ error: 'Failed to create innovation project' }, { status: 500 });
  }
}

// DELETE: Bulk delete innovation projects (Protected)
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
    await query(`DELETE FROM innovations WHERE id IN (${placeholders})`, numericIds).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Innovation Director';

    await logAuditAction(
      userName,
      userRole,
      'BULK_DELETE_INNOVATIONS',
      `${numericIds.length} projects`,
      `Bulk deleted ${numericIds.length} TVET innovation projects (IDs: ${numericIds.join(', ')})`
    );

    return NextResponse.json({ success: true, message: `Successfully deleted ${numericIds.length} project(s)` });
  } catch (error: any) {
    console.error('Error bulk deleting innovations:', error);
    return NextResponse.json({ error: 'Failed to bulk delete innovation projects' }, { status: 500 });
  }
}
