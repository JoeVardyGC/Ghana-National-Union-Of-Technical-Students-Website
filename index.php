<?php
// Database connection
$conn = new mysqli("127.0.0.1", "root", "", "gnuts");

// Check connection
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

// Fetch stats
$statsQuery = "
    SELECT
        (SELECT COUNT(*) FROM innovations WHERE status = 'approved') AS projects,
        (SELECT COUNT(*) FROM scholarships WHERE status = 'active') AS scholarships,
        (SELECT COUNT(*) FROM opportunities WHERE status = 'active') AS opportunities
";
$statsResult = $conn->query($statsQuery);
$stats = $statsResult->fetch_assoc();

// Fetch active scholarships (limit 3 for homepage)
$scholarshipsQuery = "SELECT * FROM scholarships WHERE status = 'active' ORDER BY created_at DESC LIMIT 2";
$scholarshipsResult = $conn->query($scholarshipsQuery);
$scholarships = [];
while($row = $scholarshipsResult->fetch_assoc()) {
    $scholarships[] = $row;
}

// Fetch active opportunities (limit 3 for homepage)
$opportunitiesQuery = "SELECT * FROM opportunities WHERE status = 'active' ORDER BY created_at DESC LIMIT 3";
$opportunitiesResult = $conn->query($opportunitiesQuery);
$opportunities = [];
while($row = $opportunitiesResult->fetch_assoc()) {
    $opportunities[] = $row;
}

// Fetch approved innovations (limit 3 for homepage)
$innovationsQuery = "SELECT * FROM innovations WHERE status = 'approved' ORDER BY created_at DESC LIMIT 2";
$innovationsResult = $conn->query($innovationsQuery);
$innovations = [];
while($row = $innovationsResult->fetch_assoc()) {
    $innovations[] = $row;
}

// Fetch executives with all details (limit 8 for homepage)
$executivesQuery = "SELECT * FROM executives ORDER BY display_order ASC LIMIT 8";
$executivesResult = $conn->query($executivesQuery);
$executives = [];
while($row = $executivesResult->fetch_assoc()) {
    $executives[] = $row;
}

