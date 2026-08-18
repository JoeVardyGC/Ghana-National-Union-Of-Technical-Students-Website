<?php
session_start();

// Check if admin is logged in
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit();
}

// Database connection
require_once '../config/db.php';

// Handle file upload
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];
    
    if ($action === 'add') {
        $title = $_POST['title'];
        $description = $_POST['description'];
        $category = $_POST['category'];
        $display_order = $_POST['display_order'] ?? 0;
        
        // Handle file upload
        $file_path = null;
        $file_name = null;
        $file_size = null;
        
        if (isset($_FILES['resource_file']) && $_FILES['resource_file']['error'] === UPLOAD_ERR_OK) {
            $upload_dir = '../uploads/resources/';
            if (!file_exists($upload_dir)) {
                mkdir($upload_dir, 0777, true);
            }
            
            $file_name = $_FILES['resource_file']['name'];
            $file_size = $_FILES['resource_file']['size'];
            $file_tmp = $_FILES['resource_file']['tmp_name'];
            $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
            
            // Allowed file types
            $allowed = ['pdf', 'doc', 'docx', 'txt', 'xlsx', 'xls', 'ppt', 'pptx', 'zip'];
            
            if (in_array($file_ext, $allowed)) {
                $new_filename = uniqid() . '.' . $file_ext;
                $file_path = 'uploads/resources/' . $new_filename;
                
                if (move_uploaded_file($file_tmp, '../' . $file_path)) {
                    $stmt = $pdo->prepare("INSERT INTO resources (title, description, category, file_path, file_name, file_size, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$title, $description, $category, $file_path, $file_name, $file_size, $display_order]);
                    $_SESSION['success'] = "Resource uploaded successfully!";
                } else {
                    $_SESSION['error'] = "Failed to upload file.";
                }
            } else {
                $_SESSION['error'] = "Invalid file type. Allowed types: PDF, DOC, DOCX, TXT, XLSX, XLS, PPT, PPTX, ZIP";
            }
        } else {
            $_SESSION['error'] = "Please select a file to upload.";
        }
        
        header('Location: resources.php');
        exit();
    }
    
    if ($action === 'edit') {
        $id = $_POST['id'];
        $title = $_POST['title'];
        $description = $_POST['description'];
        $category = $_POST['category'];
        $display_order = $_POST['display_order'] ?? 0;
        
        // Check if new file is uploaded
        if (isset($_FILES['resource_file']) && $_FILES['resource_file']['error'] === UPLOAD_ERR_OK) {
            // Delete old file
            $stmt = $pdo->prepare("SELECT file_path FROM resources WHERE id = ?");
            $stmt->execute([$id]);
            $old_resource = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($old_resource && file_exists('../' . $old_resource['file_path'])) {
                unlink('../' . $old_resource['file_path']);
            }
            
            $upload_dir = '../uploads/resources/';
            $file_name = $_FILES['resource_file']['name'];
            $file_size = $_FILES['resource_file']['size'];
            $file_tmp = $_FILES['resource_file']['tmp_name'];
            $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
            
            $allowed = ['pdf', 'doc', 'docx', 'txt', 'xlsx', 'xls', 'ppt', 'pptx', 'zip'];
            
            if (in_array($file_ext, $allowed)) {
                $new_filename = uniqid() . '.' . $file_ext;
                $file_path = 'uploads/resources/' . $new_filename;
                
                if (move_uploaded_file($file_tmp, '../' . $file_path)) {
                    $stmt = $pdo->prepare("UPDATE resources SET title = ?, description = ?, category = ?, file_path = ?, file_name = ?, file_size = ?, display_order = ? WHERE id = ?");
                    $stmt->execute([$title, $description, $category, $file_path, $file_name, $file_size, $display_order, $id]);
                }
            }
        } else {
            $stmt = $pdo->prepare("UPDATE resources SET title = ?, description = ?, category = ?, display_order = ? WHERE id = ?");
            $stmt->execute([$title, $description, $category, $display_order, $id]);
        }
        
        $_SESSION['success'] = "Resource updated successfully!";
        header('Location: resources.php');
        exit();
    }
    
    if ($action === 'delete') {
        $id = $_POST['id'];
        
        // Get file path and delete file
        $stmt = $pdo->prepare("SELECT file_path FROM resources WHERE id = ?");
        $stmt->execute([$id]);
        $resource = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($resource && file_exists('../' . $resource['file_path'])) {
            unlink('../' . $resource['file_path']);
        }
        
        $stmt = $pdo->prepare("DELETE FROM resources WHERE id = ?");
        $stmt->execute([$id]);
        
        $_SESSION['success'] = "Resource deleted successfully!";
        header('Location: resources.php');
        exit();
    }
}

