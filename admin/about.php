<?php
session_start();

// Check if admin is logged in
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit();
}

// Database connection
require_once '../config/db.php';

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['action']) && $_POST['action'] == 'update') {
        // Handle mission image upload
        $missionImage = $_POST['existing_mission_image'];
        if (isset($_FILES['mission_image']) && $_FILES['mission_image']['error'] == 0) {
            $targetDir = "../uploads/about/";
            if (!file_exists($targetDir)) {
                mkdir($targetDir, 0777, true);
            }
            $imageFileType = strtolower(pathinfo($_FILES["mission_image"]["name"], PATHINFO_EXTENSION));
            $newFileName = 'mission_' . uniqid() . '.' . $imageFileType;
            $targetFile = $targetDir . $newFileName;
            
            if (move_uploaded_file($_FILES["mission_image"]["tmp_name"], $targetFile)) {
                if ($missionImage && file_exists("../" . $missionImage)) {
                    unlink("../" . $missionImage);
                }
                $missionImage = "uploads/about/" . $newFileName;
            }
        }

        // Handle vision image upload
        $visionImage = $_POST['existing_vision_image'];
        if (isset($_FILES['vision_image']) && $_FILES['vision_image']['error'] == 0) {
            $targetDir = "../uploads/about/";
            if (!file_exists($targetDir)) {
                mkdir($targetDir, 0777, true);
            }
            $imageFileType = strtolower(pathinfo($_FILES["vision_image"]["name"], PATHINFO_EXTENSION));
            $newFileName = 'vision_' . uniqid() . '.' . $imageFileType;
            $targetFile = $targetDir . $newFileName;
            
            if (move_uploaded_file($_FILES["vision_image"]["tmp_name"], $targetFile)) {
                if ($visionImage && file_exists("../" . $visionImage)) {
                    unlink("../" . $visionImage);
                }
                $visionImage = "uploads/about/" . $newFileName;
            }
        }

        // Handle hero image upload
        $heroImage = $_POST['existing_hero_image'];
        if (isset($_FILES['hero_image']) && $_FILES['hero_image']['error'] == 0) {
            $targetDir = "../uploads/about/";
            if (!file_exists($targetDir)) {
                mkdir($targetDir, 0777, true);
            }
            $imageFileType = strtolower(pathinfo($_FILES["hero_image"]["name"], PATHINFO_EXTENSION));
            $newFileName = 'hero_' . uniqid() . '.' . $imageFileType;
            $targetFile = $targetDir . $newFileName;
            
            if (move_uploaded_file($_FILES["hero_image"]["tmp_name"], $targetFile)) {
                if ($heroImage && file_exists("../" . $heroImage)) {
                    unlink("../" . $heroImage);
                }
                $heroImage = "uploads/about/" . $newFileName;
            }
        }

        // Check if about page data exists
        $checkStmt = $pdo->query("SELECT COUNT(*) FROM about_page");
        $exists = $checkStmt->fetchColumn() > 0;

        if ($exists) {
            // Update existing record
            $stmt = $pdo->prepare("UPDATE about_page SET 
                hero_title=?, hero_subtitle=?, hero_image=?,
                about_title=?, about_content=?,
                mission_title=?, mission_content=?, mission_image=?,
                vision_title=?, vision_content=?, vision_image=?,
                values_title=?, values_content=?,
                updated_at=NOW() WHERE id=1");
            $stmt->execute([
                $_POST['hero_title'],
                $_POST['hero_subtitle'],
                $heroImage,
                $_POST['about_title'],
                $_POST['about_content'],
                $_POST['mission_title'],
                $_POST['mission_content'],
                $missionImage,
                $_POST['vision_title'],
                $_POST['vision_content'],
                $visionImage,
                $_POST['values_title'],
                $_POST['values_content']
            ]);
        } else {
            // Insert new record
            $stmt = $pdo->prepare("INSERT INTO about_page (
                hero_title, hero_subtitle, hero_image,
                about_title, about_content,
                mission_title, mission_content, mission_image,
                vision_title, vision_content, vision_image,
                values_title, values_content,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");
            $stmt->execute([
                $_POST['hero_title'],
                $_POST['hero_subtitle'],
                $heroImage,
                $_POST['about_title'],
                $_POST['about_content'],
                $_POST['mission_title'],
                $_POST['mission_content'],
                $missionImage,
                $_POST['vision_title'],
                $_POST['vision_content'],
                $visionImage,
                $_POST['values_title'],
                $_POST['values_content']
            ]);
        }

        $_SESSION['success'] = "About page updated successfully!";
        header('Location: about.php');
        exit();
    }
}

// Fetch current about page data
$aboutData = $pdo->query("SELECT * FROM about_page WHERE id=1")->fetch(PDO::FETCH_ASSOC);

// Get logged in admin info
$adminName = $_SESSION['admin_name'] ?? 'Admin';
$adminInitial = strtoupper(substr($adminName, 0, 1));

// Default values if no data exists
if (!$aboutData) {
    $aboutData = [
        'hero_title' => 'About GNUTS',
        'hero_subtitle' => 'Empowering Ghanaian Students Worldwide',
        'hero_image' => '',
        'about_title' => 'Who We Are',
        'about_content' => '',
        'mission_title' => 'Our Mission',
        'mission_content' => '',
        'mission_image' => '',
        'vision_title' => 'Our Vision',
        'vision_content' => '',
        'vision_image' => '',
        'values_title' => 'Our Core Values',
        'values_content' => ''
    ];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Page Management - GNUTS Admin</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="assets/gnuts_fav.png">

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

        /* Sidebar */
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
        }

        /* Main Content */
        .main-content {
            flex: 1;
            margin-left: 280px;
            transition: margin-left 0.3s ease;
        }

        /* Top Bar */
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

        .page-breadcrumb {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--gray-600);
            font-size: 0.9rem;
        }

        .page-breadcrumb a {
            color: var(--primary);
            text-decoration: none;
        }

        .page-breadcrumb a:hover {
            color: var(--secondary);
        }

        .top-bar-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-family: 'Montserrat', sans-serif;
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .btn-primary {
            background: var(--primary);
            color: white;
        }

        .btn-primary:hover {
            background: #013300;
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }

        .btn-secondary {
            background: var(--gray-200);
            color: var(--dark);
        }

        .btn-secondary:hover {
            background: var(--gray-300);
        }

        /* Page Content */
        .page-content {
            padding: 2rem;
            max-width: 1400px;
            margin: 0 auto;
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

        /* Alert Messages */
        .alert {
            padding: 1rem 1.5rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .alert-success {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success);
            border-left: 4px solid var(--success);
        }

        /* Form Card */
        .form-card {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: var(--shadow);
            margin-bottom: 2rem;
        }

        .form-section {
            margin-bottom: 3rem;
            padding-bottom: 2rem;
            border-bottom: 2px solid var(--gray-200);
        }

        .form-section:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }

        .form-section-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--dark);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .form-section-subtitle {
            color: var(--gray-600);
            font-size: 0.9rem;
            margin-bottom: 1.5rem;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: var(--dark);
            font-size: 0.9rem;
        }

        .form-label.required::after {
            content: ' *';
            color: var(--danger);
        }

        .form-input,
        .form-select,
        .form-textarea {
            width: 100%;
            padding: 0.875rem 1rem;
            border: 2px solid var(--gray-200);
            border-radius: 8px;
            font-family: 'Montserrat', sans-serif;
            font-size: 0.95rem;
            transition: all 0.3s ease;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(1, 73, 0, 0.1);
        }

        .form-textarea {
            resize: vertical;
            min-height: 150px;
        }

        .form-file-wrapper {
            position: relative;
            overflow: hidden;
            display: inline-block;
            width: 100%;
        }

        .form-file {
            display: none;
        }

        .file-upload-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 1rem;
            border: 2px dashed var(--gray-300);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            background: var(--gray-100);
        }

        .file-upload-btn:hover {
            border-color: var(--primary);
            background: white;
        }

        .form-hint {
            font-size: 0.85rem;
            color: var(--gray-500);
            margin-top: 0.5rem;
        }

        .image-preview {
            max-width: 300px;
            max-height: 200px;
            margin-top: 1rem;
            border-radius: 8px;
            box-shadow: var(--shadow);
        }

        .form-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 2px solid var(--gray-200);
        }

        .section-icon {
            width: 36px;
            height: 36px;
            background: var(--primary);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(-100%);
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

            .page-content {
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
                    <img src="../includes/assets/gnuts_logo.png" alt="GNUTS Logo">
                </div>
                <div>
                    <div class="sidebar-title">GNUTS</div>
                    <div style="font-size: 0.75rem; color: var(--secondary);">Admin Panel</div>
                </div>
            </div>
            
            <nav class="sidebar-nav">
                <div class="nav-section">
                    <div class="nav-section-title">Main</div>
                    <a href="index.php" class="nav-item">
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
                    <a href="about.php" class="nav-item active">
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
                    <a href="resources.php" class="nav-item">
                        <div class="nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                            </svg>
                        </div>
                        Resources/Constitution
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

                <div class="page-breadcrumb">
                    <a href="index.php">Dashboard</a>
                    <span>/</span>
                    <span>About Page</span>
                </div>

                <div class="top-bar-actions">
                    <a href="../about.php" target="_blank" class="btn btn-secondary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        Preview Page
                    </a>
                </div>
            </header>

            <!-- Page Content -->
            <main class="page-content">
                <?php if(isset($_SESSION['success'])): ?>
                <div class="alert alert-success">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <?php echo $_SESSION['success']; unset($_SESSION['success']); ?>
                </div>
                <?php endif; ?>

                <div class="page-header">
                    <h1 class="page-title">About Page Management</h1>
                    <p class="page-subtitle">Manage all content displayed on the About page of your website</p>
                </div>

                <form method="POST" enctype="multipart/form-data">
                    <input type="hidden" name="action" value="update">
                    <input type="hidden" name="existing_hero_image" value="<?php echo $aboutData['hero_image']; ?>">
                    <input type="hidden" name="existing_mission_image" value="<?php echo $aboutData['mission_image']; ?>">
                    <input type="hidden" name="existing_vision_image" value="<?php echo $aboutData['vision_image']; ?>">

                    <!-- Hero Section -->
                    <div class="form-card">
                        <div class="form-section">
                            <h2 class="form-section-title">
                                <div class="section-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                                        <line x1="4" y1="22" x2="4" y2="15"></line>
                                    </svg>
                                </div>
                                Hero Section
                            </h2>
                            <p class="form-section-subtitle">The main banner section at the top of the page</p>

                            <div class="form-group">
                                <label class="form-label required">Hero Title</label>
                                <input type="text" name="hero_title" class="form-input" required 
                                       value="<?php echo htmlspecialchars($aboutData['hero_title']); ?>"
                                       placeholder="e.g., About GNUTS">
                            </div>

                            <div class="form-group">
                                <label class="form-label required">Hero Subtitle</label>
                                <input type="text" name="hero_subtitle" class="form-input" required 
                                       value="<?php echo htmlspecialchars($aboutData['hero_subtitle']); ?>"
                                       placeholder="e.g., Empowering Ghanaian Students Worldwide">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Hero Background Image</label>
                                <div class="form-file-wrapper">
                                    <input type="file" name="hero_image" id="hero_image" class="form-file" accept="image/*" onchange="previewImage(this, 'hero_preview')">
                                    <label for="hero_image" class="file-upload-btn">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="17 8 12 3 7 8"></polyline>
                                            <line x1="12" y1="3" x2="12" y2="15"></line>
                                        </svg>
                                        <span>Choose Hero Image</span>
                                    </label>
                                </div>
                                <p class="form-hint">Recommended size: 1920x600px (JPG, PNG, WebP)</p>
                                <?php if($aboutData['hero_image']): ?>
                                    <img src="../<?php echo $aboutData['hero_image']; ?>" alt="Current hero image" class="image-preview" id="hero_preview">
                                <?php endif; ?>
                            </div>
                        </div>

                        <!-- About Section -->
                        <div class="form-section">
                            <h2 class="form-section-title">
                                <div class="section-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="16" x2="12" y2="12"></line>
                                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                    </svg>
                                </div>
                                About Section
                            </h2>
                            <p class="form-section-subtitle">Main introduction and information about GNUTS</p>

                            <div class="form-group">
                                <label class="form-label required">Section Title</label>
                                <input type="text" name="about_title" class="form-input" required 
                                       value="<?php echo htmlspecialchars($aboutData['about_title']); ?>"
                                       placeholder="e.g., Who We Are">
                            </div>

                            <div class="form-group">
                                <label class="form-label required">Content</label>
                                <textarea name="about_content" class="form-textarea" required placeholder="Write about GNUTS history, purpose, and impact..."><?php echo htmlspecialchars($aboutData['about_content']); ?></textarea>
                            </div>
                        </div>

                        <!-- Mission Section -->
                        <div class="form-section">
                            <h2 class="form-section-title">
                                <div class="section-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                </div>
                                Mission Section
                            </h2>
                            <p class="form-section-subtitle">Your organization's mission statement and goals</p>

                            <div class="form-group">
                                <label class="form-label required">Mission Title</label>
                                <input type="text" name="mission_title" class="form-input" required 
                                       value="<?php echo htmlspecialchars($aboutData['mission_title']); ?>"
                                       placeholder="e.g., Our Mission">
                            </div>

                            <div class="form-group">
                                <label class="form-label required">Mission Statement</label>
                                <textarea name="mission_content" class="form-textarea" required placeholder="Describe your mission and what you aim to achieve..."><?php echo htmlspecialchars($aboutData['mission_content']); ?></textarea>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Mission Image</label>
                                <div class="form-file-wrapper">
                                    <input type="file" name="mission_image" id="mission_image" class="form-file" accept="image/*" onchange="previewImage(this, 'mission_preview')">
                                    <label for="mission_image" class="file-upload-btn">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="17 8 12 3 7 8"></polyline>
                                            <line x1="12" y1="3" x2="12" y2="15"></line>
                                        </svg>
                                        <span>Choose Mission Image</span>
                                    </label>
                                </div>
                                <p class="form-hint">Recommended size: 800x600px (JPG, PNG, WebP)</p>
                                <?php if($aboutData['mission_image']): ?>
                                    <img src="../<?php echo $aboutData['mission_image']; ?>" alt="Current mission image" class="image-preview" id="mission_preview">
                                <?php endif; ?>
                            </div>
                        </div>

                        <!-- Vision Section -->
                        <div class="form-section">
                            <h2 class="form-section-title">
                                <div class="section-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                </div>
                                Vision Section
                            </h2>
                            <p class="form-section-subtitle">Your long-term vision and aspirations</p>

                            <div class="form-group">
                                <label class="form-label required">Vision Title</label>
                                <input type="text" name="vision_title" class="form-input" required 
                                       value="<?php echo htmlspecialchars($aboutData['vision_title']); ?>"
                                       placeholder="e.g., Our Vision">
                            </div>

                            <div class="form-group">
                                <label class="form-label required">Vision Statement</label>
                                <textarea name="vision_content" class="form-textarea" required placeholder="Describe your vision for the future..."><?php echo htmlspecialchars($aboutData['vision_content']); ?></textarea>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Vision Image</label>
                                <div class="form-file-wrapper">
                                    <input type="file" name="vision_image" id="vision_image" class="form-file" accept="image/*" onchange="previewImage(this, 'vision_preview')">
                                    <label for="vision_image" class="file-upload-btn">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="17 8 12 3 7 8"></polyline>
                                            <line x1="12" y1="3" x2="12" y2="15"></line>
                                        </svg>
                                        <span>Choose Vision Image</span>
                                    </label>
                                </div>
                                <p class="form-hint">Recommended size: 800x600px (JPG, PNG, WebP)</p>
                                <?php if($aboutData['vision_image']): ?>
                                    <img src="../<?php echo $aboutData['vision_image']; ?>" alt="Current vision image" class="image-preview" id="vision_preview">
                                <?php endif; ?>
                            </div>
                        </div>

                        <!-- Values Section -->
                        <div class="form-section">
                            <h2 class="form-section-title">
                                <div class="section-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                    </svg>
                                </div>
                                Core Values Section
                            </h2>
                            <p class="form-section-subtitle">The principles and values that guide your organization</p>

                            <div class="form-group">
                                <label class="form-label required">Values Title</label>
                                <input type="text" name="values_title" class="form-input" required 
                                       value="<?php echo htmlspecialchars($aboutData['values_title']); ?>"
                                       placeholder="e.g., Our Core Values">
                            </div>

                            <div class="form-group">
                                <label class="form-label required">Values Content</label>
                                <textarea name="values_content" class="form-textarea" required placeholder="List and describe your core values..."><?php echo htmlspecialchars($aboutData['values_content']); ?></textarea>
                                <p class="form-hint">You can use bullet points or paragraphs to list your values</p>
                            </div>
                        </div>

                        <!-- Form Actions -->
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                    <polyline points="7 3 7 8 15 8"></polyline>
                                </svg>
                                Save About Page
                            </button>
                            <a href="index.php" class="btn btn-secondary">Cancel</a>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    </div>

    <script>
        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');

        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });

        // Image preview function
        function previewImage(input, previewId) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    let preview = document.getElementById(previewId);
                    if (!preview) {
                        preview = document.createElement('img');
                        preview.id = previewId;
                        preview.className = 'image-preview';
                        input.parentElement.parentElement.appendChild(preview);
                    }
                    preview.src = e.target.result;
                }
                reader.readAsDataURL(input.files[0]);
            }
        }
    </script>
</body>
</html>