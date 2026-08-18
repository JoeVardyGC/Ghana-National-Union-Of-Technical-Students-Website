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
        $description = trim($_POST['description']);
        $requirements = trim($_POST['requirements']);
        $deadline = $_POST['deadline'];
        $link = trim($_POST['link']);
        $status = $_POST['status'];

        $stmt = $pdo->prepare("
            INSERT INTO scholarships (title, description, requirements, deadline, link, status)
            VALUES (?, ?, ?, ?, ?, ?)
        ");

        if ($stmt->execute([$title, $description, $requirements, $deadline, $link, $status])) {
            $message = 'Scholarship added successfully!';
            $messageType = 'success';
        } else {
            $message = 'Error adding scholarship.';
            $messageType = 'error';
        }
    }

    if ($action === 'edit') {
        $id = $_POST['id'];
        $title = trim($_POST['title']);
        $description = trim($_POST['description']);
        $requirements = trim($_POST['requirements']);
        $deadline = $_POST['deadline'];
        $link = trim($_POST['link']);
        $status = $_POST['status'];

        $stmt = $pdo->prepare("
            UPDATE scholarships
            SET title = ?, description = ?, requirements = ?, deadline = ?, link = ?, status = ?
            WHERE id = ?
        ");

        if ($stmt->execute([$title, $description, $requirements, $deadline, $link, $status, $id])) {
            $message = 'Scholarship updated successfully!';
            $messageType = 'success';
        } else {
            $message = 'Error updating scholarship.';
            $messageType = 'error';
        }
    }

    if ($action === 'delete') {
        $id = $_POST['id'];
        $stmt = $pdo->prepare("DELETE FROM scholarships WHERE id = ?");

        if ($stmt->execute([$id])) {
            $message = 'Scholarship deleted successfully!';
            $messageType = 'success';
        } else {
            $message = 'Error deleting scholarship.';
            $messageType = 'error';
        }
    }
}

// Fetch all scholarships
$scholarships = getAllRecords($pdo, 'scholarships', 'created_at DESC');

