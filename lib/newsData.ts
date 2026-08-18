import { query } from '@/lib/db';

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  image: string;
  published_at: string;
  author: string;
  category?: string;
}

export const DEFAULT_NEWS: NewsItem[] = [
  {
    id: 1,
    title: '34TH GNUTS TECH SUMMIT & EXHIBITION — DR. ERIC KOFI ADZROE TO SPEAK',
    category: 'EVENT',
    content: `The Ghana National Union of Technical Students (GNUTS) is proud to announce the 34th Administration 1st Central Committee Meeting Tech Summit & Exhibition!

We are honored to welcome Dr. Eric Kofi Adzroe (Director-General, Ghana TVET Service) as a Distinguished Keynote Guest Speaker.

Theme: "From skills to solutions: driving innovation and sustainable livelihood through TVET."

Key Details:
• Date: 7th May, 2026 at 10:00 AM
• Venue: GNAT Auditorium, Greater Accra Region
• Host: 34th GNUTS Administration

This landmark summit brings together technical student innovators, TVET leaders, government officials, and industry partners to showcase solutions born from practical technical education.

#GNUTS1stCC #BeTheDifference #ChooseTVETFirst`,
    image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787056250/gnuts_cc_tech-GUEST_jt8cge.png',
    published_at: '2026-05-07',
    author: 'GNUTS Secretariat',
  },
  {
    id: 2,
    title: 'SKILLS ARE THE FUTURE — #CHOOSE TVET FIRST CAMPAIGN LAUNCHED',
    category: 'CAMPAIGN',
    content: `Skills Are The Future! The Ghana National Union of Technical Students (GNUTS) officially launches the nationwide #CHOOSE TVET FIRST Campaign across all Technical Universities and TVET Institutions in Ghana.

The campaign highlights practical skills acquisition, robotics, engineering innovation, and hands-on technological expertise as the fundamental drivers of Ghana's industrial economic future.

Through advocacy, campus roadshows, and industry partnerships, GNUTS is championing student-centered policies that expand funding, modern lab infrastructure, and graduate employability.

#ChooseTVETFirst #SkillsAreTheFuture #GNUTS`,
    image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787056252/choose_tvet_first_kwucvy.png',
    published_at: '2026-05-05',
    author: 'GNUTS Secretariat',
  },
  {
    id: 3,
    title: 'MINISTER OF EDUCATION HON. HARUNA IDDRISU ESQ. TO ADDRESS 34TH TECH SUMMIT',
    category: 'PRESS RELEASE',
    content: `The 34th GNUTS 1st Central Committee Meeting Tech Summit & Exhibition is honored to announce Hon. Haruna Iddrisu Esq. (Minister of Education) as a Special Guest Speaker!

Theme: "From skills to solutions: driving innovation and sustainable livelihood through TVET."

Key Details:
• Date: 7th May, 2026 at 10:00 AM
• Venue: GNAT Auditorium, Greater Accra Region
• Host: 34th GNUTS Administration

Join technical university delegates from across Ghana as we engage national policymakers on expanding TVET funding, campus safety, utility subsidies, and industrial attachment placements.

#GNUTS1stCC #BeTheDifference #ChooseTVETFirst`,
    image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787056247/haruna_ns6zfw.png',
    published_at: '2026-05-07',
    author: 'GNUTS Secretariat',
  },
];

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
        published_at: row.published_at || row.created_at || '2026-05-07',
        author: row.author || 'GNUTS Secretariat',
        category: row.category || 'NEWS',
      };
    }
  } catch {}

  // 2. Fallback to DEFAULT_NEWS
  return DEFAULT_NEWS.find((item) => item.id === numericId);
}
