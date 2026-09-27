import NewsDetailPage, { generateMetadata } from '@/app/blog/[id]/page';

export { generateMetadata };
export const revalidate = 15;

export default NewsDetailPage;
