import { query } from './db';

/**
 * Database Auto-Sync & Table Initialization Engine
 * Ensures all relational tables exist and seeded with foundational union data.
 */
export async function initializeDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Users Table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        name VARCHAR(150) DEFAULT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'Super Admin',
        avatar VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure columns exist if table was created previously
    await query('ALTER TABLE users ADD COLUMN name VARCHAR(150) DEFAULT NULL').catch(() => null);
    await query('ALTER TABLE users ADD COLUMN full_name VARCHAR(150) DEFAULT NULL').catch(() => null);
    await query('ALTER TABLE users ADD COLUMN avatar VARCHAR(255) DEFAULT NULL').catch(() => null);

    // Seed default primary Super Admin if empty
    const existingUsers = await query('SELECT id FROM users LIMIT 1');
    if (!existingUsers || existingUsers.length === 0) {
      await query(`
        INSERT INTO users (full_name, name, email, password, role) VALUES
        ('GNUTS Secretariat', 'GNUTS Secretariat', 'admin@gnuts.org.gh', 'admin123', 'Super Admin');
      `);
    }

    // 2. Executives Table
    await query(`
      CREATE TABLE IF NOT EXISTS executives (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        bio TEXT DEFAULT NULL,
        photo VARCHAR(255) DEFAULT NULL,
        display_order INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. News Table
    await query(`
      CREATE TABLE IF NOT EXISTS news (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        image VARCHAR(255) DEFAULT NULL,
        author VARCHAR(100) DEFAULT 'GNUTS Secretariat',
        published_at DATE DEFAULT (CURRENT_DATE),
        status ENUM('draft','published') DEFAULT 'published',
        view_count INT DEFAULT 0,
        allow_sharing TINYINT(1) DEFAULT 1,
        image2 VARCHAR(255) DEFAULT NULL,
        image3 VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Scholarships Table
    await query(`
      CREATE TABLE IF NOT EXISTS scholarships (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT DEFAULT NULL,
        deadline DATE DEFAULT NULL,
        link VARCHAR(255) DEFAULT NULL,
        status ENUM('active','closed') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Opportunities Table
    await query(`
      CREATE TABLE IF NOT EXISTS opportunities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        type ENUM('internship','skill_camp','grant') DEFAULT 'internship',
        location VARCHAR(100) DEFAULT NULL,
        deadline DATE DEFAULT NULL,
        link VARCHAR(255) DEFAULT NULL,
        status ENUM('active','closed') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Innovations Table
    await query(`
      CREATE TABLE IF NOT EXISTS innovations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        project_image VARCHAR(255) DEFAULT NULL,
        video_url VARCHAR(255) DEFAULT NULL,
        institution VARCHAR(150) DEFAULT NULL,
        student_name VARCHAR(150) DEFAULT NULL,
        category VARCHAR(100) DEFAULT 'Engineering',
        upvotes INT DEFAULT 0,
        status ENUM('pending','approved','rejected') DEFAULT 'approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. Resources Table
    await query(`
      CREATE TABLE IF NOT EXISTS resources (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'constitution',
        file_path VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size BIGINT NOT NULL DEFAULT 2048000,
        display_order INT DEFAULT 0,
        downloads INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 8. Contact Inquiries Table
    await query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(50) DEFAULT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('unread','read','replied','archived') DEFAULT 'unread',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 9. Audit Logs Table
    await query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_name VARCHAR(150) NOT NULL,
        user_role VARCHAR(100) NOT NULL,
        action VARCHAR(100) NOT NULL,
        target VARCHAR(255) NOT NULL,
        details TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 10. About Page CMS Table
    await query(`
      CREATE TABLE IF NOT EXISTS about_page (
        id INT PRIMARY KEY DEFAULT 1,
        hero_title VARCHAR(255) NOT NULL DEFAULT 'About GNUTS',
        hero_subtitle VARCHAR(255) NOT NULL DEFAULT 'Empowering Technical & TVET Students Across Ghana',
        hero_image VARCHAR(255) DEFAULT 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg',
        who_we_are_title VARCHAR(255) NOT NULL DEFAULT 'Who We Are',
        who_we_are_subtitle TEXT DEFAULT NULL,
        who_we_are_content TEXT NOT NULL,
        who_we_are_image VARCHAR(255) DEFAULT 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991593/photo_2026-08-17_18-24-49_bg2c1g.jpg',
        mission_title VARCHAR(255) NOT NULL DEFAULT 'Our Mission',
        mission_content TEXT NOT NULL,
        vision_title VARCHAR(255) NOT NULL DEFAULT 'Our Vision',
        vision_content TEXT NOT NULL,
        values_title VARCHAR(255) NOT NULL DEFAULT 'Our Core Values',
        values_json JSON DEFAULT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed default about_page if empty
    const existingAbout = await query('SELECT id FROM about_page WHERE id=1');
    if (!existingAbout || existingAbout.length === 0) {
      await query(`
        INSERT INTO about_page (
          id, hero_title, hero_subtitle, hero_image, who_we_are_title, who_we_are_content, who_we_are_image,
          mission_title, mission_content, vision_title, vision_content, values_title
        ) VALUES (
          1,
          'About GNUTS',
          'Empowering Technical & TVET Students Across Ghana',
          'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg',
          'Who We Are',
          'The Ghana National Union of Technical Students (GNUTS) is the sole democratic, non-partisan representative council for all technical and vocational education students across Ghana.\\n\\nFrom advocating for industrial training allowances and modern laboratory equipment to participating in national education policy reform, GNUTS empowers technical students to become skilled engineers, tech pioneers, and industrial leaders.',
          'https://res.cloudinary.com/dslngzls6/image/upload/v1786991593/photo_2026-08-17_18-24-49_bg2c1g.jpg',
          'Our Mission',
          'To represent, unite, and empower technical students across Ghana by advocating for quality and inclusive technical education, promoting student welfare and leadership development, engaging stakeholders for national progress, and strengthening communication and participation within the union.',
          'Our Vision',
          'To build a strong, credible, united, and nationally respected student union that effectively represents the collective interests of students in Technical Universities and TVET institutions across Ghana.',
          'Our Core Values'
        );
      `);
    }

    // 11. History Milestones Table
    await query(`
      CREATE TABLE IF NOT EXISTS history_milestones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        year VARCHAR(20) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        image VARCHAR(255) DEFAULT NULL,
        tag VARCHAR(100) DEFAULT NULL,
        display_order INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed default history milestones if empty
    const existingMilestones = await query('SELECT id FROM history_milestones LIMIT 1');
    if (!existingMilestones || existingMilestones.length === 0) {
      await query(`
        INSERT INTO history_milestones (year, title, description, image, tag, display_order) VALUES
        ('1987', 'Establishment of GNUPS', 'The Ghana National Union of Polytechnic Students (GNUPS) was established after technical students broke away from the National Union of Ghana Students (NUGS). This decision was driven by concerns of marginalization and the need for a dedicated national body to represent the unique academic, professional, and welfare interests of polytechnic students across Ghana.', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop', 'UNION FOUNDING', 1),
        ('2000', 'The Tamale Declaration', 'GNUPS was formally operationalized at a national congress held in Tamale, where its first constitution was adopted. This historic congress, widely referred to as the Tamale Declaration, provided a legal and administrative framework for the Union and strengthened its legitimacy as the recognized voice of polytechnic students nationwide.', 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=800&auto=format&fit=crop', 'CONSTITUTIONAL CHARTER', 2),
        ('2016', 'Transition from GNUPS to GNUTS', 'Following the Government of Ghana’s conversion of polytechnics into technical universities, GNUPS was rebranded as the Ghana National Union of Technical Students (GNUTS). The change reflected the evolving identity of technical students and was ratified at the First Central Committee and Mini Congress held at Tamale Technical University from December 1–4, 2016.', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop', 'HISTORIC REBRANDING', 3),
        ('2017', 'Public Recognition and Rebranding', 'GNUTS issued official press statements to announce and affirm its new identity. The Union emphasized legal compliance, institutional continuity, and urged stakeholders, media organizations, and the general public to recognize GNUTS as the legitimate national representative body of technical university students.', 'https://res.cloudinary.com/dslngzls6/image/upload/v1787056252/choose_tvet_first_kwucvy.png', 'NATIONAL RECOGNITION', 4);
      `);
    }

    // 12. Hero Banners Table
    await query(`
      CREATE TABLE IF NOT EXISTS hero_banners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_key VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        image_url TEXT NOT NULL,
        display_order INT DEFAULT 1,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const existingBanners = await query('SELECT id FROM hero_banners LIMIT 1');
    if (!existingBanners || existingBanners.length === 0) {
      await query(`
        INSERT INTO hero_banners (page_key, title, image_url, display_order, status) VALUES
        ('home_carousel', 'Ghana National Union of Technical Students (GNUTS)', 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991593/photo_2026-08-17_18-24-49_bg2c1g.jpg', 1, 'active'),
        ('home_carousel', 'Empowering Technical Students for National Development', 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991595/photo_2026-08-17_18-24-46_w6zphs.jpg', 2, 'active'),
        ('home_carousel', 'Creating Opportunities Beyond the Classroom', 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991595/photo_2026-08-17_18-24-43_hkzlai.jpg', 3, 'active'),
        ('about_hero', 'About GNUTS Page Hero Banner', 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg', 1, 'active'),
        ('news_hero', 'News & Press Releases Hero Banner', 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg', 1, 'active'),
        ('innovations_hero', 'Student Innovations Hero Banner', 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg', 1, 'active'),
        ('scholarships_hero', 'Scholarships & Opportunities Hero Banner', 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg', 1, 'active'),
        ('contact_hero', 'Contact Hero Banner', 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg', 1, 'active');
      `);
    }

    // 13. Legacy & Leadership Gallery Table
    await query(`
      CREATE TABLE IF NOT EXISTS gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'LEADERSHIP',
        image TEXT NOT NULL,
        tenure_or_date VARCHAR(150) DEFAULT '2025/2026 Administration',
        role_or_badge VARCHAR(150) DEFAULT 'National Union Archive',
        description TEXT DEFAULT NULL,
        display_order INT DEFAULT 1,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const existingGallery = await query('SELECT id FROM gallery LIMIT 1');
    if (!existingGallery || existingGallery.length === 0) {
      await query(`
        INSERT INTO gallery (title, category, image, tenure_or_date, role_or_badge, description, display_order) VALUES
        ('H.E. Isaac Mensah & Leadership Executives', 'LEADERSHIP', 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991593/photo_2026-08-17_18-24-49_bg2c1g.jpg', '2025/2026 Administration', 'National President & Council', 'The National Executive Council presiding over union advocacy and strategic initiatives for technical students.', 1),
        ('National TVET Policy & Advocacy Summit', 'ACTIVITIES', 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991595/photo_2026-08-17_18-24-46_w6zphs.jpg', 'March 2025', 'Advocacy & Policy', 'Delegates and student representatives engaging national education stakeholders on TVET infrastructure and bursaries.', 2),
        ('Student Engineering & Prototype Exhibition', 'PROJECTS', 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991595/photo_2026-08-17_18-24-43_hkzlai.jpg', 'November 2024', 'Technical Innovation', 'Technical University student innovators unveiling automated agricultural hardware and solar technologies.', 3),
        ('34th National Delegates Congress - Inauguration', 'CONGRESS', 'https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg', 'Annual National Congress', 'National Congress', 'Official swearing-in ceremony and constitutional proceedings of elected national union officers.', 4),
        ('National Women in TVET Leadership Seminar', 'ACTIVITIES', 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991593/photo_2026-08-17_18-24-49_bg2c1g.jpg', 'February 2025', 'Women Commissioner Desk', 'Empowering female technical scholars and engineering innovators across member universities.', 5),
        ('Technical University Campus Tour & Engagement', 'LEADERSHIP', 'https://res.cloudinary.com/dslngzls6/image/upload/v1786991595/photo_2026-08-17_18-24-46_w6zphs.jpg', '2024/2025 Tour', 'Campus Outreach', 'Direct consultation sessions with student body leaders on academic affairs and welfare.', 6);
      `);
    }

    // Upgrade image columns to LONGTEXT to support CDN URLs and Base64 images without size limitation
    await query('ALTER TABLE innovations MODIFY COLUMN project_image LONGTEXT').catch(() => null);
    await query('ALTER TABLE news MODIFY COLUMN image LONGTEXT').catch(() => null);
    await query('ALTER TABLE news MODIFY COLUMN image2 LONGTEXT').catch(() => null);
    await query('ALTER TABLE news MODIFY COLUMN image3 LONGTEXT').catch(() => null);
    await query('ALTER TABLE executives MODIFY COLUMN photo LONGTEXT').catch(() => null);
    await query('ALTER TABLE hero_banners MODIFY COLUMN image_url LONGTEXT').catch(() => null);
    await query('ALTER TABLE gallery MODIFY COLUMN image LONGTEXT').catch(() => null);
    await query('ALTER TABLE resources MODIFY COLUMN file_path LONGTEXT').catch(() => null);
    await query('ALTER TABLE about_page MODIFY COLUMN hero_image LONGTEXT').catch(() => null);
    await query('ALTER TABLE about_page MODIFY COLUMN who_we_are_image LONGTEXT').catch(() => null);
    await query('ALTER TABLE users MODIFY COLUMN avatar LONGTEXT').catch(() => null);

    return { success: true, message: 'All GNUTS database tables verified, upgraded, and initialized successfully.' };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Database initialization error' };
  }
}
