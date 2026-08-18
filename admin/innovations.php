<?php
session_start();
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit();
}

require_once '../config/db.php';

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['action'])) {
    switch ($_POST['action']) {
        case 'add':
            $imagePath = null;
            if (isset($_FILES['project_image']) && $_FILES['project_image']['error'] == 0) {
                $targetDir = "../uploads/innovations/";
                if (!file_exists($targetDir)) mkdir($targetDir, 0777, true);
                $ext = strtolower(pathinfo($_FILES["project_image"]["name"], PATHINFO_EXTENSION));
                $newFileName = uniqid() . '.' . $ext;
                if (move_uploaded_file($_FILES["project_image"]["tmp_name"], $targetDir . $newFileName)) {
                    $imagePath = "uploads/innovations/" . $newFileName;
                }
            }
            $stmt = $pdo->prepare("INSERT INTO innovations (title, student_name, institution, description, project_image, video_url, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
            $stmt->execute([$_POST['title'], $_POST['student_name'], $_POST['institution'], $_POST['description'], $imagePath, $_POST['video_url'], $_POST['status']]);
            $_SESSION['success'] = "Innovation project added successfully!";
            header('Location: innovations.php');
            exit();

        case 'edit':
            $imagePath = $_POST['existing_image'];
            if (isset($_FILES['project_image']) && $_FILES['project_image']['error'] == 0) {
                $targetDir = "../uploads/innovations/";
                if (!file_exists($targetDir)) mkdir($targetDir, 0777, true);
                $ext = strtolower(pathinfo($_FILES["project_image"]["name"], PATHINFO_EXTENSION));
                $newFileName = uniqid() . '.' . $ext;
                if (move_uploaded_file($_FILES["project_image"]["tmp_name"], $targetDir . $newFileName)) {
                    if ($imagePath && file_exists("../" . $imagePath)) unlink("../" . $imagePath);
                    $imagePath = "uploads/innovations/" . $newFileName;
                }
            }
            $stmt = $pdo->prepare("UPDATE innovations SET title=?, student_name=?, institution=?, description=?, project_image=?, video_url=?, status=? WHERE id=?");
            $stmt->execute([$_POST['title'], $_POST['student_name'], $_POST['institution'], $_POST['description'], $imagePath, $_POST['video_url'], $_POST['status'], $_POST['id']]);
            $_SESSION['success'] = "Innovation project updated successfully!";
            header('Location: innovations.php');
            exit();

        case 'delete':
            $stmt = $pdo->prepare("SELECT project_image FROM innovations WHERE id=?");
            $stmt->execute([$_POST['id']]);
            $innovation = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($innovation['project_image'] && file_exists("../" . $innovation['project_image'])) {
                unlink("../" . $innovation['project_image']);
            }
            $stmt = $pdo->prepare("DELETE FROM innovations WHERE id=?");
            $stmt->execute([$_POST['id']]);
            $_SESSION['success'] = "Innovation project deleted successfully!";
            header('Location: innovations.php');
            exit();

        case 'approve':
            $pdo->prepare("UPDATE innovations SET status='approved' WHERE id=?")->execute([$_POST['id']]);
            $_SESSION['success'] = "Innovation project approved!";
            header('Location: innovations.php');
            exit();

        case 'reject':
            $pdo->prepare("UPDATE innovations SET status='rejected' WHERE id=?")->execute([$_POST['id']]);
            $_SESSION['success'] = "Innovation project rejected!";
            header('Location: innovations.php');
            exit();
    }
}

// Get innovation for editing
$editInnovation = null;
if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare("SELECT * FROM innovations WHERE id=?");
    $stmt->execute([$_GET['edit']]);
    $editInnovation = $stmt->fetch(PDO::FETCH_ASSOC);
}

