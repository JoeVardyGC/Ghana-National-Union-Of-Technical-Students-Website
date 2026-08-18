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
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'update_history_intro':
                $stmt = $pdo->prepare("UPDATE site_content SET content = ?, updated_at = NOW() WHERE section = 'history_intro'");
                $stmt->execute([$_POST['intro_content']]);
                $success = "History introduction updated successfully!";
                break;
                
            case 'add_milestone':
                $image = null;
                if (isset($_FILES['milestone_image']) && $_FILES['milestone_image']['error'] === 0) {
                    $image = 'uploads/history/' . time() . '_' . $_FILES['milestone_image']['name'];
                    move_uploaded_file($_FILES['milestone_image']['tmp_name'], '../' . $image);
                }
                
                $stmt = $pdo->prepare("INSERT INTO history_milestones (year, title, description, image, display_order) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([
                    $_POST['year'],
                    $_POST['title'],
                    $_POST['description'],
                    $image,
                    $_POST['display_order'] ?? 0
                ]);
                $success = "Milestone added successfully!";
                break;
                
            case 'update_milestone':
                $image = $_POST['existing_image'];
                if (isset($_FILES['milestone_image']) && $_FILES['milestone_image']['error'] === 0) {
                    $image = 'uploads/history/' . time() . '_' . $_FILES['milestone_image']['name'];
                    move_uploaded_file($_FILES['milestone_image']['tmp_name'], '../' . $image);
                }
                
                $stmt = $pdo->prepare("UPDATE history_milestones SET year = ?, title = ?, description = ?, image = ?, display_order = ? WHERE id = ?");
                $stmt->execute([
                    $_POST['year'],
                    $_POST['title'],
                    $_POST['description'],
                    $image,
                    $_POST['display_order'],
                    $_POST['milestone_id']
                ]);
                $success = "Milestone updated successfully!";
                break;
                
            case 'delete_milestone':
                $stmt = $pdo->prepare("DELETE FROM history_milestones WHERE id = ?");
                $stmt->execute([$_POST['milestone_id']]);
                $success = "Milestone deleted successfully!";
                break;
        }
    }
}

// Fetch history introduction
$historyIntro = $pdo->query("SELECT content FROM site_content WHERE section = 'history_intro'")->fetchColumn() ?? '';

// Fetch all milestones
$milestones = $pdo->query("SELECT * FROM history_milestones ORDER BY year DESC, display_order ASC")->fetchAll(PDO::FETCH_ASSOC);

