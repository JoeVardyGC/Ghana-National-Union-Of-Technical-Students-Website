// Email alerts via the Resend HTTP API (https://resend.com/docs/api-reference/emails/send-email).
// No SDK needed. If RESEND_API_KEY is not set, alerts are skipped and the
// message is still saved to the database.

export interface ContactNotification {
  name: string;
  email: string;
  phone: string;
  institution: string;
  category: string;
  subject: string;
  message: string;
}

const DEFAULT_TO = 'info@gnuts.org.gh';
const DEFAULT_FROM = 'GNUTS Website <noreply@gnuts.org.gh>';

/** Sends the secretariat an email about a new contact message. Returns true if it was accepted. */
export async function sendContactNotification(msg: ContactNotification): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Mailer] RESEND_API_KEY not set. Contact email alert skipped.');
    return false;
  }

  const to = (process.env.CONTACT_NOTIFY_EMAIL || DEFAULT_TO)
    .split(',')
    .map((addr) => addr.trim())
    .filter(Boolean);
  const from = process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM;
  const adminUrl = `${(process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '')}/admin/messages`;

  const text = [
    'A new message was submitted through the GNUTS website contact form.',
    '',
    `Name: ${msg.name}`,
    `Email: ${msg.email}`,
    `Phone: ${msg.phone || '-'}`,
    `Institution: ${msg.institution || '-'}`,
    `Category: ${msg.category || '-'}`,
    `Subject: ${msg.subject}`,
    '',
    'Message:',
    msg.message,
    '',
    `Reply to this email to respond to ${msg.name} directly.`,
    `View all messages: ${adminUrl}`,
  ].join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: msg.email,
        subject: `[GNUTS Contact] ${msg.subject}`,
        text,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.error(`[Mailer] Resend rejected contact alert (${res.status}):`, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Mailer] Contact alert failed:', err);
    return false;
  }
}
