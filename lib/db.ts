import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { getDatabaseUrlProblem, getDatabaseUrlWarning, getPostgresPool, getPostgresUrl, isConnectionError, runPostgres } from './postgres';

export type DatabaseDialect = 'postgres' | 'mysql' | 'local';

/** Which database query() talks to, based on the configured connection string. */
export function getDialect(): DatabaseDialect {
  if (getPostgresUrl()) return 'postgres';
  return getDatabasePool() ? 'mysql' : 'local';
}

/**
 * GNUTS Hybrid Persistence Database Engine
 *
 * Features:
 * 0. Connects to PostgreSQL / Supabase when DATABASE_URL is a postgres:// URL (see lib/postgres.ts).
 * 1. Connects to MySQL / MariaDB (via DATABASE_URL or DB_HOST) when available.
 * 2. Seamlessly falls back to a high-speed, local file-based persistence store (`data/gnuts_db.json`)
 *    when MySQL is offline, ensuring data NEVER vanishes upon page refresh!
 * 3. Supports real-time CRUD (INSERT, UPDATE, DELETE, SELECT, COUNT, ORDER BY, LIMIT, WHERE).
 */

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'gnuts_db.json');

// Initial baseline seed data
const DEFAULT_STORE: Record<string, any[]> = {
  // No seeded accounts: the first Super Admin is created from ADMIN_EMAIL / ADMIN_PASSWORD (see lib/dbInit.ts)
  users: [],
  executives: [],
  news: [
    {
      id: 1,
      title: 'GNUTS Announces 2nd Central Committee Meeting for the 34th Administration',
      content: 'The Ghana National Union of Technical Students (GNUTS) has officially announced the details for its 2nd Central Committee Meeting under the 34th Administration.\n\nThe high-profile student leadership meeting is scheduled to take place from 3rd to 4th September, 2026. This gathering will bring together student leaders, institutional representatives, and executives to deliberate on key policies, address student welfare concerns, and strategize on advancing technical education in Ghana.\n\nEvent Details at a Glance:\n\nEvent: 2nd Central Committee Meeting (34th GNUTS Administration)\n\nDate: 3rd – 4th September, 2026\n\nVenue: Kumasi Technical University, Ashanti Region\n\nDelegates and invited student leadership figures are entreated to prepare ahead of the summit as the union continues to uphold its core motto: #BeTheDifference. For further updates and official notices, members can visit the official GNUTS portal at www.gnuts.org or follow social media handles via @gnuts_live.',
      image: '/uploads/1787587306260-WhatsApp_Image_2026-08-20_at_2.33.16_PM.jpeg',
      author: 'GNUTS PRO',
      published_at: '2026-08-24',
      status: 'published',
      view_count: 342,
      allow_sharing: 1,
      image2: '',
      image3: '',
      created_at: '2026-08-24T16:02:01.343Z',
      updated_at: '2026-08-24T16:02:01.343Z',
    },
    {
      id: 2,
      title: 'GNUTS Launches "#ChooseTVETFirst" Campaign to Champion Skills Development',
      content: 'The Ghana National Union of Technical Students (GNUTS) under the 34th Administration has officially rolled out its national advocacy initiative, the "#ChooseTVETFirst" Campaign, anchored on the powerful theme: "Skills Are The Future."\n\nThis visionary campaign is designed to shift public perception, elevate the status of Technical and Vocational Education and Training (TVET), and encourage young people to embrace practical skills acquisition as a primary pathway to national development and sustainable employment.\n\nKey Highlights of the Campaign:\n\nCore Theme: Skills Are The Future (#ChooseTVETFirst)\n\nObjective: Promoting hands-on technical training, robotics, engineering competence, and modern vocational expertise.\n\nInitiator: Ghana National Union of Technical Students (34th Administration)\n\nGNUTS continues to advocate for infrastructure development, innovation, and enhanced opportunities for technical students across Ghana. For more details on the campaign and how to get involved, visit the official union platform at www.gnuts.org or connect via social media channels @gnuts_live.',
      image: '/uploads/1787587477319-choose_tvet_first.png',
      author: 'GNUTS PRO',
      published_at: '2026-06-24',
      status: 'published',
      view_count: 512,
      allow_sharing: 1,
      image2: '',
      image3: '',
      created_at: '2026-08-24T16:04:47.988Z',
      updated_at: '2026-08-24T16:04:47.988Z',
    }
  ],
  scholarships: [
    {
      id: 1,
      title: 'GETFund TVET Engineering Bursary 2026',
      description: 'Annual educational support grant covering tuition and laboratory equipment fees for accredited technical university engineering students.',
      requirements: '• Valid Student ID Card\n• Minimum CGPA of 2.5\n• Recommendation letter from Department Head',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      link: 'https://getfund.gov.gh',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  opportunities: [],
  innovations: [
    {
      id: 1,
      title: 'Solar-Powered Irrigation Automation for Rural Farms',
      description: 'An IoT automated drip irrigation system utilizing solar power and soil moisture telemetry designed by technical university students.',
      project_image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop',
      video_url: 'https://youtube.com',
      institution: 'Kumasi Technical University',
      student_name: 'Kwame Mensah & Team',
      category: 'Renewable Energy & IoT',
      upvotes: 89,
      status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  resources: [
    {
      id: 1,
      title: 'Constitution of the Ghana National Union of Technical Students (GNUTS)',
      description: 'The official supreme legal framework governing the structure, membership, governance, rights, duties, and operational procedures of the Ghana National Union of Technical Students (GNUTS). It outlines the powers of key organs including Congress, the Central Committee, the National Executive Committee, the Judicial Council, and member institution SRCs, alongside election guidelines, financial administration rules, and schedules for institutional membership and rotation.',
      category: 'constitution',
      file_path: 'https://ik.imagekit.io/joevardy/gnuts_documents/gnuts_constitution_test_emqWOG7sx.pdf',
      file_name: 'GNUTS_Supreme_Constitution_Official.pdf',
      file_size: 3873697,
      display_order: 1,
      downloads: 1240,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  contact_messages: [],
  audit_logs: [
    {
      id: 1,
      user_name: 'System Admin',
      user_role: 'Super Admin',
      action: 'SYSTEM_BOOT',
      target: 'Database Initializer',
      details: 'Universal real-time database sync initialized.',
      created_at: new Date().toISOString(),
    }
  ],
  about_page: [
    {
      id: 1,
      hero_title: 'About GNUTS',
      hero_subtitle: 'Empowering Technical & TVET Students Across Ghana',
      hero_image: '/images/header_for_pages.jpg',
      who_we_are_title: 'Who We Are',
      who_we_are_subtitle: 'The Recognized National Voice of Technical & TVET Students',
      who_we_are_content: 'The Ghana National Union of Technical Students (GNUTS) is the sole democratic, non-partisan representative council for all technical and vocational education students across Ghana.\n\nFrom advocating for industrial training allowances and modern laboratory equipment to participating in national education policy reform, GNUTS empowers technical students to become skilled engineers, tech pioneers, and industrial leaders.',
      who_we_are_image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991593/photo_2026-08-17_18-24-49_bg2c1g.jpg',
      mission_title: 'Our Mission',
      mission_content: 'To represent, unite, and empower technical students across Ghana by advocating for quality and inclusive technical education, promoting student welfare and leadership development, engaging stakeholders for national progress, and strengthening communication and participation within the union.\n\nGNUTS is committed to ensuring that the concerns, aspirations, and contributions of technical students are reflected in national educational policies and development frameworks.',
      vision_title: 'Our Vision',
      vision_content: 'To build a strong, credible, united, and nationally respected student union that effectively represents the collective interests of students in Technical Universities and Technical and Vocational Education and Training (TVET) institutions across Ghana; a union that champions excellence, innovation, professionalism, accountability, and integrity in technical education, actively influences national educational policies, promotes skills development and employability, and positions technical students as indispensable contributors to Ghana’s industrial growth, socio-economic transformation, and sustainable national development.',
      values_title: 'Our Core Values',
      updated_at: new Date().toISOString(),
    }
  ],
  history_milestones: [
    {
      id: 1,
      year: '1987',
      title: 'Establishment of GNUPS',
      description: 'The Ghana National Union of Polytechnic Students (GNUPS) was established after technical students broke away from the National Union of Ghana Students (NUGS). This decision was driven by concerns of marginalization and the need for a dedicated national body to represent the unique academic, professional, and welfare interests of polytechnic students across Ghana.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
      tag: 'UNION FOUNDING',
      display_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      year: '2000',
      title: 'The Tamale Declaration',
      description: 'GNUPS was formally operationalized at a national congress held in Tamale, where its first constitution was adopted. This historic congress, widely referred to as the Tamale Declaration, provided a legal and administrative framework for the Union and strengthened its legitimacy as the recognized voice of polytechnic students nationwide.',
      image: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=800&auto=format&fit=crop',
      tag: 'CONSTITUTIONAL CHARTER',
      display_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      year: '2016',
      title: 'Transition from GNUPS to GNUTS',
      description: 'Following the Government of Ghana’s conversion of polytechnics into technical universities, GNUPS was rebranded as the Ghana National Union of Technical Students (GNUTS). The change reflected the evolving identity of technical students and was ratified at the First Central Committee and Mini Congress held at Tamale Technical University from December 1–4, 2016.',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop',
      tag: 'HISTORIC REBRANDING',
      display_order: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 4,
      year: '2017',
      title: 'Public Recognition and Rebranding',
      description: 'GNUTS issued official press statements to announce and affirm its new identity. The Union emphasized legal compliance, institutional continuity, and urged stakeholders, media organizations, and the general public to recognize GNUTS as the legitimate national representative body of technical university students.',
      image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787056252/choose_tvet_first_kwucvy.png',
      tag: 'NATIONAL RECOGNITION',
      display_order: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
  settings: [
    {
      id: 1,
      site_name: 'GNUTS Ghana',
      contact_email: 'info@gnuts.org.gh',
      phone_number: '+233 (0) 302 987 654',
      address: 'Accra Technical University Campus, Barnes Road, Accra, Ghana',
    }
  ],
  hero_banners: [
    {
      id: 1,
      page_key: 'home_carousel',
      title: 'Ghana National Union of Technical Students (GNUTS)',
      image_url: 'https://ik.imagekit.io/joevardy/carousel%201.jpg?updatedAt=1790249603163',
      display_order: 1,
      status: 'active'
    },
    {
      id: 2,
      page_key: 'home_carousel',
      title: 'Empowering Technical Students for National Development',
      image_url: 'https://ik.imagekit.io/joevardy/carousel%202.jpg?updatedAt=1790249603210',
      display_order: 2,
      status: 'active'
    },
    {
      id: 3,
      page_key: 'home_carousel',
      title: 'Creating Opportunities Beyond the Classroom',
      image_url: 'https://ik.imagekit.io/joevardy/carousel%203.jpg?updatedAt=1790249603799',
      display_order: 3,
      status: 'active'
    },
    {
      id: 4,
      page_key: 'about_hero',
      title: 'About GNUTS Page Hero Banner',
      image_url: '/images/header_for_pages.jpg',
      display_order: 1,
      status: 'active'
    },
    {
      id: 5,
      page_key: 'news_hero',
      title: 'News & Press Releases Hero Banner',
      image_url: '/images/header_for_pages.jpg',
      display_order: 1,
      status: 'active'
    },
    {
      id: 6,
      page_key: 'innovations_hero',
      title: 'Student Innovations Hero Banner',
      image_url: '/images/header_for_pages.jpg',
      display_order: 1,
      status: 'active'
    },
    {
      id: 7,
      page_key: 'scholarships_hero',
      title: 'Scholarships & Opportunities Hero Banner',
      image_url: '/images/header_for_pages.jpg',
      display_order: 1,
      status: 'active'
    },
    {
      id: 8,
      page_key: 'contact_hero',
      title: 'Contact Hero Banner',
      image_url: '/images/header_for_pages.jpg',
      display_order: 1,
      status: 'active'
    },
    {
      id: 9,
      page_key: 'resources_hero',
      title: 'Resources & Constitution Hero Banner',
      image_url: '/images/header_for_pages.jpg',
      display_order: 1,
      status: 'active'
    },
    {
      id: 10,
      page_key: 'gallery_hero',
      title: 'Legacy & Leadership Gallery Hero Banner',
      image_url: '/images/header_for_pages.jpg',
      display_order: 1,
      status: 'active'
    },
    {
      id: 11,
      page_key: 'executives_hero',
      title: 'National Executive Officers Hero Banner',
      image_url: '/images/header_for_pages.jpg',
      display_order: 1,
      status: 'active'
    },
    {
      id: 12,
      page_key: 'opportunities_hero',
      title: 'Student Opportunities Hero Banner',
      image_url: '/images/header_for_pages.jpg',
      display_order: 1,
      status: 'active'
    }
  ],
  gallery: [
    {
      id: 1,
      title: 'H.E. Isaac Mensah & Leadership Executives',
      category: 'LEADERSHIP',
      image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991593/photo_2026-08-17_18-24-49_bg2c1g.jpg',
      tenure_or_date: '2025/2026 Administration',
      role_or_badge: 'National President & Council',
      description: 'The National Executive Council presiding over union advocacy and strategic initiatives for technical students.',
      display_order: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'National TVET Policy & Advocacy Summit',
      category: 'ACTIVITIES',
      image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991595/photo_2026-08-17_18-24-46_w6zphs.jpg',
      tenure_or_date: 'March 2025',
      role_or_badge: 'Advocacy & Policy',
      description: 'Delegates and student representatives engaging national education stakeholders on TVET infrastructure and bursaries.',
      display_order: 2,
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      title: 'Student Engineering & Prototype Exhibition',
      category: 'PROJECTS',
      image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991595/photo_2026-08-17_18-24-43_hkzlai.jpg',
      tenure_or_date: 'November 2024',
      role_or_badge: 'Technical Innovation',
      description: 'Technical University student innovators unveiling automated agricultural hardware and solar technologies.',
      display_order: 3,
      created_at: new Date().toISOString(),
    },
    {
      id: 4,
      title: '34th National Delegates Congress - Inauguration',
      category: 'CONGRESS',
      image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg',
      tenure_or_date: 'Annual National Congress',
      role_or_badge: 'National Congress',
      description: 'Official swearing-in ceremony and constitutional proceedings of elected national union officers.',
      display_order: 4,
      created_at: new Date().toISOString(),
    },
    {
      id: 5,
      title: 'National Women in TVET Leadership Seminar',
      category: 'ACTIVITIES',
      image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991593/photo_2026-08-17_18-24-49_bg2c1g.jpg',
      tenure_or_date: 'February 2025',
      role_or_badge: 'Women Commissioner Desk',
      description: 'Empowering female technical scholars and engineering innovators across member universities.',
      display_order: 5,
      created_at: new Date().toISOString(),
    },
    {
      id: 6,
      title: 'Technical University Campus Tour & Engagement',
      category: 'LEADERSHIP',
      image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991595/photo_2026-08-17_18-24-46_w6zphs.jpg',
      tenure_or_date: '2024/2025 Tour',
      role_or_badge: 'Campus Outreach',
      description: 'Direct consultation sessions with student body leaders on academic affairs and welfare.',
      display_order: 6,
      created_at: new Date().toISOString(),
    }
  ]
};

// In-Memory Persistent Store Cache for sub-millisecond query performance
let cachedStore: Record<string, any[]> | null = null;
let lastMtime: number = 0;

// Ensure data directory and file exist with automatic mtime invalidation
function getStore(): Record<string, any[]> {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(DEFAULT_STORE, null, 2), 'utf8');
      cachedStore = JSON.parse(JSON.stringify(DEFAULT_STORE));
      lastMtime = fs.statSync(DB_FILE_PATH).mtimeMs;
      return cachedStore!;
    }

    const currentMtime = fs.statSync(DB_FILE_PATH).mtimeMs;
    if (cachedStore && lastMtime === currentMtime) {
      return cachedStore;
    }

    const raw = fs.readFileSync(DB_FILE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    let updated = false;

    // Ensure all tables exist in parsed store (without overwriting if intentionally emptied)
    for (const key of Object.keys(DEFAULT_STORE)) {
      if (parsed[key] === undefined || !Array.isArray(parsed[key])) {
        parsed[key] = DEFAULT_STORE[key];
        updated = true;
      }
    }

    if (updated) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(parsed, null, 2), 'utf8');
      lastMtime = fs.statSync(DB_FILE_PATH).mtimeMs;
    } else {
      lastMtime = currentMtime;
    }
    cachedStore = parsed;
    return cachedStore!;
  } catch {
    cachedStore = JSON.parse(JSON.stringify(DEFAULT_STORE));
    return cachedStore!;
  }
}

function saveStore(store: Record<string, any[]>) {
  cachedStore = store;
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(store, null, 2), 'utf8');
    lastMtime = fs.statSync(DB_FILE_PATH).mtimeMs;
  } catch (err) {
    console.error('Error saving local db store:', err);
  }
}

// MySQL Pool Setup with Circuit Breaker and Zero-Delay Fail-Fast
let mysqlPool: mysql.Pool | null = null;
let isMySQLHealthy: boolean | null = null;
let lastMySQLCheck = 0;
let checkPromise: Promise<boolean> | null = null;
const MYSQL_COOLDOWN_MS = 60000; // 60s cooldown if MySQL is unavailable

async function isMySQLAvailable(): Promise<boolean> {
  const now = Date.now();
  if (isMySQLHealthy !== null && (now - lastMySQLCheck < MYSQL_COOLDOWN_MS)) {
    return isMySQLHealthy;
  }
  if (checkPromise) return checkPromise;

  const pool = getDatabasePool();
  if (!pool) {
    isMySQLHealthy = false;
    lastMySQLCheck = now;
    return false;
  }

  checkPromise = (async () => {
    try {
      const conn = await pool.getConnection();
      conn.release();
      isMySQLHealthy = true;
      lastMySQLCheck = Date.now();
      return true;
    } catch (err: any) {
      isMySQLHealthy = false;
      lastMySQLCheck = Date.now();
      console.warn(`[DB Engine] MySQL connection inactive (${err?.code || err?.message || 'Offline'}). Zero-latency local store active (cooldown 60s).`);
      return false;
    } finally {
      checkPromise = null;
    }
  })();

  return checkPromise;
}

export function getDatabasePool(): mysql.Pool | null {
  if (mysqlPool) return mysqlPool;

  // PostgreSQL URLs are handled by lib/postgres.ts, never by the MySQL driver
  if (getPostgresUrl()) return null;

  const connectionUri = [
    process.env.DATABASE_PUBLIC_URL,
    process.env.MYSQL_PUBLIC_URL,
    process.env.DATABASE_URL,
    process.env.MYSQL_URL,
    process.env.JAWSDB_URL,
    process.env.CLEARDB_DATABASE_URL,
  ].find((url) => url && url.trim() !== '' && !/^postgres(ql)?:\/\//i.test(url.trim()));

  if (connectionUri && connectionUri.trim() !== '') {
    try {
      const cleanUri = connectionUri.trim();
      const isRemote = !cleanUri.includes('127.0.0.1') && !cleanUri.includes('localhost');
      
      mysqlPool = mysql.createPool({
        uri: cleanUri,
        ssl: process.env.DB_SSL === 'false' ? undefined : (isRemote ? { rejectUnauthorized: false } : undefined),
        waitForConnections: true,
        connectionLimit: 10,
        connectTimeout: 1000, // 1s fast probe timeout
        enableKeepAlive: true,
      });
      return mysqlPool;
    } catch (err) {
      console.error('MySQL URI Pool Creation Error:', err);
    }
  }

  const host = process.env.DB_HOST || process.env.MYSQLHOST || process.env.MYSQL_HOST;
  if (host && host !== '127.0.0.1' && host !== 'localhost') {
    try {
      mysqlPool = mysql.createPool({
        host: host,
        port: Number(process.env.DB_PORT || process.env.MYSQLPORT || process.env.MYSQL_PORT) || 3306,
        user: process.env.DB_USER || process.env.MYSQLUSER || process.env.MYSQL_USER || 'root',
        password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || '',
        database: process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'railway',
        ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 10,
        connectTimeout: 1000, // 1s fast probe timeout
        enableKeepAlive: true,
      });
      return mysqlPool;
    } catch (err) {
      console.error('MySQL Host Pool Creation Error:', err);
    }
  }

  return null;
}

export interface DatabaseStatus {
  dialect: DatabaseDialect;
  connected: boolean;
  version: string | null;
  tables: string[];
  userCount: number;
  error: string | null;
  /** Non-blocking advice, e.g. a direct (non-pooler) Supabase connection */
  warning: string | null;
}

/** Connection check for the admin database-status page. Never throws. */
export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  const status: DatabaseStatus = { dialect: getDialect(), connected: false, version: null, tables: [], userCount: 0, error: null, warning: getDatabaseUrlWarning() };
  const problem = isLiveSite() ? getLiveDatabaseProblem() : getDatabaseUrlProblem();
  if (problem) {
    status.error = problem;
    return status;
  }
  try {
    if (status.dialect === 'postgres') {
      const pg = getPostgresPool()!;
      const version = await pg.query('SELECT version() AS version');
      status.version = String(version.rows[0]?.version || '').split(' on ')[0] || 'PostgreSQL';
      const tables = await pg.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
      );
      status.tables = tables.rows.map((r) => String(r.table_name));
      status.connected = true;
      if (status.tables.includes('users')) {
        const users = await pg.query('SELECT COUNT(*) AS count FROM users');
        status.userCount = Number(users.rows[0]?.count) || 0;
      }
    } else if (status.dialect === 'mysql') {
      const pool = getDatabasePool()!;
      const [versionRows]: any = await pool.execute('SELECT VERSION() AS version');
      status.version = versionRows?.[0]?.version || 'MySQL';
      const [tables]: any = await pool.execute('SHOW TABLES');
      status.tables = Array.isArray(tables) ? tables.map((t: any) => String(Object.values(t)[0])) : [];
      status.connected = true;
      const [userRows]: any = await pool.execute('SELECT COUNT(*) AS count FROM users').catch(() => [[{ count: 0 }]]);
      status.userCount = Number(userRows?.[0]?.count) || 0;
    } else {
      const local = await query<{ count: number }>('SELECT COUNT(*) as count FROM users');
      status.userCount = Number(local[0]?.count) || 0;
    }
  } catch (err) {
    status.error = (err as Error)?.message || String(err);
  }
  return status;
}

/**
 * True on the running live site (production server), false during `next build`
 * and in development. Only the live site must never fake a save.
 */
function isLiveSite(): boolean {
  return process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build';
}

/** Problem that stops the live site from using its database, or null. */
export function getLiveDatabaseProblem(): string | null {
  const urlProblem = getDatabaseUrlProblem();
  if (urlProblem) return urlProblem;
  if (getPostgresUrl() || getDatabasePool()) return null;
  // No database configured: only acceptable when a real data file exists on this
  // server's disk (e.g. running on your own computer). On Vercel there is none.
  if (!fs.existsSync(DB_FILE_PATH)) {
    return 'No database is configured. Set DATABASE_URL in Vercel to your Supabase "Transaction pooler" connection string (postgresql://…) and redeploy.';
  }
  return null;
}

/**
 * Universal query runner: PostgreSQL (Supabase) or MySQL when configured; the local
 * JSON store otherwise. On the live site a missing or broken database is reported as
 * an error, never hidden by writing to temporary memory.
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const trimmed = sql.trim();
  const live = isLiveSite();

  if (live) {
    const problem = getLiveDatabaseProblem();
    if (problem) throw new Error(problem);
  } else if (getDatabaseUrlProblem()) {
    console.warn(`[DB Engine] ${getDatabaseUrlProblem()} Using the local JSON store (development only).`);
    return executeLocalSql(trimmed, params) as Promise<T[]>;
  }

  // PostgreSQL / Supabase (DATABASE_URL starting with postgres:// or postgresql://)
  if (getPostgresUrl()) {
    try {
      const result = (await runPostgres(trimmed, params)) as T[];
      afterWrite(trimmed);
      return result;
    } catch (error) {
      // Real query errors are reported to the caller. Only an unreachable database
      // falls back to the local JSON store, and only outside the live site.
      if (live || !isConnectionError(error)) throw error;
      console.warn(`[DB Engine] PostgreSQL unreachable (${(error as Error)?.message}). Using local JSON store (development only).`);
      return executeLocalSql(trimmed, params) as Promise<T[]>;
    }
  }

  if (getDatabasePool()) {
    const available = await isMySQLAvailable();
    if (available && mysqlPool) {
      try {
        const [rows] = await mysqlPool.execute(sql, params);
        afterWrite(trimmed);
        return rows as T[];
      } catch (error: any) {
        if (live) throw error;
        isMySQLHealthy = false;
        lastMySQLCheck = Date.now();
        console.warn(`[DB Engine] MySQL query failed (${error?.code || error?.message}). Using local JSON store (development only).`);
      }
    } else if (live) {
      throw new Error('The MySQL database configured in DATABASE_URL cannot be reached. Check the connection string and that the database is online.');
    }
  }

  // Local JSON store (development, or a self-hosted server with a real data file)
  const result = await executeLocalSql(trimmed, params);
  afterWrite(trimmed);
  return result as T[];
}

/**
 * After content changes, refresh the public pages straight away instead of waiting
 * for their 15-second cache. Skipped for tables the public pages don't show.
 */
function afterWrite(sql: string): void {
  const match = sql.match(/^\s*(?:INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+[`"]?(\w+)/i);
  if (!match) return;
  if (['audit_logs', 'contact_messages', 'users'].includes(match[1].toLowerCase())) return;
  try {
    revalidatePath('/', 'layout');
  } catch {
    // Not inside a request (e.g. a page render or the build): the normal cache timer applies
  }
}

async function executeLocalSql(sql: string, params: any[]): Promise<any> {
  const store = getStore();
  const lowerSql = sql.toLowerCase();

  // 1. CREATE TABLE / SHOW TABLES / SHOW COLUMNS
  if (lowerSql.startsWith('create table') || lowerSql.startsWith('alter table')) {
    const match = sql.match(/create\s+table\s+(?:if\s+not\s+exists\s+)?([a-zA-Z0-9_]+)/i);
    if (match && match[1]) {
      const tableName = match[1];
      if (!store[tableName]) {
        store[tableName] = [];
        saveStore(store);
      }
    }
    return { success: true, affectedRows: 0 };
  }

  if (lowerSql.startsWith('show tables')) {
    return Object.keys(store).map((t) => ({ Tables_in_gnuts: t }));
  }

  if (lowerSql.startsWith('show columns from')) {
    const match = sql.match(/show\s+columns\s+from\s+([a-zA-Z0-9_]+)/i);
    const tableName = match ? match[1] : '';
    const sample = store[tableName]?.[0] || {};
    return Object.keys(sample).map((k) => ({ Field: k, Type: 'varchar(255)' }));
  }

  // 2. INSERT INTO
  if (lowerSql.startsWith('insert into')) {
    const match = sql.match(/insert\s+into\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*values/i);
    if (match) {
      const tableName = match[1];
      const columns = match[2].split(',').map((c) => c.trim().replace(/[`"']/g, ''));
      if (!store[tableName]) store[tableName] = [];

      const maxId = store[tableName].reduce((max, r) => Math.max(max, Number(r.id) || 0), 0);
      const newId = maxId + 1;

      const newRow: any = { id: newId };
      columns.forEach((col, idx) => {
        if (params[idx] !== undefined) {
          newRow[col] = params[idx];
        }
      });

      if (!newRow.created_at) newRow.created_at = new Date().toISOString();
      if (!newRow.updated_at) newRow.updated_at = new Date().toISOString();

      store[tableName].push(newRow);
      saveStore(store);

      const result: any = [newRow];
      result.insertId = newId;
      result.affectedRows = 1;
      return result;
    }
  }

  // 3. UPDATE table SET ... WHERE ...
  if (lowerSql.startsWith('update')) {
    const tableMatch = sql.match(/update\s+([a-zA-Z0-9_]+)/i);
    if (tableMatch) {
      const tableName = tableMatch[1];
      const rows = store[tableName] || [];

      // Extract set expressions
      const setMatch = sql.match(/set\s+(.+?)(?:\s+where|$)/i);
      const whereMatch = sql.match(/where\s+(.+)$/i);

      if (setMatch) {
        const setClauses = setMatch[1].split(',').map((c) => c.trim());
        const setCols: string[] = [];
        setClauses.forEach((clause) => {
          const colMatch = clause.match(/([a-zA-Z0-9_]+)\s*=\s*\?/);
          if (colMatch) {
            setCols.push(colMatch[1]);
          }
        });

        // Determine WHERE filter condition
        let filterFn = (row: any) => true;

        if (whereMatch) {
          const whereClause = whereMatch[1];

          // 1. Check if WHERE id = ? or WHERE id = 123
          const idMatch = whereClause.match(/(?:`?id`?)\s*=\s*(?:\?|['"]?([0-9]+)['"]?)/i);
          if (idMatch) {
            const targetId = idMatch[1] ? Number(idMatch[1]) : Number(params[setCols.length]);
            filterFn = (row) => Number(row.id) === targetId;
          }

          // 2. Check if WHERE page_key = ? or WHERE page_key = '...'
          const pkMatch = whereClause.match(/page_key\s*=\s*(?:\?|['"]([^'"]+)['"])/i);
          if (pkMatch) {
            const targetKey = String(pkMatch[1] || params[setCols.length] || '').toLowerCase();
            filterFn = (row) => String(row.page_key || '').toLowerCase() === targetKey;
          }
        }

        let updatedCount = 0;
        store[tableName] = rows.map((row) => {
          if (filterFn(row)) {
            const updatedRow = { ...row };
            setCols.forEach((col, idx) => {
              if (params[idx] !== undefined) {
                updatedRow[col] = params[idx];
              }
            });
            updatedRow.updated_at = new Date().toISOString();
            updatedCount++;
            return updatedRow;
          }
          return row;
        });

        saveStore(store);
        const result: any = { affectedRows: updatedCount, changedRows: updatedCount };
        return result;
      }
    }
  }

  // 4. DELETE FROM table WHERE ...
  if (lowerSql.startsWith('delete from')) {
    const match = sql.match(/delete\s+from\s+([a-zA-Z0-9_]+)(?:\s+where\s+(.+))?/i);
    if (match) {
      const tableName = match[1];
      const whereClause = match[2];
      const rows = store[tableName] || [];

      if (!whereClause) {
        store[tableName] = [];
        saveStore(store);
        return { affectedRows: rows.length };
      }

      // 4A. Check for WHERE id IN (...)
      const inMatch = whereClause.match(/(?:`?id`?)\s+in\s*\(([^)]+)\)/i);
      if (inMatch) {
        let idsToDelete: number[] = [];
        if (inMatch[1].includes('?')) {
          idsToDelete = params.map((p) => Number(p)).filter((n) => !isNaN(n));
        } else {
          idsToDelete = inMatch[1].split(',').map((s) => Number(s.trim().replace(/[`'"]/g, ''))).filter((n) => !isNaN(n));
        }
        const initialLen = rows.length;
        store[tableName] = rows.filter((r) => !idsToDelete.includes(Number(r.id)));
        saveStore(store);
        return { affectedRows: initialLen - store[tableName].length };
      }

      // 4B. Check for WHERE id = ? or WHERE id = 123 or WHERE `id` = 123
      const idMatch = whereClause.match(/(?:`?id`?)\s*=\s*(?:\?|['"]?([0-9]+)['"]?)/i);
      if (idMatch) {
        let targetId: number | null = null;
        if (idMatch[1]) {
          targetId = Number(idMatch[1]);
        } else if (params.length > 0) {
          targetId = Number(params[0]);
        }
        if (targetId !== null && !isNaN(targetId)) {
          const initialLen = rows.length;
          store[tableName] = rows.filter((r) => Number(r.id) !== targetId);
          saveStore(store);
          return { affectedRows: initialLen - store[tableName].length };
        }
      }

      // 4C. Check for WHERE page_key = ? or WHERE page_key = '...'
      const pageKeyMatch = whereClause.match(/page_key\s*=\s*(?:\?|['"]([^'"]+)['"])/i);
      if (pageKeyMatch) {
        const targetKey = pageKeyMatch[1] || (params.length > 0 ? params[0] : null);
        if (targetKey) {
          const initialLen = rows.length;
          store[tableName] = rows.filter((r) => String(r.page_key).toLowerCase() !== String(targetKey).toLowerCase());
          saveStore(store);
          return { affectedRows: initialLen - store[tableName].length };
        }
      }

      // 4D. Fallback by first numeric parameter
      if (params.length > 0) {
        const pId = Number(params[0]);
        if (!isNaN(pId)) {
          const initialLen = rows.length;
          store[tableName] = rows.filter((r) => Number(r.id) !== pId);
          saveStore(store);
          return { affectedRows: initialLen - store[tableName].length };
        }
      }

      return { affectedRows: 0 };
    }
  }

  // 5. SELECT Queries
  if (lowerSql.startsWith('select')) {
    const fromMatch = sql.match(/from\s+([a-zA-Z0-9_]+)/i);
    if (!fromMatch) return [];

    const tableName = fromMatch[1];
    let rows = [...(store[tableName] || [])];

    // Handle COUNT(*)
    if (lowerSql.includes('count(*)')) {
      // Check for simple WHERE filters
      if (lowerSql.includes('where status = "active"') || lowerSql.includes("where status = 'active'")) {
        rows = rows.filter((r) => String(r.status).toLowerCase() === 'active');
      } else if (lowerSql.includes('where status = "approved"') || lowerSql.includes("where status = 'approved'")) {
        rows = rows.filter((r) => String(r.status).toLowerCase() === 'approved');
      } else if (lowerSql.includes('where status = "pending"') || lowerSql.includes("where status = 'pending'")) {
        rows = rows.filter((r) => String(r.status).toLowerCase() === 'pending');
      } else if (lowerSql.includes('where status = "unread"') || lowerSql.includes("where status = 'unread'")) {
        rows = rows.filter((r) => String(r.status).toLowerCase() === 'unread');
      }
      return [{ count: rows.length }];
    }

    // WHERE id = ? / WHERE id=1
    if (lowerSql.includes('where id = ?') || lowerSql.includes('where id=?')) {
      const targetId = params[0];
      rows = rows.filter((r) => Number(r.id) === Number(targetId));
    } else if (lowerSql.includes('where id = 1') || lowerSql.includes('where id=1')) {
      rows = rows.filter((r) => Number(r.id) === 1);
    } else if (lowerSql.includes("where status = 'active'") || lowerSql.includes('where status = "active"')) {
      rows = rows.filter((r) => String(r.status).toLowerCase() === 'active');
    } else if (lowerSql.includes("where status = 'closed'") || lowerSql.includes('where status = "closed"')) {
      rows = rows.filter((r) => String(r.status).toLowerCase() === 'closed');
    } else if (lowerSql.includes("where status = 'published'") || lowerSql.includes('where status = "published"')) {
      rows = rows.filter((r) => String(r.status).toLowerCase() === 'published');
    } else if (lowerSql.includes("where status = 'pending'") || lowerSql.includes('where status = "pending"')) {
      rows = rows.filter((r) => String(r.status).toLowerCase() === 'pending');
    } else if (lowerSql.includes('where status = ?')) {
      const st = String(params[0]).toLowerCase();
      rows = rows.filter((r) => String(r.status).toLowerCase() === st);
    }

    // WHERE email = ? / WHERE LOWER(email) = ? (case-insensitive, used by login)
    const emailParamMatch = sql.match(/where\s+(?:lower\(\s*)?email(?:\s*\))?\s*=\s*\?/i);
    if (emailParamMatch) {
      const targetEmail = String(params[0] ?? '').trim().toLowerCase();
      rows = rows.filter((r) => String(r.email || '').trim().toLowerCase() === targetEmail);
    }

    // WHERE page_key filters (supports any page key or dynamic params)
    const pageKeyParamMatch = sql.match(/page_key\s*=\s*\?/i);
    const pageKeyLiteralMatch = sql.match(/page_key\s*=\s*['"]([^'"]+)['"]/i);
    if (pageKeyParamMatch && params.length > 0) {
      const targetPk = String(params[0] || '').toLowerCase();
      rows = rows.filter((r) => String(r.page_key || '').toLowerCase() === targetPk);
    } else if (pageKeyLiteralMatch) {
      // Check for multi-key OR conditions (e.g. gallery_hero OR about_hero)
      if (lowerSql.includes(' or ') && lowerSql.includes('page_key')) {
        const allKeys = [...sql.matchAll(/page_key\s*=\s*['"]([^'"]+)['"]/gi)].map((m) => m[1].toLowerCase());
        rows = rows.filter((r) => allKeys.includes(String(r.page_key || '').toLowerCase()));
      } else {
        const targetPk = pageKeyLiteralMatch[1].toLowerCase();
        rows = rows.filter((r) => String(r.page_key || '').toLowerCase() === targetPk);
      }
    }

    // ORDER BY
    if (lowerSql.includes('order by display_order asc')) {
      rows.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
    } else if (lowerSql.includes('order by')) {
      rows.sort((a, b) => {
        const createdB = new Date(b.created_at || 0).getTime();
        const createdA = new Date(a.created_at || 0).getTime();
        if (createdB !== createdA && !isNaN(createdB) && !isNaN(createdA)) {
          return createdB - createdA;
        }
        const dateB = new Date(b.published_at || 0).getTime();
        const dateA = new Date(a.published_at || 0).getTime();
        if (dateB !== dateA && !isNaN(dateB) && !isNaN(dateA)) {
          return dateB - dateA;
        }
        return (Number(b.id) || 0) - (Number(a.id) || 0);
      });
    }

    // LIMIT
    const limitMatch = sql.match(/limit\s+([0-9]+)/i);
    if (limitMatch) {
      const limit = Number(limitMatch[1]);
      rows = rows.slice(0, limit);
    }

    return rows;
  }

  return [];
}

export default mysqlPool;