// Fetch all resources
$resources = $pdo->query("SELECT * FROM resources ORDER BY display_order ASC, created_at DESC")->fetchAll(PDO::FETCH_ASSOC);

// Get resource to edit if ID is provided
$editResource = null;
if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare("SELECT * FROM resources WHERE id = ?");
    $stmt->execute([$_GET['edit']]);
    $editResource = $stmt->fetch(PDO::FETCH_ASSOC);
}

$adminName = $_SESSION['admin_name'] ?? 'Admin';
$adminInitial = strtoupper(substr($adminName, 0, 1));
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Resources - GNUTS Admin</title>
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

        .main-content {
            flex: 1;
            margin-left: 280px;
            transition: margin-left 0.3s ease;
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

        .page-content {
            padding: 2rem;
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

        .alert {
            padding: 1rem 1.5rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .alert-success {
            background: #d1fae5;
            color: #065f46;
        }

        .alert-error {
            background: #fee2e2;
            color: #991b1b;
        }

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

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-label {
            display: block;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: var(--dark);
        }

        .form-input, .form-select, .form-textarea {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 2px solid var(--gray-300);
            border-radius: 8px;
            font-size: 1rem;
            font-family: 'Montserrat', sans-serif;
            transition: border-color 0.3s ease;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
            outline: none;
            border-color: var(--primary);
        }

        .form-textarea {
            resize: vertical;
            min-height: 120px;
        }

        .form-file {
            border: 2px dashed var(--gray-300);
            border-radius: 8px;
            padding: 2rem;
            text-align: center;
            transition: all 0.3s ease;
        }

        .form-file:hover {
            border-color: var(--primary);
            background: var(--gray-100);
        }

        .file-input-label {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
            cursor: pointer;
        }

        .file-input {
            display: none;
        }

        .btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 1rem;
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
            background: var(--gray-300);
            color: var(--dark);
        }

        .btn-secondary:hover {
            background: var(--gray-400);
        }

        .btn-danger {
            background: var(--danger);
            color: white;
        }

        .btn-danger:hover {
            background: #dc2626;
        }

        .btn-sm {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
        }

        .resources-grid {
            display: grid;
            gap: 1.5rem;
        }

        .resource-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: var(--shadow);
            display: flex;
            gap: 1.5rem;
            transition: all 0.3s ease;
        }

        .resource-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
        }

        .resource-icon {
            width: 80px;
            height: 80px;
            background: var(--gray-100);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .resource-icon.pdf { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
        .resource-icon.doc { background: rgba(59, 130, 246, 0.1); color: #2563eb; }
        .resource-icon.xls { background: rgba(16, 185, 129, 0.1); color: #059669; }
        .resource-icon.ppt { background: rgba(245, 158, 11, 0.1); color: #d97706; }
        .resource-icon.zip { background: rgba(139, 92, 246, 0.1); color: #7c3aed; }

        .resource-content {
            flex: 1;
        }

        .resource-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 0.75rem;
        }

        .resource-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--dark);
            margin-bottom: 0.25rem;
        }

        .resource-category {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: var(--primary);
            color: white;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .resource-description {
            color: var(--gray-600);
            margin-bottom: 1rem;
            line-height: 1.6;
        }

        .resource-meta {
            display: flex;
            gap: 1.5rem;
            font-size: 0.85rem;
            color: var(--gray-500);
            margin-bottom: 1rem;
        }

        .resource-actions {
            display: flex;
            gap: 0.75rem;
        }

        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            color: var(--gray-500);
        }

        .empty-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }

        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(-100%);
            }

            .main-content {
                margin-left: 0;
            }

            .resource-card {
                flex-direction: column;
            }

            .resource-icon {
                width: 60px;
                height: 60px;
            }
        }
    </style>
