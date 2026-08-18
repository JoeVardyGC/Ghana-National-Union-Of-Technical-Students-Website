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
$message = '';
$messageType = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'add') {
        $title = trim($_POST['title']);
        $content = trim($_POST['content']);
        $author = trim($_POST['author']);
        $published_at = $_POST['published_at'];
        $status = $_POST['status'];
        
        // Handle main image upload
        $image = null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
            $uploadDir = '../uploads/news/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $image = uniqid() . '.' . $ext;
            move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $image);
        }
        
        $stmt = $pdo->prepare("INSERT INTO news (title, content, image, author, published_at, status) VALUES (?, ?, ?, ?, ?, ?)");
        
        if ($stmt->execute([$title, $content, $image, $author, $published_at, $status])) {
            $newsId = $pdo->lastInsertId();
            
            // Handle additional images
            if (isset($_FILES['additional_images'])) {
                $uploadDir = '../uploads/news/';
                $captions = $_POST['image_captions'] ?? [];
                
                foreach ($_FILES['additional_images']['tmp_name'] as $key => $tmp_name) {
                    if ($_FILES['additional_images']['error'][$key] === 0) {
                        $ext = pathinfo($_FILES['additional_images']['name'][$key], PATHINFO_EXTENSION);
                        $imageName = uniqid() . '.' . $ext;
                        $imagePath = 'uploads/news/' . $imageName;
                        
                        if (move_uploaded_file($tmp_name, $uploadDir . $imageName)) {
                            $caption = $captions[$key] ?? '';
                            $stmt = $pdo->prepare("INSERT INTO news_additional_images (news_id, image_path, caption, display_order) VALUES (?, ?, ?, ?)");
                            $stmt->execute([$newsId, $imagePath, $caption, $key]);
                        }
                    }
                }
            }
            
            $message = 'Article published successfully!';
            $messageType = 'success';
        } else {
            $message = 'Error publishing article.';
            $messageType = 'error';
        }
    }
    
    if ($action === 'edit') {
        $id = $_POST['id'];
        $title = trim($_POST['title']);
        $content = trim($_POST['content']);
        $author = trim($_POST['author']);
        $published_at = $_POST['published_at'];
        $status = $_POST['status'];
        
        // Get existing article
        $existing = getRecord($pdo, 'news', $id);
        $image = $existing['image'];
        
        // Handle new main image upload
        if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
            $uploadDir = '../uploads/news/';
            
            // Delete old image
            if ($image && file_exists($uploadDir . $image)) {
                unlink($uploadDir . $image);
            }
            
            $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $image = uniqid() . '.' . $ext;
            move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $image);
        }
        
        $stmt = $pdo->prepare("UPDATE news SET title=?, content=?, image=?, author=?, published_at=?, status=? WHERE id=?");
        
        if ($stmt->execute([$title, $content, $image, $author, $published_at, $status, $id])) {
            // Handle additional images
            if (isset($_FILES['additional_images'])) {
                $uploadDir = '../uploads/news/';
                $captions = $_POST['image_captions'] ?? [];
                
                foreach ($_FILES['additional_images']['tmp_name'] as $key => $tmp_name) {
                    if ($_FILES['additional_images']['error'][$key] === 0) {
                        $ext = pathinfo($_FILES['additional_images']['name'][$key], PATHINFO_EXTENSION);
                        $imageName = uniqid() . '.' . $ext;
                        $imagePath = 'uploads/news/' . $imageName;
                        
                        if (move_uploaded_file($tmp_name, $uploadDir . $imageName)) {
                            $caption = $captions[$key] ?? '';
                            $stmt = $pdo->prepare("INSERT INTO news_additional_images (news_id, image_path, caption, display_order) VALUES (?, ?, ?, ?)");
                            $stmt->execute([$id, $imagePath, $caption, $key]);
                        }
                    }
                }
            }
            
            $message = 'Article updated successfully!';
            $messageType = 'success';
        } else {
            $message = 'Error updating article.';
            $messageType = 'error';
        }
    }
    
    if ($action === 'delete') {
        $id = $_POST['id'];
        
        // Delete main image
        $article = getRecord($pdo, 'news', $id);
        if ($article && $article['image']) {
            $imagePath = "../uploads/news/" . $article['image'];
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        }
        
        // Delete additional images
        $stmt = $pdo->prepare("SELECT image_path FROM news_additional_images WHERE news_id = ?");
        $stmt->execute([$id]);
        $additionalImages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($additionalImages as $img) {
            if (file_exists('../' . $img['image_path'])) {
                unlink('../' . $img['image_path']);
            }
        }
        
        $stmt = $pdo->prepare("DELETE FROM news WHERE id=?");
        
        if ($stmt->execute([$id])) {
            $message = 'Article deleted successfully!';
            $messageType = 'success';
        } else {
            $message = 'Error deleting article.';
            $messageType = 'error';
        }
    }
    
    if ($action === 'delete_image') {
        $imageId = $_POST['image_id'];
        
        $stmt = $pdo->prepare("SELECT image_path FROM news_additional_images WHERE id = ?");
        $stmt->execute([$imageId]);
        $img = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($img && file_exists('../' . $img['image_path'])) {
            unlink('../' . $img['image_path']);
        }
        
        $stmt = $pdo->prepare("DELETE FROM news_additional_images WHERE id = ?");
        if ($stmt->execute([$imageId])) {
            $message = 'Image deleted successfully!';
            $messageType = 'success';
        }
    }
}

