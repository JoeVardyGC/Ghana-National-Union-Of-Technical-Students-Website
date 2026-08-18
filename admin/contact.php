
<?php
session_start();

// Check if admin is logged in
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit();
}

// Database connection
$conn = new mysqli("127.0.0.1", "root", "", "gnuts");

// Check connection
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

// Handle form submission for updating contact info
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'update_contact') {
        $phone = $_POST['phone'] ?? '';
        $email = $_POST['email'] ?? '';
        $address = $_POST['address'] ?? '';
        $office_hours = $_POST['office_hours'] ?? '';
        $facebook = $_POST['facebook'] ?? '';
        $twitter = $_POST['twitter'] ?? '';
        $instagram = $_POST['instagram'] ?? '';
        $youtube = $_POST['youtube'] ?? '';
        $linkedin = $_POST['linkedin'] ?? '';
        $whatsapp = $_POST['whatsapp'] ?? '';
        
        // Check if contact info exists
        $check = $conn->query("SELECT COUNT(*) as count FROM site_content WHERE section = 'contact_info'");
        $row = $check->fetch_assoc();
        
        // Prepare contact data as JSON
        $contactData = json_encode([
            'phone' => $phone,
            'email' => $email,
            'address' => $address,
            'office_hours' => $office_hours,
            'facebook' => $facebook,
            'twitter' => $twitter,
            'instagram' => $instagram,
            'youtube' => $youtube,
            'linkedin' => $linkedin,
            'whatsapp' => $whatsapp
        ]);
        
        if ($row['count'] > 0) {
            // Update existing
            $stmt = $conn->prepare("UPDATE site_content SET content = ?, updated_at = NOW() WHERE section = 'contact_info'");
            $stmt->bind_param("s", $contactData);
        } else {
            // Insert new
            $stmt = $conn->prepare("INSERT INTO site_content (section, content) VALUES ('contact_info', ?)");
            $stmt->bind_param("s", $contactData);
        }
        
        if ($stmt->execute()) {
            $success = "Contact information updated successfully! This will be reflected on the website footer and contact page.";
        } else {
            $error = "Error updating contact info: " . $conn->error;
        }
        $stmt->close();
    }
}

// Fetch current contact info
$result = $conn->query("SELECT content FROM site_content WHERE section = 'contact_info'");
if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $contactInfo = json_decode($row['content'], true);
} else {
    $contactInfo = [
        'phone' => '+233 24 316 31354',
        'email' => 'infos@gnuts.org.gh',
        'address' => 'P.O. Box LG 1237, Accra',
        'office_hours' => 'Monday - Friday: 8:00 AM - 5:00 PM',
        'facebook' => '',
        'twitter' => '',
        'instagram' => '',
        'youtube' => '',
        'linkedin' => '',
        'whatsapp' => ''
    ];
}