// Get logged in admin info
$adminName = $_SESSION['admin_name'] ?? 'Admin';
$adminInitial = strtoupper(substr($adminName, 0, 1));
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Union History Management - GNUTS Admin</title>
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

        /* Layout */
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
            font-weight: 900;
            color: var(--primary);
        }

        .sidebar-title {
            font-size: 1.5rem;
            font-weight: 800;
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
        }

        /* Main Content */
        .main-content {
            flex: 1;
            margin-left: 280px;
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

        .page-title-bar {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .back-btn {
            width: 40px;
            height: 40px;
            background: var(--gray-100);
            border: none;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .back-btn:hover {
            background: var(--primary);
            color: white;
        }

        .page-title {
            font-size: 1.5rem;
            font-weight: 700;
        }

        .user-menu {
            display: flex;
            align-items: center;
            gap: 0.75rem;
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
        }

        /* Page Content */
        .page-content {
            padding: 2rem;
        }

        /* Alert Messages */
        .alert {
            padding: 1rem 1.5rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .alert-success {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success);
            border: 1px solid var(--success);
        }

        .alert-error {
            background: rgba(239, 68, 68, 0.1);
            color: var(--danger);
            border: 1px solid var(--danger);
        }

        /* Cards */
        .card {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: var(--shadow);
            margin-bottom: 2rem;
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid var(--gray-200);
        }

        .card-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--dark);
        }

        /* Form Styles */
        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: var(--gray-700);
        }

        .form-control {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 2px solid var(--gray-300);
            border-radius: 8px;
            font-family: 'Montserrat', sans-serif;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        .form-control:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(1, 73, 0, 0.1);
        }

        textarea.form-control {
            min-height: 120px;
            resize: vertical;
        }

        .form-help {
            font-size: 0.85rem;
            color: var(--gray-500);
            margin-top: 0.5rem;
        }

        /* Buttons */
        .btn {
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            font-size: 1rem;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
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
            background: var(--secondary);
            color: white;
        }

        .btn-secondary:hover {
            background: #b88700;
            transform: translateY(-2px);
        }

        .btn-danger {
            background: var(--danger);
            color: white;
        }

        .btn-danger:hover {
            background: #dc2626;
        }

        .btn-outline {
            background: transparent;
            border: 2px solid var(--primary);
            color: var(--primary);
        }

        .btn-outline:hover {
            background: var(--primary);
            color: white;
        }

        .btn-sm {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
        }

        /* Milestone Timeline */
        .timeline {
            position: relative;
            padding-left: 2rem;
        }

        .timeline::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            background: var(--primary);
        }

        .timeline-item {
            position: relative;
            padding: 1.5rem;
            background: white;
            border-radius: 12px;
            margin-bottom: 2rem;
            box-shadow: var(--shadow);
            transition: all 0.3s ease;
        }

        .timeline-item:hover {
            transform: translateX(8px);
            box-shadow: var(--shadow-lg);
        }

        .timeline-item::before {
            content: '';
            position: absolute;
            left: -2.5rem;
            top: 2rem;
            width: 16px;
            height: 16px;
            background: var(--secondary);
            border: 4px solid white;
            border-radius: 50%;
            box-shadow: 0 0 0 4px var(--primary);
        }

        .timeline-year {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: var(--primary);
            color: white;
            border-radius: 6px;
            font-weight: 700;
            font-size: 1.1rem;
            margin-bottom: 1rem;
        }

        .timeline-content {
            display: grid;
            gap: 1rem;
        }

        .timeline-image {
            width: 100%;
            max-height: 300px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 1rem;
        }

        .timeline-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--dark);
            margin-bottom: 0.5rem;
        }

        .timeline-description {
            color: var(--gray-600);
            line-height: 1.7;
        }

        .timeline-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--gray-200);
        }

        /* Modal */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }

        .modal.active {
            display: flex;
        }

        .modal-content {
            background: white;
            border-radius: 16px;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: var(--shadow-xl);
        }

        .modal-header {
            padding: 1.5rem 2rem;
            border-bottom: 2px solid var(--gray-200);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-title {
            font-size: 1.5rem;
            font-weight: 700;
        }

        .modal-close {
            width: 32px;
            height: 32px;
            border: none;
            background: var(--gray-100);
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .modal-close:hover {
            background: var(--danger);
            color: white;
        }

        .modal-body {
            padding: 2rem;
        }

        .modal-footer {
            padding: 1.5rem 2rem;
            border-top: 1px solid var(--gray-200);
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
        }

        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
        }

        .empty-state-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }

        .empty-state-text {
            color: var(--gray-500);
            font-size: 1.1rem;
            margin-bottom: 1.5rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(-100%);
            }

            .main-content {
                margin-left: 0;
            }

            .page-content {
                padding: 1rem;
            }

            .timeline {
                padding-left: 1.5rem;
            }

            .timeline-item::before {
                left: -2rem;
            }
        }
    </style>