// Fetch all news articles
$newsArticles = getAllRecords($pdo, 'news', 'published_at DESC');

// Get article for editing if ID provided
$editArticle = null;
$existingImages = [];
if (isset($_GET['edit'])) {
    $editArticle = getRecord($pdo, 'news', $_GET['edit']);
    
    // Get existing additional images
    $stmt = $pdo->prepare("SELECT * FROM news_additional_images WHERE news_id = ? ORDER BY display_order ASC");
    $stmt->execute([$_GET['edit']]);
    $existingImages = $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Get admin info
$adminName = $_SESSION['admin_name'] ?? 'Admin';
$adminInitial = strtoupper(substr($adminName, 0, 1));
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog/News Management - GNUTS Admin</title>
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
            --shadow:    0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
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
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1000;
            box-shadow: var(--shadow-lg);
        }

        .sidebar-header {
            padding: 2rem 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar h2 {
            color: white;
            font-size: 1.5rem;
            font-weight: 800;
            margin-bottom: 0.25rem;
        }

        .sidebar-subtitle {
            color: var(--secondary);
            font-size: 0.75rem;
            font-weight: 500;
        }

        .sidebar nav {
            padding: 1.5rem 0;
        }

        .sidebar a {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.875rem 1.5rem;
            color: rgba(255,255,255,0.8);
            text-decoration: none;
            transition: all 0.3s ease;
            border-left: 4px solid transparent;
            position: relative;
        }

        .sidebar a:hover {
            background: rgba(255,255,255,0.1);
            color: white;
            border-left-color: var(--secondary);
            transform: translateX(4px);
        }

        .sidebar a.active {
            background: rgba(255,255,255,0.15);
            color: white;
            border-left-color: var(--secondary);
            font-weight: 600;
        }

        .main-content {
            flex: 1;
            margin-left: 280px;
            transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            min-width: 0;
        }

        /* Top bar */
        .top-bar {
            background: var(--white);
            padding: 1rem 2rem;
            box-shadow: var(--shadow);
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
            padding: 0.75rem;
            border-radius: 8px;
            font-size: 1.2rem;
            transition: all 0.3s ease;
        }

        .menu-toggle:hover {
            background: var(--gray-100);
            transform: rotate(90deg);
        }

        .page-content {
            padding: 2rem;
            min-width: 0;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .page-title {
            font-size: 2rem;
            font-weight: 800;
            color: var(--dark);
            margin: 0;
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
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: none;
            cursor: pointer;
            font-family: 'Montserrat', sans-serif;
        }

        .btn-primary {
            background: var(--primary);
            color: var(--white);
        }

        .btn-primary:hover {
            background: #023300;
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }

        .btn-danger {
            background: var(--danger);
            color: var(--white);
        }

        .btn-danger:hover {
            background: #dc2626;
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }

        .btn-secondary {
            background: var(--gray-300);
            color: var(--dark);
        }

        .btn-secondary:hover {
            background: var(--gray-400);
            transform: translateY(-1px);
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
            animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
        }

        .alert-success {
            background: rgba(16, 185, 129, 0.1);
            border-left: 4px solid var(--success);
            color: var(--success);
        }

        .alert-error {
            background: rgba(239, 68, 68, 0.1);
            border-left: 4px solid var(--danger);
            color: var(--danger);
        }

        .card {
            background: var(--white);
            border-radius: 12px;
            padding: 2rem;
            box-shadow: var(--shadow);
            margin-bottom: 2rem;
            transition: all 0.3s ease;
        }

        .card:hover {
            box-shadow: var(--shadow-md);
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
        input[type="date"],
        input[type="file"],
        select,
        textarea {
            padding: 0.75rem;
            border: 2px solid var(--gray-200);
            border-radius: 8px;
            font-size: 0.95rem;
            font-family: 'Montserrat', sans-serif;
            transition: all 0.3s ease;
        }

        input:focus,
        select:focus,
        textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(1, 73, 0, 0.1);
            transform: translateY(-1px);
        }

        textarea {
            resize: vertical;
            min-height: 200px;
        }

        .image-preview {
            width: 100%;
            max-width: 300px;
            height: 200px;
            border: 2px dashed var(--gray-300);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            margin-top: 0.5rem;
            background: var(--gray-100);
            transition: all 0.3s ease;
        }

        .image-preview:hover {
            border-color: var(--primary);
        }

        .image-preview img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Additional Images Section */
        .additional-images-section {
            background: var(--gray-100);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1.5rem 0;
        }

        .section-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--dark);
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .images-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .image-item {
            background: var(--white);
            border-radius: 8px;
            padding: 1rem;
            box-shadow: var(--shadow-sm);
            transition: all 0.3s ease;
        }

        .image-item:hover {
            box-shadow: var(--shadow-md);
            transform: translateY(-2px);
        }

        .image-item-preview {
            width: 100%;
            height: 150px;
            border-radius: 6px;
            overflow: hidden;
            background: var(--gray-200);
            margin-bottom: 0.75rem;
        }

        .image-item-preview img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .image-item input {
            width: 100%;
            margin-bottom: 0.5rem;
        }

        .add-image-btn {
            background: var(--info);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .add-image-btn:hover {
            background: #2563eb;
            transform: translateY(-2px);
        }

        .existing-images {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .existing-image-card {
            background: var(--white);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: var(--shadow-sm);
            position: relative;
        }

        .existing-image-card img {
            width: 100%;
            height: 150px;
            object-fit: cover;
        }

        .existing-image-info {
            padding: 0.75rem;
        }

        .existing-image-caption {
            font-size: 0.85rem;
            color: var(--gray-600);
            margin-bottom: 0.5rem;
        }

        .delete-existing-image {
            background: var(--danger);
            color: white;
            border: none;
            padding: 0.4rem 0.8rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.3s ease;
        }

        .delete-existing-image:hover {
            background: #dc2626;
        }

        .articles-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 1.5rem;
        }

        .article-card {
            background: var(--white);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: var(--shadow);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .article-card:hover {
            transform: translateY(-8px);
            box-shadow: var(--shadow-lg);
        }

        .article-image {
            width: 100%;
            height: 200px;
            background: var(--gray-200);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .article-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }

        .article-card:hover .article-image img {
            transform: scale(1.05);
        }

        .article-content {
            padding: 1.5rem;
        }

        .article-title {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: var(--dark);
            line-height: 1.3;
        }

        .article-meta {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
            font-size: 0.85rem;
            color: var(--gray-500);
            flex-wrap: wrap;
        }

        .article-excerpt {
            color: var(--gray-600);
            font-size: 0.9rem;
            line-height: 1.6;
            margin-bottom: 1rem;
        }

        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 1rem;
        }

        .status-published {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success);
        }

        .status-draft {
            background: rgba(107, 114, 128, 0.1);
            color: var(--gray-600);
        }

        .action-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--gray-200);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
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

            .page-header {
                flex-direction: column;
                align-items: flex-start;
            }
        }

        @media (max-width: 768px) {
            .page-content {
                padding: 1.5rem 1rem;
            }

            .articles-grid {
                grid-template-columns: 1fr;
            }

            .form-grid {
                grid-template-columns: 1fr;
            }

            .top-bar {
                padding: 1rem;
            }

            .images-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 480px) {
            .action-buttons {
                flex-direction: column;
            }

            .btn {
                justify-content: center;
                width: 100%;
            }
        }

        /* Overlay for mobile sidebar */
        .sidebar-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .sidebar-overlay.active {
            display: block;
            opacity: 1;
        }
    </style>
