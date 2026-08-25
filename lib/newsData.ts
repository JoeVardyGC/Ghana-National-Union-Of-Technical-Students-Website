import { query } from '@/lib/db';

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  image: string;
  images?: string[];
  published_at: string;
  author: string;
  category?: string;
}

export const DEFAULT_NEWS: NewsItem[] = [];

export async function getNewsById(id: number | string): Promise<NewsItem | undefined> {
  const numericId = Number(id);
  
  // 1. Query database first if available
  try {
    const rows = await query('SELECT * FROM news WHERE id = ? AND status = "published"', [numericId]);
    if (rows && rows.length > 0) {
      const row = rows[0];
      return {
        id: row.id,
        title: row.title,
        content: row.content || '',
        image: row.image || '',
        published_at: row.published_at || row.created_at || new Date().toISOString().substring(0, 10),
        author: row.author || 'GNUTS Secretariat',
        category: row.category || 'NEWS',
      };
    }
  } catch {}

  // 2. Fallback to DEFAULT_NEWS
  return DEFAULT_NEWS.find((item) => item.id === numericId);
}
