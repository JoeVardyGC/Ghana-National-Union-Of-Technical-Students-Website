import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_NEWS: any[] = [];

// GET: Fetch news articles
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let sql = 'SELECT * FROM news ORDER BY published_at DESC, created_at DESC, id DESC';
    let params: any[] = [];

    if (status && status !== 'ALL') {
      sql = 'SELECT * FROM news WHERE status = ? ORDER BY published_at DESC, created_at DESC, id DESC';
      params = [status.toLowerCase()];
    }

    const rows = await query(sql, params);

    if (rows && rows.length > 0) {
      let filtered = rows;
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((item: any) => 
          item.title?.toLowerCase().includes(q) || 
          item.content?.toLowerCase().includes(q) ||
          item.author?.toLowerCase().includes(q)
        );
      }
      return NextResponse.json({ news: filtered });
    }

    // Fallback seed
    let fallback = DEFAULT_NEWS;
    if (status && status !== 'ALL') {
      fallback = fallback.filter((n) => n.status.toUpperCase() === status.toUpperCase());
    }
    if (search) {
      const q = search.toLowerCase();
      fallback = fallback.filter((n) => 
        n.title.toLowerCase().includes(q) || 
        n.content.toLowerCase().includes(q) ||
        n.author.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ news: fallback });
  } catch (error: any) {
    return NextResponse.json({ news: DEFAULT_NEWS });
  }
}

// POST: Create a new news article (Protected)
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, 
      content, 
      image, 
      author = 'GNUTS Secretariat', 
      published_at, 
      status = 'published',
      allow_sharing = 1,
      image2 = '',
      image3 = ''
    } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Article title and content are required' }, { status: 400 });
    }

    const formattedDate = published_at || new Date().toISOString().substring(0, 10);
    const articleImg = image || 'https://res.cloudinary.com/dslngzls6/image/upload/v1787056250/gnuts_cc_tech-GUEST_jt8cge.png';

    const insertResult = await query(
      `INSERT INTO news (title, content, image, author, published_at, status, allow_sharing, image2, image3, view_count) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [title, content, articleImg, author, formattedDate, status.toLowerCase(), allow_sharing ? 1 : 0, image2, image3]
    ).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Press & Media';

    await logAuditAction(
      userName,
      userRole,
      'CREATE_NEWS',
      title,
      `Published new article: "${title}" by ${author}`
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Article published successfully',
      article: {
        id: (insertResult as any)?.insertId || Date.now(),
        title,
        content,
        image: articleImg,
        author,
        published_at: formattedDate,
        status,
        allow_sharing,
        image2,
        image3,
        view_count: 0
      }
    });
  } catch (error: any) {
    console.error('Error creating news:', error);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}

// DELETE: Bulk delete news articles (Protected)
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
    await query(`DELETE FROM news WHERE id IN (${placeholders})`, numericIds).catch(() => null);

    const userName = session.name || session.username || 'Executive Officer';
    const userRole = session.role || 'Press & Media';

    await logAuditAction(
      userName,
      userRole,
      'BULK_DELETE_NEWS',
      `${numericIds.length} articles`,
      `Bulk deleted ${numericIds.length} news articles (IDs: ${numericIds.join(', ')})`
    );

    return NextResponse.json({ success: true, message: `Successfully deleted ${numericIds.length} article(s)` });
  } catch (error: any) {
    console.error('Error bulk deleting news:', error);
    return NextResponse.json({ error: 'Failed to bulk delete news articles' }, { status: 500 });
  }
}
