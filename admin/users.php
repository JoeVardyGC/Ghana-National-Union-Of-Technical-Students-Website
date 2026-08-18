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
        $full_name = trim($_POST['full_name']);
        $email = trim($_POST['email']);
        $password = $_POST['password'];
        $role = $_POST['role'];
        
        // Check if email already exists
        $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
        $checkStmt->execute([$email]);
        
        if ($checkStmt->fetchColumn() > 0) {
            $message = 'Email already exists!';
            $messageType = 'error';
        } else {
            // In production, use password_hash()
            // $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            
            $stmt = $pdo->prepare("INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)");
            
            if ($stmt->execute([$full_name, $email, $password, $role])) {
                $message = 'User added successfully!';
                $messageType = 'success';
            } else {
                $message = 'Error adding user.';
                $messageType = 'error';
            }
        }
    }
    
    if ($action === 'edit') {
        $id = $_POST['id'];
        $full_name = trim($_POST['full_name']);
        $email = trim($_POST['email']);
        $role = $_POST['role'];
        
        // Check if email exists for another user
        $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = ? AND id != ?");
        $checkStmt->execute([$email, $id]);
        
        if ($checkStmt->fetchColumn() > 0) {
            $message = 'Email already exists!';
            $messageType = 'error';
        } else {
            // Update with new password if provided
            if (!empty($_POST['password'])) {
                $password = $_POST['password'];
                // In production: $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("UPDATE users SET full_name=?, email=?, password=?, role=? WHERE id=?");
                $success = $stmt->execute([$full_name, $email, $password, $role, $id]);
            } else {
                // Update without password
                $stmt = $pdo->prepare("UPDATE users SET full_name=?, email=?, role=? WHERE id=?");
                $success = $stmt->execute([$full_name, $email, $role, $id]);
            }
            
            if ($success) {
                $message = 'User updated successfully!';
                $messageType = 'success';
            } else {
                $message = 'Error updating user.';
                $messageType = 'error';
            }
        }
    }
    
    if ($action === 'delete') {
        $id = $_POST['id'];
        
        // Prevent deleting yourself
        if ($id == $_SESSION['admin_id']) {
            $message = 'You cannot delete your own account!';
            $messageType = 'error';
        } else {
            $stmt = $pdo->prepare("DELETE FROM users WHERE id=?");
            
            if ($stmt->execute([$id])) {
                $message = 'User deleted successfully!';
                $messageType = 'success';
            } else {
                $message = 'Error deleting user.';
                $messageType = 'error';
            }
        }
    }
}

// Fetch all users
$users = getAllRecords($pdo, 'users', 'created_at DESC');

