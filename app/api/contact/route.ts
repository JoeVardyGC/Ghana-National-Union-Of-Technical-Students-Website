import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Please fill in all required fields (Name, Email, Subject, Message).' },
        { status: 400 }
      );
    }

    // Save to database
    await query(
      'INSERT INTO contact_messages (name, email, phone, subject, message, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [name, email, phone || '', subject, message]
    );

    return NextResponse.json(
      { success: true, message: 'Your message has been sent successfully. The GNUTS Secretariat will respond shortly!' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'An error occurred while sending your message. Please try again later.' },
      { status: 500 }
    );
  }
}
