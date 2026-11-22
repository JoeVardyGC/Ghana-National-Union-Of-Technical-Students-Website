import { Metadata } from 'next';
import NewsArchivePage from '@/app/blog/page';

export const metadata: Metadata = {
  title: 'News & Press Releases | GNUTS Ghana',
  description: 'Official announcements, statements, and national activities from the Ghana National Union of Technical Students (GNUTS).',
};

export const revalidate = 15;

export default NewsArchivePage;
