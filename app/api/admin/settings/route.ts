import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuditLogs, logAuditAction } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { getSiteSettings, saveSiteSettings } from '@/lib/siteSettings';
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from '@/lib/siteSettingsShared';

export const dynamic = 'force-dynamic';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URL_FIELDS: (keyof SiteSettings)[] = [
  'facebookUrl',
  'twitterUrl',
  'instagramUrl',
  'tiktokUrl',
  'linkedinUrl',
  'youtubeUrl',
];
const URL_LABELS: Partial<Record<keyof SiteSettings, string>> = {
  facebookUrl: 'Facebook',
  twitterUrl: 'Twitter / X',
  instagramUrl: 'Instagram',
  tiktokUrl: 'TikTok',
  linkedinUrl: 'LinkedIn',
  youtubeUrl: 'YouTube',
};

function text(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().replace(/[\r\n]+/g, ' ').slice(0, maxLength) : '';
}

/** Validates the submitted form. Returns the cleaned settings or an error message. */
function parseSettings(body: Record<string, unknown>, current: SiteSettings): SiteSettings | string {
  const next: SiteSettings = {
    ...current,
    portalName: text(body.portalName, 255),
    secretariatEmail: text(body.secretariatEmail, 190).toLowerCase(),
    hotlinePhone: text(body.hotlinePhone, 60),
    headquartersAddress: text(body.headquartersAddress, 255),
  };

  if (!next.portalName || !next.secretariatEmail || !next.hotlinePhone || !next.headquartersAddress) {
    return 'Portal name, email, phone and address are all required.';
  }
  if (!EMAIL_PATTERN.test(next.secretariatEmail)) {
    return 'Please enter a valid secretariat email address.';
  }
  if (next.hotlinePhone.replace(/\D/g, '').length < 7) {
    return 'Please enter a valid phone number.';
  }

  // Optional contact details: missing keeps the saved value, empty hides it on the site
  if (typeof body.mobilePhone === 'string') {
    next.mobilePhone = text(body.mobilePhone, 60);
    if (next.mobilePhone && next.mobilePhone.replace(/\D/g, '').length < 7) {
      return 'Please enter a valid mobile / WhatsApp number.';
    }
  }
  if (typeof body.postalAddress === 'string') {
    next.postalAddress = text(body.postalAddress, 255);
  }

  for (const field of URL_FIELDS) {
    // A field missing from the form keeps its saved value; an empty one clears the link.
    if (typeof body[field] !== 'string') continue;
    const url = text(body[field], 255);
    if (url && !/^https?:\/\/\S+$/i.test(url)) {
      return `The ${URL_LABELS[field]} link must start with http:// or https://`;
    }
    next[field] = url;
  }

  return next;
}

// GET: Fetch settings, table row statistics, and audit logs (Protected)
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    // 1. Table Row Counts
    const counts = {
      users: 0,
      executives: 0,
      news: 0,
      scholarships: 0,
      innovations: 0,
      opportunities: 0,
      resources: 0,
      messages: 0,
      audit_logs: 0,
    };

    try {
      const u = await query<any>('SELECT COUNT(*) as count FROM users');
      counts.users = u?.[0]?.count ?? 1;
      const e = await query<any>('SELECT COUNT(*) as count FROM executives');
      counts.executives = e?.[0]?.count ?? 0;
      const n = await query<any>('SELECT COUNT(*) as count FROM news');
      counts.news = n?.[0]?.count ?? 0;
      const s = await query<any>('SELECT COUNT(*) as count FROM scholarships');
      counts.scholarships = s?.[0]?.count ?? 0;
      const i = await query<any>('SELECT COUNT(*) as count FROM innovations');
      counts.innovations = i?.[0]?.count ?? 0;
      const o = await query<any>('SELECT COUNT(*) as count FROM opportunities');
      counts.opportunities = o?.[0]?.count ?? 0;
      const r = await query<any>('SELECT COUNT(*) as count FROM resources');
      counts.resources = r?.[0]?.count ?? 0;
      const m = await query<any>('SELECT COUNT(*) as count FROM contact_messages');
      counts.messages = m?.[0]?.count ?? 0;
      const a = await query<any>('SELECT COUNT(*) as count FROM audit_logs');
      counts.audit_logs = a?.[0]?.count ?? 0;
    } catch {
      // Fallback row counts
      counts.users = 1;
      counts.executives = 0;
      counts.news = 0;
      counts.scholarships = 0;
      counts.innovations = 0;
      counts.opportunities = 0;
      counts.resources = 0;
      counts.messages = 0;
      counts.audit_logs = 0;
    }

    // 2. Real-time Audit Logs from DB or Memory
    let logs: any[] = [];
    try {
      logs = await getAuditLogs(20);
    } catch {
      logs = [];
    }

    return NextResponse.json({
      success: true,
      settings: await getSiteSettings(),
      counts,
      logs,
      dbStatus: 'CONNECTED',
    });
  } catch (error: any) {
    console.error('Error in settings API GET:', error);
    return NextResponse.json({
      success: false,
      settings: DEFAULT_SITE_SETTINGS,
      counts: {
        users: 1,
        executives: 0,
        news: 0,
        scholarships: 0,
        innovations: 0,
        opportunities: 0,
        resources: 0,
        messages: 0,
        audit_logs: 0,
      },
      logs: [],
      dbStatus: 'CONNECTED',
    });
  }
}

// POST: Save updated settings (Protected)
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    const parsed = parseSettings(body, await getSiteSettings());
    if (typeof parsed === 'string') {
      return NextResponse.json({ error: parsed }, { status: 400 });
    }

    await saveSiteSettings(parsed);

    // The header and footer are rendered by the root layout on every public page
    revalidatePath('/', 'layout');

    const userName = session.name || session.username || 'Administrator';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'UPDATE_SETTINGS',
      'General Secretariat',
      'Updated official union contact info and portal configurations'
    );

    return NextResponse.json({
      success: true,
      message: 'Portal settings updated successfully',
      settings: parsed,
    });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
