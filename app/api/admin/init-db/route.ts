import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/dbInit';

export async function POST() {
  const result = await initializeDatabase();
  return NextResponse.json(result);
}

export async function GET() {
  const result = await initializeDatabase();
  return NextResponse.json(result);
}