// Fetch published news (limit 3 for homepage)
$newsQuery = "SELECT * FROM news WHERE status = 'published' ORDER BY published_at DESC LIMIT 3";
$newsResult = $conn->query($newsQuery);
$news = [];
while($row = $newsResult->fetch_assoc()) {
    $news[] = $row;
}
$newsQuery = "SELECT * FROM news
              WHERE status = 'published'
              ORDER BY CREATED_at DESC
              LIMIT 6";
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
    <title>GNUTS — Ghana National Union of Technical Students</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="includes/assets/gnuts_fav.png">


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
        --gray-800: #1f2937;
        --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
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
        font-family: 'Montserrat', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: var(--light);
        color: var(--dark);
        line-height: 1.6;
        overflow-x: hidden;
    }

    h1, h2, h3, h4, h5, h6 {
        font-family: 'Montserrat', sans-serif;
        font-weight: 700;
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
        border-bottom: none !important;
    }

    .logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 800;
        font-size: 1.5rem;
        color: var(--primary);
        text-decoration: none;
    }

    .logo span {
        color: #ffffff !important;
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

    .nav-menu .nav-link:hover {
        color: #D9A000 !important;
    }

    .nav-menu .nav-link:hover::after {
        width: 100%;
    }

    .nav-menu .nav-link.active::after {
        background: #D9A000 !important;
        width: 100%;
    }

    /* Mobile Toggle */
    .mobile-toggle {
        display: none;
        flex-direction: column;
        justify-content: center;
        align-items: center;
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
        gap: 0;
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

    .mobile-menu a:hover {
        background: #f8f9fa;
        color: #014900;
        padding-left: 2.5rem;
    }

    .mobile-menu a.active {
        color: #014900;
        font-weight: 600;
        border-left: 4px solid #D9A000;
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
    .hero {
        position: relative;
        height: 85vh;
        min-height: 600px;
        overflow: hidden;
        background: var(--dark);
    }

    .hero-slide {
        position: absolute;
        inset: 0;
        background-size: cover;
        background-position: center;
        opacity: 0;
        transition: opacity 1s ease-in-out, transform 1.2s ease;
        transform: scale(1.05);
    }

    .hero-slide.active {
        opacity: 1;
        transform: scale(1);
    }

    .hero-slide::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.5) 70%, rgba(0, 0, 0, 0.75) 100%);
        pointer-events: none;
    }

    .hero-slide::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at center, rgba(255, 255, 255, 0.02) 0%, rgba(0, 0, 0, 0.5) 100%);
        mix-blend-mode: overlay;
        pointer-events: none;
    }

    .hero-content {
        position: relative;
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 2rem;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        color: white;
        z-index: 2;
    }

    .hero-content h1 {
        font-size: clamp(2.5rem, 5vw, 4rem);
        font-weight: 800;
        line-height: 1.1;
        margin-bottom: 1.5rem;
        animation: fadeInUp 0.8s ease-out;
    }

    .hero-content p {
        font-size: clamp(1.1rem, 2vw, 1.35rem);
        max-width: 700px;
        margin-bottom: 2.5rem;
        line-height: 1.7;
        opacity: 0.95;
        animation: fadeInUp 0.8s ease-out 0.2s backwards;
    }

    .hero-actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        animation: fadeInUp 0.8s ease-out 0.4s backwards;
    }

    .btn {
        padding: 1rem 2rem;
        border-radius: 8px;
        font-weight: 600;
        font-size: 1rem;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
        border: 2px solid transparent;
        cursor: pointer;
    }

    .btn-primary {
        background: white;
        color: var(--primary);
    }

    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(255, 255, 255, 0.73);
    }
     .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(255, 255, 255, 0.73);
    }

    .btn-outline {
        background: transparent;
        color: white;
        border-color: white;
    }

    .btn-outline:hover {
        background: white;
        color: var(--primary);
        transform: translateY(-2px);
    }

    .stats-card {
        position: absolute;
        bottom: 2rem;
        right: 2rem;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        padding: 1.5rem;
        border-radius: 16px;
        box-shadow: var(--shadow-xl);
        min-width: 280px;
        animation: fadeInRight 0.8s ease-out 0.6s backwards;
    }

    .stats-grid {
        display: grid;
        gap: 1rem;
    }

    .stat-item {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .stat-icon {
        width: 48px;
        height: 48px;
        background: var(--primary);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.25rem;
    }

    .stat-info h4 {
        font-size: 1.75rem;
        font-weight: 800;
        color: var(--primary);
        line-height: 1;
    }

    .stat-info p {
        font-size: 0.85rem;
        color: var(--gray-600);
        margin-top: 0.25rem;
    }

    .hero-nav {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 1rem;
        z-index: 10;
        align-items: center;
        justify-content: center;
    }

    .hero-nav-btn {
        width: 40px;
        height: 40px;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 50%;
        color: white;
        font-size: 1.25rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    }

    .hero-nav-btn:hover {
        background: rgba(0, 0, 0, 0.6);
        transform: scale(1.2);
        box-shadow: 0 6px 15px rgba(0,0,0,0.5);
    }

    /* Sections */
    .container {
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 2rem;
    }

    .section {
        padding: 5rem 0;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 3rem;
    }

    .section-title {
        font-size: clamp(1.75rem, 3vw, 2.5rem);
        font-weight: 800;
        color: #014900;
        position: relative;
        padding-bottom: 1rem;
    }

    .section-title::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 60px;
        height: 4px;
        background: var(--primary);
        border-radius: 2px;
    }

    .section-subtitle {
        color: var(--gray-500);
        font-size: 1rem;
        margin-top: 0.5rem;
    }

    .section-link {
        color: var(--primary);
        text-decoration: none;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: gap 0.3s ease;
    }

    .section-link:hover {
        gap: 0.75rem;
    }

    .grid {
        display: grid;
        gap: 2rem;
    }

    .grid-3 {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }

    .card {
        background: white;
        border-radius: 16px;
        padding: 2rem;
        box-shadow: var(--shadow);
        transition: all 0.3s ease;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .card:hover {
        transform: translateY(-8px);
        box-shadow: var(--shadow-xl);
    }

    .card-icon {
        width: 64px;
        height: 64px;
        background: var(--primary);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.75rem;
        margin-bottom: 1.5rem;
    }

    .card h3 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--dark);
        margin-bottom: 1rem;
    }

    .card p {
        color: var(--gray-600);
        line-height: 1.7;
        margin-bottom: 1.5rem;
        flex-grow: 1;
    }

    .card-link {
        color: var(--primary);
        text-decoration: none;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: gap 0.3s ease;
    }

    .card-link:hover {
        gap: 0.75rem;
    }

    /* Innovation Cards - Enhanced */
    .innovation-card {
        background: white;
        border-radius: 0px;
        overflow: hidden;
        box-shadow: var(--shadow);
        transition: all 0.3s ease;
    }

    .innovation-card:hover {
        transform: translateY(-8px);
        box-shadow: var(--shadow-xl);
    }

    .innovation-image {
        width: 100%;
        height: 280px;
        background: var(--gray-200);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--gray-400);
        font-size: 3rem;
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

    .innovation-content {
        padding: 1.5rem;
    }

    .innovation-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background: var(--primary);
        color: white;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-bottom: 1rem;
    }

    .innovation-card h4 {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--dark);
        margin-bottom: 0.75rem;
    }

    .innovation-card p {
        color: var(--gray-600);
        font-size: 0.95rem;
        line-height: 1.6;
        margin-bottom: 1rem;
    }

    .innovation-meta {
        display: flex;
        align-items: center;
        gap: 1rem;
        font-size: 0.85rem;
        color: var(--gray-500);
        padding-top: 1rem;
        border-top: 1px solid var(--gray-200);
    }

    /* Executive Cards - Block Style */
    .exec-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 2rem;
        margin-top: 2rem;
    }

    .exec-card {
        background: white;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: var(--shadow-lg);
        transition: all 0.4s ease;
        position: relative;
    }

    .exec-card:hover {
        transform: translateY(-12px);
        box-shadow: var(--shadow-xl);
    }

    .exec-card-image {
        width: 100%;
        height: 400px;
        background: linear-gradient(135deg, var(--primary) 0%, #026b00 100%);
        display: flex;
        align-items: center;
        justify-content: center;
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
        z-index: 2;
        max-width: 80%;
        line-height: 1.3;
    }

    .exec-card-content {
        padding: 2rem;
        text-align: center;
    }

    .exec-card h4 {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--dark);
        margin-bottom: 0.5rem;
        line-height: 1.3;
    }

    .exec-position {
        color: var(--primary);
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 1rem;
    }

    .exec-card p {
        color: var(--gray-600);
        font-size: 0.95rem;
        line-height: 1.6;
        margin-bottom: 1.5rem;
    }

    .exec-contact {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: var(--gray-600);
        padding-top: 1rem;
        border-top: 1px solid var(--gray-200);
    }

    .exec-contact a {
        color: var(--primary);
        text-decoration: none;
        transition: color 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }

    .exec-contact a:hover {
        color: var(--secondary);
    }

    /* Scholarship Cards */
    .scholarship-card {
        background: white;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: var(--shadow);
        transition: all 0.3s ease;
        border-left: 4px solid var(--primary);
    }

    .scholarship-card:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-xl);
    }

    .scholarship-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 1rem;
    }

    .scholarship-badge {
        padding: 0.25rem 0.75rem;
        background: var(--primary);
        color: white;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
    }

    .scholarship-card h4 {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--dark);
        margin-bottom: 0.5rem;
    }

    .scholarship-card p {
        color: var(--gray-600);
        line-height: 1.6;
        margin-bottom: 1rem;
    }

    .scholarship-meta {
        display: flex;
        gap: 1.5rem;
        font-size: 0.85rem;
        color: var(--gray-500);
        padding-top: 1rem;
        border-top: 1px solid var(--gray-200);
        flex-wrap: wrap;
        align-items: center;
    }

    /* Opportunity Cards */
    .opportunity-card {
        background: white;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: var(--shadow);
        transition: all 0.3s ease;
        border-top: 4px solid var(--secondary);
    }

    .opportunity-card:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-xl);
    }

    .opportunity-type {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background: var(--secondary);
        color: white;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-bottom: 1rem;
    }

    .opportunity-card h4 {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--dark);
        margin-bottom: 0.75rem;
    }

    .opportunity-card p {
        color: var(--gray-600);
        line-height: 1.6;
        margin-bottom: 1rem;
    }

    /* News Cards - Enhanced */
    .news-card {
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: var(--shadow);
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
    }

    .news-card:hover {
        transform: translateY(-8px);
        box-shadow: var(--shadow-xl);
    }

    .news-image {
        width: 100%;
        height: 250px;
        background: var(--gray-200);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
    }

    .news-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .news-image::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%);
        z-index: 1;
    }

    .news-category {
        position: absolute;
        top: 1rem;
        left: 1rem;
        background: var(--primary);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        z-index: 2;
    }

    .news-content {
        padding: 1.5rem;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }

    .news-date {
        color: var(--gray-500);
        font-size: 0.85rem;
        font-weight: 600;
        margin-bottom: 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .news-card h4 {
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--dark);
        margin-bottom: 0.75rem;
        line-height: 1.4;
    }

    .news-card p {
        color: var(--gray-600);
        line-height: 1.7;
        margin-bottom: 1rem;
        flex-grow: 1;
    }

    .news-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 1rem;
        border-top: 1px solid var(--gray-200);
    }

    .read-more-btn {
        background: var(--primary);
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.9rem;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
    }

    .read-more-btn:hover {
        background: #026b00;
        transform: translateX(5px);
    }

    /* Empty State */
    .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: var(--gray-500);
    }

    .empty-state-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.5;
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

    @keyframes fadeInRight {
        from {
            opacity: 0;
            transform: translateX(30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .nav-menu {
            display: none !important;
        }
        
        .mobile-toggle {
            display: flex !important;
        }
        
        .hero {
            height: 70vh;
            min-height: 500px;
        }
        
        .hero-content {
            padding: 0 1.5rem;
            justify-content: flex-start;
            padding-top: 6rem;
        }
        
        .hero-content h1 {
            font-size: clamp(1.75rem, 6vw, 2.5rem);
            margin-bottom: 1rem;
        }
        
        .hero-content p {
            font-size: clamp(1rem, 3vw, 1.2rem);
            margin-bottom: 1.5rem;
        }
        
        .hero-actions {
            flex-direction: column;
            width: 100%;
        }
        
        .btn {
            width: 100%;
            justify-content: center;
            padding: 0.875rem 1.5rem;
        }
        
        .stats-card {
            position: relative;
            bottom: auto;
            right: auto;
            margin: 1.5rem;
            width: calc(100% - 3rem);
            min-width: auto;
        }
        
        .section {
            padding: 3rem 0;
        }
        
        .container {
            padding: 0 1.5rem;
        }
        
        .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .grid-3 {
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }
        
        .exec-card {
            flex: 0 0 100%;
        }
        
        .exec-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }
        
        .exec-card-image {
             height: 230px !important;
        }
        
        .news-image {
            height: 220px;
        }
        
        .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
        }
    }