</head>
<body>
    <div class="admin-layout">
        <!-- Sidebar (same as index.php) -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo">G</div>
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
                    <a href="history.php" class="nav-item active">
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
                <div class="page-title-bar">
                    <button class="back-btn" onclick="window.location.href='index.php'">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <h1 class="page-title">Union History Management</h1>
                </div>

                <div class="user-menu">
                    <div class="user-avatar"><?php echo $adminInitial; ?></div>
                    <div>
                        <div style="font-weight: 600;"><?php echo htmlspecialchars($adminName); ?></div>
                        <div style="font-size: 0.75rem; color: var(--gray-500);">Administrator</div>
                    </div>
                </div>
            </header>

            <!-- Page Content -->
            <main class="page-content">
                <?php if (isset($success)): ?>
                    <div class="alert alert-success">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <?php echo $success; ?>
                    </div>
                <?php endif; ?>

                <?php if (isset($error)): ?>
                    <div class="alert alert-error">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        <?php echo $error; ?>
                    </div>
                <?php endif; ?>

                <!-- History Introduction Card -->
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 0.5rem;">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            History Introduction
                        </h2>
                    </div>

                    <form method="POST" action="">
                        <input type="hidden" name="action" value="update_history_intro">
                        
                        <div class="form-group">
                            <label class="form-label">Introduction Content</label>
                            <textarea name="intro_content" class="form-control" rows="8" required><?php echo htmlspecialchars($historyIntro); ?></textarea>
                            <div class="form-help">This text will appear at the top of the Union History page</div>
                        </div>

                        <button type="submit" class="btn btn-primary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                <polyline points="7 3 7 8 15 8"></polyline>
                            </svg>
                            Save Introduction
                        </button>
                    </form>
                </div>

                <!-- Historical Milestones Card -->
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 0.5rem;">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            Historical Milestones
                        </h2>
                        <button class="btn btn-secondary" onclick="openAddModal()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add Milestone
                        </button>
                    </div>

                    <?php if (empty($milestones)): ?>
                        <div class="empty-state">
                            <div class="empty-state-icon">📅</div>
                            <p class="empty-state-text">No historical milestones yet</p>
                            <button class="btn btn-primary" onclick="openAddModal()">Add Your First Milestone</button>
                        </div>
                    <?php else: ?>
                        <div class="timeline">
                            <?php foreach ($milestones as $milestone): ?>
                                <div class="timeline-item">
                                    <span class="timeline-year"><?php echo htmlspecialchars($milestone['year']); ?></span>
                                    <div class="timeline-content">
                                        <?php if ($milestone['image']): ?>
                                            <img src="../<?php echo htmlspecialchars($milestone['image']); ?>" alt="<?php echo htmlspecialchars($milestone['title']); ?>" class="timeline-image">
                                        <?php endif; ?>
                                        <h3 class="timeline-title"><?php echo htmlspecialchars($milestone['title']); ?></h3>
                                        <p class="timeline-description"><?php echo nl2br(htmlspecialchars($milestone['description'])); ?></p>
                                        
                                        <div class="timeline-actions">
                                            <button class="btn btn-sm btn-outline" onclick='openEditModal(<?php echo json_encode($milestone); ?>)'>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                                Edit
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="deleteMilestone(<?php echo $milestone['id']; ?>, '<?php echo htmlspecialchars(addslashes($milestone['title'])); ?>')">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                                </svg>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>
            </main>
        </div>
    </div>

    <!-- Add Milestone Modal -->
    <div class="modal" id="addMilestoneModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Add Historical Milestone</h3>
                <button class="modal-close" onclick="closeAddModal()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            
            <form method="POST" action="" enctype="multipart/form-data">
                <input type="hidden" name="action" value="add_milestone">
                
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">Year *</label>
                        <input type="number" name="year" class="form-control" min="1900" max="2100" required>
                        <div class="form-help">The year this milestone occurred</div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Title *</label>
                        <input type="text" name="title" class="form-control" required>
                        <div class="form-help">A brief, descriptive title for this milestone</div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Description *</label>
                        <textarea name="description" class="form-control" rows="6" required></textarea>
                        <div class="form-help">Detailed description of what happened</div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Image (Optional)</label>
                        <input type="file" name="milestone_image" class="form-control" accept="image/*">
                        <div class="form-help">Upload an image related to this milestone</div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Display Order</label>
                        <input type="number" name="display_order" class="form-control" value="0">
                        <div class="form-help">Lower numbers appear first (within the same year)</div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="closeAddModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Milestone
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Edit Milestone Modal -->
    <div class="modal" id="editMilestoneModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Edit Historical Milestone</h3>
                <button class="modal-close" onclick="closeEditModal()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            
            <form method="POST" action="" enctype="multipart/form-data" id="editMilestoneForm">
                <input type="hidden" name="action" value="update_milestone">
                <input type="hidden" name="milestone_id" id="edit_milestone_id">
                <input type="hidden" name="existing_image" id="edit_existing_image">
                
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">Year *</label>
                        <input type="number" name="year" id="edit_year" class="form-control" min="1900" max="2100" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Title *</label>
                        <input type="text" name="title" id="edit_title" class="form-control" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Description *</label>
                        <textarea name="description" id="edit_description" class="form-control" rows="6" required></textarea>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Current Image</label>
                        <div id="current_image_preview" style="margin-bottom: 1rem;"></div>
                        <label class="form-label">Upload New Image (Optional)</label>
                        <input type="file" name="milestone_image" class="form-control" accept="image/*">
                        <div class="form-help">Leave empty to keep current image</div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Display Order</label>
                        <input type="number" name="display_order" id="edit_display_order" class="form-control" value="0">
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="closeEditModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        Update Milestone
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Delete Confirmation Form -->
    <form method="POST" action="" id="deleteMilestoneForm" style="display: none;">
        <input type="hidden" name="action" value="delete_milestone">
        <input type="hidden" name="milestone_id" id="delete_milestone_id">
    </form>

    <script>
        // Add Milestone Modal Functions
        function openAddModal() {
            document.getElementById('addMilestoneModal').classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeAddModal() {
            document.getElementById('addMilestoneModal').classList.remove('active');
            document.body.style.overflow = '';
        }

        // Edit Milestone Modal Functions
        function openEditModal(milestone) {
            document.getElementById('edit_milestone_id').value = milestone.id;
            document.getElementById('edit_year').value = milestone.year;
            document.getElementById('edit_title').value = milestone.title;
            document.getElementById('edit_description').value = milestone.description;
            document.getElementById('edit_display_order').value = milestone.display_order;
            document.getElementById('edit_existing_image').value = milestone.image || '';
            
            // Show current image preview
            const previewDiv = document.getElementById('current_image_preview');
            if (milestone.image) {
                previewDiv.innerHTML = `
                    <img src="../${milestone.image}" alt="Current image" 
                         style="max-width: 100%; max-height: 200px; border-radius: 8px; box-shadow: var(--shadow);">
                `;
            } else {
                previewDiv.innerHTML = '<p style="color: var(--gray-500); font-size: 0.9rem;">No image uploaded</p>';
            }
            
            document.getElementById('editMilestoneModal').classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeEditModal() {
            document.getElementById('editMilestoneModal').classList.remove('active');
            document.body.style.overflow = '';
        }

        // Delete Milestone Function
        function deleteMilestone(id, title) {
            if (confirm(`Are you sure you want to delete the milestone "${title}"? This action cannot be undone.`)) {
                document.getElementById('delete_milestone_id').value = id;
                document.getElementById('deleteMilestoneForm').submit();
            }
        }

        // Close modals when clicking outside
        window.addEventListener('click', function(event) {
            const addModal = document.getElementById('addMilestoneModal');
            const editModal = document.getElementById('editMilestoneModal');
            
            if (event.target === addModal) {
                closeAddModal();
            }
            if (event.target === editModal) {
                closeEditModal();
            }
        });

        // Close modals on Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeAddModal();
                closeEditModal();
            }
        });

        // Auto-hide alerts after 5 seconds
        setTimeout(function() {
            const alerts = document.querySelectorAll('.alert');
            alerts.forEach(function(alert) {
                alert.style.transition = 'opacity 0.5s ease';
                alert.style.opacity = '0';
                setTimeout(function() {
                    alert.remove();
                }, 500);
            });
        }, 5000);
    </script>
</body>
</html