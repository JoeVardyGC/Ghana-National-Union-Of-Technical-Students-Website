<?php
// Database connection
$conn = new mysqli("127.0.0.1", "root", "", "gnuts");

// Check connection
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

// Get filter parameter
$filter = isset($_GET['filter']) ? $_GET['filter'] : 'all';

// Fetch news based on filter
$newsQuery = "SELECT * FROM news WHERE status = 'published'";
if ($filter !== 'all') {
    $currentDate = date('Y-m-d');
    if ($filter === 'recent') {
        $newsQuery .= " AND published_at >= DATE_SUB('$currentDate', INTERVAL 30 DAY)";
    } elseif ($filter === 'older') {
        $newsQuery .= " AND published_at < DATE_SUB('$currentDate', INTERVAL 30 DAY)";
    }
}
$newsQuery .= " ORDER BY CREATED_at DESC";

$newsResult = $conn->query($newsQuery);
$news = [];
while ($row = $newsResult->fetch_assoc()) {
    $news[] = $row;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>News & Events - GNUTS</title>
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
        .page-hero {
            position: relative;
            height: 40vh;
            min-height: 300px;
            background: linear-gradient(135deg, rgba(1, 73, 0, 0.95) 0%, rgba(1, 73, 0, 0.85) 100%),
                        url('../includes/assets/slide4.png');
            background-size: cover;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-align: center;
        }

        .page-hero-content h1 {
            font-size: clamp(2rem, 4vw, 3.5rem);
            font-weight: 800;
            margin-bottom: 1rem;
        }

        .page-hero-content p {
            font-size: clamp(1rem, 2vw, 1.25rem);
            opacity: 0.95;
        }

        /* Container */
        .container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        /* Filter Section */
        .filter-section {
            background: white;
            padding: 2rem 0;
            box-shadow: var(--shadow);
            position: sticky;
            top: 72px;
            z-index: 500;
        }

        .filter-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .filter-tabs {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .filter-tab {
            padding: 0.75rem 1.5rem;
            background: var(--gray-100);
            border: 2px solid transparent;
            border-radius: 8px;
            font-weight: 600;
            color: var(--gray-700);
            text-decoration: none;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .filter-tab:hover {
            background: var(--gray-200);
            transform: translateY(-2px);
        }

        .filter-tab.active {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
        }

        .news-count {
            font-weight: 600;
            color: var(--gray-600);
            font-size: 1rem;
        }

        /* News Grid */
        .news-section {
            padding: 4rem 0;
        }

        .news-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 30px;
        }

        .news-card {
            border: 1px solid #eee;
            border-radius: 16px;
            overflow: hidden;
            background: #fff;
            transition: all 0.3s;
            cursor: pointer;
            display: flex;
            flex-direction: column;
        }

        .news-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(2, 97, 0, 0.52);
        }

        .news-image-container {
            height: 220px;
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, #014900 0%, #026b00 100%);
            flex-shrink: 0;
        }

        .news-image-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s;
        }

        .news-card:hover .news-image-container img {
            transform: scale(1.05);
        }

        .news-badge {
            position: absolute;
            top: 15px;
            left: 15px;
            background: #014900;
            color: #fff;
            padding: 5px 12px;
            font-weight: 600;
            font-size: 11px;
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .news-content {
            padding: 20px;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
        }

        .news-date {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #9ca3af;
            font-size: 12px;
            margin-bottom: 12px;
        }

        .news-title {
            font-weight: 800;
            font-style: italic;
            text-transform: uppercase;
            margin-bottom: 12px;
            line-height: 1.3;
            font-size: 16px;
            color: #1a1a1a;
            height: 62px;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            word-break: break-word;
        }

        .news-description {
            display: -webkit-box;
            -webkit-line-clamp: 7;
            -webkit-box-orient: vertical;
            overflow: hidden;
            word-break: break-word;
            line-height: 1.5;
            color: #64748b;
            font-size: 13px;
            margin-bottom: 18px;
            height: 136px;
            flex-grow: 1;
        }

        .read-more-btn {
            background: #014900;
            color: #ffffff;
            padding: 10px 20px;
            border-radius: 8px;
            text-transform: uppercase;
            font-weight: 600;
            font-size: 13px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border: none;
            cursor: pointer;
            transition: all 0.3s;
            text-decoration: none;
            align-self: flex-start;
            font-family: 'Montserrat', sans-serif !important;
        }

        .read-more-btn:hover {
            background: #013200;
            transform: scale(1.05);
            color: #ffbb00ff;
        }

        .empty-state {
            text-align: center;
            padding: 60px 20px;
            background: #ffffff;
            border-radius: 12px;
            border: 2px dashed #e5e7eb;
        }

        .empty-state-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }

        /* Modal Styles - UPDATED TO MATCH INNOVATION PAGE */
        .news-modal-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.85);
            z-index: 10000;
            backdrop-filter: blur(8px);
            padding: 20px;
            overflow-y: auto;
            justify-content: center;
            align-items: flex-start;
        }

        .news-modal-overlay.active {
            display: flex;
        }

        .news-modal-window {
            background: #fff;
            width: 100%;
            max-width: 900px;
            border-radius: 20px;
            overflow: hidden;
            position: relative;
            margin: 40px auto;
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
            animation: modalSlideIn 0.4s ease-out;
        }

        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .modal-close-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(1, 73, 0, 0.9);
            color: #fff;
            border: none;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            cursor: pointer;
            z-index: 10;
            font-size: 28px;
            font-weight: 300;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
        }

        .modal-close-btn:hover {
            background: rgba(217, 160, 0, 0.9);
            transform: rotate(90deg) scale(1.1);
        }

        .modal-hero-image {
            width: 100%;
            height: 450px;
            background: linear-gradient(135deg, #014900 0%, #026b00 100%);
            overflow: hidden;
            position: relative;
        }

        .modal-hero-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .modal-content-wrapper {
            padding: 50px;
        }

        .modal-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            flex-wrap: wrap;
            gap: 15px;
        }

        .modal-category {
            background: #D9A000;
            color: #fff;
            padding: 8px 20px;
            border-radius: 50px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }

        .modal-date {
            color: #9ca3af;
            font-size: 13px;
            font-weight: 600;
        }

        .modal-title {
            font-weight: 800;
            font-style: italic;
            text-transform: uppercase;
            font-size: 38px;
            margin-bottom: 15px;
            line-height: 1.2;
            color: #1a1a1a;
            word-break: break-word;
        }

        .modal-author {
            color: #014900;
            font-weight: 700;
            font-size: 16px;
            margin-bottom: 35px;
        }

        .modal-article-body {
            font-size: 17px;
            line-height: 1.9;
            color: #374151;
            word-break: break-word;
        }

        .modal-article-body p {
            margin-bottom: 22px;
        }

        .article-image-block {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin: 45px 0;
        }

        .article-figure {
            margin: 0;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12);
            transition: transform 0.3s;
        }

        .article-figure:hover {
            transform: translateY(-5px);
        }

        .article-figure.full-width {
            grid-column: 1 / -1;
        }

        .article-inline-image {
            width: 100%;
            height: auto;
            display: block;
        }

        .article-figure figcaption {
            padding: 18px;
            background: #f9fafb;
            font-size: 14px;
            color: #6b7280;
            font-style: italic;
            text-align: center;
            line-height: 1.6;
        }

        .modal-share-section {
            margin-top: 55px;
            padding-top: 35px;
            border-top: 2px solid #e5e7eb;
        }

        .modal-share-title {
            font-size: 13px;
            font-weight: 800;
            color: #014900;
            text-transform: uppercase;
            margin-bottom: 22px;
            letter-spacing: 1.2px;
        }

        .modal-share-buttons {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            align-items: center;
        }

        .share-btn {
            padding: 10px 16px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            color: #fff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.25s ease;
        }

        .share-btn:hover {
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 8px 20px rgba(0,0,0,0.25);
        }

        .share-btn.whatsapp { background: linear-gradient(135deg,#25D366,#1DA851); }
        .share-btn.facebook { background: linear-gradient(135deg,#1877F2,#1456c7); }
        .share-btn.twitter { background: linear-gradient(135deg,#000,#333); }
        .share-btn.linkedin { background: linear-gradient(135deg,#0077B5,#005f8d); }
        .share-btn.telegram { background: linear-gradient(135deg,#0088cc,#006fa6); }
        .share-btn.copy { background: linear-gradient(135deg,#6b7280,#4b5563); }

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

        /* Responsive */
        @media (max-width: 768px) {
            .nav-menu {
                display: none !important;
            }
            
            .mobile-toggle {
                display: flex !important;
            }

            .page-hero {
                height: 30vh;
                min-height: 250px;
            }

            .filter-container {
                flex-direction: column;
                align-items: flex-start;
            }

            .news-grid {
                grid-template-columns: 1fr;
            }

            .modal-content-wrapper {
                padding: 30px 25px;
            }

            .modal-title {
                font-size: 26px;
            }

            .modal-hero-image {
                height: 280px;
            }

            .article-image-block {
                grid-template-columns: 1fr;
            }

            .modal-share-buttons {
                justify-content: center;
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
                <li><a href="about.php" class="nav-link">About</a></li>
                <li><a href="scholarships.php" class="nav-link">Scholarships & Opportunities</a></li>
                <li><a href="innovations.php" class="nav-link">Innovations</a></li>
                <li><a href="blog.php" class="nav-link active">News & Events</a></li>
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
            <a href="about.php">About</a>
            <a href="scholarships.php">Scholarships & Opportunities</a>
            <a href="innovations.php">Innovations</a>
            <a href="blog.php" class="active">News & Events</a>
            <a href="contact.php">Contact Us</a>
            
            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb;">
                <div style="padding: 0 2rem; margin-bottom: 0.75rem; font-size: 14px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                    Resources
                </div>
                <a href="about.php#leadership">Our Leadership</a>
                <a href="https://ctvet.gov.gh/results/">Check your CTVET result</a>
                <a href="about.php#resources">Resources/Constitution</a>
                <a href="about.php#history">Our History</a>
                <a href="#">Privacy Policy</a>
            </div>
        </div>

        <div class="mobile-overlay" id="mobile-overlay"></div>

        <div class="desktop-drawer" id="desktop-drawer">
            <a href="about.php#leadership">Our Leadership</a>
            <a href="https://ctvet.gov.gh/results/">Check your CTVET result</a>
            <a href="about.php#resources">Resources/Constitution</a>
            <a href="about.php#history">Our History</a>
            <a href="#">Privacy Policy</a>
        </div>

        <div class="desktop-overlay" id="desktop-overlay"></div>
    </header>

    <!-- Page Hero -->
    <section class="page-hero">
        <div class="page-hero-content">
            <h1>News & Events</h1>
            <p>Stay updated with the latest from GNUTS</p>
        </div>
    </section>

    <!-- Filter Section -->
    <section class="filter-section" id="all">
        <div class="container">
            <div class="filter-container">
                <div class="filter-tabs">
                    <a href="blog.php?filter=all#all" class="filter-tab <?php echo $filter === 'all' ? 'active' : ''; ?>">
                        All News
                    </a>
                    <a href="blog.php?filter=recent#all" class="filter-tab <?php echo $filter === 'recent' ? 'active' : ''; ?>">
                        Recent (Last 30 Days)
                    </a>
                    <a href="blog.php?filter=older#all" class="filter-tab <?php echo $filter === 'older' ? 'active' : ''; ?>">
                        Older Articles
                    </a>
                </div>
                <div class="news-count">
                    <?php echo count($news); ?> Article<?php echo count($news) !== 1 ? 's' : ''; ?> Found
                </div>
            </div>
        </div>
    </section>

    <!-- News Section -->
    <section class="news-section">
        <div class="container">
            <?php if (empty($news)): ?>
                <div class="empty-state">
                    <div class="empty-state-icon">📰</div>
                    <p style="font-size: 16px; color: #9ca3af; margin: 0;">No news articles available for this filter. Check back soon!</p>
                </div>
            <?php else: ?>
                <div class="news-grid">
                    <?php foreach ($news as $article): ?>
                        <?php
                        // Image path handling
                        $imagePath = '';
                        if (!empty($article['image'])) {
                            $imagePath = (strpos($article['image'], 'uploads/') === 0)
                                ? "../" . $article['image']
                                : '../uploads/news/' . $article['image'];
                        }
                        $imageExists = !empty($imagePath) && file_exists($imagePath);

                        // Create clean 7-line description
                        $raw = trim(strip_tags($article['content'] ?? ''));
                        $maxChars = 400;
                        if (mb_strlen($raw) > $maxChars) {
                            $short = mb_substr($raw, 0, $maxChars);
                            $lastSpace = mb_strrpos($short, ' ');
                            if ($lastSpace !== false) {
                                $short = mb_substr($short, 0, $lastSpace);
                            }
                            $short .= '...';
                        } else {
                            $short = $raw;
                        }
                        ?>
                        <div class="news-card" onclick='openNewsDetail(<?php echo htmlspecialchars(json_encode($article), ENT_QUOTES, 'UTF-8'); ?>)'>
                            <div class="news-image-container">
                                <?php if ($imageExists): ?>
                                    <img src="<?php echo htmlspecialchars($imagePath); ?>" 
                                         alt="<?php echo htmlspecialchars($article['title']); ?>">
                                <?php else: ?>
                                    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" style="opacity: 0.5;">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                            <polyline points="21 15 16 10 5 21"></polyline>
                                        </svg>
                                    </div>
                                <?php endif; ?>
                                <span class="news-badge">NEWS</span>
                            </div>

                            <div class="news-content">
                                <div class="news-date">
                                    <span>📅 <?php echo date('M d, Y', strtotime($article['published_at'])); ?></span>
                                </div>

                                <h4 class="news-title">
                                    <?php echo htmlspecialchars($article['title']); ?>
                                </h4>

                                <div class="news-description">
                                    <?php echo htmlspecialchars($short); ?>
                                </div>

                                <button class="read-more-btn">
                                    READ MORE »
                                </button>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </section>

    <!-- Modal -->
    <div class="news-modal-overlay" id="newsModal">
        <div class="news-modal-window">
            <button onclick="closeNewsDetail()" class="modal-close-btn">×</button>
            
            <div id="modalImg" class="modal-hero-image"></div>

            <div class="modal-content-wrapper">
                <div class="modal-meta">
                    <span class="modal-category">GNUTS UPDATE</span>
                    <span class="modal-date">Published: <span id="mDate"></span></span>
                </div>

                <h2 id="mTitle" class="modal-title"></h2>
                
                <p class="modal-author">By: <span id="mAuthor"></span></p>

                <div id="mContent" class="modal-article-body"></div>

                <div class="modal-share-section">
                    <h4 class="modal-share-title">Share this Story</h4>
                    <div class="modal-share-buttons">
                        <button onclick="socialShare('wa')" class="share-btn whatsapp">WhatsApp</button>
                        <button onclick="socialShare('fb')" class="share-btn facebook">Facebook</button>
                        <button onclick="socialShare('tw')" class="share-btn twitter">X</button>
                        <button onclick="socialShare('li')" class="share-btn linkedin">LinkedIn</button>
                        <button onclick="socialShare('tg')" class="share-btn telegram">Telegram</button>
                        <button onclick="copyLink()" class="share-btn copy">Copy Link</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

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
                        <li><a href="about.php#resources">Constitution</a></li>
                        <li><a href="about.php#history">Our History</a></li>
                        <li><a href="contact.php">Contact</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; <?php echo date('Y'); ?> Ghana National Union of Technical Students (GNUTS). All rights reserved. <b>By Joe Vardy Group</b></p>
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

        // Modal functionality - UPDATED TO MATCH INNOVATION PAGE LOGIC
        let currentUrl = '';
        let currentArticleId = null;

        async function fetchAdditionalImages(articleId) {
            try {
                const response = await fetch('../api/get_article_images.php?id=' + articleId);
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.error('Error fetching images:', error);
            }
            return [];
        }

        async function openNewsDetail(article) {
            currentArticleId = article.id;
            currentUrl = window.location.origin + '/pages/blog.php?id=' + article.id;
            
            document.getElementById('mTitle').innerText = article.title;
            document.getElementById('mDate').innerText = new Date(article.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            document.getElementById('mAuthor').innerText = article.author || 'GNUTS Admin';
            
            // Set hero image
            const imgPath = article.image ? 
                (article.image.startsWith('uploads/') ? '../' + article.image : '../uploads/news/' + article.image) : 
                '../assets/placeholder.jpg';
            document.getElementById('modalImg').innerHTML = '<img src="' + imgPath + '" alt="' + article.title + '">';

            // Fetch additional images
            const additionalImages = await fetchAdditionalImages(article.id);
            
            // Process content based on line count (matching innovation page)
            const content = article.content || '';
            const lines = content.split('\n').filter(line => line.trim() !== '');
            const lineCount = lines.length;
            
            let contentHTML = '';
            
            if (lineCount <= 10) {
                // 10 lines or less: show all content, then media below
                contentHTML = lines.map(line => '<p>' + line + '</p>').join('');
                
                // Add additional images if they exist (below content)
                if (additionalImages.length > 0) {
                    contentHTML += '<div class="article-image-block">';
                    additionalImages.forEach(img => {
                        contentHTML += '<figure class="article-figure full-width">';
                        contentHTML += '<img src="../' + img.image_path + '" alt="Article image" class="article-inline-image">';
                        if (img.caption) {
                            contentHTML += '<figcaption>' + img.caption + '</figcaption>';
                        }
                        contentHTML += '</figure>';
                    });
                    contentHTML += '</div>';
                }
            } else {
                // More than 10 lines: show first 10, insert media, then continue
                contentHTML = lines.slice(0, 10).map(line => '<p>' + line + '</p>').join('');
                
                // Insert media after line 10
                if (additionalImages.length > 0) {
                    contentHTML += '<div class="article-image-block">';
                    additionalImages.forEach(img => {
                        contentHTML += '<figure class="article-figure full-width">';
                        contentHTML += '<img src="../' + img.image_path + '" alt="Article image" class="article-inline-image">';
                        if (img.caption) {
                            contentHTML += '<figcaption>' + img.caption + '</figcaption>';
                        }
                        contentHTML += '</figure>';
                    });
                    contentHTML += '</div>';
                }
                
                // Add remaining content
                contentHTML += lines.slice(10).map(line => '<p>' + line + '</p>').join('');
            }
            
            document.getElementById('mContent').innerHTML = contentHTML;

            // Show modal
            document.getElementById('newsModal').classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeNewsDetail() {
            document.getElementById('newsModal').classList.remove('active');
            document.body.style.overflow = '';
        }

        function socialShare(platform) {
            const text = encodeURIComponent("Check out this update from GNUTS: " + document.getElementById('mTitle').innerText);
            let url = '';
            
            switch(platform) {
                case 'wa':
                    url = `https://api.whatsapp.com/send?text=${text}%20${encodeURIComponent(currentUrl)}`;
                    break;
                case 'fb':
                    url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
                    break;
                case 'tw':
                    url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${text}`;
                    break;
                case 'li':
                    url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
                    break;
                case 'tg':
                    url = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${text}`;
                    break;
            }
            
            if (url) {
                window.open(url, '_blank', 'width=600,height=400');
            }
        }

        function copyLink() {
            navigator.clipboard.writeText(currentUrl).then(function() {
                alert('Link copied to clipboard!');
            }).catch(function() {
                alert('Link: ' + currentUrl);
            });
        }

        // Close modal on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeNewsDetail();
            }
        });

        // Close modal on outside click
        document.getElementById('newsModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeNewsDetail();
            }
        });
    </script>
</body>
</html>

<?php
// Close database connection
$conn->close();
?>