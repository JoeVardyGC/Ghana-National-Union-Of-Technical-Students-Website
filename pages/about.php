<?php
// Database connection
$conn = new mysqli("127.0.0.1", "root", "", "gnuts");

// Check connection
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

// Fetch About page content
$aboutQuery = "SELECT * FROM about_page WHERE id=1";
$aboutResult = $conn->query($aboutQuery);
$aboutData = $aboutResult->fetch_assoc();

// Fetch history introduction
$historyIntroQuery = "SELECT content FROM site_content WHERE section = 'history_intro'";
$historyIntroResult = $conn->query($historyIntroQuery);
$historyIntro = $historyIntroResult->fetch_assoc()['content'] ?? '';

// Fetch historical milestones
$milestonesQuery = "SELECT * FROM history_milestones ORDER BY year DESC, display_order ASC";
$milestonesResult = $conn->query($milestonesQuery);
$milestones = [];
while($row = $milestonesResult->fetch_assoc()) {
    $milestones[] = $row;
}

// Fetch executives
$executivesQuery = "SELECT * FROM executives ORDER BY display_order ASC LIMIT 12";
$executivesResult = $conn->query($executivesQuery);
$executives = [];
while($row = $executivesResult->fetch_assoc()) {
    $executives[] = $row;
}

// Fetch resources/constitution
$resourcesQuery = "SELECT * FROM resources ORDER BY display_order ASC, created_at DESC";
$resourcesResult = $conn->query($resourcesQuery);
$resources = [];
while($row = $resourcesResult->fetch_assoc()) {
    $resources[] = $row;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Us - GNUTS</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="../includes/assets/gnuts_fav.png">
    <style>
        :root {
            --primary: #014900;
            --secondary: #D9A000;
            --dark: #1a1a1a;
            --light: #f8f9fa;
            --white: #ffffff;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-300: #d1d5db;
            --gray-400: #9ca3af;
            --gray-500: #6b7280;
            --gray-600: #4b5563;
            --gray-700: #374151;
            --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: var(--light);
            color: var(--dark);
            line-height: 1.6;
            overflow-x: hidden;
        }

        /* Header & Navigation */
        .header {
            background: #014900 !important;
            box-shadow: var(--shadow-md);
            position: sticky;
            top: 0;
            z-index: 1000;
            transition: all 0.3s ease;
        }

        .nav-container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 72px;
            background: #014900 !important;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 800;
            font-size: 1.5rem;
            text-decoration: none;
        }

        .logo img {
            width: 55px;
            height: 55px;
            object-fit: contain;
        }

        .logo span {
            color: #ffffff !important;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 1px;
        }

        .nav-menu {
            display: flex;
            gap: 2rem;
            align-items: center;
            list-style: none;
        }

        .nav-link {
            color: #ffffff !important;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.95rem;
            padding: 0.5rem 0;
            position: relative;
            transition: color 0.3s ease;
        }

        .nav-link::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 2px;
            background: #D9A000;
            transition: width 0.3s ease;
        }

        .nav-link:hover {
            color: #D9A000 !important;
        }

        .nav-link:hover::after,
        .nav-link.active::after {
            width: 100%;
        }

        /* Mobile Toggle */
        .mobile-toggle {
            display: none;
            flex-direction: column;
            gap: 6px;
            cursor: pointer;
            background: none;
            border: none;
            padding: 10px;
            z-index: 9999;
        }

        .mobile-toggle span {
            width: 28px;
            height: 3px;
            background: white;
            border-radius: 4px;
            transition: 0.4s ease;
        }

        .mobile-toggle:hover span {
            background: gold;
        }

        .mobile-toggle.active span:nth-child(1) {
            transform: translateY(9px) rotate(45deg);
            background: gold;
        }

        .mobile-toggle.active span:nth-child(2) {
            opacity: 0;
        }

        .mobile-toggle.active span:nth-child(3) {
            transform: translateY(-9px) rotate(-45deg);
            background: gold;
        }

        /* Desktop Toggle */
        .desktop-toggle {
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            background: none;
            border: none;
            padding: 10px;
            z-index: 16000;
        }

        .desktop-toggle span {
            width: 28px;
            height: 3px;
            background: white;
            border-radius: 4px;
            transition: 0.4s ease;
        }

        .desktop-toggle:hover span {
            background: gold;
        }

        .desktop-toggle.active span:nth-child(1) {
            transform: translateY(9px) rotate(45deg);
            background: gold;
        }

        .desktop-toggle.active span:nth-child(2) {
            opacity: 0;
        }

        .desktop-toggle.active span:nth-child(3) {
            transform: translateY(-9px) rotate(-45deg);
            background: gold;
        }

        @media (min-width: 1025px) {
            .desktop-toggle { display: flex; }
        }

        /* Mobile Menu */
        .mobile-menu {
            position: fixed;
            top: 72px;
            right: -100%;
            width: 80%;
            max-width: 320px;
            height: calc(100vh - 72px);
            background: #ffffff;
            display: flex;
            flex-direction: column;
            padding: 2rem 0;
            transition: right 0.4s ease;
            box-shadow: -2px 0 10px rgba(0,0,0,0.1);
            overflow-y: auto;
            z-index: 10000;
        }

        .mobile-menu.active {
            right: 0;
        }

        .mobile-menu a {
            color: #333;
            text-decoration: none;
            padding: 1rem 2rem;
            font-size: 16px;
            font-weight: 500;
            transition: 0.3s ease;
            border-bottom: 1px solid #f0f0f0;
        }

        .mobile-menu a:hover,
        .mobile-menu a.active {
            background: #f8f9fa;
            color: #014900;
            padding-left: 2.5rem;
        }

        .mobile-overlay {
            position: fixed;
            top: 72px;
            left: 0;
            width: 100%;
            height: calc(100vh - 72px);
            background: rgba(0, 0, 0, 0.5);
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.4s ease;
            z-index: 9999;
        }

        .mobile-overlay.active {
            opacity: 1;
            visibility: visible;
        }

        /* Desktop Drawer */
        .desktop-drawer {
            position: fixed;
            top: 72px;
            right: -100%;
            width: 70%;
            max-width: 360px;
            height: calc(100vh - 72px);
            background: #ffffff;
            display: flex;
            flex-direction: column;
            padding-top: 100px;
            gap: 20px;
            transition: 0.4s ease;
            z-index: 15000;
        }

        .desktop-drawer.active {
            right: 0;
        }

        .desktop-drawer a {
            color: #014900;
            text-decoration: none;
            padding: 12px 25px;
            font-size: 18px;
            transition: 0.3s ease;
        }

        .desktop-drawer a:hover {
            color: gold;
            padding-left: 35px;
        }

        .desktop-overlay {
            display: none;
        }

        @media (min-width: 1025px) {
            .desktop-overlay {
                display: block;
                position: fixed;
                top: 72px;
                left: 0;
                width: 100%;
                height: calc(100vh - 72px);
                background: rgba(0,0,0,0.25);
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.4s ease;
                z-index: 14000;
            }

            .desktop-overlay.active {
                opacity: 1;
                visibility: visible;
            }
        }

        /* Hero Section */
        .hero {
            position: relative;
            height: 60vh;
            min-height: 400px;
            background: linear-gradient(135deg, rgba(1, 73, 0, 0.95) 0%, rgba(1, 73, 0, 0.85) 100%),
                        url('<?php echo !empty($aboutData['hero_image']) ? "../" . $aboutData['hero_image'] : "../includes/assets/slide4.png"; ?>');
            background-size: cover;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-align: center;
        }

        .hero-content {
            max-width: 900px;
            padding: 2rem;
            z-index: 2;
        }

        .hero-content h1 {
            font-size: clamp(2.5rem, 5vw, 4rem);
            font-weight: 800;
            margin-bottom: 1rem;
            animation: fadeInUp 0.8s ease-out;
        }

        .hero-content p {
            font-size: clamp(1.1rem, 2vw, 1.35rem);
            opacity: 0.95;
            animation: fadeInUp 0.8s ease-out 0.2s backwards;
        }

        /* Container */
        .container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .section {
            padding: 5rem 0;
        }

        .section-header {
            text-align: center;
            margin-bottom: 4rem;
        }

        .section-title {
            font-size: clamp(2rem, 4vw, 3rem);
            font-weight: 800;
            color: var(--primary);
            margin-bottom: 1rem;
            position: relative;
            display: inline-block;
        }

        .section-title::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 4px;
            background: var(--secondary);
            border-radius: 2px;
        }

        .section-subtitle {
            font-size: 1.1rem;
            color: var(--gray-600);
            max-width: 700px;
            margin: 1.5rem auto 0;
            line-height: 1.7;
        }

        /* About Content */
        .about-content {
            display: grid;
            grid-template-columns: 1fr;
            gap: 3rem;
            margin-bottom: 4rem;
        }

        .content-block {
            background: white;
            padding: 3rem;
            border-radius: 16px;
            box-shadow: var(--shadow-lg);
        }

        .content-block h2 {
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .content-block-icon {
            width: 48px;
            height: 48px;
            background: var(--primary);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }

        .content-block p {
            font-size: 1.05rem;
            line-height: 1.8;
            color: var(--gray-700);
            margin-bottom: 1rem;
        }

        .content-with-image {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            align-items: center;
        }

        .content-image {
            border-radius: 16px;
            overflow: hidden;
            box-shadow: var(--shadow-xl);
        }

        .content-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        /* Timeline */
        .timeline {
            position: relative;
            padding: 2rem 0;
        }

        .timeline::before {
            content: '';
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            top: 0;
            bottom: 0;
            width: 4px;
            background: var(--primary);
        }

        .timeline-item {
            position: relative;
            margin-bottom: 4rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
        }

        .timeline-item:nth-child(even) {
            direction: rtl;
        }

        .timeline-item:nth-child(even) > * {
            direction: ltr;
        }

        .timeline-year {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            background: var(--secondary);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 50px;
            font-weight: 800;
            font-size: 1.25rem;
            box-shadow: var(--shadow-lg);
            z-index: 2;
        }

        .timeline-content {
            background: white;
            padding: 2rem;
            border-radius: 16px;
            box-shadow: var(--shadow-lg);
            margin-top: 3rem;
        }

        .timeline-content h3 {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 1rem;
        }

        .timeline-content p {
            color: var(--gray-700);
            line-height: 1.7;
        }

        .timeline-image {
            margin-top: 3rem;
        }

        .timeline-image img {
            width: 100%;
            height: 300px;
            object-fit: cover;
            border-radius: 16px;
            box-shadow: var(--shadow-lg);
        }

        /* Executives Grid */
        .exec-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }

        .exec-card {
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: var(--shadow-lg);
            transition: all 0.4s ease;
        }

        .exec-card:hover {
            transform: translateY(-12px);
            box-shadow: var(--shadow-xl);
        }

        .exec-card-image {
            width: 100%;
            height: 350px;
            background: linear-gradient(135deg, var(--primary) 0%, #026b00 100%);
            overflow: hidden;
            position: relative;
        }

        .exec-card-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .exec-badge {
            position: absolute;
            top: 1rem;
            left: 1rem;
            background: rgba(217, 160, 0, 0.95);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            box-shadow: var(--shadow-md);
        }

        .exec-card-content {
            padding: 2rem;
            text-align: center;
        }

        .exec-card h4 {
            font-size: 1.25rem;
            font-weight: 800;
            color: var(--dark);
            margin-bottom: 0.5rem;
        }

        .exec-position {
            color: var(--primary);
            font-size: 0.95rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .exec-contact {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            font-size: 0.85rem;
            color: var(--gray-600);
            padding-top: 1rem;
            border-top: 1px solid var(--gray-200);
        }

        /* Resources Grid */
        .resources-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }

        .resource-card {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: var(--shadow-lg);
            transition: all 0.3s ease;
            border-left: 4px solid var(--primary);
        }

        .resource-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-xl);
        }

        .resource-icon {
            width: 64px;
            height: 64px;
            background: var(--gray-100);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
        }

        .resource-icon.pdf { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
        .resource-icon.doc { background: rgba(59, 130, 246, 0.1); color: #2563eb; }

        .resource-card h4 {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--dark);
            margin-bottom: 0.75rem;
        }

        .resource-category {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: var(--secondary);
            color: white;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 1rem;
        }

        .resource-card p {
            color: var(--gray-600);
            line-height: 1.7;
            margin-bottom: 1.5rem;
        }

        .resource-meta {
            display: flex;
            gap: 1rem;
            font-size: 0.85rem;
            color: var(--gray-500);
            margin-bottom: 1rem;
        }

        .download-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: var(--primary);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .download-btn:hover {
            background: #013300;
            transform: translateX(5px);
        }

        /* Footer */
        .footer {
            background: var(--dark);
            color: white;
            padding: 4rem 0 2rem;
            margin-top: 5rem;
        }

        .footer-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 3rem;
            margin-bottom: 3rem;
        }

        .footer-section h4 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            color: #ffb400;
        }

        .footer-section p {
            color: var(--gray-400);
            line-height: 1.7;
        }

        .footer-links {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .footer-links a {
            color: var(--gray-400);
            text-decoration: none;
            transition: color 0.3s ease;
        }

        .footer-links a:hover {
            color: white;
        }

        .footer-bottom {
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 2rem;
            text-align: center;
            color: var(--gray-400);
        }

        /* Animations */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .nav-menu {
                display: none !important;
            }
            
            .mobile-toggle {
                display: flex !important;
            }

            .hero {
                height: 50vh;
                min-height: 350px;
            }

            .content-with-image {
                grid-template-columns: 1fr;
            }

            .timeline::before {
                left: 20px;
            }

            .timeline-item {
                grid-template-columns: 1fr;
                margin-left: 50px;
            }

            .timeline-item:nth-child(even) {
                direction: ltr;
            }

            .timeline-year {
                left: 20px;
                transform: translateX(0);
            }

            .exec-grid {
                grid-template-columns: 1fr !important;
                gap: 24px !important;
            }

            .exec-card-image {
                height: 230px !important;
            }

            .resources-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
            .exec-grid {
                grid-template-columns: repeat(2, 1fr) !important;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <nav class="nav-container">
            <a href="../index.php" class="logo">
                <img src="../includes/assets/gnuts_logo1.png" alt="GNUTS Logo">
                <span>GNUTS</span>
            </a>

            <ul class="nav-menu">
                <li><a href="../index.php" class="nav-link">Home</a></li>
                <li><a href="about.php" class="nav-link active">About</a></li>
                <li><a href="scholarships.php" class="nav-link">Scholarships & Opportunities</a></li>
                <li><a href="innovations.php" class="nav-link">Innovations</a></li>
                <li><a href="blog.php" class="nav-link">News & Events</a></li>
                <li><a href="contact.php" class="nav-link">Contact Us</a></li>
            </ul>

            <button class="mobile-toggle" id="mobile-toggle" aria-label="Toggle menu">
                <span></span>
                <span></span>
                <span></span>
            </button>

            <button class="desktop-toggle" id="desktop-toggle" aria-label="Toggle Desktop Drawer">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </nav>

        <div class="mobile-menu" id="mobile-menu">
            <a href="../index.php">Home</a>
            <a href="about.php" class="active">About</a>
            <a href="scholarships.php">Scholarships & Opportunities</a>
            <a href="innovations.php">Innovations</a>
            <a href="blog.php">News & Events</a>
            <a href="contact.php">Contact Us</a>
            
            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb;">
                <div style="padding: 0 2rem; margin-bottom: 0.75rem; font-size: 14px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                    Resources
                </div>
                <a href="#leadership" >Our Leadership</a>
                <a href="https://ctvet.gov.gh/results/">Check your CTVET result</a>
                <a href="#resources">Resources/Constitution</a>
                <a href="about.php#history">Our History</a>
                <a href="#">Privacy Policy</a>
            </div>
        </div>

        <div class="mobile-overlay" id="mobile-overlay"></div>

        <div class="desktop-drawer" id="desktop-drawer">
            <a href="about.php#leadership" >Our Leadership</a>
            <a href="https://ctvet.gov.gh/results/">Check your CTVET result</a>
            <a href="#resources">Resources/Constitution</a>
            <a href="about.php#history">Our History</a>
            <a href="#">Privacy Policy</a>
        </div>

        <div class="desktop-overlay" id="desktop-overlay"></div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-content">
            <h1><?php echo htmlspecialchars($aboutData['hero_title'] ?? 'About GNUTS'); ?></h1>
            <p><?php echo htmlspecialchars($aboutData['hero_subtitle'] ?? 'Empowering Technical Students Across Ghana'); ?></p>
        </div>
    </section>

    <!-- About Section -->
    <section class="section" style="background: white;">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title"><?php echo htmlspecialchars($aboutData['about_title'] ?? 'Who We Are'); ?></h2>
            </div>
            <div class="about-content">
                <div class="content-block">
                    <p><?php echo nl2br(htmlspecialchars($aboutData['about_content'] ?? 'Content will be available soon.')); ?></p>
                </div>
            </div>
        </div>
    </section>

    <!-- Mission & Vision -->
    <section class="section">
        <div class="container">
            <?php if(!empty($aboutData['mission_content'])): ?>
            <div class="content-with-image" style="margin-bottom: 5rem;">
                <div class="content-block">
                    <h2>
                        <span class="content-block-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </span>
                        <?php echo htmlspecialchars($aboutData['mission_title'] ?? 'Our Mission'); ?>
                    </h2>
                    <p><?php echo nl2br(htmlspecialchars($aboutData['mission_content'])); ?></p>
                </div>
                <?php if(!empty($aboutData['mission_image'])): ?>
                <div class="content-image">
                    <img src="../<?php echo htmlspecialchars($aboutData['mission_image']); ?>" alt="Mission">
                </div>
                <?php endif; ?>
            </div>
            <?php endif; ?>

            <?php if(!empty($aboutData['vision_content'])): ?>
            <div class="content-with-image">
                <?php if(!empty($aboutData['vision_image'])): ?>
                <div class="content-image">
                    <img src="../<?php echo htmlspecialchars($aboutData['vision_image']); ?>" alt="Vision">
                </div>
                <?php endif; ?>
                <div class="content-block">
                    <h2>
                        <span class="content-block-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </span>
                        <?php echo htmlspecialchars($aboutData['vision_title'] ?? 'Our Vision'); ?>
                    </h2>
                    <p><?php echo nl2br(htmlspecialchars($aboutData['vision_content'])); ?></p>
                </div>
            </div>
            <?php endif; ?>
        </div>
    </section>

    <!-- Core Values -->
    <?php if(!empty($aboutData['values_content'])): ?>
    <section class="section" style="background: white;">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title"><?php echo htmlspecialchars($aboutData['values_title'] ?? 'Our Core Values'); ?></h2>
            </div>
            <div class="content-block">
                <p><?php echo nl2br(htmlspecialchars($aboutData['values_content'])); ?></p>
            </div>
        </div>
    </section>
    <?php endif; ?>

    <!-- Union History -->
    <?php if(!empty($historyIntro) || !empty($milestones)): ?>
    <section class="section" id="history">
        <div class="container">
           <div class="section-header">
            <h2 class="section-title">Our History</h2>
            <?php if(!empty($historyIntro)): ?>
                <p class="section-subtitle"><?php echo nl2br(htmlspecialchars($historyIntro)); ?></p>
            <?php else: ?>
                <p class="section-subtitle">Explore the journey and milestones that have shaped GNUTS into what it is today.</p>
            <?php endif; ?>
        </div>

            <?php if(!empty($milestones)): ?>
            <div class="timeline">
                <?php foreach($milestones as $milestone): ?>
                <div class="timeline-item">
                    <div class="timeline-year"><?php echo htmlspecialchars($milestone['year']); ?></div>
                    <div class="timeline-content">
                        <h3><?php echo htmlspecialchars($milestone['title']); ?></h3>
                        <p><?php echo nl2br(htmlspecialchars($milestone['description'])); ?></p>
                    </div>
                    <?php if(!empty($milestone['image'])): ?>
                    <div class="timeline-image">
                        <img src="../<?php echo htmlspecialchars($milestone['image']); ?>" alt="<?php echo htmlspecialchars($milestone['title']); ?>">
                    </div>
                    <?php endif; ?>
                </div>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>
        </div>
    </section>
    <?php endif; ?>

    <!-- Executives -->
<?php if(!empty($executives)): ?>
<section class="section" style="background: #f8f9fa; padding: 60px 0;" id="leadership">
    <div class="container">
        <div class="section-header">
            <h2 class="section-title">GNUTS Executives</h2>
            <p class="section-subtitle">The National Executive Committee</p>
        </div>
        
        <div class="exec-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px;">
            <?php 
            $counter = 1;
            foreach($executives as $exec): 
                $imagePath = '';
                if (!empty($exec['photo'])) {
                    $imagePath = (strpos($exec['photo'], 'uploads/') === 0) 
                        ? "../" . $exec['photo'] 
                        : "../uploads/executives/" . $exec['photo'];
                }
                $imageExists = !empty($imagePath) && file_exists($imagePath);
            ?>
            <div class="exec-card"
                 style="
                    background: linear-gradient(145deg, #014900 0%, #016a02 100%);
                    border-radius: 0px;
                    overflow: hidden;
                    box-shadow: 0 8px 32px rgba(1, 73, 0, 0.3);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    position: relative;
                 "
                 onmouseover="
                    this.style.transform='translateY(-12px) scale(1.02)';
                    this.style.boxShadow='0 20px 60px rgba(1, 73, 0, 0.4)';
                    var img = this.querySelector('.exec-card-image img, .exec-card-image > div');
                    if(img) img.style.transform='scale(1.08)';
                 "
                 onmouseout="
                    this.style.transform='translateY(0) scale(1)';
                    this.style.boxShadow='0 8px 32px rgba(1, 73, 0, 0.3)';
                    var img = this.querySelector('.exec-card-image img, .exec-card-image > div');
                    if(img) img.style.transform='scale(1)';
                 ">
                
                <div style="
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    width: 44px;
                    height: 44px;
                    background: rgba(255, 255, 255, 0.95);
                    color: #014900;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 14px;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                    z-index: 10;
                    backdrop-filter: blur(10px);
                ">
                    #<?php echo $counter; ?>
                </div>
                
                <div class="exec-card-image" style="
                    position: relative;
                    width: 100%;
                    height: 300px;
                    overflow: hidden;
                    background: rgba(255, 255, 255, 0.1);
                ">
                    <?php if($imageExists): ?>
                        <img src="<?php echo htmlspecialchars($imagePath); ?>" 
                             alt="<?php echo htmlspecialchars($exec['full_name']); ?>"
                             style="
                                width: 100%; 
                                height: 100%; 
                                object-fit: cover;
                                object-position: center;
                                display: block;
                                transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                                filter: brightness(1.1) contrast(1.05);
                             ">
                    <?php else: ?>
                        <div style="
                            width: 100%; 
                            height: 100%; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            font-size: 6rem; 
                            color: rgba(255, 255, 255, 0.9); 
                            font-weight: 800;
                            text-shadow: 0 2px 8px rgba(0,0,0,0.5);
                            transition: transform 0.6s ease;
                        ">
                            <?php echo strtoupper(substr($exec['full_name'], 0, 1)); ?>
                        </div>
                    <?php endif; ?>
                    
                    <div style="
                        position: absolute;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        height: 80px;
                        pointer-events: none;
                        background: linear-gradient(
                            to top,
                            rgba(255, 255, 255, 0.4) 0%,
                            rgba(255, 255, 255, 0.15) 40%,
                            rgba(255, 255, 255, 0) 100%
                        );
                        z-index: 2;
                    "></div>
                </div>
                
                <div style="padding: 28px 24px 24px;">
                    <h4 style="
                        font-size: 20px; 
                        font-weight: 700; 
                        color: #ffffff; 
                        margin: 0 0 6px 0;
                        text-shadow: 0 1px 3px rgba(0,0,0,0.3);
                    ">
                    <?php echo htmlspecialchars($exec['full_name']); ?>
                    </h4>
                    <p style="
                        font-size: 14px; 
                        color: #d1fae5; 
                        margin: 0 0 20px 0; 
                        font-weight: 600;
                        text-shadow: 0 1px 2px rgba(0,0,0,0.2);
                    ">
                        <?php echo htmlspecialchars($exec['position']); ?>
                    </p>
                    
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <?php if(!empty($exec['email'])): ?>
                            <a href="mailto:<?php echo htmlspecialchars($exec['email']); ?>" 
                               style="
                                display: flex; 
                                align-items: center; 
                                gap: 10px; 
                                color: #e5e7eb; 
                                text-decoration: none; 
                                font-size: 13px; 
                                font-weight: 500; 
                                padding: 8px 12px;
                                border-radius: 8px;
                                background: rgba(255, 255, 255, 0.1);
                                backdrop-filter: blur(10px);
                                transition: all 0.3s ease;
                                border: 1px solid rgba(255, 255, 255, 0.2);
                               "
                               onmouseover="this.style.color='#facc15'; this.style.background='rgba(250, 204, 21, 0.2)'; this.style.borderColor='rgba(250, 204, 21, 0.4)';"
                               onmouseout="this.style.color='#e5e7eb'; this.style.background='rgba(255, 255, 255, 0.1)'; this.style.borderColor='rgba(255, 255, 255, 0.2)';">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    <?php echo htmlspecialchars($exec['email']); ?>
                                </span>
                            </a>
                        <?php endif; ?>
                        
                        <?php if(!empty($exec['phone'])): ?>
                            <a href="tel:<?php echo htmlspecialchars($exec['phone']); ?>" 
                               style="
                                display: flex; 
                                align-items: center; 
                                gap: 10px; 
                                color: #facc15; 
                                text-decoration: none; 
                                font-size: 13px; 
                                font-weight: 600; 
                                padding: 8px 12px;
                                border-radius: 8px;
                                background: rgba(250, 204, 21, 0.15);
                                backdrop-filter: blur(10px);
                                transition: all 0.3s ease;
                                border: 1px solid rgba(250, 204, 21, 0.3);
                               "
                               onmouseover="this.style.color='#fde68a'; this.style.background='rgba(250, 204, 21, 0.25)'; this.style.borderColor='rgba(250, 204, 21, 0.5)'; this.style.transform='translateX(4px)';"
                               onmouseout="this.style.color='#facc15'; this.style.background='rgba(250, 204, 21, 0.15)'; this.style.borderColor='rgba(250, 204, 21, 0.3)'; this.style.transform='translateX(0)';">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                                <?php echo htmlspecialchars($exec['phone']); ?>
                            </a>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
            <?php $counter++; endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>
    <!-- Resources & Constitution -->
    <?php if(!empty($resources)): ?>
    <section class="section" id="resources">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Resources & Constitution</h2>
                <p class="section-subtitle">Access important documents, policies, and resources</p>
            </div>
            <div class="resources-grid">
                <?php foreach($resources as $resource): 
                    $fileExt = strtolower(pathinfo($resource['file_name'], PATHINFO_EXTENSION));
                    $iconClass = in_array($fileExt, ['pdf']) ? 'pdf' : 'doc';
                    $fileSize = round($resource['file_size'] / 1024, 2);
                ?>
                <div class="resource-card">
                    <div class="resource-icon <?php echo $iconClass; ?>">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                    </div>
                    <h4><?php echo htmlspecialchars($resource['title']); ?></h4>
                    <span class="resource-category"><?php echo htmlspecialchars($resource['category']); ?></span>
                    <p><?php echo htmlspecialchars($resource['description']); ?></p>
                    <div class="resource-meta">
                        <span>📄 <?php echo strtoupper($fileExt); ?></span>
                        <span>💾 <?php echo $fileSize; ?> KB</span>
                        <span>📅 <?php echo date('M d, Y', strtotime($resource['created_at'])); ?></span>
                    </div>
                    <a href="../<?php echo htmlspecialchars($resource['file_path']); ?>" download class="download-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download
                    </a>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
    <?php endif; ?>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-section">
                    <h4>GNUTS</h4>
                    <p>Ghana National Union of Technical Students — Empowering technical and vocational students across Ghana since 1962.</p>
                </div>
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul class="footer-links">
                        <li><a href="../index.php">Home</a></li>
                        <li><a href="about.php">About Us</a></li>
                        <li><a href="scholarships.php">Scholarships</a></li>
                        <li><a href="innovations.php">Innovations</a></li>
                        <li><a href="blog.php">News & Blog</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Contact Us</h4>
                    <ul class="footer-links">
                        <li>📞 +233 24 316 31354</li>
                        <li>📧 infos@gnuts.org.gh</li>
                        <li>📍 P.O. Box LG 1237, Accra</li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Resources</h4>
                    <ul class="footer-links">
                        <li><a href="#resources">Constitution</a></li>
                        <li><a href="#history">Our History</a></li>
                        <li><a href="contact.php">Contact</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; <?php echo date('Y'); ?> Ghana National Union of Technical Students (GNUTS). All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script>
        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobile-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileOverlay = document.getElementById('mobile-overlay');

        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        mobileOverlay.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        document.querySelectorAll('.mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Desktop drawer toggle
        const desktopToggle = document.getElementById('desktop-toggle');
        const desktopDrawer = document.getElementById('desktop-drawer');
        const desktopOverlay = document.getElementById('desktop-overlay');

        desktopToggle.addEventListener('click', () => {
            desktopToggle.classList.toggle('active');
            desktopDrawer.classList.toggle('active');
            desktopOverlay.classList.toggle('active');
            document.body.style.overflow = desktopDrawer.classList.contains('active') ? 'hidden' : '';
        });

        desktopOverlay.addEventListener('click', () => {
            desktopToggle.classList.remove('active');
            desktopDrawer.classList.remove('active');
            desktopOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        document.querySelectorAll('.desktop-drawer a').forEach(link => {
            link.addEventListener('click', () => {
                desktopToggle.classList.remove('active');
                desktopDrawer.classList.remove('active');
                desktopOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth < 1025) {
                desktopToggle.classList.remove('active');
                desktopDrawer.classList.remove('active');
                desktopOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Header scroll effect
        const header = document.querySelector('.header');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }
        });
    </script>
</body>
</html>

<?php
// Close database connection
$conn->close();
?>