import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getLiveDatabaseProblem, query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';
import { hashPassword, isHashed, KNOWN_DEFAULT_PASSWORDS, verifyPassword } from '@/lib/password';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/lib/session';
import type { AdminSessionUser } from '@/lib/authTypes';
import { initializeDatabase } from '@/lib/dbInit';

// One setup at a time per server instance; skipped once a user exists
let setupInFlight: Promise<unknown> | null = null;
let databaseReady = false;

async function ensureDatabaseReady(): Promise<void> {
  if (databaseReady) return;
  const users = await query('SELECT id FROM users LIMIT 1').catch(() => null);
  if (users && users.length > 0) {
    databaseReady = true;
    return;
  }
  setupInFlight ??= initializeDatabase().finally(() => {
    setupInFlight = null;
  });
  await setupInFlight;
}

export const dynamic = 'force-dynamic';

const INVALID_LOGIN = 'Invalid login details. Please verify your email and password.';

// Basic in-memory brute-force throttle (per server instance)
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; first: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.first > WINDOW_MS) return false;
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: now });
  } else {
    entry.count += 1;
  }
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password) {
      return NextResponse.json({ error: 'Please enter your email and password.' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const throttleKey = `${ip}|${cleanUsername}`;

    if (isRateLimited(throttleKey)) {
      return NextResponse.json(
        { error: 'Too many failed login attempts. Please wait 15 minutes and try again.' },
        { status: 429 }
      );
    }

    // On the live site, explain a missing or misconfigured database here instead of
    // failing with a vague error (otherwise nobody could reach the admin panel to see why)
    if (process.env.NODE_ENV === 'production') {
      const problem = getLiveDatabaseProblem();
      if (problem) return NextResponse.json({ error: `Cannot sign in: ${problem}` }, { status: 503 });
    }

    // First login on a brand-new database (e.g. a fresh Supabase project): create the
    // tables and the first Super Admin from ADMIN_EMAIL / ADMIN_PASSWORD automatically,
    // so no terminal command is needed. Does nothing once any user exists.
    await ensureDatabaseReady();

    const dbUsers = await query(
      'SELECT id, full_name, email, password, role FROM users WHERE LOWER(email) = ? LIMIT 1',
      [cleanUsername]
    ).catch(() => []);

    // Double-check the email match in code (the local JSON fallback engine has limited WHERE support)
    const user =
      (dbUsers || []).find(
        (u: any) => String(u.email || '').trim().toLowerCase() === cleanUsername
      ) || null;
    const valid = user ? await verifyPassword(password, user.password) : false;

    if (!user || !valid) {
      recordFailure(throttleKey);
      return NextResponse.json({ error: INVALID_LOGIN }, { status: 401 });
    }

    attempts.delete(throttleKey);

    // Passwords published in old code / seed data must not grant access in production
    if (KNOWN_DEFAULT_PASSWORDS.has(password) && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This account still uses a publicly known default password. Ask a Super Admin to reset it.' },
        { status: 403 }
      );
    }

    const needsRehash = !isHashed(user.password);

    // Upgrade legacy plain-text passwords to a hash on successful login
    if (needsRehash) {
      try {
        const hashed = await hashPassword(password);
        await query('UPDATE users SET password = ? WHERE id = ?', [hashed, user.id]);
      } catch (rehashErr) {
        console.warn('Password hash upgrade failed:', rehashErr);
      }
    }

    const authenticatedUser: AdminSessionUser = {
      id: Number(user.id),
      username: user.email,
      name: user.full_name || 'Executive Officer',
      role: user.role || 'Press & Media',
      email: user.email,
    };

    const token = await createSessionToken(authenticatedUser);
    if (!token) {
      return NextResponse.json(
        { error: 'Admin login is not configured on this server (SESSION_SECRET missing).' },
        { status: 503 }
      );
    }

    await logAuditAction(
      authenticatedUser.name,
      authenticatedUser.role,
      'USER_LOGIN',
      'Executive Portal',
      `Signed in with role: ${authenticatedUser.role}`
    );

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE_SECONDS,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      redirect: '/admin',
      user: authenticatedUser,
    });
  } catch (error: any) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred during authentication.' }, { status: 500 });
  }
}
