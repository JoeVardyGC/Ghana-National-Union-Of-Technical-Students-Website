import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Please enter your email/username and password.' }, { status: 400 });
    }

    let authenticatedUser = null;
    const cleanUsername = username.trim().toLowerCase();

    // 1. Database Lookup — Auto-Detect Role from DB record
    const dbUsers = await query(
      'SELECT id, full_name, email, password, role FROM users WHERE LOWER(email) = ? OR LOWER(full_name) = ? LIMIT 1',
      [cleanUsername, cleanUsername]
    ).catch(() => []);

    if (dbUsers && dbUsers.length > 0) {
      const user = dbUsers[0];
      // Compare password directly or default master access
      if (user.password === password || password === 'admin123' || password === 'gnuts2026!') {
        authenticatedUser = {
          id: user.id,
          username: user.email,
          name: user.full_name || 'Executive Officer',
          role: user.role || 'Super Admin',
          email: user.email
        };
      }
    }

    // 2. Built-in Auto-Detected Executive Accounts (for instant resilience)
    if (!authenticatedUser) {
      const isAuthorizedEmail = (
        cleanUsername === 'admin' || 
        cleanUsername === 'admin@gnuts.org.gh' || 
        cleanUsername === 'press@gnuts.org.gh' ||
        cleanUsername === 'innovation@gnuts.org.gh' ||
        cleanUsername === 'finance@gnuts.org.gh' ||
        cleanUsername === 'abubakarsadikmusah2004@gmail.com'
      );
      const isAuthorizedPassword = (
        password === 'admin123' || 
        password === 'gnuts2026!' || 
        password === 'abubakarsadikmusah2004@gmail.com'
      );

      if (isAuthorizedEmail && isAuthorizedPassword) {
        let detectedName = 'General Secretariat';
        let detectedRole = 'Super Admin';

        if (cleanUsername === 'press@gnuts.org.gh') {
          detectedName = 'Press & Information Secretary';
          detectedRole = 'Press & Media';
        } else if (cleanUsername === 'innovation@gnuts.org.gh') {
          detectedName = 'Director of TVET & Innovation';
          detectedRole = 'Innovation Director';
        } else if (cleanUsername === 'finance@gnuts.org.gh') {
          detectedName = 'National Treasurer';
          detectedRole = 'Financial Secretary';
        } else if (cleanUsername === 'abubakarsadikmusah2004@gmail.com') {
          detectedName = 'Joe Vardy';
          detectedRole = 'Super Admin';
        }

        authenticatedUser = {
          id: 1,
          username: cleanUsername,
          name: detectedName,
          role: detectedRole,
          email: cleanUsername
        };
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Invalid login details. Please verify your email and password.' }, { status: 401 });
    }

    // 3. Log Audit Action
    await logAuditAction(
      authenticatedUser.name,
      authenticatedUser.role,
      'USER_LOGIN',
      'Executive Portal',
      `Authenticated with auto-detected role: ${authenticatedUser.role}`
    );

    // 4. Encode session data and set secure HTTP-only cookie
    const token = Buffer.from(JSON.stringify(authenticatedUser)).toString('base64');

    const cookieStore = await cookies();
    cookieStore.set('gnuts_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 Days
      path: '/'
    });

    return NextResponse.json({ 
      success: true, 
      redirect: '/admin', 
      user: authenticatedUser 
    });
  } catch (error: any) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred during authentication.' }, { status: 500 });
  }
}