</head>
<body>
    <div class="admin-layout">
        <!-- Sidebar (same as index.php) -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo">
                    <img src="../includes/assets/gnuts_logo.png" alt="GNUTS Logo" style="width: 100%; height: 100%; object-fit: contain;">
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
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        </svg>
                        Dashboard
                    </a>
                </div>

                <div class="nav-section">
                    <div class="nav-section-title">Content Management</div>
                    <a href="scholarships.php" class="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                        </svg>
                        Scholarships
                    </a>
                    <a href="opportunities.php" class="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="7" width="20" height="14" rx="2"></rect>
                        </svg>
                        Opportunities
                    </a>
                    <a href="innovations.php" class="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                        Innovation Projects
                    </a>
                    <a href="blog.php" class="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        </svg>
                        News & Blog
                    </a>
                </div>

                <div class="nav-section">
                    <div class="nav-section-title">Site Settings</div>
                    <a href="about.php" class="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                        About Page
                    </a>
                    <a href="history.php" class="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                        Union History
                    </a>
                    <a href="contact.php" class="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2"></path>
                        </svg>
                        Contact Info
                    </a>
                    <a href="resources.php" class="nav-item active">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        </svg>
                        Resources/Constitution
                    </a>
                </div>

                <div class="nav-section">
                    <div class="nav-section-title">Administration</div>
                    <a href="executives.php" class="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        </svg>
                        Executives
                    </a>
                    <a href="users.php" class="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        </svg>
                        Users
                    </a>
                </div>

                <div class="nav-section">
                    <div class="nav-section-title">System</div>
                    <a href="../index.php" class="nav-item" target="_blank">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        </svg>
                        View Site
                    </a>
                    <a href="logout.php" class="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        </svg>
                        Logout
                    </a>
                </div>
            </nav>
        </aside>

        <!-- Main Content -->
        <div class="main-content">
            <header class="top-bar">
                <h2 style="font-size: 1.25rem; font-weight: 600; color: var(--dark);">Resources & Constitution Management</h2>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="width: 40px; height: 40px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">
                            <?php echo $adminInitial; ?>
                        </div>
                        <div>
                            <div style="font-weight: 600; font-size: 0.9rem;"><?php echo htmlspecialchars($adminName); ?></div>
                            <div style="font-size: 0.75rem; color: var(--gray-500);">Administrator</div>
                        </div>
                    </div>
                </div>
            </header>

            <main class="page-content">
                <?php if (isset($_SESSION['success'])): ?>
                    <div class="alert alert-success">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <?php echo $_SESSION['success']; unset($_SESSION['success']); ?>
                    </div>
                <?php endif; ?>

                <?php if (isset($_SESSION['error'])): ?>
                    <div class="alert alert-error">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <?php echo $_SESSION['error']; unset($_SESSION['error']); ?>
                    </div>
                <?php endif; ?>

                <!-- Upload Form -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><?php echo $editResource ? 'Edit Resource' : 'Upload New Resource'; ?></h3>
                    </div>
                    
                    <form method="POST" enctype="multipart/form-data">
                        <input type="hidden" name="action" value="<?php echo $editResource ? 'edit' : 'add'; ?>">
                        <?php if ($editResource): ?>
                            <input type="hidden" name="id" value="<?php echo $editResource['id']; ?>">
                        <?php endif; ?>
                        
                        <div class="form-group">
                            <label class="form-label">Resource Title *</label>
                            <input type="text" name="title" class="form-input" value="<?php echo $editResource ? htmlspecialchars($editResource['title']) : ''; ?>" required placeholder="e.g., GNUTS Constitution 2024">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Description *</label>
                            <textarea name="description" class="form-textarea" required placeholder="Brief description of the resource..."><?php echo $editResource ? htmlspecialchars($editResource['description']) : ''; ?></textarea>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Category *</label>
                            <select name="category" class="form-select" required>
                                <option value="">Select Category</option>
                                <option value="constitution" <?php echo ($editResource && $editResource['category'] === 'constitution') ? 'selected' : ''; ?>>Constitution</option>
                                <option value="policy" <?php echo ($editResource && $editResource['category'] === 'policy') ? 'selected' : ''; ?>>Policy Documents</option>
                                <option value="handbook" <?php echo ($editResource && $editResource['category'] === 'handbook') ? 'selected' : ''; ?>>Handbooks & Guides</option>
                                <option value="forms" <?php echo ($editResource && $editResource['category'] === 'forms') ? 'selected' : ''; ?>>Forms & Templates</option>
                                <option value="reports" <?php echo ($editResource && $editResource['category'] === 'reports') ? 'selected' : ''; ?>>Reports & Publications</option>
                                <option value="other" <?php echo ($editResource && $editResource['category'] === 'other') ? 'selected' : ''; ?>>Other Resources</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Display Order</label>
                            <input type="number" name="display_order" class="form-input" value="<?php echo $editResource ? $editResource['display_order'] : '0'; ?>" min="0" placeholder="0">
                            <small style="color: var(--gray-500); font-size: 0.85rem;">Lower numbers appear first</small>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Upload File * <?php echo $editResource ? '(Leave empty to keep current file)' : ''; ?></label>
                            <div class="form-file">
                                <label for="file-upload" class="file-input-label">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                    <span style="font-weight: 600; color: var(--primary);">Click to upload file</span>
                                    <span style="font-size: 0.85rem; color: var(--gray-500);">PDF, DOC, DOCX, TXT, XLSX, XLS, PPT, PPTX, ZIP (Max 10MB)</span>
                                    <?php if ($editResource): ?>
                                        <span style="font-size: 0.85rem; color: var(--info); font-weight: 600;">Current: <?php echo htmlspecialchars($editResource['file_name']); ?></span>
                                    <?php endif; ?>
                                </label>
                                <input type="file" id="file-upload" name="resource_file" class="file-input" accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx,.zip" <?php echo $editResource ? '' : 'required'; ?>>
                            </div>
                        </div>

                        <div style="display: flex; gap: 1rem;">
                            <button type="submit" class="btn btn-primary">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                </svg>
                                <?php echo $editResource ? 'Update Resource' : 'Upload Resource'; ?>
                            </button>
                            <?php if ($editResource): ?>
                                <a href="resources.php" class="btn btn-secondary">Cancel</a>
                            <?php endif; ?>
                        </div>
                    </form>
                </div>

                <!-- Resources List -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">All Resources (<?php echo count($resources); ?>)</h3>
                    </div>

                    <?php if (empty($resources)): ?>
                        <div class="empty-state">
                            <div class="empty-icon">📁</div>
                            <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">No Resources Yet</h3>
                            <p>Upload your first resource document using the form above.</p>
                        </div>
                    <?php else: ?>
                        <div class="resources-grid">
                            <?php foreach ($resources as $resource): 
                                $fileExt = strtolower(pathinfo($resource['file_name'], PATHINFO_EXTENSION));
                                $iconClass = in_array($fileExt, ['pdf']) ? 'pdf' : 
                                            (in_array($fileExt, ['doc', 'docx']) ? 'doc' : 
                                            (in_array($fileExt, ['xls', 'xlsx']) ? 'xls' : 
                                            (in_array($fileExt, ['ppt', 'pptx']) ? 'ppt' : 
                                            (in_array($fileExt, ['zip']) ? 'zip' : 'doc'))));
                            ?>
                            <div class="resource-card">
                                <div class="resource-icon <?php echo $iconClass; ?>">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                </div>
                                
                                <div class="resource-content">
                                    <div class="resource-header">
                                        <div>
                                            <h4 class="resource-title"><?php echo htmlspecialchars($resource['title']); ?></h4>
                                            <span class="resource-category"><?php echo htmlspecialchars($resource['category']); ?></span>
                                        </div>
                                    </div>
                                    
                                    <p class="resource-description"><?php echo htmlspecialchars($resource['description']); ?></p>
                                    
                                    <div class="resource-meta">
                                        <span>📄 <?php echo strtoupper($fileExt); ?></span>
                                        <span>💾 <?php echo round($resource['file_size'] / 1024, 2); ?> KB</span>
                                        <span>📅 <?php echo date('M d, Y', strtotime($resource['created_at'])); ?></span>
                                        <span>🔢 Order: <?php echo $resource['display_order']; ?></span>
                                    </div>
                                    
                                    <div class="resource-actions">
                                        <a href="../<?php echo $resource['file_path']; ?>" download class="btn btn-primary btn-sm">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                <polyline points="7 10 12 15 17 10"></polyline>
                                                <line x1="12" y1="15" x2="12" y2="3"></line>
                                            </svg>
                                            Download
                                        </a>
                                        <a href="?edit=<?php echo $resource['id']; ?>" class="btn btn-secondary btn-sm">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                            Edit
                                        </a>
                                        <form method="POST" style="display: inline;" onsubmit="return confirm('Are you sure you want to delete this resource?');">
                                            <input type="hidden" name="action" value="delete">
                                            <input type="hidden" name="id" value="<?php echo $resource['id']; ?>">
                                            <button type="submit" class="btn btn-danger btn-sm">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                                Delete
                                            </button>
                                        </form>
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

    <script>
        // File input preview
        document.getElementById('file-upload').addEventListener('change', function(e) {
            const fileName = e.target.files[0]?.name;
            if (fileName) {
                const label = document.querySelector('.file-input-label span:first-of-type');
                label.textContent = fileName;
                label.style.color = 'var(--success)';
            }
        });
    </script>
</body>
</html>