import { NextResponse } from 'next/server';
import { addSubscriber, parseContact } from '@/lib/subscribers';
import { consumeRateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

// A visitor can sign up at most this many times per 10 minutes
const MAX_SIGNUPS = 5;
const WINDOW_MS = 10 * 60 * 1000;

/** POST /api/subscribe { contact, source?, website? }: scholarship & opportunity alerts sign-up */
export async function POST(request: Request) {
  try {
    if (!consumeRateLimit(`subscribe|${getClientIp(request)}`, MAX_SIGNUPS, WINDOW_MS)) {
      return NextResponse.json({ error: 'Too many sign-ups from your connection. Please try again later.' }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    // Hidden field real visitors never fill: quietly accept bots without saving
    if (typeof body.website === 'string' && body.website.trim() !== '') {
      return NextResponse.json({ success: true });
    }

    const parsed = parseContact(body.contact);
    if (typeof parsed === 'string') {
      return NextResponse.json({ error: parsed }, { status: 400 });
    }

    const source = typeof body.source === 'string' ? body.source.replace(/[^a-z_-]/gi, '').slice(0, 60) || 'scholarships' : 'scholarships';
    const added = await addSubscriber(parsed.contact, parsed.type, source);

    return NextResponse.json({ success: true, alreadySubscribed: !added });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Could not save your sign-up. Please try again.' }, { status: 500 });
  }
}