/* MOBILE RESPONSIVE FIXES - Add these styles to your existing CSS */

/* Mobile Responsive Breakpoints */
@media (max-width: 768px) {
    /* Navigation */
    .nav-menu {
        display: none !important;
    }
    
    .mobile-toggle {
        display: flex !important;
    }
    
    /* Hero Section - Mobile Optimized */
    .hero {
        height: auto;
        min-height: 400px;
        padding-bottom: 0;
        display: flex;
        flex-direction: column;
    }
    
    .hero-slide {
        position: absolute;
        height: 100%;
    }
    
    .hero-content {
        position: relative;
        padding: 5rem 1.5rem 2rem;
        justify-content: flex-start;
        flex: 1;
        z-index: 3;
    }
    
    .hero-content h1 {
        font-size: 1.85rem;
        margin-bottom: 1rem;
        line-height: 1.2;
    }
    
    .hero-content p {
        font-size: 0.95rem;
        margin-bottom: 1.5rem;
        line-height: 1.5;
    }
    
    .hero-actions {
        flex-direction: column;
        width: 100%;
        margin-bottom: 0;
    }
    
    .btn {
        width: 100%;
        justify-content: center;
        padding: 0.875rem 1.5rem;
        font-size: 0.9rem;
    }
    
    /* Stats Card - Moved Below Hero Buttons */
    .stats-card {
        position: relative !important;
        bottom: auto !important;
        right: auto !important;
        left: 0 !important;
        top: auto !important;
        width: calc(100% - 3rem) !important;
        margin: 1.5rem auto 2rem !important;
        min-width: auto !important;
        padding: 1.5rem !important;
        border-radius: 12px !important;
        animation: none !important;
        order: 10;
        z-index: 5;
    }
    
    .stats-grid {
        gap: 1rem !important;
    }
    
    .stat-item {
        gap: 0.75rem !important;
    }
    
    .stat-icon {
        width: 40px !important;
        height: 40px !important;
        font-size: 1rem !important;
    }
    
    .stat-info h4 {
        font-size: 1.5rem !important;
    }
    
    .stat-info p {
        font-size: 0.8rem !important;
    }
    
    /* Hero Navigation Buttons */
    .hero-nav {
        bottom: 10px;
    }
    
    .hero-nav-btn {
        width: 35px;
        height: 35px;
        font-size: 1.1rem;
    }
    
    /* Sections */
    .section {
        padding: 3rem 0;
    }
    
    .container {
        padding: 0 1.5rem;
    }
    
    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 2rem;
    }
    
    /* Grid Layouts */
    .grid-3 {
        grid-template-columns: 1fr !important;
        gap: 1.5rem;
    }
    
    .grid-2-large {
        grid-template-columns: 1fr !important;
    }
    
    /* Executive Cards - Mobile - Reduced Image Size */
    .exec-grid {
        grid-template-columns: 1fr !important;
        gap: 1.5rem !important;
    }
    
    .exec-card {
        max-width: 100%;
    }
    
    /* Reduced exec image height for better mobile viewing */
    .exec-card-image {
        height: 220px !important;
    }
    
    .exec-card-image img {
        object-fit: cover;
        object-position: center 20%;
    }
    
    .exec-card-content {
        padding: 1.5rem !important;
    }
    
    .exec-card h4 {
        font-size: 1.15rem !important;
        line-height: 1.3;
    }
    
    .exec-position {
        font-size: 0.85rem !important;
    }
    
    .exec-badge {
        font-size: 0.6rem !important;
        padding: 0.4rem 0.7rem !important;
        max-width: 75%;
        line-height: 1.2;
    }
    
    /* Rank badge adjustment */
    .exec-card > div[style*="position: absolute"] {
        width: 36px !important;
        height: 36px !important;
        font-size: 12px !important;
    }
    
    /* Innovation Cards */
    .innovation-image {
        height: 220px !important;
    }
    
    .innovation-content {
        padding: 1.25rem !important;
    }
    
    .innovation-card h4 {
        font-size: 1.1rem !important;
    }
    
    /* News Cards */
    .news-grid {
        grid-template-columns: 1fr !important;
    }
    
    .news-image-container {
        height: 200px !important;
    }
    
    .news-title {
        font-size: 1rem !important;
    }
    
    /* Footer */
    .footer-grid {
        grid-template-columns: 1fr !important;
        gap: 2rem;
        margin-bottom: 2rem;
    }
}

/* Extra Small Phones (max-width: 480px) */
@media (max-width: 480px) {
    .nav-container {
        padding: 0 1rem;
        height: 64px;
    }
    
    .logo {
        font-size: 1.25rem;
        gap: 0.5rem;
    }
    
    .logo img {
        width: 45px !important;
        height: 45px !important;
    }
    
    .hero {
        min-height: 380px;
    }
    
    .hero-content {
        padding: 4rem 1rem 1.5rem;
    }
    
    .hero-content h1 {
        font-size: 1.6rem;
        line-height: 1.2;
    }
    
    .hero-content p {
        font-size: 0.9rem;
        line-height: 1.4;
    }
    
    /* Stats Card - Extra Small */
    .stats-card {
        width: calc(100% - 2rem) !important;
        margin: 1rem auto 1.5rem !important;
        padding: 1.25rem !important;
    }
    
    .stat-icon {
        width: 36px !important;
        height: 36px !important;
        font-size: 0.9rem !important;
    }
    
    .stat-info h4 {
        font-size: 1.35rem !important;
    }
    
    .stat-info p {
        font-size: 0.75rem !important;
        line-height: 1.3;
    }
    
    .section {
        padding: 2.5rem 0;
    }
    
    .container {
        padding: 0 1rem;
    }
    
    .section-title {
        font-size: 1.5rem !important;
    }
    
    .section-subtitle {
        font-size: 0.9rem !important;
    }
    
    /* Even smaller exec images on tiny phones */
    .exec-card-image {
        height: 200px !important;
    }
    
    .exec-card h4 {
        font-size: 1.05rem !important;
    }
    
    .exec-position {
        font-size: 0.8rem !important;
    }
    
    .exec-card-content {
        padding: 1.25rem !important;
    }
    
    .innovation-image {
        height: 200px !important;
    }
    
    .news-image-container {
        height: 180px !important;
    }
    
    .btn {
        font-size: 0.85rem;
        padding: 0.75rem 1.25rem;
    }
}

/* Tablet Landscape (769px - 1024px) */
@media (min-width: 769px) and (max-width: 1024px) {
    .exec-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 2rem;
    }
    
    .exec-card-image {
        height: 350px;
    }
    
    .stats-card {
        min-width: 260px;
    }
    
    .grid-3 {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .grid-2-large {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Small Tablets (600px - 768px) */
@media (min-width: 601px) and (max-width: 768px) {
    .stats-card {
        width: calc(100% - 3rem) !important;
        margin: 1.5rem auto 2rem !important;
    }
    
    .exec-grid {
        grid-template-columns: repeat(2, 1fr) !important;
    }
    
    /* Balanced image size for small tablets */
    .exec-card-image {
        height: 240px !important;
    }
}

/* Ensure stats card stays within viewport */
@media (max-width: 768px) {
    .hero {
        padding-bottom: 0;
    }
    
    .stats-card {
        position: static !important;
        transform: none !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
    }
}

/* Fix executive card numbering on mobile */
@media (max-width: 768px) {
    #executives-section .exec-card {
        margin-bottom: 0;
    }
    
    #executives-section .exec-card:last-child {
        margin-bottom: 0;
    }
}

