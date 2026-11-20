import type { Metadata } from 'next';
import ScholarshipsPage from '../scholarships/page';

/**
 * /opportunities shows exactly the same page as /scholarships (the GNUTS
 * Opportunities Hub: scholarships, internships and skill camps in one place).
 * It reuses the scholarships page code, so any change there appears here too.
 */
export const revalidate = 15;

export const metadata: Metadata = {
  title: 'Scholarships & Opportunities for Technical Students | GNUTS Ghana',
  description:
    'Scholarships, internships, skill camps and funding opportunities for technical university and TVET students in Ghana, with requirements and deadlines.',
  // Same content as /scholarships, so search engines treat that page as the main one
  alternates: { canonical: '/scholarships' },
  openGraph: {
    title: 'Scholarships & Opportunities for Technical Students | GNUTS Ghana',
    description: 'Scholarships, internships and skill camps for technical and TVET students in Ghana.',
    url: '/opportunities',
    images: ['/images/og-logo.png'],
  },
};

export default ScholarshipsPage;
