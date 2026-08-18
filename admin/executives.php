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
            $photoPath = null;
            if (isset($_FILES['photo']) && $_FILES['photo']['error'] == 0) {
                $targetDir = "../uploads/executives/";
                if (!file_exists($targetDir)) mkdir($targetDir, 0777, true);
                $ext = strtolower(pathinfo($_FILES["photo"]["name"], PATHINFO_EXTENSION));
                $newFileName = uniqid() . '.' . $ext;
                if (move_uploaded_file($_FILES["photo"]["tmp_name"], $targetDir . $newFileName)) {
                    $photoPath = "uploads/executives/" . $newFileName;
                }
            }
            $stmt = $pdo->prepare("INSERT INTO executives (full_name, position, email, phone, bio, photo, display_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
            $stmt->execute([$_POST['full_name'], $_POST['position'], $_POST['email'], $_POST['phone'], $_POST['bio'], $photoPath, $_POST['display_order']]);
            $_SESSION['success'] = "Executive added successfully!";
            header('Location: executives.php');
            exit();

        case 'edit':
            $photoPath = $_POST['existing_photo'];
            if (isset($_FILES['photo']) && $_FILES['photo']['error'] == 0) {
                $targetDir = "../uploads/executives/";
                if (!file_exists($targetDir)) mkdir($targetDir, 0777, true);
                $ext = strtolower(pathinfo($_FILES["photo"]["name"], PATHINFO_EXTENSION));
                $newFileName = uniqid() . '.' . $ext;
                if (move_uploaded_file($_FILES["photo"]["tmp_name"], $targetDir . $newFileName)) {
                    if ($photoPath && file_exists("../" . $photoPath)) unlink("../" . $photoPath);
                    $photoPath = "uploads/executives/" . $newFileName;
                }
            }
            $stmt = $pdo->prepare("UPDATE executives SET full_name=?, position=?, email=?, phone=?, bio=?, photo=?, display_order=? WHERE id=?");
            $stmt->execute([$_POST['full_name'], $_POST['position'], $_POST['email'], $_POST['phone'], $_POST['bio'], $photoPath, $_POST['display_order'], $_POST['id']]);
            $_SESSION['success'] = "Executive updated successfully!";
            header('Location: executives.php');
            exit();

        case 'delete':
            $stmt = $pdo->prepare("SELECT photo FROM executives WHERE id=?");
            $stmt->execute([$_POST['id']]);
            $executive = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($executive['photo'] && file_exists("../" . $executive['photo'])) {
                unlink("../" . $executive['photo']);
            }
            $stmt = $pdo->prepare("DELETE FROM executives WHERE id=?");
            $stmt->execute([$_POST['id']]);
            $_SESSION['success'] = "Executive deleted successfully!";
            header('Location: executives.php');
            exit();
    }
}

// Get executive for editing
$editExecutive = null;
if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare("SELECT * FROM executives WHERE id=?");
    $stmt->execute([$_GET['edit']]);
    $editExecutive = $stmt->fetch(PDO::FETCH_ASSOC);
}

// Fetch all executives
$executives = $pdo->query("SELECT * FROM executives ORDER BY display_order ASC, created_at DESC")->fetchAll(PDO::FETCH_ASSOC);

// Get statistics
$stats = [
    'total' => count($executives),
];