/* Ensure proper text wrapping on mobile */
@media (max-width: 768px) {
    .exec-card h4,
    .innovation-card h4,
    .news-title,
    .scholarship-card h4,
    .opportunity-card h4 {
        word-wrap: break-word;
        overflow-wrap: break-word;
        hyphens: auto;
    }
}

/* Fix modal responsiveness */
@media (max-width: 768px) {
    .innovation-modal-window,
    .news-modal-window {
        width: calc(100% - 2rem);
        margin: 1rem auto;
        border-radius: 16px;
    }
    
    .innovation-modal-hero-image,
    .modal-hero-image {
        height: 250px;
    }
    
    .innovation-modal-content-wrapper,
    .modal-content-wrapper {
        padding: 1.5rem;
    }
    
    .innovation-modal-title,
    .modal-title {
        font-size: 1.5rem;
    }
    
    .modal-share-buttons,
    .innovation-modal-share-buttons {
        justify-content: center;
    }
}

.stats-card {
    position: absolute;
    bottom: 2rem;
    right: 2rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 1.5rem;
    border-radius: 16px;
    box-shadow: var(--shadow-xl);
    min-width: 280px;
    animation: fadeInRight 0.8s ease-out 0.6s backwards;
    z-index: 10;
}

/* NEW: Mobile stats card - shown below hero */
.stats-card-mobile {
    display: none;
    background: white;
    padding: 2rem;
    border-radius: 16px;
    box-shadow: var(--shadow-md);
    margin: -3rem 1rem 0 1rem;
    position: relative;
    z-index: 100;
}

/* ============================================
   MODIFIED MOBILE RESPONSIVE CSS
   ============================================ */

