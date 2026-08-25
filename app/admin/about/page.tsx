import { query } from '@/lib/db';
import AboutManagementClient from './AboutManagementClient';

export const dynamic = 'force-dynamic';

export default async function AdminAboutPage() {
  let aboutData = {
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

  let milestones: any[] = [];

  try {
    const dbAbout = await query<any>('SELECT * FROM about_page WHERE id=1 LIMIT 1');
    if (dbAbout && dbAbout.length > 0) {
      aboutData = { ...aboutData, ...dbAbout[0] };
    }

    const dbMilestones = await query<any>('SELECT * FROM history_milestones ORDER BY year ASC, display_order ASC');
    if (dbMilestones && Array.isArray(dbMilestones) && dbMilestones.length > 0) {
      milestones = dbMilestones;
    } else {
      milestones = [
        {
          id: 1,
          year: '1987',
          title: 'Establishment of GNUPS',
          description: 'The Ghana National Union of Polytechnic Students (GNUPS) was established after technical students broke away from the National Union of Ghana Students (NUGS). This decision was driven by concerns of marginalization and the need for a dedicated national body to represent the unique academic, professional, and welfare interests of polytechnic students across Ghana.',
          image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
          tag: 'UNION FOUNDING',
          display_order: 1,
        },
        {
          id: 2,
          year: '2000',
          title: 'The Tamale Declaration',
          description: 'GNUPS was formally operationalized at a national congress held in Tamale, where its first constitution was adopted. This historic congress, widely referred to as the Tamale Declaration, provided a legal and administrative framework for the Union and strengthened its legitimacy as the recognized voice of polytechnic students nationwide.',
          image: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=800&auto=format&fit=crop',
          tag: 'CONSTITUTIONAL CHARTER',
          display_order: 2,
        },
        {
          id: 3,
          year: '2016',
          title: 'Transition from GNUPS to GNUTS',
          description: 'Following the Government of Ghana’s conversion of polytechnics into technical universities, GNUPS was rebranded as the Ghana National Union of Technical Students (GNUTS). The change reflected the evolving identity of technical students and was ratified at the First Central Committee and Mini Congress held at Tamale Technical University from December 1–4, 2016.',
          image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop',
          tag: 'HISTORIC REBRANDING',
          display_order: 3,
        },
        {
          id: 4,
          year: '2017',
          title: 'Public Recognition and Rebranding',
          description: 'GNUTS issued official press statements to announce and affirm its new identity. The Union emphasized legal compliance, institutional continuity, and urged stakeholders, media organizations, and the general public to recognize GNUTS as the legitimate national representative body of technical university students.',
          image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787056252/choose_tvet_first_kwucvy.png',
          tag: 'NATIONAL RECOGNITION',
          display_order: 4,
        },
      ];
    }
  } catch (e) {
    // Database fallback
  }

  return (
    <AboutManagementClient
      initialAbout={aboutData}
      initialMilestones={milestones}
    />
  );
}
