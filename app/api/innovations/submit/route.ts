import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      project_image,
      video_url,
      institution,
      student_name,
      category
    } = body;

    if (!title || !description || !student_name || !institution) {
      return NextResponse.json(
        { error: 'Please provide all required fields: Title, Innovator Name, Technical Institution, and Description.' },
        { status: 400 }
      );
    }

    const defaultImg = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop';
    const mainImage = project_image && project_image.trim() !== '' ? project_image.trim() : defaultImg;

    // Insert into innovations table with status = 'pending'
    const result = await query(
      `INSERT INTO innovations (title, description, project_image, video_url, institution, student_name, category, status, upvotes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 0, NOW())`,
      [
        title.trim(),
        description.trim(),
        mainImage,
        video_url ? video_url.trim() : '',
        institution.trim(),
        student_name.trim(),
        category ? category.trim() : 'Renewable Energy'
      ]
    );

    // Log public submission for admin transparency
    try {
      await logAuditAction(
        student_name.trim(),
        'Student Innovator',
        'SUBMIT_INNOVATION',
        title.trim(),
        `Submitted student project "${title.trim()}" from ${institution.trim()} for National Secretariat review.`
      );
    } catch (auditErr) {
      console.warn('Audit log write skipped:', auditErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Your innovation project has been submitted successfully to the GNUTS National Secretariat for review!',
        innovation: {
          title,
          student_name,
          institution,
          status: 'pending'
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error submitting innovation project:', error);
    return NextResponse.json(
      { error: error?.message || 'An error occurred while submitting your innovation project. Please try again.' },
      { status: 500 }
    );
  }
}
