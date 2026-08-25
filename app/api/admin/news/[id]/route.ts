import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// PUT: Update an existing news article (Protected)
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
    const newsId = Number(resolvedParams.id);
    const body = await request.json();

    const { 
      title, 
      content, 
      image, 
      author, 
      published_at, 
      status, 
      allow_sharing, 
      image2, 
      image3 
    } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    await query(
      `UPDATE news SET 
        title = ?, 
        content = ?, 
        image = ?, 
        author = ?, 
        published_at = ?, 
        status = ?, 
        allow_sharing = ?, 
        image2 = ?, 
        image3 = ? 
       WHERE id = ?`,
      [
        title, 
        content, 
        image, 
        author || 'GNUTS Secretariat', 
        published_at || new Date().toISOString().substring(0, 10), 
        (status || 'published').toLowerCase(), 
        allow_sharing ? 1 : 0, 
        image2 || '', 
        image3 || '', 
        newsId
      ]
    ).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Press & Media';

    await logAuditAction(
      userName,
      userRole,
      'UPDATE_NEWS',
      title,
      `Updated article (#${newsId}): "${title}"`
    );

    return NextResponse.json({ success: true, message: 'Article updated successfully' });
  } catch (error: any) {
    console.error('Error updating news:', error);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

// DELETE: Delete a news article (Protected)
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
    const newsId = Number(resolvedParams.id);

    await query('DELETE FROM news WHERE id = ?', [newsId]).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Press & Media';

    await logAuditAction(
      userName,
      userRole,
      'DELETE_NEWS',
      `Article #${newsId}`,
      `Deleted article #${newsId}`
    );

    return NextResponse.json({ success: true, message: 'Article deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting news:', error);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
