import NewsDetailPage, { generateMetadata } from '@/app/blog/[id]/page';

export { generateMetadata };
export const revalidate = 3600; // Rebuild at most hourly; admin saves refresh pages instantly (lib/revalidateSite.ts)

export default NewsDetailPage;
