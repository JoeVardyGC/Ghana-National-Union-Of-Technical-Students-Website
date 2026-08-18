<?php
session_start();

// Check if admin is logged in
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit();
}

// Database connection
require_once '../config/db.php';

// Fetch statistics
$stats = [
    'scholarships' => $pdo->query("SELECT COUNT(*) FROM scholarships")->fetchColumn(),
    'opportunities' => $pdo->query("SELECT COUNT(*) FROM opportunities")->fetchColumn(),
    'innovations' => $pdo->query("SELECT COUNT(*) FROM innovations")->fetchColumn(),
    'news' => $pdo->query("SELECT COUNT(*) FROM news")->fetchColumn(),
    'pending_innovations' => $pdo->query("SELECT COUNT(*) FROM innovations WHERE status='pending'")->fetchColumn(),
    'users' => $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn(),
    'executives' => $pdo->query("SELECT COUNT(*) FROM executives")->fetchColumn(),
];

// Fetch recent activities
$recentInnovations = $pdo->query("SELECT * FROM innovations ORDER BY created_at DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
$recentNews = $pdo->query("SELECT * FROM news ORDER BY published_at DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
$recentScholarships = $pdo->query("SELECT * FROM scholarships ORDER BY created_at DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
$recentExecutives = $pdo->query("SELECT * FROM executives ORDER BY display_order ASC LIMIT 4")->fetchAll(PDO::FETCH_ASSOC);
$recentOpportunities = $pdo->query("SELECT * FROM opportunities ORDER BY created_at DESC LIMIT 3")->fetchAll(PDO::FETCH_ASSOC);

// Get logged in admin info
$adminName = $_SESSION['admin_name'] ?? 'Admin';
$adminInitial = strtoupper(substr($adminName, 0, 1));
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GNUTS Admin Dashboard</title>
   <link rel="icon" type="image/png" href="assets/gnuts_fav.png">

    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
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
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --info: #3b82f6;
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
            font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: var(--gray-100);
            color: var(--dark);
            line-height: 1.6;
        }

        .admin-layout {
            display: flex;
            min-height: 100vh;
        }

        .sidebar {
            width: 280px;
            background: var(--primary);
            color: white;
            position: fixed;
            height: 100vh;
            overflow-y: auto;
            transition: transform 0.3s ease;
            z-index: 1000;
        }

        .sidebar-header {
            padding: 2rem 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .sidebar-logo {
            width: 50px;
            height: 50px;
            background: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            flex-shrink: 0;
        }

        .sidebar-logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .sidebar-title {
            font-size: 1.5rem;
            font-weight: 800;
            color: white;
        }

        .sidebar-nav {
            padding: 1.5rem 0;
        }

        .nav-section {
            margin-bottom: 2rem;
        }

        .nav-section-title {
            padding: 0 1.5rem;
            margin-bottom: 0.5rem;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--secondary);
        }

        .nav-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.875rem 1.5rem;
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            transition: all 0.3s ease;
            border-left: 4px solid transparent;
        }

        .nav-item:hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border-left-color: var(--secondary);
        }

        .nav-item.active {
            background: rgba(255, 255, 255, 0.15);
            color: white;
            border-left-color: var(--secondary);
            font-weight: 600;
        }

        .nav-icon {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .badge {
            margin-left: auto;
            padding: 0.25rem 0.5rem;
            background: var(--danger);
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .main-content {
            flex: 1;
            margin-left: 280px;
            transition: margin-left 0.3s ease;
            min-width: 0;
        }

        .top-bar {
            background: white;
            padding: 1rem 2rem;
            box-shadow: var(--shadow-sm);
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 999;
        }

        .menu-toggle {
            display: none;
            background: none;
            border: none;
            color: var(--primary);
            cursor: pointer;
            padding: 0.5rem;
        }

        .search-bar {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            background: var(--gray-100);
            padding: 0.75rem 1rem;
            border-radius: 8px;
            max-width: 400px;
            flex: 1;
        }

        .search-bar input {
            border: none;
            background: none;
            outline: none;
            width: 100%;
            font-size: 0.95rem;
            font-family: 'Montserrat', sans-serif;
        }

        .top-bar-actions {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }

        .notification-btn {
            position: relative;
            background: none;
            border: none;
            color: var(--gray-600);
            cursor: pointer;
            padding: 0.5rem;
        }

        .notification-dot {
            position: absolute;
            top: 0.25rem;
            right: 0.25rem;
            width: 8px;
            height: 8px;
            background: var(--danger);
            border-radius: 50%;
        }

        .user-menu {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 8px;
            transition: background 0.3s ease;
        }

        .user-menu:hover {
            background: var(--gray-100);
        }

        .user-avatar {
            width: 40px;
            height: 40px;
            background: var(--primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            flex-shrink: 0;
        }

        .user-info {
            display: flex;
            flex-direction: column;
        }

        .user-name {
            font-weight: 600;
            font-size: 0.9rem;
            white-space: nowrap;
        }

        .user-role {
            font-size: 0.75rem;
            color: var(--gray-500);
        }

        .page-content {
            padding: 2rem;
            min-width: 0;
        }

        .page-header {
            margin-bottom: 2rem;
        }

        .page-title {
            font-size: 2rem;
            font-weight: 800;
            color: var(--dark);
            margin-bottom: 0.5rem;
        }

        .page-subtitle {
            color: var(--gray-600);
            font-size: 1rem;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: var(--shadow);
            transition: all 0.3s ease;
            border-left: 4px solid var(--primary);
            min-width: 0;
        }

        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
        }

        .stat-card.success { border-left-color: var(--success); }
        .stat-card.warning { border-left-color: var(--warning); }
        .stat-card.danger { border-left-color: var(--danger); }
        .stat-card.info { border-left-color: var(--info); }

        .stat-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 1rem;
        }

        .stat-title {
            font-size: 0.875rem;
            color: var(--gray-600);
            font-weight: 500;
        }

        .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--gray-100);
            flex-shrink: 0;
        }

        .stat-icon.success { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .stat-icon.warning { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
        .stat-icon.danger { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
        .stat-icon.info { background: rgba(59, 130, 246, 0.1); color: var(--info); }

        .stat-value {
            font-size: 2rem;
            font-weight: 800;
            color: var(--dark);
            line-height: 1;
            margin-bottom: 0.5rem;
        }

        .stat-footer {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.85rem;
            color: var(--gray-500);
        }

        .content-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .content-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: var(--shadow);
            min-width: 0;
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--gray-200);
        }

        .card-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--dark);
        }

        .card-link {
            color: var(--primary);
            text-decoration: none;
            font-weight: 600;
            font-size: 0.9rem;
            transition: color 0.3s ease;
            white-space: nowrap;
        }

        .card-link:hover {
            color: var(--secondary);
        }

        .activity-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .activity-item {
            display: flex;
            gap: 1rem;
            padding: 1rem;
            border-radius: 8px;
            transition: background 0.3s ease;
            min-width: 0;
        }

        .activity-item:hover {
            background: var(--gray-100);
        }

        .activity-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--gray-100);
            flex-shrink: 0;
        }

        .activity-content {
            flex: 1;
            min-width: 0;
        }

        .activity-title {
            font-weight: 600;
            color: var(--dark);
            margin-bottom: 0.25rem;
            word-wrap: break-word;
        }

        .activity-meta {
            font-size: 0.85rem;
            color: var(--gray-500);
            word-wrap: break-word;
        }

        .activity-time {
            font-size: 0.8rem;
            color: var(--gray-400);
        }

        .quick-actions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 1rem;
        }

        .quick-action-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
            padding: 1.5rem 1rem;
            background: var(--gray-100);
            border: 2px solid transparent;
            border-radius: 12px;
            text-decoration: none;
            color: var(--dark);
            font-weight: 600;
            transition: all 0.3s ease;
            cursor: pointer;
            text-align: center;
        }

        .quick-action-btn:hover {
            background: white;
            border-color: var(--primary);
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }

        .quick-action-icon {
            width: 48px;
            height: 48px;
            background: var(--primary);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            flex-shrink: 0;
        }

        .scholarship-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .scholarship-item {
            padding: 0.875rem 1rem;
            background: var(--gray-50);
            border-radius: 8px;
            border-left: 3px solid var(--primary);
            transition: all 0.3s ease;
            min-width: 0;
        }

        .scholarship-item:hover {
            background: white;
            box-shadow: var(--shadow-sm);
        }

        .scholarship-name {
            font-weight: 600;
            color: var(--dark);
            margin-bottom: 0.25rem;
            word-wrap: break-word;
        }

        .scholarship-info {
            font-size: 0.85rem;
            color: var(--gray-500);
            word-wrap: break-word;
        }

        .executives-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1rem;
        }

        .executive-card {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.5rem;
            background: var(--gray-100);
            border-radius: 12px;
            transition: all 0.3s ease;
            min-width: 0;
        }

        .executive-card:hover {
            background: white;
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }

        .executive-photo {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid white;
            box-shadow: var(--shadow);
            flex-shrink: 0;
        }

        .executive-info {
            flex: 1;
            min-width: 0;
        }

        .executive-name {
            font-weight: 700;
            color: var(--dark);
            margin-bottom: 0.25rem;
            word-wrap: break-word;
        }

        .executive-position {
            font-size: 0.85rem;
            color: var(--primary);
            font-weight: 600;
            word-wrap: break-word;
        }

        .innovation-card-small {
            display: flex;
            gap: 1rem;
            padding: 1rem;
            border-radius: 8px;
            transition: background 0.3s ease;
            min-width: 0;
        }

        .innovation-card-small:hover {
            background: var(--gray-100);
        }

        .innovation-thumb {
            width: 100px;
            height: 100px;
            border-radius: 8px;
            object-fit: cover;
            flex-shrink: 0;
            background: var(--gray-200);
        }

        .innovation-thumb-placeholder {
            width: 100px;
            height: 100px;
            border-radius: 8px;
            background: var(--gray-200);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: var(--gray-500);
        }

        .status-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-left: 0.5rem;
        }

        .status-pending {
            background: var(--warning);
            color: white;
        }

        .status-approved {
            background: var(--success);
            color: white;
        }

        .status-rejected {
            background: var(--danger);
            color: white;
        }

        @media (max-width: 1024px) {
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .quick-actions {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(-100%);
                box-shadow: var(--shadow-xl);
            }

            .sidebar.active {
                transform: translateX(0);
            }

            .main-content {
                margin-left: 0;
            }

            .menu-toggle {
                display: block;
            }

            .top-bar {
                padding: 1rem;
            }

            .search-bar {
                display: none;
            }

            .user-info {
                display: none;
            }

            .page-content {
                padding: 1.5rem 1rem;
            }

            .page-title {
                font-size: 1.75rem;
            }

            .stats-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }

            .content-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }

            .quick-actions {
                grid-template-columns: 1fr;
            }

            .executives-grid {
                grid-template-columns: 1fr;
            }

            .executive-card {
                padding: 1.25rem;
            }

            .executive-photo {
                width: 70px;
                height: 70px;
            }

            .card-header {
                flex-wrap: wrap;
                gap: 0.5rem;
            }

            .innovation-thumb,
            .innovation-thumb-placeholder {
                width: 80px;
                height: 80px;
            }
        }

        @media (max-width: 480px) {
            .page-content {
                padding: 1rem 0.75rem;
            }

            .page-title {
                font-size: 1.5rem;
            }

            .stat-card {
                padding: 1.25rem;
            }

            .stat-value {
                font-size: 1.75rem;
            }

            .stat-icon {
                width: 40px;
                height: 40px;
            }

            .content-card {
                padding: 1.25rem;
            }

            .card-title {
                font-size: 1.1rem;
            }

            .quick-action-btn {
                padding: 1.25rem 1rem;
            }

            .quick-action-icon {
                width: 40px;
                height: 40px;
            }

            .executive-photo {
                width: 60px;
                height: 60px;
            }

            .innovation-thumb,
            .innovation-thumb-placeholder {
                width: 70px;
                height: 70px;
            }

            .activity-item {
                padding: 0.875rem;
            }
        }

        @media (max-width: 360px) {
            .page-content {
                padding: 0.75rem 0.5rem;
            }

            .stat-card,
            .content-card {
                padding: 1rem;
            }

            .executive-card {
                padding: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="admin-layout">
        <!-- Sidebar -->
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo">
                    <img src="../includes/assets/gnuts_logo.png" alt="GNUTS Logo" onerror="this.parentElement.innerHTML='<div style=\'color: var(--primary); font-weight: 800; font-size: 1.5rem;\'>G</div>'">
                </div>
                <div>
                    <div class="sidebar-title">GNUTS</div>
                    <div style="font-size: 0.75rem; color: var(--secondary);">Admin Panel</div>
                </div>
            </div>
            
            <nav class="sidebar-nav">
                <div class="nav-section">
                    <div class="nav-section-title">Main</div>
                    <a href="index.php" class="nav-item active">
                        <div class="nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            </svg>
                        </div>
                        Dashboard
                    </a>
                </div>

                <div class="nav-section">
                    <div class="nav-section-title">Content Management</div>
                    <a href="scholarships.php" class="nav-item">
                        <div class="nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                            </svg>
                        </div>
                        Scholarships
                    </a>
                    <a href="opportunities.php" class="nav-item">
                        <div class="nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                            </svg>
                        </div>
                        Opportunities
                    </a>
                    <a href="innovations.php" class="nav-item">
                        <div class="nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                            </svg>
                        </div>
                        Innovation Projects
                        <?php if($stats['pending_innovations'] > 0): ?>
                            <span class="badge"><?php echo $stats['pending_innovations']; ?></span>
                        <?php endif; ?>
                    </a>
                    <a href="blog.php" class="nav-item">
                        <div class="nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                <polyline points="13 2 13 9 20 9"></polyline>
                            </svg>
                        </div>
                        News & Blog
                    </a>
                </div>

                <div class="nav-section">
                    <div class="nav-section-title">Site Settings</div>
                    <a href="about.php" class="nav-item">
                        <div class="nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                        </div>
                        About Page
                    </a>
                    <a href="history.php" class="nav-item">
                        <div class="nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                        Union History
                    </a>
                    <a href="contact.php" class="nav-item">
                        <div class="nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                        </div>
                        Contact Info
                    </a>
                </div>

                <div class="nav-section">
                    <div class="nav-section-title">Administration</div>
                    <a href="executives.php" class="nav-item">
                        <div class="nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        Executives
                    </a>
                    <a href="users.php" class="nav-item">
                        <div class="nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="8.5" cy="7" r="4"></circle>
                                <line x1="20" y1="8" x2="20" y2="14"></line>
                                <line x1="23" y1="11" x2="17" y2="11"></line>
                            </svg>
                        </div>
                        Users
                    </a>
                </div>

                <div class="nav-section">
                    <div class="nav-section-title">System</div>
                    <a href="../index.php" class="nav-item" target="_blank">
                        <div class="nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </div>
                        View Site
                    </a>
                    <a href="logout.php" class="nav-item">
                        <div class="nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </div>
                        Logout
                    </a>
                </div>
            </nav>
        </aside>

        <!-- Main Content -->
        <div class="main-content">
            <!-- Top Bar -->
            <header class="top-bar">
                <button class="menu-toggle" id="menuToggle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>

                <div class="search-bar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input type="text" placeholder="Search...">
                </div>

                <div class="top-bar-actions">
                    <button class="notification-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        <?php if($stats['pending_innovations'] > 0): ?>
                            <span class="notification-dot"></span>
                        <?php endif; ?>
                    </button>

                    <div class="user-menu">
                        <div class="user-avatar"><?php echo $adminInitial; ?></div>
                        <div class="user-info">
                            <div class="user-name"><?php echo htmlspecialchars($adminName); ?></div>
                            <div class="user-role">Administrator</div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Page Content -->
            <main class="page-content">
                <div class="page-header">
                    <h1 class="page-title">Dashboard</h1>
                    <p class="page-subtitle">Welcome back! Here's what's happening with GNUTS today.</p>
                </div>

                <!-- Stats Grid -->
                <div class="stats-grid">
                    <div class="stat-card success">
                        <div class="stat-header">
                            <div>
                                <div class="stat-title">Total Scholarships</div>
                                <div class="stat-value"><?php echo $stats['scholarships']; ?></div>
                            </div>
                            <div class="stat-icon success">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                                    <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                                </svg>
                            </div>
                        </div>
                        <div class="stat-footer">
                            <span>Active scholarship listings</span>
                        </div>
                    </div>

                    <div class="stat-card info">
                        <div class="stat-header">
                            <div>
                                <div class="stat-title">Innovation Projects</div>
                                <div class="stat-value"><?php echo $stats['innovations']; ?></div>
                            </div>
                            <div class="stat-icon info">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                </svg>
                            </div>
                        </div>
                        <div class="stat-footer">
                            <?php if($stats['pending_innovations'] > 0): ?>
                                <span style="color: var(--warning); font-weight: 600;"><?php echo $stats['pending_innovations']; ?> pending approval</span>
                            <?php else: ?>
                                <span>All projects reviewed</span>
                            <?php endif; ?>
                        </div>
                    </div>

                    <div class="stat-card danger">
                        <div class="stat-header">
                            <div>
                                <div class="stat-title">News Articles</div>
                                <div class="stat-value"><?php echo $stats['news']; ?></div>
                            </div>
                            <div class="stat-icon danger">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                    <polyline points="13 2 13 9 20 9"></polyline>
                                </svg>
                            </div>
                        </div>
                        <div class="stat-footer">
                            <span>Published articles</span>
                        </div>
                    </div>

                    <div class="stat-card warning">
                        <div class="stat-header">
                            <div>
                                <div class="stat-title">Opportunities</div>
                                <div class="stat-value"><?php echo $stats['opportunities']; ?></div>
                            </div>
                            <div class="stat-icon warning">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                </svg>
                            </div>
                        </div>
                        <div class="stat-footer">
                            <span>Active opportunities</span>
                        </div>
                    </div>
                </div>

                <!-- Content Grid -->
                <div class="content-grid">
                    <!-- Recent Scholarships -->
                    <div class="content-card">
                        <div class="card-header">
                            <h3 class="card-title">Recent Scholarships</h3>
                            <a href="scholarships.php" class="card-link">View All →</a>
                        </div>
                        <div class="scholarship-list">
                            <?php if(empty($recentScholarships)): ?>
                                <p style="text-align: center; color: var(--gray-500); padding: 2rem;">No scholarships available</p>
                            <?php else: ?>
                                <?php foreach($recentScholarships as $scholarship): ?>
                                <div class="scholarship-item">
                                    <div class="scholarship-name"><?php echo htmlspecialchars($scholarship['title']); ?></div>
                                    <div class="scholarship-info">
                                        <?php if(!empty($scholarship['link'])): ?>
                                            <a href="<?php echo htmlspecialchars($scholarship['link']); ?>" target="_blank" style="color: var(--primary); text-decoration: none;">View Details</a> • 
                                        <?php endif; ?>
                                        Deadline: <?php echo $scholarship['deadline'] ? date('M d, Y', strtotime($scholarship['deadline'])) : 'N/A'; ?>
                                    </div>
                                </div>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="content-card">
                        <div class="card-header">
                            <h3 class="card-title">Quick Actions</h3>
                        </div>
                        <div class="quick-actions">
                            <a href="scholarships.php?action=new" class="quick-action-btn">
                                <div class="quick-action-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                </div>
                                Add Scholarship
                            </a>
                            <a href="opportunities.php?action=new" class="quick-action-btn">
                                <div class="quick-action-icon" style="background: var(--secondary);">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                </div>
                                Add Opportunity
                            </a>
                            <a href="innovations.php?action=new" class="quick-action-btn">
                                <div class="quick-action-icon" style="background: var(--info);">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                    </svg>
                                </div>
                                Add Innovation
                            </a>
                            <a href="blog.php?action=new" class="quick-action-btn">
                                <div class="quick-action-icon" style="background: var(--danger);">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 20h9"></path>
                                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                    </svg>
                                </div>
                                Write Article
                            </a>
                            <a href="about.php" class="quick-action-btn">
                                <div class="quick-action-icon" style="background: var(--success);">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="16" x2="12" y2="12"></line>
                                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                    </svg>
                                </div>
                                Update About
                            </a>
                            <a href="executives.php?action=new" class="quick-action-btn">
                                <div class="quick-action-icon" style="background: var(--warning);">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </div>
                                Add Executive
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Recent Innovation Projects -->
                <div class="content-card" style="margin-bottom: 2rem;">
                    <div class="card-header">
                        <h3 class="card-title">Recent Innovation Projects</h3>
                        <a href="innovations.php" class="card-link">View All →</a>
                    </div>
                    <div class="activity-list">
                        <?php if(empty($recentInnovations)): ?>
                            <p style="text-align: center; color: var(--gray-500); padding: 2rem;">No innovation projects yet</p>
                        <?php else: ?>
                            <?php foreach($recentInnovations as $innovation): ?>
                            <div class="innovation-card-small">
                                <?php if(!empty($innovation['project_image'])): ?>
                                    <img src="../<?php echo htmlspecialchars($innovation['project_image']); ?>" alt="<?php echo htmlspecialchars($innovation['title']); ?>" class="innovation-thumb" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                    <div class="innovation-thumb-placeholder" style="display: none;">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                        </svg>
                                    </div>
                                <?php else: ?>
                                    <div class="innovation-thumb-placeholder">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                        </svg>
                                    </div>
                                <?php endif; ?>
                                <div class="activity-content">
                                    <div class="activity-title"><?php echo htmlspecialchars($innovation['title']); ?></div>
                                    <div class="activity-meta">
                                        <?php echo htmlspecialchars($innovation['student_name'] ?? 'N/A'); ?> • 
                                        <?php echo htmlspecialchars($innovation['institution'] ?? 'N/A'); ?>
                                        <?php if($innovation['status'] == 'pending'): ?>
                                            <span class="status-badge status-pending">PENDING</span>
                                        <?php elseif($innovation['status'] == 'approved'): ?>
                                            <span class="status-badge status-approved">APPROVED</span>
                                        <?php elseif($innovation['status'] == 'rejected'): ?>
                                            <span class="status-badge status-rejected">REJECTED</span>
                                        <?php endif; ?>
                                    </div>
                                    <div class="activity-time"><?php echo date('M d, Y', strtotime($innovation['created_at'])); ?></div>
                                </div>
                            </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- Current Executives -->
                <div class="content-card" style="margin-bottom: 2rem;">
                    <div class="card-header">
                        <h3 class="card-title">Current Executives</h3>
                        <a href="executives.php" class="card-link">View All →</a>
                    </div>
                    <div class="executives-grid">
                        <?php if(empty($recentExecutives)): ?>
                            <p style="grid-column: 1/-1; text-align: center; color: var(--gray-500); padding: 2rem;">No executives added yet</p>
                        <?php else: ?>
                            <?php foreach($recentExecutives as $executive): ?>
                            <div class="executive-card">
                                <?php if(!empty($executive['photo'])): ?>
                                    <img src="../<?php echo htmlspecialchars($executive['photo']); ?>" alt="<?php echo htmlspecialchars($executive['full_name']); ?>" class="executive-photo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                    <div class="executive-photo" style="display: none; background: var(--primary); color: white; font-size: 1.5rem; font-weight: 700;">
                                        <?php echo strtoupper(substr($executive['full_name'], 0, 1)); ?>
                                    </div>
                                <?php else: ?>
                                    <div class="executive-photo" style="background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700;">
                                        <?php echo strtoupper(substr($executive['full_name'], 0, 1)); ?>
                                    </div>
                                <?php endif; ?>
                                <div class="executive-info">
                                    <div class="executive-name"><?php echo htmlspecialchars($executive['full_name']); ?></div>
                                    <div class="executive-position"><?php echo htmlspecialchars($executive['position']); ?></div>
                                </div>
                            </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- Recent News & Opportunities -->
                <div class="content-grid">
                    <!-- Recent News -->
                    <div class="content-card">
                        <div class="card-header">
                            <h3 class="card-title">Recent News & Events</h3>
                            <a href="blog.php" class="card-link">View All →</a>
                        </div>
                        <div class="activity-list">
                            <?php if(empty($recentNews)): ?>
                                <p style="text-align: center; color: var(--gray-500); padding: 2rem;">No recent news articles</p>
                            <?php else: ?>
                                <?php foreach($recentNews as $article): ?>
                                <div class="activity-item">
                                    <div class="activity-icon" style="background: rgba(217, 160, 0, 0.1); color: var(--secondary);">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                            <polyline points="13 2 13 9 20 9"></polyline>
                                        </svg>
                                    </div>
                                    <div class="activity-content">
                                        <div class="activity-title"><?php echo htmlspecialchars($article['title']); ?></div>
                                        <div class="activity-meta">
                                            <?php echo htmlspecialchars(substr(strip_tags($article['content']), 0, 100)) . '...'; ?>
                                        </div>
                                        <div class="activity-time"><?php echo date('M d, Y', strtotime($article['published_at'])); ?></div>
                                    </div>
                                </div>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </div>
                    </div>

                    <!-- Recent Opportunities -->
                    <div class="content-card">
                        <div class="card-header">
                            <h3 class="card-title">Recent Opportunities</h3>
                            <a href="opportunities.php" class="card-link">View All →</a>
                        </div>
                        <div class="activity-list">
                            <?php if(empty($recentOpportunities)): ?>
                                <p style="text-align: center; color: var(--gray-500); padding: 2rem;">No opportunities available</p>
                            <?php else: ?>
                                <?php foreach($recentOpportunities as $opportunity): ?>
                                <div class="activity-item">
                                    <div class="activity-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--success);">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                        </svg>
                                    </div>
                                    <div class="activity-content">
                                        <div class="activity-title"><?php echo htmlspecialchars($opportunity['title']); ?></div>
                                        <div class="activity-meta">
                                            <?php echo ucfirst($opportunity['type']); ?> • 
                                            <?php echo htmlspecialchars($opportunity['location'] ?? 'Remote'); ?>
                                            <?php if($opportunity['deadline']): ?>
                                                • Deadline: <?php echo date('M d, Y', strtotime($opportunity['deadline'])); ?>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                </div>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <script>
        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');

        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('active');
            }
        });

        // Add smooth scroll animation for stats cards
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.stat-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(card);
        });
    </script>
</body>
</html>