// Admin info (same as paste.txt)
$adminName = $_SESSION['admin_name'] ?? 'Admin';
$adminInitial = strtoupper(substr($adminName, 0, 1));
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Executives - GNUTS Admin</title>
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
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --info: #3b82f6;
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; 
            background: var(--gray-100); 
            color: var(--dark); 
            line-height: 1.6; 
            overflow-x: hidden;
        }
        
        .admin-layout { display: flex; min-height: 100vh; }
        
        /* Sidebar - Complete from paste.txt */
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
        .sidebar-nav { padding: 1.5rem 0; }
        .nav-section { margin-bottom: 2rem; }
        .nav-section-title { 
            padding: 0 1.5rem 0.5rem; 
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
            color: rgba(255,255,255,0.8); 
            text-decoration: none; 
            transition: all 0.3s ease; 
            border-left: 4px solid transparent; 
        }
        .nav-item:hover, .nav-item.active { 
            background: rgba(255,255,255,0.15); 
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
        
        /* Main content */
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
        
        .page-content { padding: 2rem; }
        
        /* Rest of the styles remain the same */
        .btn { 
            padding: 0.75rem 1.5rem; 
            border: none; 
            border-radius: 8px; 
            font-family: 'Montserrat'; 
            font-weight: 600; 
            font-size: 0.9rem; 
            cursor: pointer; 
            transition: all 0.3s; 
            text-decoration: none; 
            display: inline-flex; 
            align-items: center; 
            gap: 0.5rem; 
        }
        .btn-primary { background: var(--primary); color: white; }
        .btn-primary:hover { background: #013300; transform: translateY(-2px); }
        .btn-secondary { background: var(--gray-200); color: var(--dark); }
        .btn-success { background: var(--success); color: white; }
        .btn-danger { background: var(--danger); color: white; }
        .btn-info { background: var(--info); color: white; }
        .btn-sm { padding: 0.5rem 1rem; font-size: 0.85rem; }
        
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
        
        .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 1.5rem; 
            margin-bottom: 2rem; 
        }
        .stat-card { 
            background: white; 
            border-radius: 12px; 
            padding: 1.5rem; 
            box-shadow: var(--shadow); 
            border-left: 4px solid var(--primary); 
        }
        .stat-label { font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.5rem; }
        .stat-value { font-size: 2rem; font-weight: 800; }
        
        .form-card { 
            background: white; 
            border-radius: 12px; 
            padding: 2rem; 
            box-shadow: var(--shadow); 
            margin-bottom: 2rem; 
        }
        .form-card-title { 
            font-size: 1.5rem; 
            font-weight: 700; 
            margin-bottom: 1.5rem; 
            padding-bottom: 1rem; 
            border-bottom: 2px solid var(--gray-200); 
        }
        .form-group { margin-bottom: 1.5rem; }
        .form-label { 
            display: block; 
            margin-bottom: 0.5rem; 
            font-weight: 600; 
            font-size: 0.9rem; 
        }
        .form-label.required::after { content: ' *'; color: var(--danger); }
        .form-input, .form-select, .form-textarea { 
            width: 100%; 
            padding: 0.875rem 1rem; 
            border: 2px solid var(--gray-200); 
            border-radius: 8px; 
            font-family: 'Montserrat'; 
            font-size: 0.95rem; 
            transition: all 0.3s; 
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus { 
            outline: none; 
            border-color: var(--primary); 
            box-shadow: 0 0 0 3px rgba(1, 73, 0, 0.1); 
        }
        .form-textarea { resize: vertical; min-height: 120px; }
        .form-hint { font-size: 0.85rem; color: var(--gray-500); margin-top: 0.5rem; }
        .form-actions { 
            display: flex; 
            gap: 1rem; 
            margin-top: 2rem; 
            padding-top: 2rem; 
            border-top: 2px solid var(--gray-200); 
        }
        
        .executives-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
            gap: 2rem; 
        }
        .executive-card { 
            background: white; 
            border-radius: 16px; 
            overflow: hidden; 
            box-shadow: var(--shadow); 
            transition: all 0.3s; 
            position: relative; 
        }
        .executive-card:hover { 
            transform: translateY(-8px); 
            box-shadow: var(--shadow-lg); 
        }
        .executive-image-container { 
            position: relative; 
            height: 320px; 
            background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%); 
            overflow: hidden; 
        }
        .executive-image-container img { 
            width: 100%; 
            height: 100%; 
            object-fit: cover; 
            object-position: center top; 
        }
        .executive-image-placeholder { 
            width: 100%; 
            height: 100%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 5rem; 
            font-weight: 700; 
            color: var(--gray-400); 
        }
        .executive-badge { 
            position: absolute; 
            bottom: 0; 
            left: 0; 
            right: 0; 
            background: var(--primary); 
            color: white; 
            padding: 0.75rem 1rem; 
            text-align: center; 
        }
        .executive-badge-name { 
            font-size: 1.1rem; 
            font-weight: 700; 
            text-transform: uppercase; 
            letter-spacing: 0.5px; 
            margin-bottom: 0.25rem; 
        }
        .executive-badge-position { 
            font-size: 0.85rem; 
            font-weight: 500; 
            opacity: 0.95; 
        }
        .executive-content { padding: 1.5rem; }
        .executive-title { 
            font-size: 1.25rem; 
            font-weight: 700; 
            color: var(--dark); 
            margin-bottom: 0.5rem; 
        }
        .executive-position-label { 
            font-size: 0.95rem; 
            color: var(--gray-600); 
            margin-bottom: 1rem; 
        }
        .executive-divider { 
            height: 2px; 
            background: var(--gray-200); 
            margin: 1rem 0; 
        }
        .executive-info-item { 
            display: flex; 
            align-items: flex-start; 
            gap: 0.5rem; 
            margin-bottom: 0.75rem; 
            font-size: 0.9rem; 
            color: var(--gray-600); 
            line-height: 1.5; 
        }
        .executive-bio { 
            font-size: 0.9rem; 
            color: var(--gray-600); 
            line-height: 1.6; 
            margin-bottom: 1rem; 
        }
        .executive-actions { 
            display: flex; 
            gap: 0.5rem; 
            padding-top: 1rem; 
            border-top: 1px solid var(--gray-200); 
        }
        .executive-order-badge { 
            position: absolute; 
            top: 1rem; 
            right: 1rem; 
            background: white; 
            color: var(--primary); 
            padding: 0.4rem 0.8rem; 
            border-radius: 20px; 
            font-size: 0.8rem; 
            font-weight: 700; 
            box-shadow: var(--shadow); 
            z-index: 2; 
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
            overflow-y: auto; 
        }
        .modal.active { display: flex; }
        .modal-content { 
            background: white; 
            border-radius: 12px; 
            padding: 2rem; 
            max-width: 500px; 
            width: 100%; 
            max-height: 90vh; 
            overflow-y: auto; 
        }
        .modal-title { 
            font-size: 1.5rem; 
            font-weight: 700; 
            margin-bottom: 1rem; 
        }
        .modal-actions { 
            display: flex; 
            gap: 1rem; 
            justify-content: flex-end; 
            margin-top: 1.5rem; 
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
            .executives-grid { 
                grid-template-columns: 1fr; 
            }
            .executive-image-container { 
                height: 280px; 
            }
            .page-content { 
                padding: 1.5rem 1rem; 
            }
            .form-actions { 
                flex-direction: column; 
            }
        }
        
        @media (max-width: 480px) {
            .page-content { 
                padding: 1rem 0.75rem; 
            }
            .top-bar { 
                padding: 1rem; 
            }
            .executive-image-container { 
                height: 240px; 
            }
            * Tablet Landscape (769px - 1024px) */
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


        }
    </style>
