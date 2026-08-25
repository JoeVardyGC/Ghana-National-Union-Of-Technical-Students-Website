import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_ABOUT = {
  id: 1,
  hero_title: 'About GNUTS',
  hero_subtitle: 'Empowering Technical & TVET Students Across Ghana',
  hero_image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg',
  who_we_are_title: 'Who We Are',
  who_we_are_subtitle: 'The sole democratic, non-partisan representative council for technical students in Ghana',
  who_we_are_content: 'The Ghana National Union of Technical Students (GNUTS) is the sole democratic, non-partisan representative council for all technical and vocational education students across Ghana.\n\nFrom advocating for industrial training allowances and modern laboratory equipment to participating in national education policy reform, GNUTS empowers technical students to become skilled engineers, tech pioneers, and industrial leaders.',
  who_we_are_image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991593/photo_2026-08-17_18-24-49_bg2c1g.jpg',
  mission_title: 'Our Mission',
  mission_content: 'To represent, unite, and empower technical students across Ghana by advocating for quality and inclusive technical education, promoting student welfare and leadership development, engaging stakeholders for national progress, and strengthening communication and participation within the union.\n\nGNUTS is committed to ensuring that the concerns, aspirations, and contributions of technical students are reflected in national educational policies and development frameworks.',
  vision_title: 'Our Vision',
  vision_content: 'To build a strong, credible, united, and nationally respected student union that effectively represents the collective interests of students in Technical Universities and Technical and Vocational Education and Training (TVET) institutions across Ghana; a union that champions excellence, innovation, professionalism, accountability, and integrity in technical education, actively influences national educational policies, promotes skills development and employability, and positions technical students as indispensable contributors to Ghana’s industrial growth, socio-economic transformation, and sustainable national development.',
  values_title: 'Our Core Values',
  values_json: null
};

// GET: Fetch About Page Details & History Milestones
export async function GET() {
  try {
    let about = DEFAULT_ABOUT;
    let milestones: any[] = [];

    try {
      const dbAbout = await query<any>('SELECT * FROM about_page WHERE id=1 LIMIT 1');
      if (dbAbout && dbAbout.length > 0) {
        about = dbAbout[0];
      }

      const dbMilestones = await query<any>('SELECT * FROM history_milestones ORDER BY year ASC, display_order ASC');
      if (dbMilestones && Array.isArray(dbMilestones)) {
        milestones = dbMilestones;
      }
    } catch (e) {
      // Table may not exist yet
    }

    return NextResponse.json({
      success: true,
      about,
      milestones,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch about data' },
      { status: 500 }
    );
  }
}

// PUT: Update About Page Content (Protected)
export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const body = await request.json();

    const {
      hero_title,
      hero_subtitle,
      hero_image,
      who_we_are_title,
      who_we_are_subtitle,
      who_we_are_content,
      who_we_are_image,
      mission_title,
      mission_content,
      vision_title,
      vision_content,
      values_title,
      values_json,
    } = body;

    const existing = await query<any>('SELECT id FROM about_page WHERE id = 1 LIMIT 1').catch(() => []);

    if (existing && existing.length > 0) {
      await query(
        `UPDATE about_page SET
          hero_title = ?,
          hero_subtitle = ?,
          hero_image = ?,
          who_we_are_title = ?,
          who_we_are_subtitle = ?,
          who_we_are_content = ?,
          who_we_are_image = ?,
          mission_title = ?,
          mission_content = ?,
          vision_title = ?,
          vision_content = ?,
          values_title = ?,
          values_json = ?
        WHERE id = 1`,
        [
          hero_title || 'About GNUTS',
          hero_subtitle || '',
          hero_image || '',
          who_we_are_title || 'Who We Are',
          who_we_are_subtitle || '',
          who_we_are_content || '',
          who_we_are_image || '',
          mission_title || 'Our Mission',
          mission_content || '',
          vision_title || 'Our Vision',
          vision_content || '',
          values_title || 'Our Core Values',
          values_json ? JSON.stringify(values_json) : null,
        ]
      );
    } else {
      await query(
        `INSERT INTO about_page (
          id, hero_title, hero_subtitle, hero_image, who_we_are_title, who_we_are_subtitle, who_we_are_content, who_we_are_image,
          mission_title, mission_content, vision_title, vision_content, values_title, values_json
        ) VALUES (
          1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )`,
        [
          hero_title || 'About GNUTS',
          hero_subtitle || '',
          hero_image || '',
          who_we_are_title || 'Who We Are',
          who_we_are_subtitle || '',
          who_we_are_content || '',
          who_we_are_image || '',
          mission_title || 'Our Mission',
          mission_content || '',
          vision_title || 'Our Vision',
          vision_content || '',
          values_title || 'Our Core Values',
          values_json ? JSON.stringify(values_json) : null,
        ]
      );
    }

    const userName = session.name || session.username || 'Administrator';
    const userRole = session.role || 'Super Admin';

    await logAuditAction(
      userName,
      userRole,
      'UPDATE_ABOUT_PAGE',
      'About Page CMS',
      'Updated hero header, narrative story, mission, vision, and core values'
    );

    return NextResponse.json({
      success: true,
      message: 'About page content updated successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update about page' },
      { status: 500 }
    );
  }
}