// Get logged in admin info
$adminName = $_SESSION['admin_name'] ?? 'Admin';
$adminInitial = strtoupper(substr($adminName, 0, 1));
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Information - GNUTS Admin</title>
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

        .top-bar-actions {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }

        .user-menu {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 8px;
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

        .user-info {
            display: flex;
            flex-direction: column;
        }

        .user-name {
            font-weight: 600;
            font-size: 0.9rem;
        }

        .user-role {
            font-size: 0.75rem;
            color: var(--gray-500);
        }

        /* Page Content */
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

        /* Form Container */
        .form-container {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: var(--shadow);
            margin-bottom: 2rem;
        }

        .form-section {
            margin-bottom: 2rem;
        }

        .form-section:last-child {
            margin-bottom: 0;
        }

        .form-section-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--dark);
            margin-bottom: 1.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid var(--gray-200);
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .form-group label {
            font-weight: 600;
            color: var(--gray-700);
            font-size: 0.9rem;
        }

        .form-group input,
        .form-group textarea {
            padding: 0.75rem 1rem;
            border: 2px solid var(--gray-300);
            border-radius: 8px;
            font-family: 'Montserrat', sans-serif;
            font-size: 0.95rem;
            transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(1, 73, 0, 0.1);
        }

        .form-group textarea {
            resize: vertical;
            min-height: 100px;
        }

        .form-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 2px solid var(--gray-200);
        }

        .btn {
            padding: 0.875rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            border: none;
            text-decoration: none;
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
            color: var(--gray-700);
        }

        .btn-secondary:hover {
            background: var(--gray-300);
        }

        .info-box {
            background: linear-gradient(135deg, var(--primary), #026600);
            color: white;
            padding: 1.5rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            box-shadow: var(--shadow-md);
        }

        .info-box h3 {
            margin-bottom: 0.5rem;
            font-size: 1.25rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .info-box p {
            opacity: 0.95;
            font-size: 0.95rem;
            line-height: 1.6;
        }

        .info-box ul {
            margin-top: 1rem;
            padding-left: 1.5rem;
            opacity: 0.95;
        }

        .info-box li {
            margin-bottom: 0.5rem;
        }

        .preview-card {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: var(--shadow);
            margin-bottom: 2rem;
        }

        .preview-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid var(--gray-200);
        }

        .preview-icon {
            width: 48px;
            height: 48px;
            background: var(--primary);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }

        .preview-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--dark);
        }

        .preview-content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
        }

        .preview-item {
            display: flex;
            align-items: start;
            gap: 1rem;
            padding: 1rem;
            background: var(--gray-100);
            border-radius: 8px;
        }

        .preview-item-icon {
            width: 40px;
            height: 40px;
            background: var(--primary);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            flex-shrink: 0;
        }

        .preview-item-content {
            flex: 1;
        }

        .preview-item-label {
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--gray-500);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 0.25rem;
        }

        .preview-item-value {
            font-size: 0.95rem;
            color: var(--dark);
            font-weight: 500;
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

            .form-grid {
                grid-template-columns: 1fr;
            }

            .form-actions {
                flex-direction: column;
            }

            .btn {
                width: 100%;
                justify-content: center;
            }

            .preview-content {
                grid-template-columns: 1fr;
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
                    <a href="contact.php" class="nav-item active">
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

                <div class="top-bar-actions">
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
                    <h1 class="page-title">Contact Information</h1>
                    <p class="page-subtitle">Manage GNUTS contact details displayed on the website footer and contact page</p>
                </div>

                <div class="info-box">
                    <h3>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        Where This Information Appears
                    </h3>
                    <p>The contact information you update here will be automatically displayed in:</p>
                    <ul>
                        <li><strong>Website Footer</strong> - Phone, email, address, and social media links</li>
                        <li><strong>Contact Page</strong> - Full contact details and office hours</li>
                        <li><strong>About Page</strong> - Contact section with reach-out information</li>
                    </ul>
                </div>
                                <?php if (!empty($success)): ?>
                    <div class="alert alert-success">
                        <?php echo htmlspecialchars($success); ?>
                    </div>
                <?php endif; ?>

                <?php if (!empty($error)): ?>
                    <div class="alert alert-error">
                        <?php echo htmlspecialchars($error); ?>
                    </div>
                <?php endif; ?>

                <!-- Contact Form -->
                <div class="form-container">
                    <form method="POST">
                        <input type="hidden" name="action" value="update_contact">

                        <div class="form-section">
                            <div class="form-section-title">Primary Contact Details</div>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Phone Number</label>
                                    <input type="text" name="phone" value="<?php echo htmlspecialchars($contactInfo['phone']); ?>">
                                </div>

                                <div class="form-group">
                                    <label>Email Address</label>
                                    <input type="email" name="email" value="<?php echo htmlspecialchars($contactInfo['email']); ?>">
                                </div>

                                <div class="form-group">
                                    <label>Office Address</label>
                                    <textarea name="address"><?php echo htmlspecialchars($contactInfo['address']); ?></textarea>
                                </div>

                                <div class="form-group">
                                    <label>Office Hours</label>
                                    <input type="text" name="office_hours" value="<?php echo htmlspecialchars($contactInfo['office_hours']); ?>">
                                </div>
                            </div>
                        </div>

                        <div class="form-section">
                            <div class="form-section-title">Social Media & Online Presence</div>
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Facebook</label>
                                    <input type="url" name="facebook" value="<?php echo htmlspecialchars($contactInfo['facebook']); ?>">
                                </div>

                                <div class="form-group">
                                    <label>Twitter (X)</label>
                                    <input type="url" name="twitter" value="<?php echo htmlspecialchars($contactInfo['twitter']); ?>">
                                </div>

                                <div class="form-group">
                                    <label>Instagram</label>
                                    <input type="url" name="instagram" value="<?php echo htmlspecialchars($contactInfo['instagram']); ?>">
                                </div>

                                <div class="form-group">
                                    <label>YouTube</label>
                                    <input type="url" name="youtube" value="<?php echo htmlspecialchars($contactInfo['youtube']); ?>">
                                </div>

                                <div class="form-group">
                                    <label>LinkedIn</label>
                                    <input type="url" name="linkedin" value="<?php echo htmlspecialchars($contactInfo['linkedin']); ?>">
                                </div>

                                <div class="form-group">
                                    <label>WhatsApp Link</label>
                                    <input type="url" name="whatsapp" value="<?php echo htmlspecialchars($contactInfo['whatsapp']); ?>">
                                </div>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">
                                Save Contact Information
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Preview Section -->
                <div class="preview-card">
                    <div class="preview-header">
                        <div class="preview-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </div>
                        <div class="preview-title">Live Website Preview</div>
                    </div>

                    <div class="preview-content">
                        <div class="preview-item">
                            <div class="preview-item-icon">📞</div>
                            <div class="preview-item-content">
                                <div class="preview-item-label">Phone</div>
                                <div class="preview-item-value"><?php echo htmlspecialchars($contactInfo['phone']); ?></div>
                            </div>
                        </div>

                        <div class="preview-item">
                            <div class="preview-item-icon">📧</div>
                            <div class="preview-item-content">
                                <div class="preview-item-label">Email</div>
                                <div class="preview-item-value"><?php echo htmlspecialchars($contactInfo['email']); ?></div>
                            </div>
                        </div>

                        <div class="preview-item">
                            <div class="preview-item-icon">📍</div>
                            <div class="preview-item-content">
                                <div class="preview-item-label">Address</div>
                                <div class="preview-item-value"><?php echo htmlspecialchars($contactInfo['address']); ?></div>
                            </div>
                        </div>

                        <div class="preview-item">
                            <div class="preview-item-icon">⏰</div>
                            <div class="preview-item-content">
                                <div class="preview-item-label">Office Hours</div>
                                <div class="preview-item-value"><?php echo htmlspecialchars($contactInfo['office_hours']); ?></div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    </div>

    <!-- Sidebar Toggle Script -->
    <script>
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');

        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    </script>
</body>
</html>
