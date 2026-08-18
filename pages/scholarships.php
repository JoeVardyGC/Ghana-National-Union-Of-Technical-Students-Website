
<?php
// Database connection
$conn = new mysqli("127.0.0.1", "root", "", "gnuts");

// Check connection
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

// Fetch all active scholarships
$scholarshipsQuery = "SELECT * FROM scholarships WHERE status = 'active' ORDER BY created_at DESC";
$scholarshipsResult = $conn->query($scholarshipsQuery);
$scholarships = [];
while($row = $scholarshipsResult->fetch_assoc()) {
    $scholarships[] = $row;
}

// Fetch closed scholarships
$closedQuery = "SELECT * FROM scholarships WHERE status = 'closed' ORDER BY updated_at DESC LIMIT 5";
$closedResult = $conn->query($closedQuery);
$closedScholarships = [];
while($row = $closedResult->fetch_assoc()) {
    $closedScholarships[] = $row;
}
// Fetch all active opportunities
$opportunitiesQuery = "SELECT * FROM opportunities WHERE status = 'active' ORDER BY created_at DESC";
$opportunitiesResult = $conn->query($opportunitiesQuery);
$opportunities = [];
while($row = $opportunitiesResult->fetch_assoc()) {
    $opportunities[] = $row;
}

// Fetch closed opportunities
$closedQuery = "SELECT * FROM opportunities WHERE status = 'closed' ORDER BY updated_at DESC LIMIT 5";
$closedResult = $conn->query($closedQuery);
$closedOpportunities = [];
while($row = $closedResult->fetch_assoc()) {
    $closedOpportunities[] = $row;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scholarships - GNUTS</title>
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

        /* Header & Navigation - Same as about.php */
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
          .social-links {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
    }

    .social-link {
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        text-decoration: none;
        transition: all 0.3s ease;
    }

    .social-link:hover {
        background: var(--primary);
        transform: translateY(-3px);
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

        /* Opportunity Cards */
        .opportunities-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }

        .opportunity-card {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: var(--shadow-lg);
            transition: all 0.3s ease;
            border-top: 4px solid var(--secondary);
            display: flex;
            flex-direction: column;
        }

        .opportunity-card:hover {
            transform: translateY(-8px);
            box-shadow: var(--shadow-xl);
        }

        .opportunity-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 1.5rem;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .opportunity-type {
            padding: 0.5rem 1rem;
            background: var(--primary);
            color: #ffffffff;
            border-radius: 8px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
        }

        .opportunity-badge {
            padding: 0.5rem 1rem;
            background: var(--gray-100);
            color: var(--primary);
            border-radius: 8px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .opportunity-card h3 {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--dark);
            margin-bottom: 1rem;
            line-height: 1.3;
        }

        .opportunity-description {
            color: var(--gray-700);
            line-height: 1.7;
            margin-bottom: 1.5rem;
            flex-grow: 1;
        }

        .opportunity-meta {
            display: flex;
            gap: 1.5rem;
            font-size: 0.9rem;
            color: var(--gray-500);
            padding-top: 1rem;
            border-top: 1px solid var(--gray-200);
            flex-wrap: wrap;
            margin-bottom: 1.5rem;
        }

        .opportunity-meta span {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .apply-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.875rem 1.75rem;
            background: var(--primary);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
            align-self: flex-start;
        }

        .apply-btn:hover {
            background: #013300;
            transform: translateX(5px);
        }

        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            background: white;
            border-radius: 16px;
            box-shadow: var(--shadow);
        }

        .empty-state-icon {
            font-size: 5rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }

        .empty-state p {
            color: var(--gray-500);
            font-size: 1.1rem;
        }

        /* Closed Opportunities Section */
        .closed-section {
            background: var(--);
            padding: 3rem 0;
            margin-top: 3rem;
            
        }

        .closed-card {
            opacity: 0.7;
            border-top-color: var(--gray-400);
        }

        .closed-card:hover {
            opacity: 1;
        }

        .closed-badge {
            background: #ff0000ff;
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

        .footer-links li {
            color: var(--gray-400);
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

            .opportunities-grid {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }

            .section {
                padding: 3rem 0;
            }

            .opportunity-meta {
                flex-direction: column;
                gap: 0.75rem;
            }
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

        .desktop-toggle {
            display: none;
            flex-direction: column;
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
                        url('../includes/assets/slide1.png');
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

        /* Scholarship Cards */
        .scholarships-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }

        .scholarship-card {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: var(--shadow-lg);
            transition: all 0.3s ease;
            border-left: 4px solid var(--primary);
            display: flex;
            flex-direction: column;
        }

        .scholarship-card:hover {
            transform: translateY(-8px);
            box-shadow: var(--shadow-xl);
        }

        .scholarship-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 1.5rem;
            gap: 1rem;
        }

        .scholarship-badge {
            padding: 0.5rem 1rem;
            background: var(--primary);
            color: white;
            border-radius: 8px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
        }

        .scholarship-card h3 {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--dark);
            margin-bottom: 1rem;
            line-height: 1.3;
        }

        .scholarship-description {
            color: var(--gray-700);
            line-height: 1.7;
            margin-bottom: 1.5rem;
            flex-grow: 1;
        }

        .scholarship-requirements {
            background: var(--gray-100);
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
        }

        .scholarship-requirements h4 {
            font-size: 0.9rem;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 0.5rem;
            text-transform: uppercase;
        }

        .scholarship-requirements p {
            font-size: 0.9rem;
            color: var(--gray-600);
            line-height: 1.6;
        }

        .scholarship-meta {
            display: flex;
            gap: 1.5rem;
            font-size: 0.9rem;
            color: var(--gray-500);
            padding-top: 1rem;
            border-top: 1px solid var(--gray-200);
            flex-wrap: wrap;
            margin-bottom: 1.5rem;
        }

        .scholarship-meta span {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .apply-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.875rem 1.75rem;
            background: var(--primary);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
            align-self: flex-start;
        }

        .apply-btn:hover {
            background: #013300;
            transform: translateX(5px);
        }

        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            background: white;
            border-radius: 16px;
            box-shadow: var(--shadow);
        }

        .empty-state-icon {
            font-size: 5rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }

        .empty-state p {
            color: var(--gray-500);
            font-size: 1.1rem;
        }

        /* Closed Scholarships Section */
        .closed-section {
            background: var(--gray-100);
            padding: 3rem 0;
            margin-top: 3rem;
        }

        .closed-card {
            opacity: 0.7;
            border-left-color: var(--gray-400);
        }

        .closed-card:hover {
            opacity: 1;
        }

        .closed-badge {
            background: #ff0000ff;
             padding: 0.5rem 1rem;
            color: #ffffffff;
            border-radius: 8px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
        }

        /* Footer - Same as about.php */
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

        .footer-links li {
            color: var(--gray-400);
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

            .scholarships-grid {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }

            .section {
                padding: 3rem 0;
            }

            .scholarship-meta {
                flex-direction: column;
                gap: 0.75rem;
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
                <li><a href="scholarships.php" class="nav-link active">Scholarships & Opportunities</a></li>
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
            <a href="about.php">About</a>
            <a href="scholarships.php" class="active">Scholarships & Opportunities</a>
            <a href="innovations.php">Innovations</a>
            <a href="blog.php">News & Events</a>
            <a href="contact.php">Contact Us</a>
            
            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb;">
                <div style="padding: 0 2rem; margin-bottom: 0.75rem; font-size: 14px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                    Resources
                </div>
                <a href="about.php#leadership" >Our Leadership</a>
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
            <h1>GNUTS Opportunities Hub</h1>
            <p>Training and funding opportunities to support your technical and vocational education journey</p>
        </div>
    </section>

    <!-- Active Scholarships Section -->
    <section class="section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Available Scholarships</h2>
                <p class="section-subtitle">Explore financial aid opportunities currently accepting applications</p>
            </div>

            <?php if(empty($scholarships)): ?>
                <div class="empty-state">
                    <div class="empty-state-icon">🎓</div>
                    <p>No scholarships are currently available. Please check back soon for new opportunities!</p>
                </div>
            <?php else: ?>
                <div class="scholarships-grid">
                    <?php foreach($scholarships as $scholarship): ?>
                    <div class="scholarship-card">
                        <div class="scholarship-header">
                            <span class="scholarship-badge">Active</span>
                        </div>

                        <h3><?php echo htmlspecialchars($scholarship['title']); ?></h3>

                        <div class="scholarship-description">
                            <?php echo nl2br(htmlspecialchars($scholarship['description'])); ?>
                        </div>

                        <?php if(!empty($scholarship['requirements'])): ?>
                        <div class="scholarship-requirements">
                            <h4>Requirements</h4>
                            <p><?php echo nl2br(htmlspecialchars($scholarship['requirements'])); ?></p>
                        </div>
                        <?php endif; ?>

                        <div class="scholarship-meta">
                            <?php if(!empty($scholarship['deadline'])): ?>
                            <span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                Deadline: <?php echo date('F d, Y', strtotime($scholarship['deadline'])); ?>
                            </span>
                            <?php endif; ?>

                            <span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                Posted: <?php echo date('M d, Y', strtotime($scholarship['created_at'])); ?>
                            </span>
                        </div>

                        <?php if(!empty($scholarship['link'])): ?>
                        <a href="<?php echo htmlspecialchars($scholarship['link']); ?>" target="_blank" class="apply-btn">
                            Apply Now
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </a>
                        <?php endif; ?>
                    </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </section>

    <!-- Closed Scholarships Section -->
    <?php if(!empty($closedScholarships)): ?>
    <section class="closed-section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Recently Closed Scholarships</h2>
                <p class="section-subtitle">These opportunities are no longer accepting applications</p>
            </div>

            <div class="scholarships-grid">
                <?php foreach($closedScholarships as $scholarship): ?>
                <div class="scholarship-card closed-card">
                    <div class="scholarship-header">
                        <span class="scholarship-badge closed-badge">Closed</span>
                    </div>

                    <h3><?php echo htmlspecialchars($scholarship['title']); ?></h3>

                    <div class="scholarship-description">
                        <?php echo nl2br(htmlspecialchars(substr($scholarship['description'], 0, 300))); ?>
                        <?php if(strlen($scholarship['description']) > 300) echo '...'; ?>
                    </div>

                    <div class="scholarship-meta">
                        <span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            Closed: <?php echo !empty($scholarship['deadline']) ? date('F d, Y', strtotime($scholarship['deadline'])) : 'N/A'; ?>
                        </span>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
    
    <?php endif; ?>
      <!-- Active Opportunities Section -->
    <section class="section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Available Opportunities</h2>
                <p class="section-subtitle">Explore internships, skill development programs, and grants currently accepting applications</p>
            </div>

            <?php if(empty($opportunities)): ?>
                <div class="empty-state">
                    <div class="empty-state-icon">💼</div>
                    <p>No opportunities are currently available. Check back soon for new programs!</p>
                </div>
            <?php else: ?>
                <div class="opportunities-grid">
                    <?php foreach($opportunities as $opportunity): ?>
                    <div class="opportunity-card">
                        <div class="opportunity-header">
                            <span class="opportunity-type">
                                <?php 
                                    $typeDisplay = str_replace('_', ' ', $opportunity['type']);
                                    echo strtoupper($typeDisplay); 
                                ?>
                            </span>
                            <span class="opportunity-badge">Active</span>
                        </div>

                        <h3><?php echo htmlspecialchars($opportunity['title']); ?></h3>

                        <div class="opportunity-description">
                            <?php echo nl2br(htmlspecialchars($opportunity['description'])); ?>
                        </div>

                        <div class="opportunity-meta">
                            <?php if(!empty($opportunity['location'])): ?>
                            <span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <?php echo htmlspecialchars($opportunity['location']); ?>
                            </span>
                            <?php endif; ?>

                            <?php if(!empty($opportunity['deadline'])): ?>
                            <span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                Deadline: <?php echo date('F d, Y', strtotime($opportunity['deadline'])); ?>
                            </span>
                            <?php endif; ?>

                            <span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                Posted: <?php echo date('M d, Y', strtotime($opportunity['created_at'])); ?>
                            </span>
                        </div>

                        <?php if(!empty($opportunity['link'])): ?>
                        <a href="<?php echo htmlspecialchars($opportunity['link']); ?>" target="_blank" class="apply-btn">
                            Apply Now
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </a>
                        <?php endif; ?>
                    </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </section>

    <!-- Closed Opportunities Section -->
    <?php if(!empty($closedOpportunities)): ?>
    <section class="closed-section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">Recently Closed Opportunities</h2>
                <p class="section-subtitle">These programs are no longer accepting applications</p>
            </div>

            <div class="opportunities-grid">
                <?php foreach($closedOpportunities as $opportunity): ?>
                <div class="opportunity-card closed-card">
                    <div class="opportunity-header">
                        <span class="opportunity-type">
                            <?php 
                                $typeDisplay = str_replace('_', ' ', $opportunity['type']);
                                echo strtoupper($typeDisplay); 
                            ?>
                        </span>
                        <span class="closed-badge">Closed</span>
                    </div>

                    <h3><?php echo htmlspecialchars($opportunity['title']); ?></h3>

                    <div class="opportunity-description">
                        <?php echo nl2br(htmlspecialchars(substr($opportunity['description'], 0, 300))); ?>
                        <?php if(strlen($opportunity['description']) > 300) echo '...'; ?>
                    </div>

                    <div class="opportunity-meta">
                        <?php if(!empty($opportunity['location'])): ?>
                        <span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <?php echo htmlspecialchars($opportunity['location']); ?>
                        </span>
                        <?php endif; ?>
                        
                        <span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            Closed: <?php echo !empty($opportunity['deadline']) ? date('F d, Y', strtotime($opportunity['deadline'])) : 'N/A'; ?>
                        </span>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
    <?php endif; ?>
    <footer class="footer" id="footer-section">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-section">
                    <h4>GNUTS</h4>
                    <p>Ghana National Union of Technical Students — Empowering technical and vocational students across Ghana since 1962.</p>
                    <div class="social-links">
                        <a href="#" class="social-link" aria-label="Facebook">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                            </svg>
                        </a>
                        <a href="#" class="social-link" aria-label="Twitter">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                            </svg>
                        </a>
                        <a href="#" class="social-link" aria-label="Instagram">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                        </a>
                        <a href="#" class="social-link" aria-label="YouTube">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                            </svg>
                        </a>
                    </div>
                </div>
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul class="footer-links">
                        <li><a href="pages/about.php">About Us</a></li>
                        <li><a href="pages/scholarships.php">Scholarships</a></li>
                        <li><a href="pages/scholarship.php">Opportunities</a></li>
                        <li><a href="pages/innovations.php">Innovations</a></li>
                        <li><a href="pages/blog.php">News & Blog</a></li>
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
                        <li><a href="pages/about.php#constitution">Constitution</a></li>
                        <li><a href="pages/about.php#history">Our History</a></li>
                        <li><a href="pages/contact.php">Contact</a></li>
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
        const mobileToggle = document.querySelector('.mobile-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        const mobileOverlay = document.querySelector('.mobile-overlay');
        const navMenu = document.querySelector('.nav-menu');

        function checkScreenWidth() {
            if (window.innerWidth <= 768) {
                mobileToggle.style.display = 'flex';
                if (!mobileMenu.classList.contains('active')) {
                    navMenu.style.display = 'none';
                }
            } else {
                mobileToggle.style.display = 'none';
                mobileMenu.classList.remove('active');
                mobileOverlay.classList.remove('active');
                navMenu.style.display = 'flex';
            }
        }

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

        checkScreenWidth();
        window.addEventListener('resize', checkScreenWidth);

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

        // Header scroll effect
        const header = document.getElementById('main-header');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        });

        // Smooth scroll for navigation links
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
    </script>
                </body>
                </html>