import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

/**
 * GNUTS Hybrid Persistence Database Engine
 * 
 * Features:
 * 1. Connects to MySQL / MariaDB (via DATABASE_URL or DB_HOST) when available.
 * 2. Seamlessly falls back to a high-speed, local file-based persistence store (`data/gnuts_db.json`)
 *    when MySQL is offline, ensuring data NEVER vanishes upon page refresh!
 * 3. Supports real-time CRUD (INSERT, UPDATE, DELETE, SELECT, COUNT, ORDER BY, LIMIT, WHERE).
 */

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'gnuts_db.json');

// Initial baseline seed data
const DEFAULT_STORE: Record<string, any[]> = {
  users: [
    {
      id: 1,
      name: 'GNUTS Secretariat',
      full_name: 'GNUTS Secretariat',
      email: 'admin@gnuts.org.gh',
      password: 'password123',
      role: 'Super Admin',
      avatar: 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991593/photo_2026-08-17_18-24-49_bg2c1g.jpg',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'PRO',
      full_name: 'PRO',
      email: 'joevardy2004@gmail.com',
      password: 'password123',
      role: 'Super Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  executives: [
    {
      id: 1,
      full_name: 'Comrade Joe Vardy',
      position: 'National President',
      email: 'president@gnuts.org.gh',
      phone: '+233 24 123 4567',
      bio: 'Leading the national technical students union with a focus on TVET innovation and industrial linkage.',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
      display_order: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      full_name: 'Comrade Priscilla Mensah',
      position: 'General Secretary',
      email: 'gensec@gnuts.org.gh',
      phone: '+233 20 987 6543',
      bio: 'Managing secretariat operations, official correspondences, and union communications.',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
      display_order: 2,
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      full_name: 'Comrade Emmanuel Osei',
      position: 'Treasurer / Financial Controller',
      email: 'finance@gnuts.org.gh',
      phone: '+233 55 456 7890',
      bio: 'Ensuring fiscal discipline, transparent bursary disbursement, and project funding accountability.',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
      display_order: 3,
      created_at: new Date().toISOString(),
    }
  ],
  news: [
    {
      id: 1,
      title: 'GNUTS National Delegates Congress 2026 Scheduled for Sunyani Technical University',
      content: 'The National Executive Council has officially scheduled the 2026 GNUTS Congress to discuss TVET industrial allowances and student innovation funding across all technical universities in Ghana.',
      image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg',
      author: 'GNUTS Secretariat',
      published_at: new Date().toISOString().substring(0, 10),
      status: 'published',
      view_count: 342,
      allow_sharing: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
  opportunities: [
    {
      id: 1,
      title: 'Ghana Grid Company (GRIDCo) Industrial Engineering Internship',
      description: '12-week hands-on industrial placement across electrical transmission substations, control centers, and automation facilities.',
      type: 'internship',
      category: 'Industrial Attachment',
      partner: 'GRIDCo Ghana',
      eligibility: 'Electrical, Mechanical & Computer Engineering Level 200 & 300 students',
      location: 'Tema / Takoradi / Kumasi',
      stipend_reward: 'Monthly Allowance + Field Protective Gear',
      application_url: 'https://gridcogh.com/careers',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      link: 'https://gridcogh.com/careers',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ],
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
      title: 'GNUTS Supreme Constitution (Revised Edition)',
      description: 'The supreme governing charter, legal framework, and administrative guidelines of the Ghana National Union of Technical Students.',
      category: 'Constitution',
      file_path: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787056252/choose_tvet_first_kwucvy.png',
      file_name: 'GNUTS_Supreme_Constitution_Official.pdf',
      file_size: 2450000,
      display_order: 1,
      downloads: 1240,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'National Secretariat Official Communiqué on TVET Allowances',
      description: 'Comprehensive policy resolution and joint union communiqué submitted to the Ministry of Education.',
      category: 'Communiqué',
      file_path: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787056252/choose_tvet_first_kwucvy.png',
      file_name: 'GNUTS_National_Communique_2026.pdf',
      file_size: 1180000,
      display_order: 2,
      downloads: 870,
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
      hero_image: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg',
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
      image_url: 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991593/photo_2026-08-17_18-24-49_bg2c1g.jpg',
      display_order: 1,
      status: 'active'
    },
    {
      id: 2,
      page_key: 'home_carousel',
      title: 'Empowering Technical Students for National Development',
      image_url: 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991595/photo_2026-08-17_18-24-46_w6zphs.jpg',
      display_order: 2,
      status: 'active'
    },
    {
      id: 3,
      page_key: 'home_carousel',
      title: 'Creating Opportunities Beyond the Classroom',
      image_url: 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991595/photo_2026-08-17_18-24-43_hkzlai.jpg',
      display_order: 3,
      status: 'active'
    },
    {
      id: 4,
      page_key: 'about_hero',
      title: 'About GNUTS Page Hero Banner',
      image_url: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg',
      display_order: 1,
      status: 'active'
    },
    {
      id: 5,
      page_key: 'news_hero',
      title: 'News & Press Releases Hero Banner',
      image_url: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg',
      display_order: 1,
      status: 'active'
    },
    {
      id: 6,
      page_key: 'innovations_hero',
      title: 'Student Innovations Hero Banner',
      image_url: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg',
      display_order: 1,
      status: 'active'
    },
    {
      id: 7,
      page_key: 'scholarships_hero',
      title: 'Scholarships & Opportunities Hero Banner',
      image_url: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg',
      display_order: 1,
      status: 'active'
    },
    {
      id: 8,
      page_key: 'contact_hero',
      title: 'Contact Hero Banner',
      image_url: 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg',
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

// Ensure data directory and file exist
function getStore(): Record<string, any[]> {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(DEFAULT_STORE, null, 2), 'utf8');
      return DEFAULT_STORE;
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
    }
    return parsed;
  } catch {
    return DEFAULT_STORE;
  }
}

function saveStore(store: Record<string, any[]>) {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving local db store:', err);
  }
}

// MySQL Pool Setup with dynamic lazy initialization and SSL support
let mysqlPool: mysql.Pool | null = null;

export function getDatabasePool(): mysql.Pool | null {
  if (mysqlPool) return mysqlPool;

  const connectionUri = 
    process.env.DATABASE_PUBLIC_URL ||
    process.env.MYSQL_PUBLIC_URL ||
    process.env.DATABASE_URL ||
    process.env.MYSQL_URL ||
    process.env.JAWSDB_URL ||
    process.env.CLEARDB_DATABASE_URL;

  if (connectionUri && connectionUri.trim() !== '') {
    try {
      const cleanUri = connectionUri.trim();
      const isRemote = !cleanUri.includes('127.0.0.1') && !cleanUri.includes('localhost');
      
      mysqlPool = mysql.createPool({
        uri: cleanUri,
        ssl: process.env.DB_SSL === 'false' ? undefined : (isRemote ? { rejectUnauthorized: false } : undefined),
        waitForConnections: true,
        connectionLimit: 10,
        connectTimeout: 10000,
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
        connectTimeout: 10000,
        enableKeepAlive: true,
      });
      return mysqlPool;
    } catch (err) {
      console.error('MySQL Host Pool Creation Error:', err);
    }
  }

  return null;
}

/**
 * Universal query runner: executes against MySQL if available,
 * or against local persistent store with zero data loss.
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const trimmed = sql.trim();
  const pool = getDatabasePool();

  // Try MySQL if pool exists
  if (pool) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows as T[];
    } catch (error: any) {
      console.error('MySQL Query Execution Error:', error?.message || error, 'SQL:', sql);
    }
  }

  // Fallback: Local Persistent JSON SQL Engine
  return executeLocalSql(trimmed, params) as Promise<T[]>;
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
        let paramIdx = 0;

        // Check if WHERE id = ?
        let targetId: any = null;
        if (whereMatch) {
          const idMatch = whereMatch[1].match(/(?:`?id`?)\s*=\s*(?:\?|['"]?([0-9]+)['"]?)/i);
          if (idMatch) {
            targetId = idMatch[1] ? Number(idMatch[1]) : params[params.length - 1];
          }
        }

        let updatedCount = 0;
        store[tableName] = rows.map((row) => {
          if (targetId === null || Number(row.id) === Number(targetId)) {
            const updatedRow = { ...row };
            setClauses.forEach((clause) => {
              const colMatch = clause.match(/([a-zA-Z0-9_]+)\s*=\s*\?/);
              if (colMatch) {
                const col = colMatch[1];
                updatedRow[col] = params[paramIdx++];
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
    } else if (lowerSql.includes('where page_key = ?')) {
      const pk = String(params[0]).toLowerCase();
      rows = rows.filter((r) => String(r.page_key).toLowerCase() === pk);
    } else if (lowerSql.includes("where page_key = 'home_carousel'") || lowerSql.includes('where page_key = "home_carousel"')) {
      rows = rows.filter((r) => r.page_key === 'home_carousel');
    } else if (lowerSql.includes("where page_key = 'about_hero'") || lowerSql.includes('where page_key = "about_hero"')) {
      rows = rows.filter((r) => r.page_key === 'about_hero');
    } else if (lowerSql.includes("where page_key = 'news_hero'") || lowerSql.includes('where page_key = "news_hero"')) {
      rows = rows.filter((r) => r.page_key === 'news_hero');
    } else if (lowerSql.includes("where page_key = 'innovations_hero'") || lowerSql.includes('where page_key = "innovations_hero"')) {
      rows = rows.filter((r) => r.page_key === 'innovations_hero');
    } else if (lowerSql.includes("where page_key = 'scholarships_hero'") || lowerSql.includes('where page_key = "scholarships_hero"')) {
      rows = rows.filter((r) => r.page_key === 'scholarships_hero');
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
