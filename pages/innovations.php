<?php
// Database connection
$conn = new mysqli("127.0.0.1", "root", "", "gnuts");

// Check connection
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

// Fetch all approved innovations
$innovationsQuery = "SELECT * FROM innovations WHERE status = 'approved' ORDER BY created_at DESC";
$innovationsResult = $conn->query($innovationsQuery);
$innovations = [];
while($row = $innovationsResult->fetch_assoc()) {
    $innovations[] = $row;
}

// Get statistics
$totalProjects = count($innovations);
$uniqueInstitutions = count(array_unique(array_column($innovations, 'institution')));
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Innovation Projects - GNUTS</title>
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

        /* Header & Navigation - Copied from homepage */
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
            height: 50vh;
            min-height: 400px;
            background: linear-gradient(135deg, rgba(1, 73, 0, 0.95) 0%, rgba(1, 73, 0, 0.85) 100%),
                        url('../includes/assets/slide3.png');
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

        /* Stats Section */
        .stats-section {
            background: white;
            padding: 3rem 0;
            margin-top: -3rem;
            position: relative;
            z-index: 10;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
        }

        .stat-card {
            text-align: center;
            padding: 2rem;
            background: var(--gray-100);
            border-radius: 16px;
            transition: all 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-lg);
        }

        .stat-number {
            font-size: 3rem;
            font-weight: 800;
            color: var(--primary);
            line-height: 1;
            margin-bottom: 0.5rem;
        }

        .stat-label {
            font-size: 1.1rem;
            color: var(--gray-600);
            font-weight: 600;
        }

        /* Innovations Grid */
        .innovations-section {
            background: var(--light);
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

        .innovations-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 2rem;
        }

        .innovation-card {
            background: white;
            border-radius: 0px;
            overflow: hidden;
            box-shadow: var(--shadow);
            transition: all 0.3s ease;
            cursor: pointer;
            display: flex;
            flex-direction: column;
        }

        .innovation-card:hover {
            transform: translateY(-8px);
            box-shadow: var(--shadow-xl);
        }

        .innovation-image {
            width: 100%;
            height: 280px;
            background: linear-gradient(135deg, var(--primary) 0%, #026b00 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
        }

        .innovation-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }

        .innovation-card:hover .innovation-image img {
            transform: scale(1.1);
        }

        .innovation-badge {
            position: absolute;
            top: 1rem;
            left: 1rem;
            background: var(--secondary);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            box-shadow: var(--shadow-md);
            z-index: 2;
        }

        .innovation-content {
            padding: 1.5rem;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
        }

        .innovation-content h3 {
            font-size: 1.35rem;
            font-weight: 800;
            font-style: italic;
            text-transform: uppercase;
            margin-bottom: 1rem;
            line-height: 1.3;
            color: var(--dark);
        }

        .innovation-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            margin-bottom: 1rem;
            font-size: 0.85rem;
            color: var(--gray-600);
        }

        .innovation-description {
            color: var(--gray-600);
            line-height: 1.7;
            margin-bottom: 1.5rem;
            flex-grow: 1;
            display: -webkit-box;
            -webkit-line-clamp: 4;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .view-project-btn {
            background: var(--primary);
            color: white;
            padding: 0.875rem 1.5rem;
            border-radius: 8px;
            text-transform: uppercase;
            font-weight: 600;
            font-size: 0.9rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            align-self: flex-start;
        }

        .view-project-btn:hover {
            background: #013200;
            transform: scale(1.05);
            color: #ffbb00;
        }

        /* Modal Styles */
        .innovation-modal-overlay {
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

        .innovation-modal-overlay.active {
            display: flex;
        }

        .innovation-modal-window {
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

        .innovation-modal-close-btn {
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

        .innovation-modal-close-btn:hover {
            background: rgba(217, 160, 0, 0.9);
            transform: rotate(90deg) scale(1.1);
        }

        .innovation-modal-hero-image {
            width: 100%;
            height: 450px;
            background: linear-gradient(135deg, #014900 0%, #026b00 100%);
            overflow: hidden;
            position: relative;
        }

        .innovation-modal-hero-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .innovation-modal-content-wrapper {
            padding: 50px;
        }

        .innovation-modal-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            flex-wrap: wrap;
            gap: 15px;
        }

        .innovation-modal-category {
            background: var(--secondary);
            color: #fff;
            padding: 8px 20px;
            border-radius: 50px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }

        .innovation-modal-institution {
            color: var(--gray-600);
            font-size: 14px;
            font-weight: 600;
        }

        .innovation-modal-title {
            font-weight: 800;
            font-style: italic;
            text-transform: uppercase;
            font-size: 38px;
            margin-bottom: 15px;
            line-height: 1.2;
            color: var(--dark);
            word-break: break-word;
        }

        .innovation-modal-student {
            color: var(--primary);
            font-weight: 700;
            font-size: 16px;
            margin-bottom: 35px;
        }

        .innovation-modal-body {
            font-size: 17px;
            line-height: 1.9;
            color: var(--gray-700);
            word-break: break-word;
        }

        .innovation-modal-body p {
            margin-bottom: 22px;
        }

        .innovation-media-block {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin: 45px 0;
        }

        .innovation-media-item {
            margin: 0;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12);
            transition: transform 0.3s;
        }

        .innovation-media-item:hover {
            transform: translateY(-5px);
        }

        .innovation-media-item.full-width {
            grid-column: 1 / -1;
        }

        .innovation-media-item img {
            width: 100%;
            height: auto;
            display: block;
        }

        .innovation-video-container {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;
            overflow: hidden;
            margin: 45px 0;
            border-radius: 15px;
            box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12);
        }

        .innovation-video-container iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 0;
        }

        .innovation-modal-share-section {
            margin-top: 55px;
            padding-top: 35px;
            border-top: 2px solid var(--gray-200);
        }

        .innovation-modal-share-title {
            font-size: 13px;
            font-weight: 800;
            color: var(--primary);
            text-transform: uppercase;
            margin-bottom: 22px;
            letter-spacing: 1.2px;
        }

        .innovation-modal-share-buttons {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            align-items: center;
        }

        .innovation-share-btn {
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

        .innovation-share-btn:hover {
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 8px 20px rgba(0,0,0,0.25);
        }

        .innovation-share-btn.whatsapp { background: linear-gradient(135deg,#25D366,#1DA851); }
        .innovation-share-btn.facebook { background: linear-gradient(135deg,#1877F2,#1456c7); }
        .innovation-share-btn.twitter { background: linear-gradient(135deg,#000,#333); }
        .innovation-share-btn.linkedin { background: linear-gradient(135deg,#0077B5,#005f8d); }
        .innovation-share-btn.telegram { background: linear-gradient(135deg,#0088cc,#006fa6); }
        .innovation-share-btn.copy { background: linear-gradient(135deg,#6b7280,#4b5563); }

        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 5rem 2rem;
            background: white;
            border-radius: 16px;
            box-shadow: var(--shadow);
        }

        .empty-state-icon {
            font-size: 5rem;
            margin-bottom: 2rem;
            opacity: 0.5;
        }

        .empty-state h3 {
            font-size: 2rem;
            font-weight: 700;
            color: var(--dark);
            margin-bottom: 1rem;
        }

        .empty-state p {
            font-size: 1.1rem;
            color: var(--gray-600);
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
                height: 40vh;
                min-height: 300px;
            }

            .stats-grid {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }

            .innovations-grid {
                grid-template-columns: 1fr;
            }

            .innovation-modal-content-wrapper {
                padding: 30px 25px;
            }

            .innovation-modal-title {
                font-size: 26px;
            }

            .innovation-modal-hero-image {
                height: 280px;
            }

            .innovation-media-block {
                grid-template-columns: 1fr;
            }

            .innovation-modal-share-buttons {
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
                <li><a href="innovations.php" class="nav-link active">Innovations</a></li>
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
            <a href="about.php">About</a>
            <a href="scholarships.php">Scholarships & Opportunities</a>
            <a href="innovations.php" class="active">Innovations</a>
            <a href="blog.php">News & Events</a>
            <a href="contact.php">Contact Us</a>
            
            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb;">
                <div style="padding: 0 2rem; margin-bottom: 0.75rem; font-size: 14px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                    Resources
                </div>
                <a href="about.php#leadership" >Our Leadership</a>
                <a href="https://ctvet.gov.gh/results/">Check your CTVET result</a>
                <a href="about.php#resources">Resources/Constitution</a>
                <a href="about.php#history">Our History</a>
                <a href="#">Privacy Policy</a>
            </div>
        </div>

        <div class="mobile-overlay" id="mobile-overlay"></div>

        <div class="desktop-drawer" id="desktop-drawer">
            <a href="about.php#leadership" >Our Leadership</a>
            <a href="https://ctvet.gov.gh/results/">Check your CTVET result</a>
            <a href="about.php#resources">Resources/Constitution</a>
            <a href="about.php#history">Our History</a>
            <a href="#">Privacy Policy</a>
        </div>

        <div class="desktop-overlay" id="desktop-overlay"></div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-content">
            <h1>Innovation Projects</h1>
            <p>Showcasing groundbreaking innovations from technical students across Ghana</p>
        </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
        <div class="container">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number"><?php echo $totalProjects; ?></div>
                    <div class="stat-label">Total Projects</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number"><?php echo $uniqueInstitutions; ?></div>
                    <div class="stat-label">Contributing Institutions</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">100%</div>
                    <div class="stat-label">Approved & Verified</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Innovations Grid -->
    <section class="section innovations-section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Student Innovation Projects</h2>
                <p class="section-subtitle">Discover the creativity and technical excellence of GNUTS members nationwide</p>
            </div>

            <?php if(empty($innovations)): ?>
                <div class="empty-state">
                    <div class="empty-state-icon">⚡</div>
                    <h3>No Innovation Projects Yet</h3>
                    <p>Check back soon for exciting projects from technical students across Ghana!</p>
                </div>
            <?php else: ?>
                <div class="innovations-grid">
                    <?php foreach($innovations as $innovation): ?>
                    <div class="innovation-card" onclick='openInnovationModal(<?php echo json_encode($innovation, JSON_HEX_APOS | JSON_HEX_QUOT); ?>)'>
                        <div class="innovation-image">
                            <?php if($innovation['project_image']): ?>
                                <img src="../<?php echo htmlspecialchars($innovation['project_image']); ?>" 
                                     alt="<?php echo htmlspecialchars($innovation['title']); ?>">
                            <?php else: ?>
                                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" style="opacity: 0.5;">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                </svg>
                            <?php endif; ?>
                            <span class="innovation-badge">PROJECT</span>
                        </div>
                        <div class="innovation-content">
                            <h3><?php echo htmlspecialchars($innovation['title']); ?></h3>
                            <div class="innovation-meta">
                                <span>🏫 <?php echo htmlspecialchars($innovation['institution']); ?></span>
                                <span>👤 <?php echo htmlspecialchars($innovation['student_name']); ?></span>
                            </div>
                            <p class="innovation-description"><?php echo htmlspecialchars($innovation['description']); ?></p>
                            <button class="view-project-btn">
                                <span>View Project</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                    <path d="M5 12h14M13 6l6 6-6 6"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </section>

    <!-- Innovation Modal -->
    <div class="innovation-modal-overlay" id="innovationModal">
        <div class="innovation-modal-window">
            <button onclick="closeInnovationModal()" class="innovation-modal-close-btn">×</button>
            
            <div id="modalHeroImage" class="innovation-modal-hero-image"></div>

            <div class="innovation-modal-content-wrapper">
                <div class="innovation-modal-meta">
                    <span class="innovation-modal-category">INNOVATION PROJECT</span>
                    <span id="modalInstitution" class="innovation-modal-institution"></span>
                </div>

                <h2 id="modalTitle" class="innovation-modal-title"></h2>
                
                <p class="innovation-modal-student">By: <span id="modalStudent"></span></p>

                <div id="modalBody" class="innovation-modal-body"></div>

                <div id="modalVideo" class="innovation-video-container" style="display: none;"></div>

                <div class="innovation-modal-share-section">
                    <h4 class="innovation-modal-share-title">Share This Project</h4>
                    <div class="innovation-modal-share-buttons">
                        <button onclick="socialShareInnovation('wa')" class="innovation-share-btn whatsapp">WhatsApp</button>
                        <button onclick="socialShareInnovation('fb')" class="innovation-share-btn facebook">Facebook</button>
                        <button onclick="socialShareInnovation('tw')" class="innovation-share-btn twitter">X</button>
                        <button onclick="socialShareInnovation('li')" class="innovation-share-btn linkedin">LinkedIn</button>
                        <button onclick="socialShareInnovation('tg')" class="innovation-share-btn telegram">Telegram</button>
                        <button onclick="copyInnovationLink()" class="innovation-share-btn copy">Copy Link</button>
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

        // Innovation Modal Functions
        let currentInnovationUrl = '';

        function processInnovationContent(description) {
            // Split description into lines (assuming each sentence is a line)
            const lines = description.split('\n').filter(line => line.trim() !== '');
            
            if (lines.length <= 10) {
                // If 10 lines or less, return all content as paragraphs
                return lines.map(line => '<p>' + line + '</p>').join('');
            } else {
                // If more than 10 lines, just return first 10 as paragraphs
                // Media will be inserted after
                return lines.slice(0, 10).map(line => '<p>' + line + '</p>').join('');
            }
        }

        function extractYouTubeID(url) {
            if (!url) return null;
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        }

        function openInnovationModal(innovation) {
            currentInnovationUrl = window.location.origin + '/pages/innovations.php?id=' + innovation.id;
            
            // Set title, student, institution
            document.getElementById('modalTitle').innerText = innovation.title;
            document.getElementById('modalStudent').innerText = innovation.student_name || 'GNUTS Student';
            document.getElementById('modalInstitution').innerText = innovation.institution || '';
            
            // Set hero image
            const imgPath = innovation.project_image ? 
                (innovation.project_image.startsWith('uploads/') ? '../' + innovation.project_image : '../uploads/innovations/' + innovation.project_image) : 
                '';
            
            if (imgPath) {
                document.getElementById('modalHeroImage').innerHTML = '<img src="' + imgPath + '" alt="' + innovation.title + '">';
            } else {
                document.getElementById('modalHeroImage').innerHTML = '<svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>';
            }
            
            // Process content based on line count
            const description = innovation.description || '';
            const lines = description.split('\n').filter(line => line.trim() !== '');
            const lineCount = lines.length;
            
            let contentHTML = '';
            
            if (lineCount <= 10) {
                // 10 lines or less: show all content, then media below
                contentHTML = processInnovationContent(description);
                
                // Add project image if exists (below content)
                if (innovation.project_image && imgPath) {
                    contentHTML += '<div class="innovation-media-block"><figure class="innovation-media-item full-width">';
                    contentHTML += '<img src="' + imgPath + '" alt="Project Image">';
                    contentHTML += '</figure></div>';
                }
                
                // Add YouTube video if exists (below content)
                const videoId = extractYouTubeID(innovation.video_url);
                if (videoId) {
                    contentHTML += '<div class="innovation-video-container">';
                    contentHTML += '<iframe src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
                    contentHTML += '</div>';
                }
            } else {
                // More than 10 lines: show first 10, insert media, then continue
                contentHTML = lines.slice(0, 10).map(line => '<p>' + line + '</p>').join('');
                
                // Insert media after line 10
                contentHTML += '<div class="innovation-media-block">';
                
                // Add project image
                if (innovation.project_image && imgPath) {
                    contentHTML += '<figure class="innovation-media-item full-width">';
                    contentHTML += '<img src="' + imgPath + '" alt="Project Image">';
                    contentHTML += '</figure>';
                }
                
                contentHTML += '</div>';
                
                // Add YouTube video after images
                const videoId = extractYouTubeID(innovation.video_url);
                if (videoId) {
                    contentHTML += '<div class="innovation-video-container">';
                    contentHTML += '<iframe src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
                    contentHTML += '</div>';
                }
                
                // Add remaining content
                contentHTML += lines.slice(10).map(line => '<p>' + line + '</p>').join('');
            }
            
            document.getElementById('modalBody').innerHTML = contentHTML;

            // Show modal
            document.getElementById('innovationModal').classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeInnovationModal() {
            document.getElementById('innovationModal').classList.remove('active');
            document.body.style.overflow = '';
        }

        function socialShareInnovation(platform) {
            const text = encodeURIComponent("Check out this innovation project from GNUTS: " + document.getElementById('modalTitle').innerText);
            let url = '';
            
            switch(platform) {
                case 'wa':
                    url = `https://api.whatsapp.com/send?text=${text}%20${encodeURIComponent(currentInnovationUrl)}`;
                    break;
                case 'fb':
                    url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentInnovationUrl)}`;
                    break;
                case 'tw':
                    url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentInnovationUrl)}&text=${text}`;
                    break;
                case 'li':
                    url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentInnovationUrl)}`;
                    break;
                case 'tg':
                    url = `https://t.me/share/url?url=${encodeURIComponent(currentInnovationUrl)}&text=${text}`;
                    break;
            }
            
            if (url) {
                window.open(url, '_blank', 'width=600,height=400');
            }
        }

        function copyInnovationLink() {
            navigator.clipboard.writeText(currentInnovationUrl).then(function() {
                alert('Link copied to clipboard!');
            }).catch(function() {
                alert('Link: ' + currentInnovationUrl);
            });
        }

        // Close modal on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeInnovationModal();
            }
        });

        // Close modal on outside click
        document.getElementById('innovationModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeInnovationModal();
            }
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