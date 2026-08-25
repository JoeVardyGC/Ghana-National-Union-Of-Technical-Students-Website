import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('gnuts_admin_session');
    return NextResponse.json({ success: true, redirect: '/admin/login' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('gnuts_admin_session');
    return NextResponse.redirect(new URL('/admin/login', request.url));
  } catch (error: any) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}