</head>
<body>
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    
    <div class="admin-layout">
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <h2>GNUTS</h2>
                <p class="sidebar-subtitle">Admin Panel</p>
            </div>
            <nav>
                <a href="index.php" class="nav-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    </svg>
                    Dashboard
                </a>
                <a href="scholarships.php" class="nav-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                    </svg>
                    Scholarships
                </a>
                <a href="opportunities.php" class="nav-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                    Opportunities
                </a>
                <a href="innovations.php" class="nav-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                    Innovations
                </a>
                <a href="blog.php" class="nav-item active">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    Blog/News
                </a>
            </nav>
        </aside>

        <div class="main-content">
            <header class="top-bar">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <button class="menu-toggle" id="menuToggle">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="4" y1="12" x2="20" y2="12"></line>
                            <line x1="4" y1="6" x2="20" y2="6"></line>
                            <line x1="4" y1="18" x2="20" y2="18"></line>
                        </svg>
                    </button>
                    <h2 style="margin: 0;">Blog/News Management</h2>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; border-radius: 8px; transition: background 0.3s ease;">
                        <div style="width: 36px; height: 36px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 0.9rem;">
                            <?php echo $adminInitial; ?>
                        </div>
                        <span style="font-weight: 600;"><?php echo htmlspecialchars($adminName); ?></span>
                    </div>
                    <a href="index.php" class="btn btn-secondary btn-sm">Dashboard</a>
                </div>
            </header>

            <main class="page-content">
                <?php if ($message): ?>
                <div class="alert alert-<?php echo $messageType; ?>">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <?php if ($messageType === 'success'): ?>
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        <?php else: ?>
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                        <?php endif; ?>
                    </svg>
                    <?php echo htmlspecialchars($message); ?>
                </div>
                <?php endif; ?>

                <div class="page-header">
                    <h1 class="page-title"><?php echo $editArticle ? 'Edit' : 'Write New'; ?> Article</h1>
                </div>

                <div class="card">
                    <form method="POST" action="" enctype="multipart/form-data" id="articleForm">
                        <input type="hidden" name="action" value="<?php echo $editArticle ? 'edit' : 'add'; ?>">
                        <?php if ($editArticle): ?>
                        <input type="hidden" name="id" value="<?php echo $editArticle['id']; ?>">
                        <?php endif; ?>

                        <div class="form-grid">
                            <div class="form-group full-width">
                                <label for="title">Article Title *</label>
                                <input 
                                    type="text" 
                                    id="title" 
                                    name="title" 
                                    value="<?php echo htmlspecialchars($editArticle['title'] ?? ''); ?>"
                                    required
                                    placeholder="Enter article title"
                                >
                            </div>

                            <div class="form-group full-width">
                                <label for="content">Content *</label>
                                <textarea 
                                    id="content" 
                                    name="content" 
                                    required
                                    placeholder="Write your article content here..."
                                ><?php echo htmlspecialchars($editArticle['content'] ?? ''); ?></textarea>
                            </div>

                            <div class="form-group">
                                <label for="author">Author *</label>
                                <input 
                                    type="text" 
                                    id="author" 
                                    name="author"
                                    value="<?php echo htmlspecialchars($editArticle['author'] ?? 'GNUTS Admin'); ?>"
                                    required
                                >
                            </div>

                            <div class="form-group">
                                <label for="published_at">Publish Date *</label>
                                <input 
                                    type="date" 
                                    id="published_at" 
                                    name="published_at"
                                    value="<?php echo $editArticle['published_at'] ?? date('Y-m-d'); ?>"
                                    required
                                >
                            </div>

                            <div class="form-group">
                                <label for="status">Status *</label>
                                <select id="status" name="status" required>
                                    <option value="published" <?php echo ($editArticle['status'] ?? '') === 'published' ? 'selected' : ''; ?>>Published</option>
                                    <option value="draft" <?php echo ($editArticle['status'] ?? '') === 'draft' ? 'selected' : ''; ?>>Draft</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="image">Featured Image (Hero Image)</label>
                                <input 
                                    type="file" 
                                    id="image" 
                                    name="image"
                                    accept="image/*"
                                >
                                <?php if ($editArticle && $editArticle['image']): ?>
                                <div class="image-preview">
                                    <img src="../uploads/news/<?php echo htmlspecialchars($editArticle['image']); ?>" alt="Current image">
                                </div>
                                <?php endif; ?>
                            </div>
                        </div>

                        <!-- Existing Additional Images -->
                        <?php if ($editArticle && !empty($existingImages)): ?>
                        <div class="additional-images-section">
                            <h3 class="section-title">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                                Existing Article Images
                            </h3>
                            <div class="existing-images">
                                <?php foreach ($existingImages as $img): ?>
                                <div class="existing-image-card">
                                    <img src="../<?php echo htmlspecialchars($img['image_path']); ?>" alt="Article image">
                                    <div class="existing-image-info">
                                        <p class="existing-image-caption">
                                            <?php echo htmlspecialchars($img['caption'] ?: 'No caption'); ?>
                                        </p>
                                        <form method="POST" style="display: inline;" onsubmit="return confirm('Delete this image?');">
                                            <input type="hidden" name="action" value="delete_image">
                                            <input type="hidden" name="image_id" value="<?php echo $img['id']; ?>">
                                            <button type="submit" class="delete-existing-image">Delete</button>
                                        </form>
                                    </div>
                                </div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                        <?php endif; ?>

                        <!-- New Additional Images -->
                        <div class="additional-images-section">
                            <h3 class="section-title">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                                Additional Article Images
                            </h3>
                            <p style="color: var(--gray-600); margin-bottom: 1rem; font-size: 0.9rem;">
                                Add images that will appear within the article content. These images will be displayed automatically as readers scroll through the article.
                            </p>
                            
                            <div id="additionalImagesContainer" class="images-grid">
                                <!-- Image items will be added here -->
                            </div>
                            
                            <button type="button" class="add-image-btn" onclick="addImageField()">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Add Another Image
                            </button>
                        </div>

                        <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 2rem;">
                            <button type="submit" class="btn btn-primary">
                                <?php echo $editArticle ? 'Update' : 'Publish'; ?> Article
                            </button>
                            <?php if ($editArticle): ?>
                            <a href="blog.php" class="btn btn-secondary">Cancel</a>
                            <?php endif; ?>
                        </div>
                    </form>
                </div>

                <div class="page-header">
                    <h2 class="page-title">All Articles</h2>
                </div>

                <?php if (empty($newsArticles)): ?>
                <div class="card" style="text-align: center; padding: 3rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📰</div>
                    <p style="color: var(--gray-500);">No articles yet. Write your first article above!</p>
                </div>
                <?php else: ?>
                <div class="articles-grid">
                    <?php foreach($newsArticles as $article): ?>
                    <div class="article-card">
                        <div class="article-image">
                            <?php if($article['image']): ?>
                                <img src="../uploads/news/<?php echo htmlspecialchars($article['image']); ?>" alt="<?php echo htmlspecialchars($article['title']); ?>">
                            <?php else: ?>
                                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                    <polyline points="13 2 13 9 20 9"></polyline>
                                </svg>
                            <?php endif; ?>
                        </div>
                        <div class="article-content">
                            <span class="status-badge status-<?php echo $article['status']; ?>">
                                <?php echo strtoupper($article['status']); ?>
                            </span>
                            <h3 class="article-title"><?php echo htmlspecialchars($article['title']); ?></h3>
                            <div class="article-meta">
                                <span>👤 <?php echo htmlspecialchars($article['author']); ?></span>
                                <span>📅 <?php echo date('M d, Y', strtotime($article['published_at'])); ?></span>
                            </div>
                            <p class="article-excerpt">
                                <?php echo htmlspecialchars(substr($article['content'], 0, 120)) . '...'; ?>
                            </p>
                            <div class="action-buttons">
                                <a href="?edit=<?php echo $article['id']; ?>" class="btn btn-primary btn-sm">Edit</a>
                                <form method="POST" style="display: inline;" onsubmit="return confirm('Are you sure you want to delete this article?');">
                                    <input type="hidden" name="action" value="delete">
                                    <input type="hidden" name="id" value="<?php echo $article['id']; ?>">
                                    <button type="submit" class="btn btn-danger btn-sm">Delete</button>
                                </form>
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
            </main>
        </div>
    </div>

    <script>
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');

        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        });

        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });

        // Close sidebar on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) {
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            }
        });

        // Set active nav item
        const currentPage = window.location.pathname.split('/').pop();
        document.querySelectorAll('.nav-item').forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });

        // Additional Images Functionality
        let imageCounter = 0;

        function addImageField() {
            const container = document.getElementById('additionalImagesContainer');
            const imageItem = document.createElement('div');
            imageItem.className = 'image-item';
            imageItem.innerHTML = `
                <div class="image-item-preview">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                </div>
                <input 
                    type="file" 
                    name="additional_images[]" 
                    accept="image/*"
                    onchange="previewImage(this)"
                    style="margin-bottom: 0.5rem;"
                >
                <input 
                    type="text" 
                    name="image_captions[]" 
                    placeholder="Image caption (optional)"
                    style="font-size: 0.85rem;"
                >
                <button type="button" class="btn-danger btn-sm" onclick="removeImageField(this)" style="width: 100%; margin-top: 0.5rem;">
                    Remove
                </button>
            `;
            container.appendChild(imageItem);
            imageCounter++;
        }

        function removeImageField(button) {
            button.closest('.image-item').remove();
        }

        function previewImage(input) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = input.closest('.image-item').querySelector('.image-item-preview');
                    preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(input.files[0]);
            }
        }

        // Add one image field by default when page loads
        window.addEventListener('DOMContentLoaded', () => {
            addImageField();
        });
    </script>
</body>
</html>