// Get scholarship for editing if ID provided
$editScholarship = null;
if (isset($_GET['edit'])) {
    $editScholarship = getRecord($pdo, 'scholarships', $_GET['edit']);
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
    <title>Scholarships Management - GNUTS Admin</title>
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

        .btn-secondary {
            background: var(--gray-300);
            color: var(--dark);
        }

        .btn-secondary:hover {
            background: var(--gray-400);
            transform: translateY(-1px);
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
        input[type="url"],
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
            min-height: 120px;
        }

        .table-container {
            background: var(--white);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: var(--shadow);
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        thead {
            background: var(--gray-100);
        }

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

        tbody tr:hover {
            background: var(--gray-100);
        }

        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            display: inline-block;
        }

        .status-active {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success);
        }

        .status-closed {
            background: rgba(107, 114, 128, 0.1);
            color: var(--gray-600);
        }

        .action-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
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

            .form-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 768px) {
            .page-content {
                padding: 1.5rem 1rem;
            }

            .table-container {
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
            }

            .top-bar {
                padding: 1rem;
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

            th, td {
                padding: 0.75rem 0.5rem;
                font-size: 0.9rem;
            }

            .action-buttons {
                flex-direction: column;
            }

            .btn {
                justify-content: center;
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <!-- Sidebar Overlay -->
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    
    <div class="admin-layout">
        <!-- Sidebar -->
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
                <a href="scholarships.php" class="nav-item active">
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
                <a href="blog.php" class="nav-item">
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
                    <h2 style="margin: 0;">Scholarships Management</h2>
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
                    <h1 class="page-title"><?php echo $editScholarship ? 'Edit' : 'Add New'; ?> Scholarship</h1>
                </div>

                <div class="card">
                    <form method="POST" action="">
                        <input type="hidden" name="action" value="<?php echo $editScholarship ? 'edit' : 'add'; ?>">
                        <?php if ($editScholarship): ?>
                        <input type="hidden" name="id" value="<?php echo $editScholarship['id']; ?>">
                        <?php endif; ?>

                        <div class="form-grid">
                            <div class="form-group full-width">
                                <label for="title">Scholarship Title *</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    required
                                    value="<?php echo htmlspecialchars($editScholarship['title'] ?? ''); ?>"
                                >
                            </div>

                            <div class="form-group full-width">
                                <label for="description">Description *</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    required
                                ><?php echo htmlspecialchars($editScholarship['description'] ?? ''); ?></textarea>
                            </div>

                            <div class="form-group full-width">
                                <label for="requirements">Requirements</label>
                                <textarea
                                    id="requirements"
                                    name="requirements"
                                ><?php echo htmlspecialchars($editScholarship['requirements'] ?? ''); ?></textarea>
                            </div>

                            <div class="form-group">
                                <label for="deadline">Application Deadline</label>
                                <input
                                    type="date"
                                    id="deadline"
                                    name="deadline"
                                    value="<?php echo $editScholarship['deadline'] ?? ''; ?>"
                                >
                            </div>

                            <div class="form-group">
                                <label for="status">Status *</label>
                                <select id="status" name="status" required>
                                    <option value="active" <?php echo ($editScholarship['status'] ?? '') === 'active' ? 'selected' : ''; ?>>Active</option>
                                    <option value="closed" <?php echo ($editScholarship['status'] ?? '') === 'closed' ? 'selected' : ''; ?>>Closed</option>
                                </select>
                            </div>

                            <div class="form-group full-width">
                                <label for="link">Application Link</label>
                                <input
                                    type="url"
                                    id="link"
                                    name="link"
                                    placeholder="https://..."
                                    value="<?php echo htmlspecialchars($editScholarship['link'] ?? ''); ?>"
                                >
                            </div>
                        </div>

                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                            <button type="submit" class="btn btn-primary">
                                <?php echo $editScholarship ? 'Update' : 'Add'; ?> Scholarship
                            </button>
                            <?php if ($editScholarship): ?>
                            <a href="scholarships.php" class="btn btn-secondary">Cancel</a>
                            <?php endif; ?>
                        </div>
                    </form>
                </div>

                <div class="page-header">
                    <h2 class="page-title">All Scholarships</h2>
                </div>

                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Deadline</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (empty($scholarships)): ?>
                            <tr>
                                <td colspan="5" style="text-align:center; color:var(--gray-500); padding:3rem;">
                                    No scholarships found. Add your first scholarship above!
                                </td>
                            </tr>
                            <?php else: ?>
                            <?php foreach ($scholarships as $scholarship): ?>
                            <tr>
                                <td><strong><?php echo htmlspecialchars($scholarship['title']); ?></strong></td>
                                <td>
                                    <?php
                                    echo $scholarship['deadline']
                                        ? date('M d, Y', strtotime($scholarship['deadline']))
                                        : 'N/A';
                                    ?>
                                </td>
                                <td>
                                    <span class="status-badge status-<?php echo $scholarship['status']; ?>">
                                        <?php echo strtoupper($scholarship['status']); ?>
                                    </span>
                                </td>
                                <td><?php echo date('M d, Y', strtotime($scholarship['created_at'])); ?></td>
                                <td>
                                    <div class="action-buttons">
                                        <a href="?edit=<?php echo $scholarship['id']; ?>" class="btn btn-primary btn-sm">Edit</a>
                                        <form method="POST" style="display:inline;" onsubmit="return confirm('Are you sure you want to delete this scholarship?');">
                                            <input type="hidden" name="action" value="delete">
                                            <input type="hidden" name="id" value="<?php echo $scholarship['id']; ?>">
                                            <button type="submit" class="btn btn-danger btn-sm">Delete</button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
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
    </script>
</body>
</html>