// Get user for editing if ID provided
$editUser = null;
if (isset($_GET['edit'])) {
    $editUser = getRecord($pdo, 'users', $_GET['edit']);
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
    <title>Users Management - GNUTS Admin</title>
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
        
        /* Sidebar - Complete from executives.php */
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
        
        .page-content { padding: 2rem; min-width: 0; }
        
        /* User Management Styles */
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
        .btn-primary { background: var(--primary); color: white; }
        .btn-primary:hover { background: #023300; transform: translateY(-2px); }
        .btn-danger { background: var(--danger); color: white; }
        .btn-secondary { background: var(--gray-200); color: var(--dark); }
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
            border-left: 4px solid var(--success);
            color: var(--success);
        }
        .alert-error {
            background: rgba(239, 68, 68, 0.1);
            border-left: 4px solid var(--danger);
            color: var(--danger);
        }
        
        .card {
            background: white;
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
        label {
            font-weight: 600;
            color: var(--dark);
            font-size: 0.9rem;
        }
        input[type="text"], input[type="email"], input[type="password"], select {
            padding: 0.75rem;
            border: 2px solid var(--gray-200);
            border-radius: 8px;
            font-size: 0.95rem;
            font-family: 'Montserrat', sans-serif;
            transition: border-color 0.3s ease;
        }
        input:focus, select:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(1, 73, 0, 0.15);
        }
        
        .table-container {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: var(--shadow);
        }
        table { width: 100%; border-collapse: collapse; }
        thead { background: var(--gray-100); }
        th {
            padding: 1rem;
            text-align: left;
            font-weight: 700;
            color: var(--dark);
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        td {
            padding: 1rem;
            border-bottom: 1px solid var(--gray-200);
        }
        tbody tr:hover { background: var(--gray-100); }
        
        .user-avatar {
            width: 40px;
            height: 40px;
            background: var(--primary);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
        }
        .role-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            display: inline-block;
        }
        .role-admin {
            background: rgba(1, 73, 0, 0.1);
            color: var(--primary);
        }
        .role-editor {
            background: rgba(217, 160, 0, 0.1);
            color: var(--secondary);
        }
        .action-buttons {
            display: flex;
            gap: 0.5rem;
        }
        .info-box {
            background: rgba(59, 130, 246, 0.1);
            border-left: 4px solid #3b82f6;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            font-size: 0.9rem;
            color: var(--gray-600);
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
            .sidebar { transform: translateX(-100%); }
            .sidebar.active { transform: translateX(0); }
            .main-content { margin-left: 0; }
            .menu-toggle { display: inline-flex; }
            .user-info { display: none; }
            .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
            .page-content { padding: 1.5rem 1rem; }
            .form-grid { grid-template-columns: 1fr; }
            .table-container { overflow-x: auto; }
            .action-buttons { flex-direction: column; }
        }
        @media (max-width: 480px) {
            .page-content { padding: 1rem 0.75rem; }
            .top-bar { padding: 1rem; }
        }
    </style>
</head>
<body>
    <div class="admin-layout">
        <!-- Complete Sidebar from executives.php -->
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
                                <path d="M22 10v6"></path><path d="M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                            </svg>
                        </div>
                        Scholarships
                    </a>
                    <a href="opportunities.php" class="nav-item">
                        <div class="nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
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
                                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline>
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
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        Executives
                    </a>
                    <a href="users.php" class="nav-item active">
                        <div class="nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><path d="M20 8a6 6 0 0 1-12 0"></path>
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
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line><line x1="21" y1="14" x2="10" y2="3"></line>
                            </svg>
                        </div>
                        View Site
                    </a>
                    <a href="logout.php" class="nav-item">
                        <div class="nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>
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
                    <h1 style="margin: 0; font-size: 1.5rem; font-weight: 700;">Users Management</h1>
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
                    <h1 class="page-title"><?php echo $editUser ? 'Edit' : 'Add New'; ?> User</h1>
                    <?php if (!$editUser): ?>
                    <a href="users.php" class="btn btn-secondary">← Back to List</a>
                    <?php endif; ?>
                </div>

                <div class="info-box">
                    <strong>⚠️ Security Note:</strong> In production, passwords should be hashed using <code>password_hash()</code>. Current implementation uses plain text for development only.
                </div>

                <div class="card">
                    <form method="POST" action="">
                        <input type="hidden" name="action" value="<?php echo $editUser ? 'edit' : 'add'; ?>">
                        <?php if ($editUser): ?>
                        <input type="hidden" name="id" value="<?php echo $editUser['id']; ?>">
                        <?php endif; ?>

                        <div class="form-grid">
                            <div class="form-group">
                                <label for="full_name">Full Name *</label>
                                <input type="text" id="full_name" name="full_name" 
                                       value="<?php echo htmlspecialchars($editUser['full_name'] ?? ''); ?>" required>
                            </div>

                            <div class="form-group">
                                <label for="email">Email Address *</label>
                                <input type="email" id="email" name="email" 
                                       value="<?php echo htmlspecialchars($editUser['email'] ?? ''); ?>" required>
                            </div>

                            <div class="form-group">
                                <label for="password">Password <?php echo $editUser ? '(leave empty to keep current)' : '*'; ?></label>
                                <input type="password" id="password" name="password"
                                       <?php echo $editUser ? '' : 'required'; ?> placeholder="Enter password">
                            </div>

                            <div class="form-group">
                                <label for="role">Role *</label>
                                <select id="role" name="role" required>
                                    <option value="admin" <?php echo ($editUser['role'] ?? '') === 'admin' ? 'selected' : ''; ?>>Admin</option>
                                    <option value="editor" <?php echo ($editUser['role'] ?? '') === 'editor' ? 'selected' : ''; ?>>Editor</option>
                                </select>
                            </div>
                        </div>

                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                            <button type="submit" class="btn btn-primary">
                                <?php echo $editUser ? 'Update' : 'Add'; ?> User
                            </button>
                            <?php if ($editUser): ?>
                            <a href="users.php" class="btn btn-secondary">Cancel</a>
                            <?php endif; ?>
                        </div>
                    </form>
                </div>

                <?php if (!$editUser): ?>
                <div class="page-header">
                    <h2 class="page-title">All Users (<?php echo count($users); ?>)</h2>
                </div>

                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (empty($users)): ?>
                            <tr>
                                <td colspan="5" style="text-align: center; color: var(--gray-500); padding: 3rem;">
                                    No users found.
                                </td>
                            </tr>
                            <?php else: ?>
                            <?php foreach($users as $user): ?>
                            <tr>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 1rem;">
                                        <div class="user-avatar">
                                            <?php echo strtoupper(substr($user['full_name'], 0, 1)); ?>
                                        </div>
                                        <strong><?php echo htmlspecialchars($user['full_name']); ?></strong>
                                    </div>
                                </td>
                                <td><?php echo htmlspecialchars($user['email']); ?></td>
                                <td>
                                    <span class="role-badge role-<?php echo $user['role']; ?>">
                                        <?php echo strtoupper($user['role']); ?>
                                    </span>
                                </td>
                                <td><?php echo date('M d, Y', strtotime($user['created_at'])); ?></td>
                                <td>
                                    <div class="action-buttons">
                                        <a href="?edit=<?php echo $user['id']; ?>" class="btn btn-primary btn-sm">Edit</a>
                                        <?php if ($user['id'] != $_SESSION['admin_id']): ?>
                                        <form method="POST" style="display: inline;" onsubmit="return confirm('Are you sure you want to delete this user?');">
                                            <input type="hidden" name="action" value="delete">
                                            <input type="hidden" name="id" value="<?php echo $user['id']; ?>">
                                            <button type="submit" class="btn btn-danger btn-sm">Delete</button>
                                        </form>
                                        <?php else: ?>
                                        <button class="btn btn-secondary btn-sm" disabled>Current User</button>
                                        <?php endif; ?>
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
                <?php endif; ?>
            </main>
        </div>
    </div>

    <script>
        // Sidebar toggle functionality (same as executives.php)
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
    </script>
</body>
</html>