@media (max-width: 768px) {
    /* Navigation */
    .nav-menu {
        display: none !important;
    }
    
    .mobile-toggle {
        display: flex !important;
    }
    
    /* Hero Section - Mobile Optimized */
    .hero {
        height: 70vh;
        min-height: 500px;
    }
    
    .hero-slide {
        position: absolute;
        height: 100%;
    }
    
    .hero-content {
        position: relative;
        padding: 5rem 1.5rem 2rem;
        justify-content: flex-start;
        flex: 1;
        z-index: 3;
    }
    
    .hero-content h1 {
        font-size: 1.85rem;
        margin-bottom: 1rem;
        line-height: 1.2;
    }
    
    .hero-content p {
        font-size: 0.95rem;
        margin-bottom: 1.5rem;
        line-height: 1.5;
    }
    
    .hero-actions {
        flex-direction: column;
        width: 100%;
        margin-bottom: 0;
    }
    
    .btn {
        width: 100%;
        justify-content: center;
        padding: 0.875rem 1.5rem;
        font-size: 0.9rem;
    }
    
    /* CHANGED: Hide desktop stats card on mobile */
    .stats-card {
        display: none !important;
    }
    
    /* CHANGED: Show mobile stats card */
    .stats-card-mobile {
        display: block !important;
    }
    
    .stats-grid {
        gap: 1rem !important;
    }
    
    .stat-item {
        gap: 0.75rem !important;
    }
    
    .stat-icon {
        width: 40px !important;
        height: 40px !important;
        font-size: 1rem !important;
    }
    
    .stat-info h4 {
        font-size: 1.5rem !important;
    }
    
    .stat-info p {
        font-size: 0.8rem !important;
    }
    
    /* Hero Navigation Buttons */
    .hero-nav {
        bottom: 10px;
    }
    
    .hero-nav-btn {
        width: 35px;
        height: 35px;
        font-size: 1.1rem;
    }
    
/* Tablet Landscape (769px - 1024px) */
@media (min-width: 769px) and (max-width: 1024px) {
    .exec-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 2rem;
    }
    
    /* CHANGED: Maintain 450px height on tablets too */
    .exec-card-image {
        height: 450px;
    }
    
    .stats-card {
        min-width: 260px;
    }
    
    .grid-3 {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .gri/* ============================================
   MODIFIED CSS - Executive Card Images Fixed Height
   ============================================ */

/* Executive Cards - Block Style */
.exec-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.exec-card {
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    transition: all 0.4s ease;
    position: relative;
}

.exec-card:hover {
    transform: translateY(-12px);
    box-shadow: var(--shadow-xl);
}

.exec-card-image {
    width: 100%;
    height: 450px; /* CHANGED: Increased to 450px for better full-body display */
    background: linear-gradient(135deg, var(--primary) 0%, #026b00 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
}

.exec-card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center; /* CHANGED: Centered to show full frame better */
}

    /* Executive Cards - Mobile - CHANGED: Fixed Height */
    .exec-grid {
        grid-template-columns: 1fr !important;
        gap: 1.5rem !important;
    }
    
    .exec-card {
        max-width: 100%;
    }
    
    /* CHANGED: Fixed exec image height for all devices */
    .exec-card-image {
        height: 350px !important;
    }
    
    .exec-card-image img {
        object-fit: cover;
        object-position: center center;
    }
    
    .exec-card-content {
        padding: 1.5rem !important;
    }
    
    .exec-card h4 {
        font-size: 1.15rem !important;
        line-height: 1.3;
    }
    
    .exec-position {
        font-size: 0.85rem !important;
    }
    
    .exec-badge {
        font-size: 0.6rem !important;
        padding: 0.4rem 0.7rem !important;
        max-width: 75%;
        line-height: 1.2;
    }
    
    /* Rank badge adjustment */
    .exec-card > div[style*="position: absolute"] {
        width: 36px !important;
        height: 36px !important;
        font-size: 12px !important;
    }
}


/* Landscape phone orientation */
@media (max-width: 768px) and (orientation: landscape) {
    .hero {
        height: auto;
        min-height: 400px;
    }
    
    .hero-content {
        padding: 3rem 1.5rem 2rem;
    }
    
    .stats-card {
        position: relative !important;
        margin: 1rem auto !important;
    }
}
    @media (max-width: 480px) {
        .nav-container {
            padding: 0 1rem;
            height: 64px;
        }
        
        .logo {
            font-size: 1.25rem;
            gap: 0.5rem;
        }
        
        .logo img {
            width: 45px !important;
            height: 45px !important;
        }
        
        .hero {
            height: 65vh;
            min-height: 450px;
        }
        
        .hero-content {
            padding: 0 1rem;
            padding-top: 4rem;
        }
        
        .stats-card {
            margin: 1rem;
            width: calc(100% - 2rem);
            padding: 1.25rem;
        }
        
        .stat-icon {
            width: 36px;
            height: 36px;
        }
        
        .stat-info h4 {
            font-size: 1.25rem;
        }
        
        .stat-info p {
            font-size: 0.75rem;
        }
    }
</style>
</head>
<body>
    <header class="header" id="main-header">
        <nav class="nav-container">
            <a href="index.php" class="logo">
                <img src="includes/assets/gnuts_logo1.png" alt="GNUTS Logo" style="width:55px;height:55px;object-fit:contain;">
                <span style="font-size:22px;font-weight:700;letter-spacing:1px;">GNUTS</span>
            </a>

            <ul class="nav-menu" id="nav-menu">
                <li><a href="index.php" class="nav-link active">Home</a></li>
                <li><a href="pages/about.php" class="nav-link">About</a></li>
                <li><a href="pages/scholarships.php" class="nav-link">Scholarships & Opportunities</a></li>
                <li><a href="pages/innovations.php" class="nav-link">Innovations</a></li>
                <li><a href="pages/blog.php" class="nav-link">News & Events</a></li>
                <li><a href="pages/contact.php" class="nav-link">Contact Us</a></li>
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
            <a href="index.php" class="active">Home</a>
            <a href="pages/about.php">About</a>
            <a href="pages/scholarships.php">Scholarships & Opportunities</a>
            <a href="pages/innovations.php">Innovations</a>
            <a href="pages/blog.php">News & Events</a>
            <a href="pages/contact.php">Contact Us</a>
            
            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb;">
                <div style="padding: 0 2rem; margin-bottom: 0.75rem; font-size: 14px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                    Resources
                </div>
                <a href="pages/about.php#leadership" >Our Leadership</a>
                <a href="https://ctvet.gov.gh/results/">Check your CTVET result</a>
                <a href="pages/about.php#resources">Resources/Constitution</a>
                <a href="pages/about.php#history">Our History</a>
                <a href="#">Privacy Policy</a>
            </div>
        </div>

        <div class="mobile-overlay" id="mobile-overlay"></div>

        <div class="desktop-drawer" id="desktop-drawer">
                   <a href="pages/about.php#leadership" >Our Leadership</a>
            <a href="https://ctvet.gov.gh/results/">Check your CTVET result</a>
            <a href="pages/about.php#resources">Resources/Constitution</a>
            <a href="pages/about.php#history">Our History</a>
            <a href="#">Privacy Policy</a>
        </div>

        <div class="desktop-overlay" id="desktop-overlay"></div>
    </header>

    <section class="hero" id="hero-section">
    <?php 
    $heroSlides = [
        [
            'title' => 'Ghana National Union of Technical Students (GNUTS)',
            'subtitle' => 'The unified voice of Technical and TVET students in Ghana.',
            'image' => 'includes/assets/slide4.png',
            'btn1_text' => 'Who We Are →',
            'btn1_link' => 'pages/about.php',
            'btn2_text' => 'Our Events',
            'btn2_link' => 'pages/blog.php#all'
        ],
        
        [
            'title' => 'Empowering Technical Students for National Development', 'subtitle'=> 'Professionals with Integrity.',
            'image' => 'includes/assets/slide3.png',
           'btn1_text' => 'Who We Are →',
            'btn1_link' => 'pages/about.php',
            'btn2_text' => 'Our Events',
            'btn2_link' => 'pages/blog.php#all'
        ],
        [
            'title' => 'Creating Opportunities Beyond the Classroom',
            'subtitle' => 'Scholarships, skills, leadership, and innovation.',
            'image' => 'includes/assets/slide2.png',
            'btn1_text' => 'Who We Are →',
            'btn1_link' => 'pages/about.php',
            'btn2_text' => 'Our Events',
            'btn2_link' => 'pages/blog.php#all'
        ],
        [
            'title' => 'Building a Digitally Connected Student Union',
            'subtitle' => 'Transparent. Accessible. Student-focused.',
            'image' => 'includes/assets/slide5.png',
            'btn1_text' => 'Who We Are →',
            'btn1_link' => 'pages/about.php',
            'btn2_text' => 'Our Events',
            'btn2_link' => 'pages/blog.php#all'
        ],
    ];

    foreach($heroSlides as $index => $slide): ?>
    <div class="hero-slide <?php echo $index === 0 ? 'active' : ''; ?>" 
         style="background-image: url('<?php echo $slide['image']; ?>');">
        <div class="hero-content">
            <h1><?php echo htmlspecialchars($slide['title']); ?></h1>
            <p><?php echo htmlspecialchars($slide['subtitle']); ?></p>
            <div class="hero-actions">
                <a href="<?php echo $slide['btn1_link']; ?>" class="btn btn-primary">
                    <?php echo htmlspecialchars($slide['btn1_text']); ?>
                </a>
                <a href="<?php echo $slide['btn2_link']; ?>" class="btn btn-outline">
                    <?php echo htmlspecialchars($slide['btn2_text']); ?>
                </a>
            </div>
        </div>
    </div>
    <?php endforeach; ?>

    <!-- Desktop Stats Card (overlays hero) -->
    <div class="stats-card">
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                </div>
                <div class="stat-info">
                    <h4>11+</h4>
                    <p>Active Member Institutions</p>
                </div>
            </div>
            <div class="stat-item">
                <div class="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                </div>
                <div class="stat-info">
                    <h4><?php echo number_format($stats['projects'] ?? 0); ?></h4>
                    <p>Innovation Projects</p>
                </div>
            </div>
            <div class="stat-item">
                <div class="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                    </svg>
                </div>
                <div class="stat-info">
                    <h4><?php echo number_format($stats['scholarships'] ?? 0); ?></h4>
                    <p>Active Scholarships</p>
                </div>
            </div>
        </div>
    </div>

    <div class="hero-nav">
        <button class="hero-nav-btn" id="hero-prev" aria-label="Previous slide">‹</button>
        <button class="hero-nav-btn" id="hero-next" aria-label="Next slide">›</button>
    </div>
</section>

<!-- NEW: Mobile Stats Card - Shows below hero on mobile -->
<div class="stats-card-mobile">
    <div class="stats-grid">
        <div class="stat-item">
            <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            </div>
            <div class="stat-info">
                <h4>11+</h4>
                <p>Active Member Institutions</p>
            </div>
        </div>
        <div class="stat-item">
            <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
            </div>
            <div class="stat-info">
                <h4><?php echo number_format($stats['projects'] ?? 0); ?></h4>
                <p>Innovation Projects</p>
            </div>
        </div>
        <div class="stat-item">
            <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
            </div>
            <div class="stat-info">
                <h4><?php echo number_format($stats['scholarships'] ?? 0); ?></h4>
                <p>Active Scholarships</p>
            </div>
        </div>
    </div>
</div>
    <section class="section" id="about-section">
        <div class="container">
            <div class="section-header">
                <div>
                    <h2 class="section-title">About GNUTS</h2>
                    <p class="section-subtitle">Protecting the interests of all technical students in Ghana since 1962</p>
                </div>
                <a href="pages/about.php" class="section-link">Learn More →</a>
            </div>
            <div class="grid grid-3">
                <div class="card">
                    <div class="card-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                            <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                    </div>
                    <h3>Who We Are</h3>
                    <p><b>Ghana National Union of Technical Students (GNUTS)</b> is the national representative body of students in Technical Universities and Technical and Vocational Education and Training (TVET) institutions across Ghana.

GNUTS exists to protect, promote, and advance the academic, social, and professional interests of technical students, while serving as a unified voice in national educational discourse.
</p>
                    <a href="pages/about.php#history" class="card-link">Our History →</a>
                </div>
                <div class="card">
                    <div class="card-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    </div>
                    <h3>Our History</h3>
                    <p><B>Origins (1987)</B>
GNUPS was formed after breaking away from the National Union of Ghana Students (NUGS). This decision was driven by concerns over the marginalization of polytechnic students and the lack of adequate representation of technical education within the broader student movement.

<B>Tamale Declaration (2000)</B>
GNUPS became fully operational with the adoption of its constitution at a congress held in Tamale....</p>
                    <a href="pages/about.php" class="card-link">Know More →</a>
                </div>
                <div class="card">
                    <div class="card-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </div>
                    <h3>Policy & Advocacy</h3>
                    <p>GNUTS is committed to championing strong, student-centered policies that promote quality technical education, adequate funding, campus safety, and improved employability for technical graduates. Through structured advocacy, stakeholder engagement, and policy dialogue, the union represents the interests of technical students at institutional, national, and international levels, ensuring their voices influence educational reforms and national development agendas.</p>
                    <a href="pages/blog.php" class="card-link">Recent Statements →</a>
                </div>
            </div>
        </div>
    </section>

    <section class="section" id="scholarships-section" style="background: white;">
        <div class="container">
            <div class="section-header">
                <div>
                    <h2 class="section-title">Available Scholarships</h2>
                    <p class="section-subtitle">Funding opportunities for technical and vocational students</p>
                </div>
                <a href="pages/scholarships.php" class="section-link">View All →</a>
            </div>
            
            <?php if(empty($scholarships)): ?>
                <div class="empty-state">
                    <div class="empty-state-icon">📚</div>
                    <p>No scholarships available at the moment. Check back soon!</p>
                </div>
            <?php else: ?>
                <div class="grid grid-3">
                    <?php foreach($scholarships as $scholarship): ?>
                    <div class="scholarship-card">
                        <div class="scholarship-header">
                            <div>
                                <h4><?php echo htmlspecialchars($scholarship['title']); ?></h4>
                            </div>
                            <span class="scholarship-badge"><?php echo strtoupper($scholarship['status']); ?></span>
                        </div>
                        <p><?php echo htmlspecialchars(substr($scholarship['description'], 0, 300)) . '...'; ?></p>
                        <div class="scholarship-meta">
                          
                          <!--//<span>📅 Deadline: <?php echo date(strtotime($scholarship['deadline'])); ?></span>-->
                            <?php if($scholarship['link']): ?>
                            <a href="<?php echo htmlspecialchars($scholarship['link']); ?>" target="_blank" class="card-link">Apply →</a>
                            <?php endif; ?>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </section>

    <section class="section" id="opportunities-section">
        <div class="container">
            <div class="section-header">
                <div>
                    <h2 class="section-title">Opportunities</h2>
                    <p class="section-subtitle">Internships, training programs, and competitions</p>
                </div>
                <a href="pages/scholarships.php" class="section-link">View All →</a>
            </div>
            
            <?php if(empty($opportunities)): ?>
                <div class="empty-state">
                    <div class="empty-state-icon">💼</div>
                    <p>No opportunities available at the moment. Check back soon!</p>
                </div>
            <?php else: ?>
                <div class="grid grid-3">
                    <?php foreach($opportunities as $opportunity): ?>
                    <div class="opportunity-card">
                        <span class="opportunity-type"><?php echo strtoupper($opportunity['type']); ?></span>
                        <h4><?php echo htmlspecialchars($opportunity['title']); ?></h4>
                        <p><?php echo htmlspecialchars(substr($opportunity['description'], 0, 150)) . '...'; ?></p>
                        <div class="scholarship-meta">
                            <span>📍 <?php echo htmlspecialchars($opportunity['location']); ?></span>
                            
                        </div>
                        <?php if($opportunity['link']): ?>
                        <a href="<?php echo htmlspecialchars($opportunity['link']); ?>" target="_blank" class="card-link">Learn More →</a>
                        <?php endif; ?>
                    </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </section>
<style>
    #innovations-section {
        background: #fff;
        padding: 60px 0;
        font-family: 'Montserrat', sans-serif !important;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 40px;
    }

    .section-title {
        font-size: 32px;
        font-weight: 700;
        color: #014900;
        margin: 0 0 10px 0;
    }

    .section-subtitle {
        font-size: 16px;
        color: #9ca3af;
        margin: 0;
    }

    .section-link {
        color: #014900;
        text-decoration: none;
        font-weight: 600;
        font-size: 16px;
        transition: all 0.3s;
    }

    .section-link:hover {
        color: #D9A000;
        transform: translateX(6px);
    }

    .grid-2-large {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 30px;
    }

    .innovation-card {
        border: 1px solid #eee;
        border-radius: 0px;
        overflow: hidden;
        background: #fff;
        transition: all 0.3s;
        cursor: pointer;
        display: flex;
        flex-direction: column;
    }

    .innovation-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(2, 97, 0, 0.52);
    }

    .innovation-image {
        height: 300px;
        position: relative;
        overflow: hidden;
        background: linear-gradient(135deg, #014900 0%, #026b00 100%);
        flex-shrink: 0;
    }

    .innovation-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
    }

    .innovation-card:hover .innovation-image img {
        transform: scale(1.05);
    }

    .innovation-badge {
        position: absolute;
        top: 15px;
        left: 15px;
        background: #D9A000;
        color: #fff;
        padding: 5px 12px;
        font-weight: 600;
        font-size: 11px;
        border-radius: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .innovation-content {
        padding: 25px;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }

    .innovation-content h4 {
        font-weight: 800;
        font-style: italic;
        text-transform: uppercase;
        margin: 15px 0;
        line-height: 1.3;
        font-size: 18px;
        color: #1a1a1a;
    }

    .innovation-content p {
        line-height: 1.6;
        color: #64748b;
        font-size: 14px;
        margin-bottom: 18px;
        flex-grow: 1;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .innovation-meta {
        display: flex;
        gap: 15px;
        margin-bottom: 15px;
        font-size: 13px;
        color: #9ca3af;
        flex-wrap: wrap;
    }

    .innovation-readmore-btn {
        background: #014900;
        color: #ffffff;
        padding: 12px 24px;
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
        align-self: flex-start;
        font-family: 'Montserrat', sans-serif !important;
    }

    .innovation-readmore-btn:hover {
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

    /* Innovation Modal Styles */
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
        font-family: 'Montserrat', sans-serif !important;
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
        background: #D9A000;
        color: #fff;
        padding: 8px 20px;
        border-radius: 50px;
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.8px;
    }

    .innovation-modal-institution {
        color: #9ca3af;
        font-size: 13px;
        font-weight: 600;
    }

    .innovation-modal-title {
        font-weight: 800;
        font-style: italic;
        text-transform: uppercase;
        font-size: 38px;
        margin-bottom: 15px;
        line-height: 1.2;
        color: #1a1a1a;
        word-break: break-word;
    }

    .innovation-modal-student {
        color: #014900;
        font-weight: 700;
        font-size: 16px;
        margin-bottom: 35px;
    }

    .innovation-modal-body {
        font-size: 17px;
        line-height: 1.9;
        color: #374151;
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

    .innovation-media-item img,
    .innovation-media-item video {
        width: 100%;
        height: auto;
        display: block;
    }

    .innovation-media-item figcaption {
        padding: 18px;
        background: #f9fafb;
        font-size: 14px;
        color: #6b7280;
        font-style: italic;
        text-align: center;
        line-height: 1.6;
    }

    .innovation-video-link {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 15px 25px;
        background: linear-gradient(135deg, #014900 0%, #026b00 100%);
        color: white;
        text-decoration: none;
        border-radius: 10px;
        font-weight: 600;
        transition: all 0.3s;
        margin: 20px 0;
    }

    .innovation-video-link:hover {
        transform: translateX(10px);
        box-shadow: 0 5px 20px rgba(1, 73, 0, 0.3);
    }

    .innovation-modal-share-section {
        margin-top: 55px;
        padding-top: 35px;
        border-top: 2px solid #e5e7eb;
    }

    .innovation-modal-share-title {
        font-size: 13px;
        font-weight: 800;
        color: #014900;
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

    @media (max-width: 768px) {
        .grid-2-large {
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

<section class="section" id="innovations-section">
    <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">
        <div class="section-header">
            <div>
                <h2 class="section-title">Student Innovations</h2>
                <p class="section-subtitle">Showcasing groundbreaking projects from technical students nationwide</p>
            </div>
            <a href="pages/innovations.php" class="section-link">View All Projects →</a>
        </div>

        <?php if (empty($innovations)): ?>
            <div class="empty-state">
                <div class="empty-state-icon">⚡</div>
                <p>No innovation projects yet. Be the first to submit your project!</p>
            </div>
        <?php else: ?>
            <div class="grid-2-large">
                <?php foreach ($innovations as $innovation): ?>
                    <div class="innovation-card">
                        <div class="innovation-image">
                            <?php if ($innovation['project_image']): ?>
                                <img src="<?php echo htmlspecialchars($innovation['project_image']); ?>" 
                                     alt="<?php echo htmlspecialchars($innovation['title']); ?>">
                            <?php else: ?>
                                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" style="opacity: 0.5;">
                                    <rect x="3" y="3" width="7" height="7"></rect>
                                    <rect x="14" y="3" width="7" height="7"></rect>
                                    <rect x="14" y="14" width="7" height="7"></rect>
                                    <rect x="3" y="14" width="7" height="7"></rect>
                                </svg>
                            <?php endif; ?>
                            <span class="innovation-badge">PROJECT</span>
                        </div>
                        <div class="innovation-content">
                            <h4><?php echo htmlspecialchars($innovation['title']); ?></h4>
                            <p><?php echo htmlspecialchars($innovation['description']); ?></p>

                            <div class="innovation-meta">
                                <span>🏫 <?php echo htmlspecialchars($innovation['institution']); ?></span>
                                <span>👤 <?php echo htmlspecialchars($innovation['student_name']); ?></span>
                            </div>

 <button class="innovation-readmore-btn"
        onclick="window.location.href='pages/innovations.php'">
    <span>View Project</span>
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
         stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
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



<section id="executives-section" style="background: #f8f9fa; padding: 60px 0; position: relative; overflow: hidden;">
    <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 20px; position: relative; z-index: 1;">
        <!-- Section Header -->
        <div class="section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 50px;">
            <div class="executives-title-wrapper" style="position: relative; display: inline-block; padding-bottom: 25px;">
                <h2 class="executives-title" style="font-size: 32px; font-weight: 700; color: #014900; margin: 0 0 12px 0; position: relative; line-height: 1.2;">
                    GNUTS Executives
                </h2>
                <div style="position: absolute; left: 0; bottom: 12px; width: 60px; height: 4px; background: #014900; border-radius: 2px;"></div>
                <p class="section-subtitle" style="font-size: 16px; color: #6b7280; margin: 8px 0 0 0; font-weight: 500;">
                    The National Executive Committee
                </p>
            </div>
            <a href="pages/about.php#leadership" 
               style="color: #014900; text-decoration: none; font-weight: 600; font-size: 16px; transition: color 0.3s, transform 0.3s;"
               onmouseover="this.style.color='#D9A000'; this.style.transform='translateX(8px)';"
               onmouseout="this.style.color='#014900'; this.style.transform='translateX(0)';">
                View All →
            </a>
        </div>
        
        <?php if(empty($executives)): ?>
            <!-- Empty State -->
            <div style="text-align: center; padding: 80px 20px; background: #ffffff; border: 2px dashed #e5e7eb; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <div style="font-size: 56px; margin-bottom: 24px;">👥</div>
                <p style="font-size: 18px; color: #9ca3af; margin: 0; font-weight: 500;">Executive information will be available soon.</p>
            </div>
        <?php else: ?>
            <!-- Executive Grid -->
            <div class="exec-grid"
     style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px;">

                <?php 
                $counter = 1;
                $maxCards = 8;
                foreach($executives as $exec): 
                    if ($counter > $maxCards) break;

                    $imagePath = '';
                    if (!empty($exec['photo'])) {
                        $imagePath = (strpos($exec['photo'], 'uploads/') === 0) 
                            ? $exec['photo'] 
                            : 'uploads/executives/' . $exec['photo'];
                    }
                    $imageExists = !empty($imagePath) && file_exists($imagePath);
                ?>
                <!-- Executive Card -->
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
                    
                    <!-- Rank Badge -->
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
                    
                    <!-- Executive Image with white transparent gradient overlay -->
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
                        
                        <!-- White transparent gradient overlay at bottom -->
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
                    
                    <!-- Card Content -->
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
                        
                        <!-- Contact Info -->
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
        <?php endif; ?>
    </div>
</section>

<style>
/* Responsive */
@media (max-width: 768px) {
    #executives-section .exec-grid {
        grid-template-columns: 1fr;
        gap: 24px;
    }
    #executives-section .exec-card-image {
            height: 230px !important;
    }
    .executives-title {
        font-size: 28px !important;
    }
}

@media (min-width: 769px) and (max-width: 1024px) {
    #executives-section .exec-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const execImages = document.querySelectorAll('#executives-section .exec-card-image img');
    
    execImages.forEach(function(img) {
        img.addEventListener('load', function() {
            const aspectRatio = this.naturalWidth / this.naturalHeight;
            if (aspectRatio > 1.2) {
                this.style.objectPosition = 'center center';
            } else if (aspectRatio < 0.8) {
                this.style.objectPosition = 'center top';
            } else {
                this.style.objectPosition = 'center 25%';
            }
        });
        
        if (img.complete) {
            img.dispatchEvent(new Event('load'));
        }
    });
});
</script>


<style>
    #news-section, .news-modal-window {
        font-family: 'Montserrat', sans-serif !important;
    }

    #news-section {
        background: #ffffff;
        padding: 60px 0;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 40px;
    }

    .section-title {
        font-size: 32px;
        font-weight: 700;
        color: #014900;
        margin: 0 0 10px 0;
    }

    .section-subtitle {
        font-size: 16px;
        color: #9ca3af;
        margin: 0;
    }

    .section-link {
        color: #014900;
        text-decoration: none;
        font-weight: 600;
        font-size: 16px;
        transition: all 0.3s;
    }

    .section-link:hover {
        color: #D9A000;
        transform: translateX(6px);
    }

    .news-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 30px;
    }

    .news-card {
        border: 1px solid #eee;
        border-radius: 0px;
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

    /* Modal Styles */
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
        border:  #013200;
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

    .share-icon-btn {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        transition: all 0.3s;
        color: #fff;
    }

    .share-icon-btn:hover {
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    .share-icon-btn.whatsapp { background: #25D366; }
    .share-icon-btn.facebook { background: #1877F2; }
    .share-icon-btn.twitter { background: #000000; }
    .share-icon-btn.linkedin { background: #0077b5; }
    .share-icon-btn.telegram { background: #0088cc; }
    
    .copy-link-btn {
        background: #014900;
        color: #fff;
        border: none;
        padding: 12px 24px;
        border-radius: 24px;
        cursor: pointer;
        font-weight: 700;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: all 0.3s;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }

    .copy-link-btn:hover {
        background: #D9A000;
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 768px) {
        .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
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

        .news-title {
            font-size: 15px;
            height: 60px;
        }

        .news-description {
            font-size: 12px;
            height: 126px;
        }
    }
</style>

<section id="news-section">
    <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">
        <div class="section-header">
            <div>
                <h2 class="section-title">Latest News & Events</h2>
                <p class="section-subtitle">Stay updated with the latest from GNUTS</p>
            </div>
            <a href="pages/blog.php" class="section-link">View All →</a>
        </div>

        <?php if (empty($news)): ?>
            <div class="empty-state">
                <div class="empty-state-icon">📰</div>
                <p style="font-size: 16px; color: #9ca3af; margin: 0;">No news articles available at the moment. Check back soon!</p>
            </div>
        <?php else: ?>
            <div class="news-grid">
                
                <?php foreach ($news as $article): ?>
                    <?php
                    // Image path handling
                    $imagePath = '';
                    if (!empty($article['image'])) {
                        $imagePath = (strpos($article['image'], 'uploads/') === 0)
                            ? $article['image']
                            : 'uploads/news/' . $article['image'];
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

               <div style="margin-top: 2rem; font-family: 'Montserrat', sans-serif;">
    <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem; color: #333;">Share this Story</h4>

    <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">

        <!-- WhatsApp -->
        <button onclick="socialShare('wa')" title="Share on WhatsApp"
            style="padding: 10px 16px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; color: #fff; background: linear-gradient(135deg,#25D366,#1DA851); box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.25s ease;"
            onmouseover="this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.25)';"
            onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';">
            WhatsApp
        </button>

        <!-- Facebook -->
        <button onclick="socialShare('fb')" title="Share on Facebook"
            style="padding: 10px 16px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; color: #fff; background: linear-gradient(135deg,#1877F2,#1456c7); box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.25s ease;"
            onmouseover="this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.25)';"
            onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';">
            Facebook
        </button>

        <!-- X/Twitter -->
        <button onclick="socialShare('tw')" title="Share on X"
            style="padding: 10px 16px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; color: #fff; background: linear-gradient(135deg,#000,#333); box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.25s ease;"
            onmouseover="this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.25)';"
            onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';">
            X
        </button>

        <!-- LinkedIn -->
        <button onclick="socialShare('li')" title="Share on LinkedIn"
            style="padding: 10px 16px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; color: #fff; background: linear-gradient(135deg,#0077B5,#005f8d); box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.25s ease;"
            onmouseover="this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.25)';"
            onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';">
            LinkedIn
        </button>

        <!-- Telegram -->
        <button onclick="socialShare('tg')" title="Share on Telegram"
            style="padding: 10px 16px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; color: #fff; background: linear-gradient(135deg,#0088cc,#006fa6); box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.25s ease;"
            onmouseover="this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.25)';"
            onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';">
            Telegram
        </button>

        <!-- Copy Link -->
        <div style="position: relative; display: inline-block;">
            <button onclick="copyLink()" title="Copy link"
                style="padding: 10px 16px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; color: #fff; background: linear-gradient(135deg,#6b7280,#4b5563); box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.25s ease;"
                onmouseover="tooltip.style.opacity='1'; this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.25)';"
                onmouseout="tooltip.style.opacity='0'; this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';">
                Copy Link
            </button>
            <span id="tooltip" style="position:absolute; bottom:45px; left:50%; transform:translateX(-50%); background:#333; color:#fff; padding:4px 8px; border-radius:4px; font-size:12px; opacity:0; transition: opacity 0.2s;">Copied!</span>
        </div>
    </div>
</div>

<script>
function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    const tooltip = document.getElementById('tooltip');
    tooltip.style.opacity = '1';
    setTimeout(() => { tooltip.style.opacity = '0'; }, 1500);
}
</script>

                </div>
            </div>
        </div>
    </div>
</section>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const sectionLink = document.querySelector('#news-section .section-link');
    if (sectionLink) {
        sectionLink.addEventListener('mouseenter', function() {
            this.style.color = '#D9A000';
            this.style.transform = 'translateX(6px)';
        });
        sectionLink.addEventListener('mouseleave', function() {
            this.style.color = '#014900';
            this.style.transform = 'translateX(0)';
        });
    }
});

let currentUrl = '';
let currentArticleId = null;

function processContentWithImages(content, additionalImages) {
    content = content.replace(/<[^>]*>/g, '');
    const words = content.split(' ');
    const wordsPerLine = 12;
    const lines = [];

    for (let i = 0; i < words.length; i += wordsPerLine) {
        lines.push(words.slice(i, i + wordsPerLine).join(' '));
    }

    let output = '';
    let imageIndex = 0;

    for (let i = 0; i < lines.length; i++) {
        output += '<p>' + lines[i] + '</p>';

        // Insert first 2 images after line 20
        if (i === 20 && imageIndex < additionalImages.length) {
            output += '<div class="article-image-block">';
            for (let j = 0; j < 2 && imageIndex < additionalImages.length; j++, imageIndex++) {
                const img = additionalImages[imageIndex];
                output += '<figure class="article-figure">';
                output += '<img src="' + img.image_path + '" alt="Article image" class="article-inline-image">';
                if (img.caption) {
                    output += '<figcaption>' + img.caption + '</figcaption>';
                }
                output += '</figure>';
            }
            output += '</div>';
        }

        // Insert remaining images every 20 lines after the first block
        if (i > 40 && (i - 20) % 20 === 0 && imageIndex < additionalImages.length) {
            const img = additionalImages[imageIndex];
            output += '<figure class="article-figure full-width">';
            output += '<img src="' + img.image_path + '" alt="Article image" class="article-inline-image">';
            if (img.caption) {
                output += '<figcaption>' + img.caption + '</figcaption>';
            }
            output += '</figure>';
            imageIndex++;
        }
    }

    return output;
}



async function fetchAdditionalImages(articleId) {
    try {
        const response = await fetch('api/get_article_images.php?id=' + articleId);
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
    
    // Fetch additional images
    const additionalImages = await fetchAdditionalImages(article.id);
    
    // Process content with images
    const processedContent = processContentWithImages(article.content, additionalImages);
    document.getElementById('mContent').innerHTML = processedContent;
    
    // Set hero image
    const imgPath = article.image ? 
        (article.image.startsWith('uploads/') ? article.image : 'uploads/news/' + article.image) : 
        'assets/placeholder.jpg';
    document.getElementById('modalImg').innerHTML = '<img src="' + imgPath + '" alt="' + article.title + '">';

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
        const btn = document.getElementById('copyBtn');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        btn.style.background = '#10b981';
        
        setTimeout(function() {
            btn.innerHTML = originalHTML;
            btn.style.background = '#014900';
        }, 2500);
    }).catch(function() {
        alert('Link copied: ' + currentUrl);
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
                        <li><a href="pages/scholarships.php">Opportunities</a></li>
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
                <p>&copy; <?php echo date('Y'); ?> Ghana National Union of Technical Students (GNUTS). All rights reserved.  <b>By Joe Vardy Group</b></p>
            </div>
        </div>
    </footer>

    <script>
        // Innovation Modal Functions
        function openInnovationModal(innovation) {
            const modal = document.getElementById('innovation-modal');
            const modalImage = document.getElementById('modal-image');
            const modalTitle = document.getElementById('modal-title');
            const modalStudent = document.getElementById('modal-student');
            const modalInstitution = document.getElementById('modal-institution');
            const modalDescription = document.getElementById('modal-description');
            const modalVideoSection = document.getElementById('modal-video-section');
            const modalVideo = document.getElementById('modal-video');

            // Set content
            modalTitle.textContent = innovation.title;
            modalStudent.textContent = innovation.student_name || '-';
            modalInstitution.textContent = innovation.institution || '-';
            modalDescription.textContent = innovation.description;

            // Set image
            if (innovation.project_image) {
                modalImage.innerHTML = `<img src="${innovation.project_image}" alt="${innovation.title}" style="width:100%;height:100%;object-fit:cover;">`;
            } else {
                modalImage.innerHTML = `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                </svg>`;
            }

            // Set video if exists
            if (innovation.video_url) {
                const videoId = extractYouTubeID(innovation.video_url);
                if (videoId) {
                    modalVideo.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                    modalVideoSection.style.display = 'block';
                } else {
                    modalVideoSection.style.display = 'none';
                }
            } else {
                modalVideoSection.style.display = 'none';
            }

            // Show modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeInnovationModal() {
            const modal = document.getElementById('innovation-modal');
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }

        function extractYouTubeID(url) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        }

        // Close modal when clicking outside
        document.addEventListener('click', function(e) {
            const modal = document.getElementById('innovation-modal');
            if (e.target === modal) {
                closeInnovationModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeInnovationModal();
            }
        });

        // Hero carousel
        const slides = document.querySelectorAll('.hero-slide');
        let currentSlide = 0;
        
        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
        }
        
        document.getElementById('hero-next').addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        });
        
        document.getElementById('hero-prev').addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        });
        
        // Auto-play carousel
        setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }, 5000);

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

<?php
// Close database connection
$conn->close();
?>