// Fetch all innovations
$innovations = $pdo->query("SELECT * FROM innovations ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);

// Get statistics
$stats = [
    'total' => count($innovations),
    'pending' => $pdo->query("SELECT COUNT(*) FROM innovations WHERE status='pending'")->fetchColumn(),
    'approved' => $pdo->query("SELECT COUNT(*) FROM innovations WHERE status='approved'")->fetchColumn(),
    'rejected' => $pdo->query("SELECT COUNT(*) FROM innovations WHERE status='rejected'")->fetchColumn(),
];

// Admin info
$adminName    = $_SESSION['admin_name'] ?? 'Admin';
$adminInitial = strtoupper(substr($adminName, 0, 1));
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Innovation Projects - GNUTS Admin</title>
  <link rel="icon" type="image/png" href="assets/gnuts_fav.png">

    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary:   #014900;
            --secondary: #D9A000;
            --dark:      #1a1a1a;
            --light:     #f8f9fa;
            --white:     #ffffff;
            --gray-100:  #f3f4f6;
            --gray-200:  #e5e7eb;
            --gray-300:  #d1d5db;
            --gray-400:  #9ca3af;
            --gray-500:  #6b7280;
            --gray-600:  #4b5563;
            --gray-700:  #374151;
            --success:   #10b981;
            --warning:   #f59e0b;
            --danger:    #ef4444;
            --info:      #3b82f6;
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow:    0 1px 3px 0 rgba(0, 0, 0, 0.1),
                         0 1px 2px 0 rgba(0, 0, 0, 0.06);
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
            overflow-x: hidden;
        }

        .admin-layout {
            display: flex;
            min-height: 100vh;
        }

        /* Sidebar */
        .sidebar {
            width: 280px;
            background: var(--primary);
            color: #fff;
            position: fixed;
            top: 0;
            left: 0;
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
            background: #fff;
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
            color: #fff;
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
            color: #fff;
            border-left-color: var(--secondary);
        }

        .nav-item.active {
            background: rgba(255, 255, 255, 0.15);
            color: #fff;
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

        .main-content {
            flex: 1;
            margin-left: 280px;
            transition: margin-left 0.3s ease;
            min-width: 0;
        }

        /* Top bar */
        .top-bar {
            background: #fff;
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
            border-radius: 6px;
            transition: background 0.2s ease;
        }

        .menu-toggle:hover {
            background: var(--gray-100);
        }

        .top-bar-actions {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }

        .notification-btn {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--gray-600);
            padding: 0.25rem;
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
            color: #fff;
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

        /* General UI */
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }

        .page-title {
            font-size: 2rem;
            font-weight: 800;
            color: var(--dark);
        }

        .btn {
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.95rem;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            font-family: 'Montserrat', sans-serif;
        }

        .btn-primary {
            background: var(--primary);
            color: #fff;
        }

        .btn-primary:hover {
            background: #023300;
            transform: translateY(-2px);
            box-shadow: var(--shadow-sm);
        }

        .btn-secondary {
            background: var(--gray-300);
            color: var(--dark);
        }

        .btn-danger {
            background: var(--danger);
            color: #fff;
        }

        .btn-success {
            background: var(--success);
            color: #fff;
        }

        .btn-info {
            background: var(--info);
            color: #fff;
        }

        .btn-sm {
            padding: 0.5rem 1rem;
            font-size: 0.85rem;
        }

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
            border-left: 4px solid var(--success);
            color: var(--success);
        }

        .card {
            background: #fff;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: var(--shadow);
            margin-bottom: 2rem;
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 1.5rem;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .form-group.full-width {
            grid-column: 1 / -1;
        }

        label {
            font-weight: 600;
            color: var(--dark);
            font-size: 0.9rem;
        }

        input[type="text"],
        input[type="url"],
        input[type="file"],
        select,
        textarea {
            padding: 0.75rem;
            border: 2px solid var(--gray-200);
            border-radius: 8px;
            font-size: 0.95rem;
            font-family: 'Montserrat', sans-serif;
            transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        input:focus,
        select:focus,
        textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(1, 73, 0, 0.15);
        }

        textarea {
            resize: vertical;
            min-height: 120px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: #fff;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: var(--shadow);
            border-left: 4px solid var(--primary);
            text-align: center;
            transition: transform 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-4px);
        }

        .stat-card.success {
            border-left-color: var(--success);
        }

        .stat-card.warning {
            border-left-color: var(--warning);
        }

        .stat-card.danger {
            border-left-color: var(--danger);
        }

        .stat-label {
            font-size: 0.875rem;
            color: var(--gray-600);
            margin-bottom: 0.5rem;
        }

        .stat-value {
            font-size: 2rem;
            font-weight: 800;
        }

        .innovations-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 1.5rem;
        }

        .innovation-card {
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: var(--shadow);
            transition: all 0.3s ease;
        }

        .innovation-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .innovation-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            background: var(--gray-200);
        }

        .innovation-content {
            padding: 1.5rem;
        }

        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            display: inline-block;
        }

        .status-pending {
            background: rgba(245, 158, 11, 0.1);
            color: var(--warning);
        }

        .status-approved {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success);
        }

        .status-rejected {
            background: rgba(239, 68, 68, 0.1);
            color: var(--danger);
        }

        .action-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            justify-content: center;
            align-items: center;
            padding: 2rem;
        }

        .modal.active {
            display: flex;
        }

        .modal-content {
            background: #fff;
            border-radius: 12px;
            padding: 2rem;
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
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
                display: inline-flex;
            }

            .user-info {
                display: none;
            }

            .page-content {
                padding: 1.5rem 1rem;
            }

            .page-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 1rem;
            }

            .page-title {
                font-size: 1.75rem;
            }

            .stats-grid,
            .innovations-grid {
                grid-template-columns: 1fr;
            }

            .form-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 480px) {
            .page-content {
                padding: 1rem 0.75rem;
            }

            .page-title {
                font-size: 1.5rem;
            }

            .card {
                padding: 1.5rem 1.25rem;
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
                    <img src="../includes/assets/gnutslogo.png" alt="GNUTS Logo"
                         onerror="this.parentElement.innerHTML='<div style=&quot;color: var(--primary); font-weight: 800; font-size: 1.5rem;&quot;>G</div>'">
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
                    <a href="innovations.php" class="nav-item active">
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

        <!-- Main content -->
        <div class="main-content">
            <header class="top-bar">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <button class="menu-toggle" id="menuToggle" aria-label="Toggle menu">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                    <h2 style="margin: 0; font-size: 1.5rem; font-weight: 700;">Innovation Projects</h2>
                </div>
                <div class="top-bar-actions">
                    <button class="notification-btn" aria-label="Notifications">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
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

            <main class="page-content">
                <?php if(isset($_SESSION['success'])): ?>
                    <div class="alert alert-success">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <?php echo htmlspecialchars($_SESSION['success']); unset($_SESSION['success']); ?>
                    </div>
                <?php endif; ?>

                <?php if(isset($_GET['action']) && $_GET['action'] == 'new' || isset($_GET['edit'])): ?>
                    <div class="page-header">
                        <h1 class="page-title"><?php echo isset($_GET['edit']) ? 'Edit' : 'Add New'; ?> Innovation Project</h1>
                    </div>

                    <div class="card">
                        <form method="POST" enctype="multipart/form-data">
                            <input type="hidden" name="action" value="<?php echo isset($_GET['edit']) ? 'edit' : 'add'; ?>">
                            <?php if(isset($_GET['edit'])): ?>
                                <input type="hidden" name="id" value="<?php echo $editInnovation['id']; ?>">
                                <input type="hidden" name="existing_image" value="<?php echo $editInnovation['project_image']; ?>">
                            <?php endif; ?>

                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="title">Project Title *</label>
                                    <input type="text" id="title" name="title" required 
                                           value="<?php echo isset($editInnovation) ? htmlspecialchars($editInnovation['title']) : ''; ?>">
                                </div>

                                <div class="form-group">
                                    <label for="student_name">Student Name *</label>
                                    <input type="text" id="student_name" name="student_name" required 
                                           value="<?php echo isset($editInnovation) ? htmlspecialchars($editInnovation['student_name']) : ''; ?>">
                                </div>

                                <div class="form-group">
                                    <label for="institution">Institution *</label>
                                    <input type="text" id="institution" name="institution" required 
                                           value="<?php echo isset($editInnovation) ? htmlspecialchars($editInnovation['institution']) : ''; ?>">
                                </div>

                                <div class="form-group full-width">
                                    <label for="project_image">Project Image</label>
                                    <input type="file" id="project_image" name="project_image" accept="image/*">
                                    <?php if(isset($editInnovation) && $editInnovation['project_image']): ?>
                                        <img src="../<?php echo $editInnovation['project_image']; ?>" alt="Current" 
                                             style="max-width: 200px; margin-top: 1rem; border-radius: 8px;">
                                    <?php endif; ?>
                                </div>

                                <div class="form-group">
                                    <label for="video_url">Video URL</label>
                                    <input type="url" id="video_url" name="video_url" 
                                           value="<?php echo isset($editInnovation) ? htmlspecialchars($editInnovation['video_url']) : ''; ?>"
                                           placeholder="https://youtube.com/watch?v=...">
                                </div>

                                <div class="form-group full-width">
                                    <label for="description">Description *</label>
                                    <textarea id="description" name="description" required><?php echo isset($editInnovation) ? htmlspecialchars($editInnovation['description']) : ''; ?></textarea>
                                </div>

                                <div class="form-group">
                                    <label for="status">Status *</label>
                                    <select id="status" name="status" required>
                                        <option value="pending" <?php echo (isset($editInnovation) && $editInnovation['status'] == 'pending') ? 'selected' : ''; ?>>Pending</option>
                                        <option value="approved" <?php echo (isset($editInnovation) && $editInnovation['status'] == 'approved') ? 'selected' : ''; ?>>Approved</option>
                                        <option value="rejected" <?php echo (isset($editInnovation) && $editInnovation['status'] == 'rejected') ? 'selected' : ''; ?>>Rejected</option>
                                    </select>
                                </div>
                            </div>

                            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                                <button type="submit" class="btn btn-primary">
                                    <?php echo isset($_GET['edit']) ? 'Update' : 'Add'; ?> Project
                                </button>
                                <a href="innovations.php" class="btn btn-secondary">Cancel</a>
                            </div>
                        </form>
                    </div>
                <?php else: ?>
                    <div class="page-header">
                        <h1 class="page-title">Innovation Projects</h1>
                        <a href="?action=new" class="btn btn-primary">Add New Project</a>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-label">Total Projects</div>
                            <div class="stat-value"><?php echo $stats['total']; ?></div>
                        </div>
                        <div class="stat-card warning">
                            <div class="stat-label">Pending Review</div>
                            <div class="stat-value"><?php echo $stats['pending']; ?></div>
                        </div>
                        <div class="stat-card success">
                            <div class="stat-label">Approved</div>
                            <div class="stat-value"><?php echo $stats['approved']; ?></div>
                        </div>
                        <div class="stat-card danger">
                            <div class="stat-label">Rejected</div>
                            <div class="stat-value"><?php echo $stats['rejected']; ?></div>
                        </div>
                    </div>

                    <div class="innovations-grid">
                        <?php if(empty($innovations)): ?>
                            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                                <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">No Innovation Projects Yet</h3>
                                <p style="color: var(--gray-500); margin-bottom: 2rem;">Get started by adding your first project.</p>
                                <a href="?action=new" class="btn btn-primary">Add Innovation Project</a>
                            </div>
                        <?php else: ?>
                            <?php foreach($innovations as $innovation): ?>
                                <div class="innovation-card">
                                    <?php if($innovation['project_image']): ?>
                                        <img src="../<?php echo htmlspecialchars($innovation['project_image']); ?>" 
                                             alt="<?php echo htmlspecialchars($innovation['title']); ?>" class="innovation-image">
                                    <?php else: ?>
                                        <div class="innovation-image" style="display: flex; align-items: center; justify-content: center; background: var(--gray-200); color: var(--gray-500); font-size: 1rem;">No Image</div>
                                    <?php endif; ?>
                                    
                                    <div class="innovation-content">
                                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                                            <span style="padding: 0.25rem 0.75rem; background: var(--gray-100); border-radius: 6px; font-size: 0.8rem; font-weight: 600; color: var(--primary);">
                                                <?php echo htmlspecialchars($innovation['category'] ?? 'Uncategorized'); ?>
                                            </span>
                                            <span class="status-badge status-<?php echo $innovation['status']; ?>">
                                                <?php echo ucfirst($innovation['status']); ?>
                                            </span>
                                        </div>
                                        
                                        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;">
                                            <?php echo htmlspecialchars($innovation['title']); ?>
                                        </h3>
                                        
                                        <div style="font-size: 0.85rem; color: var(--gray-600); margin-bottom: 0.75rem;">
                                            <strong><?php echo htmlspecialchars($innovation['student_name']); ?></strong><br>
                                            <?php echo htmlspecialchars($innovation['institution']); ?><br>
                                            <small><?php echo date('M d, Y', strtotime($innovation['created_at'])); ?></small>
                                        </div>
                                        
                                        <p style="font-size: 0.9rem; color: var(--gray-600); margin-bottom: 1rem; line-height: 1.6;">
                                            <?php echo htmlspecialchars(substr($innovation['description'], 0, 150)) . (strlen($innovation['description']) > 150 ? '...' : ''); ?>
                                        </p>
                                        
                                        <div class="action-buttons">
                                            <a href="?edit=<?php echo $innovation['id']; ?>" class="btn btn-secondary btn-sm">Edit</a>
                                            <?php if($innovation['status'] == 'pending'): ?>
                                                <form method="POST" style="display:inline;">
                                                    <input type="hidden" name="action" value="approve">
                                                    <input type="hidden" name="id" value="<?php echo $innovation['id']; ?>">
                                                    <button type="submit" class="btn btn-success btn-sm">Approve</button>
                                                </form>
                                            <?php endif; ?>
                                            <form method="POST" style="display:inline;" 
                                                  onsubmit="return confirm('Are you sure you want to delete this innovation project?');">
                                                <input type="hidden" name="action" value="delete">
                                                <input type="hidden" name="id" value="<?php echo $innovation['id']; ?>">
                                                <button type="submit" class="btn btn-danger btn-sm">Delete</button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>
            </main>
        </div>
    </div>

    <!-- Sidebar toggle JS -->
    <script>
        (function () {
            'use strict';

            const menuToggle = document.getElementById('menuToggle');
            const sidebar    = document.getElementById('sidebar');

            if (!menuToggle || !sidebar) return;

            // Toggle sidebar
            menuToggle.addEventListener('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                sidebar.classList.toggle('active');
            });

            // Close on outside click (mobile)
            document.addEventListener('click', function (e) {
                if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
                    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                        sidebar.classList.remove('active');
                    }
                }
            });

            // Close on resize to desktop
            window.addEventListener('resize', function () {
                if (window.innerWidth > 768 && sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                }
            });

            // Close on Escape
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && window.innerWidth <= 768 && sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                }
            });
        })();
    </script>
</body>
</html>
