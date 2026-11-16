import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendContactNotification } from '@/lib/mailer';
import { consumeRateLimit, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const SUCCESS_MESSAGE =
  'Your message has been sent successfully. The GNUTS Secretariat will respond shortly!';

// Spam protection limits
const MAX_MESSAGES = 5;
const WINDOW_MS = 10 * 60 * 1000;
const MIN_FILL_MS = 3000;
const MAX_LINKS = 3;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

/** Single-line fields must not carry line breaks (prevents email header tricks). */
function cleanLine(value: unknown, maxLength: number): string {
  return clean(value, maxLength).replace(/[\r\n]+/g, ' ');
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!consumeRateLimit(`contact|${ip}`, MAX_MESSAGES, WINDOW_MS)) {
      return NextResponse.json(
        { error: 'Too many messages sent from your connection. Please wait a few minutes and try again.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    // Honeypot: real visitors never see or fill the "website" field, and they take
    // longer than a few seconds to write a message. Bots get a fake success so they
    // do not learn to adapt.
    const honeypotFilled = typeof body.website === 'string' && body.website.trim() !== '';
    const elapsedMs = Number(body.elapsedMs);
    const submittedTooFast = Number.isFinite(elapsedMs) && elapsedMs < MIN_FILL_MS;
    if (honeypotFilled || submittedTooFast) {
      return NextResponse.json({ success: true, message: SUCCESS_MESSAGE }, { status: 200 });
    }

    const name = cleanLine(body.name, 120);
    const email = cleanLine(body.email, 190).toLowerCase();
    const phone = cleanLine(body.phone, 40);
    const institution = cleanLine(body.institution, 160);
    const category = cleanLine(body.category, 80);
    const subject = cleanLine(body.subject, 200);
    const message = clean(body.message, 5000);

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Please fill in all required fields (Name, Email, Subject, Message).' },
        { status: 400 }
      );
    }

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (message.length < 10) {
      return NextResponse.json(
        { error: 'Your message is too short. Please add a few more details.' },
        { status: 400 }
      );
    }

    const linkCount = (message.match(/https?:\/\/|www\./gi) || []).length;
    if (linkCount > MAX_LINKS) {
      return NextResponse.json(
        { error: `Please include no more than ${MAX_LINKS} links in your message.` },
        { status: 400 }
      );
    }

    // Save to database
    await query(
      'INSERT INTO contact_messages (name, email, phone, subject, message, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [name, email, phone, subject, message]
    );

    // Alert the secretariat by email. The message is already saved, so a failed
    // alert is logged inside the mailer and never fails the request.
    await sendContactNotification({ name, email, phone, institution, category, subject, message });

    return NextResponse.json({ success: true, message: SUCCESS_MESSAGE }, { status: 200 });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'An error occurred while sending your message. Please try again later.' },
      { status: 500 }
    );
  }
}