</head>
<body>
    <div class="admin-layout">
        <!-- Sidebar - Complete from paste.txt -->
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo">
                    <img src="../includes/assets/gnuts-logo.png" alt="GNUTS Logo" 
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
                                <path d="M22 10v6"></path>
                                <path d="M2 10l10-5 10 5-10 5z"></path>
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
                    <div class="nav-section-title">Administration</div>
                    <a href="executives.php" class="nav-item active">
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
                                <line x1="21" y1="14" x2="10" y2="3"></line>
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
                    <div>Executives Management</div>
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
                <div class="alert alert-success">✓ <?php echo $_SESSION['success']; unset($_SESSION['success']); ?></div>
                <?php endif; ?>

                <?php if(isset($_GET['action']) && $_GET['action'] == 'new' || isset($_GET['edit'])): ?>
                    <div class="form-card">
                        <h2 class="form-card-title"><?php echo isset($_GET['edit']) ? 'Edit' : 'Add New'; ?> Executive</h2>
                        
                        <form method="POST" enctype="multipart/form-data">
                            <input type="hidden" name="action" value="<?php echo isset($_GET['edit']) ? 'edit' : 'add'; ?>">
                            <?php if(isset($_GET['edit'])): ?>
                            <input type="hidden" name="id" value="<?php echo $editExecutive['id']; ?>">
                            <input type="hidden" name="existing_photo" value="<?php echo $editExecutive['photo']; ?>">
                            <?php endif; ?>

                            <div class="form-group">
                                <label class="form-label required">Full Name</label>
                                <input type="text" name="full_name" class="form-input" required value="<?php echo isset($editExecutive) ? htmlspecialchars($editExecutive['full_name']) : ''; ?>" placeholder="Enter full name">
                            </div>

                            <div class="form-group">
                                <label class="form-label required">Position/Portfolio</label>
                                <input type="text" name="position" class="form-input" required value="<?php echo isset($editExecutive) ? htmlspecialchars($editExecutive['position']) : ''; ?>" placeholder="e.g., NUGS President - 1997">
                            </div>

                            <div class="form-group">
                                <label class="form-label required">Email Address</label>
                                <input type="email" name="email" class="form-input" required value="<?php echo isset($editExecutive) ? htmlspecialchars($editExecutive['email']) : ''; ?>" placeholder="executive@gnuts.org.gh">
                            </div>

                            <div class="form-group">
                                <label class="form-label required">Phone Number</label>
                                <input type="tel" name="phone" class="form-input" required value="<?php echo isset($editExecutive) ? htmlspecialchars($editExecutive['phone']) : ''; ?>" placeholder="+233 24 000 0000">
                            </div>

                            <div class="form-group">
                                <label class="form-label required">Profile Photo</label>
                                <input type="file" name="photo" class="form-input" accept="image/*" <?php echo !isset($editExecutive) ? 'required' : ''; ?>>
                                <p class="form-hint">Upload a professional portrait photo (JPG, PNG). Recommended size: 400x500px minimum.</p>
                                <?php if(isset($editExecutive) && $editExecutive['photo']): ?>
                                <img src="../<?php echo $editExecutive['photo']; ?>" alt="Current" style="max-width: 200px; margin-top: 1rem; border-radius: 8px;">
                                <?php endif; ?>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Biography/Additional Info</label>
                                <textarea name="bio" class="form-textarea" placeholder="Member of Parliament, Former Minister, etc..."><?php echo isset($editExecutive) ? htmlspecialchars($editExecutive['bio']) : ''; ?></textarea>
                            </div>

                            <div class="form-group">
                                <label class="form-label required">Display Order</label>
                                <input type="number" name="display_order" class="form-input" required value="<?php echo isset($editExecutive) ? $editExecutive['display_order'] : count($executives) + 1; ?>" min="1" placeholder="1">
                                <p class="form-hint">Lower numbers appear first (1 = First President, 2 = Second, etc.)</p>
                            </div>

                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">
                                    ✓ <?php echo isset($_GET['edit']) ? 'Update' : 'Add'; ?> Executive
                                </button>
                                <a href="executives.php" class="btn btn-secondary">Cancel</a>
                            </div>
                        </form>
                    </div>
                <?php else: ?>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-label">Total Executives</div>
                            <div class="stat-value"><?php echo $stats['total']; ?></div>
                        </div>
                    </div>

                    <div class="executives-grid">
                        <?php if(empty($executives)): ?>
                            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                                <h3>No Executives Yet</h3>
                                <p style="color: var(--gray-500); margin: 1rem 0;">Add your first executive to get started.</p>
                                <a href="?action=new" class="btn btn-primary">Add Executive</a>
                            </div>
                        <?php else: ?>
                            <?php foreach($executives as $executive): ?>
                            <div class="executive-card">
                                <span class="executive-order-badge">#<?php echo $executive['display_order']; ?></span>
                                
                                <div class="executive-image-container">
                                    <?php if($executive['photo']): ?>
                                        <img src="../<?php echo htmlspecialchars($executive['photo']); ?>" alt="<?php echo htmlspecialchars($executive['full_name']); ?>">
                                    <?php else: ?>
                                        <div class="executive-image-placeholder">
                                            <?php echo strtoupper(substr($executive['full_name'], 0, 1)); ?>
                                        </div>
                                    <?php endif; ?>
                                    
                                    <div class="executive-badge">
                                        <div class="executive-badge-name"><?php echo htmlspecialchars($executive['full_name']); ?></div>
                                        <div class="executive-badge-position"><?php echo htmlspecialchars($executive['position']); ?></div>
                                    </div>
                                </div>
                                
                                <div class="executive-content">
                                    
                                    
                                    <div class="executive-divider"></div>
                                    
                                    <div class="executive-info-item">
                                        📧 <?php echo htmlspecialchars($executive['email']); ?>
                                    </div>
                                    <div class="executive-info-item">
                                        📞 <?php echo htmlspecialchars($executive['phone']); ?>
                                    </div>
                                    
                                    <?php if($executive['bio']): ?>
                                    <div class="executive-divider"></div>
                                    <div class="executive-bio">
                                        <?php echo nl2br(htmlspecialchars($executive['bio'])); ?>
                                    </div>
                                    <?php endif; ?>
                                    
                                    <div class="executive-actions">
                                        <a href="?edit=<?php echo $executive['id']; ?>" class="btn btn-sm btn-secondary" style="flex: 1;">✏️ Edit</a>
                                        <button onclick="deleteExecutive(<?php echo $executive['id']; ?>)" class="btn btn-sm btn-danger" style="flex: 1;">🗑️ Delete</button>
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

    <div class="modal" id="deleteModal">
        <div class="modal-content">
            <h3 class="modal-title">Delete Executive?</h3>
            <p>Are you sure you want to delete this executive? This action cannot be undone.</p>
            <form method="POST">
                <input type="hidden" name="action" value="delete">
                <input type="hidden" name="id" id="deleteId">
                <div class="modal-actions">
                    <button type="button" onclick="closeModal('deleteModal')" class="btn btn-secondary">Cancel</button>
                    <button type="submit" class="btn btn-danger">Delete</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        // Sidebar toggle functionality (same as paste.txt)
        (function() {
            'use strict';
            const menuToggle = document.getElementById('menuToggle');
            const sidebar = document.getElementById('sidebar');
            
            if (!menuToggle || !sidebar) return;
            
            // Toggle sidebar
            menuToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                sidebar.classList.toggle('active');
            });
            
            // Close on outside click (mobile)
            document.addEventListener('click', function(e) {
                if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
                    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                        sidebar.classList.remove('active');
                    }
                }
            });
            
            // Close on resize to desktop
            window.addEventListener('resize', function() {
                if (window.innerWidth > 768 && sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                }
            });
            
            // Close on Escape
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && window.innerWidth <= 768 && sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                }
            });
        })();
        
        function deleteExecutive(id) {
            document.getElementById('deleteId').value = id;
            document.getElementById('deleteModal').classList.add('active');
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
        }

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeModal(this.id);
                }
            });
        });
    </script>
</body>
</html>
