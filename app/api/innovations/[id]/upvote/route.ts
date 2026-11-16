import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { consumeRateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

// A visitor can like or unlike at most this many times per minute
const MAX_VOTES = 20;
const WINDOW_MS = 60 * 1000;

/**
 * POST /api/innovations/:id/upvote  { action: 'add' | 'remove' }
 * Saves a like (or removes one) on an approved innovation and returns the new total.
 * There are no visitor accounts, so "one like per person" is tracked in the
 * visitor's browser; the rate limit here only stops rapid repeat voting.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const innovationId = Number(id);
    if (!Number.isInteger(innovationId) || innovationId <= 0) {
      return NextResponse.json({ error: 'Invalid project.' }, { status: 400 });
    }

    if (!consumeRateLimit(`upvote|${getClientIp(request)}`, MAX_VOTES, WINDOW_MS)) {
      return NextResponse.json(
        { error: 'Too many likes in a short time. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const action = body?.action === 'remove' ? 'remove' : 'add';

    const rows = await query<{ id: number; status?: string; upvotes?: number | string | null }>(
      'SELECT * FROM innovations WHERE id = ?',
      [innovationId]
    );
    const project = rows.find((row) => Number(row.id) === innovationId);
    if (!project || String(project.status || '').toLowerCase() !== 'approved') {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    // Read-then-write keeps this compatible with the local fallback store, which
    // cannot run "upvotes = upvotes + 1". Two simultaneous likes may count as one.
    const current = Math.max(0, Number(project.upvotes) || 0);
    const upvotes = action === 'remove' ? Math.max(0, current - 1) : current + 1;

    await query('UPDATE innovations SET upvotes = ? WHERE id = ?', [upvotes, innovationId]);

    revalidatePath('/innovations');
    revalidatePath(`/innovations/${innovationId}`);

    return NextResponse.json({ success: true, upvotes });
  } catch (error) {
    console.error('Upvote error:', error);
    return NextResponse.json({ error: 'Could not save your like. Please try again.' }, { status: 500 });
  }
}
