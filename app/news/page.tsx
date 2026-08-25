import { Metadata } from 'next';
import NewsArchivePage from '@/app/blog/page';

export const metadata: Metadata = {
  title: 'News & Press Releases | GNUTS Ghana',
  description: 'Official announcements, statements, and national activities from the Ghana National Union of Technical Students (GNUTS).',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default NewsArchivePage;
