
<?php
// Database connection
$conn = new mysqli("127.0.0.1", "root", "", "gnuts");

// Check connection
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

// Fetch contact information
$contactQuery = "SELECT content FROM site_content WHERE section = 'contact_info'";
$contactResult = $conn->query($contactQuery);
$contactInfo = [];
if ($contactResult && $contactResult->num_rows > 0) {
    $row = $contactResult->fetch_assoc();
    $contactInfo = json_decode($row['content'], true);
}

// Default values if not set
$contactInfo = array_merge([
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
], $contactInfo);

// Handle form submission
$formSuccess = false;
$formError = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $subject = $_POST['subject'] ?? '';
    $message = $_POST['message'] ?? '';
    
    // Simple validation
    if (empty($name) || empty($email) || empty($message)) {
        $formError = 'Please fill in all required fields.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $formError = 'Please enter a valid email address.';
    } else {
        // In a real implementation, you would:
        // 1. Save to database
        // 2. Send email notification
        // For now, we'll just show success
        $formSuccess = true;
        
        // You can add database insert here:
        // $stmt = $conn->prepare("INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)");
        // $stmt->bind_param("sssss", $name, $email, $phone, $subject, $message);
        // $stmt->execute();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Us - GNUTS</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="../includes/assets/gnuts_fav.png">
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
            background: var(--light);
            color: var(--dark);
            line-height: 1.6;
            overflow-x: hidden;
        }

        /* Header & Navigation */
        .header {
            background: #014900 !important;
            box-shadow: var(--shadow-md);
            position: sticky;
            top: 0;
            z-index: 1000;
            transition: all 0.3s ease;
        }

        .nav-container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 72px;
            background: #014900 !important;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 800;
            font-size: 1.5rem;
            text-decoration: none;
        }

        .logo img {
            width: 55px;
            height: 55px;
            object-fit: contain;
        }

        .logo span {
            color: #ffffff !important;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 1px;
        }

        .nav-menu {
            display: flex;
            gap: 2rem;
            align-items: center;
            list-style: none;
        }

        .nav-link {
            color: #ffffff !important;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.95rem;
            padding: 0.5rem 0;
            position: relative;
            transition: color 0.3s ease;
        }

        .nav-link::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 2px;
            background: #D9A000;
            transition: width 0.3s ease;
        }

        .nav-link:hover {
            color: #D9A000 !important;
        }

        .nav-link:hover::after,
        .nav-link.active::after {
            width: 100%;
        }

        /* Mobile Toggle */
        .mobile-toggle {
            display: none;
            flex-direction: column;
            gap: 6px;
            cursor: pointer;
            background: none;
            border: none;
            padding: 10px;
            z-index: 9999;
        }

        .mobile-toggle span {
            width: 28px;
            height: 3px;
            background: white;
            border-radius: 4px;
            transition: 0.4s ease;
        }

        .mobile-toggle:hover span {
            background: gold;
        }

        .mobile-toggle.active span:nth-child(1) {
            transform: translateY(9px) rotate(45deg);
            background: gold;
        }

        .mobile-toggle.active span:nth-child(2) {
            opacity: 0;
        }

        .mobile-toggle.active span:nth-child(3) {
            transform: translateY(-9px) rotate(-45deg);
            background: gold;
        }

        /* Desktop Toggle */
        .desktop-toggle {
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            background: none;
            border: none;
            padding: 10px;
            z-index: 16000;
        }

        .desktop-toggle span {
            width: 28px;
            height: 3px;
            background: white;
            border-radius: 4px;
            transition: 0.4s ease;
        }

        @media (min-width: 1025px) {
            .desktop-toggle { display: flex; }
        }

        /* Mobile Menu */
        .mobile-menu {
            position: fixed;
            top: 72px;
            right: -100%;
            width: 80%;
            max-width: 320px;
            height: calc(100vh - 72px);
            background: #ffffff;
            display: flex;
            flex-direction: column;
            padding: 2rem 0;
            transition: right 0.4s ease;
            box-shadow: -2px 0 10px rgba(0,0,0,0.1);
            overflow-y: auto;
            z-index: 10000;
        }

        .mobile-menu.active {
            right: 0;
        }

        .mobile-menu a {
            color: #333;
            text-decoration: none;
            padding: 1rem 2rem;
            font-size: 16px;
            font-weight: 500;
            transition: 0.3s ease;
            border-bottom: 1px solid #f0f0f0;
        }

        .mobile-menu a:hover,
        .mobile-menu a.active {
            background: #f8f9fa;
            color: #014900;
            padding-left: 2.5rem;
        }

        .mobile-overlay {
            position: fixed;
            top: 72px;
            left: 0;
            width: 100%;
            height: calc(100vh - 72px);
            background: rgba(0, 0, 0, 0.5);
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.4s ease;
            z-index: 9999;
        }

        .mobile-overlay.active {
            opacity: 1;
            visibility: visible;
        }

        /* Desktop Drawer */
        .desktop-drawer {
            position: fixed;
            top: 72px;
            right: -100%;
            width: 70%;
            max-width: 360px;
            height: calc(100vh - 72px);
            background: #ffffff;
            display: flex;
            flex-direction: column;
            padding-top: 100px;
            gap: 20px;
            transition: 0.4s ease;
            z-index: 15000;
        }

        .desktop-drawer.active {
            right: 0;
        }

        .desktop-drawer a {
            color: #014900;
            text-decoration: none;
            padding: 12px 25px;
            font-size: 18px;
            transition: 0.3s ease;
        }

        .desktop-drawer a:hover {
            color: gold;
            padding-left: 35px;
        }

        .desktop-overlay {
            display: none;
        }

        @media (min-width: 1025px) {
            .desktop-overlay {
                display: block;
                position: fixed;
                top: 72px;
                left: 0;
                width: 100%;
                height: calc(100vh - 72px);
                background: rgba(0,0,0,0.25);
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.4s ease;
                z-index: 14000;
            }

            .desktop-overlay.active {
                opacity: 1;
                visibility: visible;
            }
        }

        /* Hero Section */
        .hero {
            position: relative;
            height: 50vh;
            min-height: 350px;
            background: linear-gradient(135deg, rgba(1, 73, 0, 0.95) 0%, rgba(1, 73, 0, 0.85) 100%),
                        url('../includes/assets/slide4.png');
            background-size: cover;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-align: center;
        }

        .hero-content {
            max-width: 800px;
            padding: 2rem;
            z-index: 2;
        }

        .hero-content h1 {
            font-size: clamp(2.5rem, 5vw, 3.5rem);
            font-weight: 800;
            margin-bottom: 1rem;
            animation: fadeInUp 0.8s ease-out;
        }

        .hero-content p {
            font-size: clamp(1rem, 2vw, 1.25rem);
            opacity: 0.95;
            animation: fadeInUp 0.8s ease-out 0.2s backwards;
        }

        /* Container */
        .container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .section {
            padding: 5rem 0;
        }

        /* Contact Grid */
        .contact-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            margin-bottom: 3rem;
        }

        /* Contact Info Cards */
        .contact-info-cards {
            display: grid;
            gap: 1.5rem;
        }

        .info-card {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: var(--shadow-lg);
            transition: all 0.3s ease;
            border-left: 4px solid var(--primary);
        }

        .info-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-xl);
        }

        .info-card-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .info-icon {
            width: 56px;
            height: 56px;
            background: var(--primary);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }

        .info-card h3 {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--dark);
        }

        .info-card p {
            color: var(--gray-600);
            line-height: 1.7;
            margin-bottom: 0.5rem;
        }

        .info-card a {
            color: var(--primary);
            text-decoration: none;
            font-weight: 600;
            transition: color 0.3s ease;
        }

        .info-card a:hover {
            color: var(--secondary);
        }

        /* Social Links */
        .social-links {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
        }

        .social-link {
            width: 48px;
            height: 48px;
            background: var(--gray-200);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--gray-700);
            text-decoration: none;
            transition: all 0.3s ease;
        }

        .social-link:hover {
            background: var(--primary);
            color: white;
            transform: translateY(-3px);
        }

        /* Contact Form */
        .contact-form-container {
            background: white;
            border-radius: 16px;
            padding: 2.5rem;
            box-shadow: var(--shadow-lg);
        }

        .form-header {
            margin-bottom: 2rem;
        }

        .form-header h2 {
            font-size: 2rem;
            font-weight: 800;
            color: var(--primary);
            margin-bottom: 0.5rem;
        }

        .form-header p {
            color: var(--gray-600);
            line-height: 1.7;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-group label {
            display: block;
            font-weight: 600;
            color: var(--gray-700);
            margin-bottom: 0.5rem;
        }

        .form-group label .required {
            color: red;
            margin-left: 2px;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 0.875rem 1rem;
            border: 2px solid var(--gray-300);
            border-radius: 8px;
            font-family: 'Montserrat', sans-serif;
            font-size: 0.95rem;
            transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(1, 73, 0, 0.1);
        }

        .form-group textarea {
            resize: vertical;
            min-height: 150px;
        }

        .submit-btn {
            width: 100%;
            padding: 1rem 2rem;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }

        .submit-btn:hover {
            background: #013300;
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }

        .submit-btn:disabled {
            background: var(--gray-400);
            cursor: not-allowed;
            transform: none;
        }

        /* Alert Messages */
        .alert {
            padding: 1rem 1.5rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .alert-success {
            background: rgba(16, 185, 129, 0.1);
            color: #065f46;
            border: 1px solid #10b981;
        }

        .alert-error {
            background: rgba(239, 68, 68, 0.1);
            color: #991b1b;
            border: 1px solid #ef4444;
        }

        /* Map Section */
        .map-section {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: var(--shadow-lg);
            margin-bottom: 3rem;
        }

        .map-section h2 {
            font-size: 2rem;
            font-weight: 800;
            color: var(--primary);
            margin-bottom: 1.5rem;
            text-align: center;
        }

        .map-container {
            width: 100%;
            height: 450px;
            border-radius: 12px;
            overflow: hidden;
        }

        .map-container iframe {
            width: 100%;
            height: 100%;
            border: none;
        }

        /* Footer */
        .footer {
            background: var(--dark);
            color: white;
            padding: 4rem 0 2rem;
            margin-top: 5rem;
        }

        .footer-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 3rem;
            margin-bottom: 3rem;
        }

        .footer-section h4 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            color: #ffb400;
        }

        .footer-section p {
            color: var(--gray-400);
            line-height: 1.7;
        }

        .footer-links {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .footer-links a {
            color: var(--gray-400);
            text-decoration: none;
            transition: color 0.3s ease;
        }

        .footer-links a:hover {
            color: white;
        }

        .footer-bottom {
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 2rem;
            text-align: center;
            color: var(--gray-400);
        }

        /* Animations */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .nav-menu {
                display: none !important;
            }
            
            .mobile-toggle {
                display: flex !important;
            }

            .hero {
                height: 40vh;
                min-height: 300px;
            }

            .contact-grid {
                grid-template-columns: 1fr;
                gap: 2rem;
            }

            .contact-form-container {
                padding: 1.5rem;
            }

            .map-container {
                height: 350px;
            }

            .info-card {
                padding: 1.5rem;
            }

            .social-links {
                flex-wrap: wrap;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <nav class="nav-container">
            <a href="../index.php" class="logo">
                <img src="../includes/assets/gnuts_logo1.png" alt="GNUTS Logo">
                <span>GNUTS</span>
            </a>

            <ul class="nav-menu">
                <li><a href="../index.php" class="nav-link">Home</a></li>
                <li><a href="about.php" class="nav-link">About</a></li>
                <li><a href="scholarships.php" class="nav-link">Scholarships & Opportunities</a></li>
                <li><a href="innovations.php" class="nav-link">Innovations</a></li>
                <li><a href="blog.php" class="nav-link">News & Events</a></li>
                <li><a href="contact.php" class="nav-link active">Contact Us</a></li>
            </ul>

            <button class="mobile-toggle" id="mobile-toggle" aria-label="Toggle menu">
                <span></span>
                <span></span>
                <span></span>
            </button>

            <button class="desktop-toggle" id="desktop-toggle" aria-label="Toggle Desktop Drawer">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </nav>

        <div class="mobile-menu" id="mobile-menu">
            <a href="../index.php">Home</a>
            <a href="about.php">About</a>
            <a href="scholarships.php">Scholarships & Opportunities</a>
            <a href="innovations.php">Innovations</a>
            <a href="blog.php">News & Events</a>
            <a href="contact.php" class="active">Contact Us</a>
            
            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb;">
                <div style="padding: 0 2rem; margin-bottom: 0.75rem; font-size: 14px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                    Resources
                </div>
                <a href="about.php#leadership">Our Leadership</a>
                <a href="https://ctvet.gov.gh/results/">Check your CTVET result</a>
                <a href="about.php#resources">Resources/Constitution</a>
                <a href="about.php#history">Our History</a>
                <a href="#">Privacy Policy</a>
            </div>
        </div>

        <div class="mobile-overlay" id="mobile-overlay"></div>

        <div class="desktop-drawer" id="desktop-drawer">
            <a href="about.php#leadership">Our Leadership</a>
            <a href="https://ctvet.gov.gh/results/">Check your CTVET result</a>
            <a href="about.php#resources">Resources/Constitution</a>
            <a href="about.php#history">Our History</a>
            <a href="#">Privacy Policy</a>
        </div>

        <div class="desktop-overlay" id="desktop-overlay"></div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-content">
            <h1>Get In Touch</h1>
            <p>We're here to help and answer any question you might have</p>
        </div>
    </section>

    <!-- Contact Section -->
    <section class="section" style="background: white;">
        <div class="container">
            <div class="contact-grid">
                <!-- Contact Information -->
                <div>
                    <div class="contact-info-cards">
                        <!-- Phone -->
                        <div class="info-card">
                            <div class="info-card-header">
                                <div class="info-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                    </svg>
                                </div>
                                <h3>Phone</h3>
                            </div>
                            <p>Give us a call during office hours</p>
                            <a href="tel:<?php echo htmlspecialchars($contactInfo['phone']); ?>">
                                <?php echo htmlspecialchars($contactInfo['phone']); ?>
                            </a>
                        </div>

                        <!-- Email -->
                        <div class="info-card">
                            <div class="info-card-header">
                                <div class="info-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                </div>
                                <h3>Email</h3>
                            </div>
                            <p>Send us an email anytime</p>
                            <a href="mailto:<?php echo htmlspecialchars($contactInfo['email']); ?>">
                                <?php echo htmlspecialchars($contactInfo['email']); ?>
                            </a>
                        </div>

                        <!-- Address -->
                        <div class="info-card">
                            <div class="info-card-header">
                                <div class="info-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                </div>
                                <h3>Address</h3>
                            </div>
                            <p><?php echo nl2br(htmlspecialchars($contactInfo['address'])); ?></p>
                        </div>

                        <!-- Office Hours -->
                        <div class="info-card">
                            <div class="info-card-header">
                                <div class="info-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                </div>
                                <h3>Office Hours</h3>
                            </div>
                            <p><?php echo htmlspecialchars($contactInfo['office_hours']); ?></p>
                        </div>

                        <!-- Social Media -->
                        <?php if (!empty(array_filter([$contactInfo['facebook'], $contactInfo['twitter'], $contactInfo['instagram'], $contactInfo['linkedin'], $contactInfo['youtube']]))): ?>
                        <div class="info-card">
                            <div class="info-card-header">
                                <div class="info-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                    </svg>
                                </div>
                                <h3>Follow Us</h3>
                            </div>
                            <p>Connect with us on social media</p>
                            <div class="social-links">
                                <?php if (!empty($contactInfo['facebook'])): ?>
                                <a href="<?php echo htmlspecialchars($contactInfo['facebook']); ?>" target="_blank" class="social-link" aria-label="Facebook">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                    </svg>
                                </a>
                                <?php endif; ?>

                                <?php if (!empty($contactInfo['twitter'])): ?>
                                <a href="<?php echo htmlspecialchars($contactInfo['twitter']); ?>" target="_blank" class="social-link" aria-label="Twitter">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                                    </svg>
                                </a>
                                <?php endif; ?>

                                <?php if (!empty($contactInfo['instagram'])): ?>
                                <a href="<?php echo htmlspecialchars($contactInfo['instagram']); ?>" target="_blank" class="social-link" aria-label="Instagram">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                    </svg>
                                </a>
                                <?php endif; ?>

                                <?php if (!empty($contactInfo['linkedin'])): ?>
                                <a href="<?php echo htmlspecialchars($contactInfo['linkedin']); ?>" target="_blank" class="social-link" aria-label="LinkedIn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                        <rect x="2" y="9" width="4" height="12"></rect>
                                        <circle cx="4" cy="4" r="2"></circle>
                                    </svg>
                                </a>
                                <?php endif; ?>

                                <?php if (!empty($contactInfo['youtube'])): ?>
                                <a href="<?php echo htmlspecialchars($contactInfo['youtube']); ?>" target="_blank" class="social-link" aria-label="YouTube">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                                        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                                    </svg>
                                </a>
                                <?php endif; ?>

                                <?php if (!empty($contactInfo['whatsapp'])): ?>
                                <a href="<?php echo htmlspecialchars($contactInfo['whatsapp']); ?>" target="_blank" class="social-link" aria-label="WhatsApp">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
                                    </svg>
                                </a>
                                <?php endif; ?>
                            </div>
                        </div>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- Contact Form -->
                <div>
                    <div class="contact-form-container">
                        <div class="form-header">
                            <h2>Send Us a Message</h2>
                            <p>Fill out the form below and we'll get back to you as soon as possible.</p>
                        </div>

                        <?php if ($formSuccess): ?>
                            <div class="alert alert-success">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                <div>
                                    <strong>Message sent successfully!</strong><br>
                                    Thank you for contacting us. We'll get back to you soon.
                                </div>
                            </div>
                        <?php endif; ?>

                        <?php if ($formError): ?>
                            <div class="alert alert-error">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="15" y1="9" x2="9" y2="15"></line>
                                    <line x1="9" y1="9" x2="15" y2="15"></line>
                                </svg>
                                <div>
                                    <strong>Error!</strong><br>
                                    <?php echo htmlspecialchars($formError); ?>
                                </div>
                            </div>
                        <?php endif; ?>

                        <form method="POST" action="">
                            <div class="form-group">
                                <label>Full Name <span class="required">*</span></label>
                                <input type="text" name="name" required placeholder="Enter your full name" value="<?php echo htmlspecialchars($_POST['name'] ?? ''); ?>">
                            </div>

                            <div class="form-group">
                                <label>Email Address <span class="required">*</span></label>
                                <input type="email" name="email" required placeholder="your.email@example.com" value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>">
                            </div>

                            <div class="form-group">
                                <label>Phone Number</label>
                                <input type="tel" name="phone" placeholder="+233 XX XXX XXXX" value="<?php echo htmlspecialchars($_POST['phone'] ?? ''); ?>">
                            </div>

                            <div class="form-group">
                                <label>Subject <span class="required">*</span></label>
                                <select name="subject" required>
                                    <option value="">Select a subject</option>
                                    <option value="General Inquiry" <?php echo (isset($_POST['subject']) && $_POST['subject'] === 'General Inquiry') ? 'selected' : ''; ?>>General Inquiry</option>
                                    <option value="Scholarship Information" <?php echo (isset($_POST['subject']) && $_POST['subject'] === 'Scholarship Information') ? 'selected' : ''; ?>>Scholarship Information</option>
                                    <option value="Innovation Submission" <?php echo (isset($_POST['subject']) && $_POST['subject'] === 'Innovation Submission') ? 'selected' : ''; ?>>Innovation Submission</option>
                                    <option value="Membership" <?php echo (isset($_POST['subject']) && $_POST['subject'] === 'Membership') ? 'selected' : ''; ?>>Membership</option>
                                    <option value="Partnership/Collaboration" <?php echo (isset($_POST['subject']) && $_POST['subject'] === 'Partnership/Collaboration') ? 'selected' : ''; ?>>Partnership/Collaboration</option>
                                    <option value="Media/Press" <?php echo (isset($_POST['subject']) && $_POST['subject'] === 'Media/Press') ? 'selected' : ''; ?>>Media/Press</option>
                                    <option value="Complaint" <?php echo (isset($_POST['subject']) && $_POST['subject'] === 'Complaint') ? 'selected' : ''; ?>>Complaint</option>
                                    <option value="Other" <?php echo (isset($_POST['subject']) && $_POST['subject'] === 'Other') ? 'selected' : ''; ?>>Other</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Message <span class="required">*</span></label>
                                <textarea name="message" required placeholder="Write your message here..."><?php echo htmlspecialchars($_POST['message'] ?? ''); ?></textarea>
                            </div>

                            <button type="submit" class="submit-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Map Section -->
    <section class="section" style="background: var(--gray-100); padding: 3rem 0;">
        <div class="container">
            <div class="map-section">
                <h2>Find Us</h2>
                <div class="map-container">
                    <!-- Google Maps Embed - Update with actual GNUTS location -->
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.3672285627476!2d-0.051864526355732944!3d5.659911732598822!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf81002f0e4dc5%3A0xda91f42bccf2908a!2sGNUTS%20RESIDENT!5e0!3m2!1sen!2sgh!4v1766881325375!5m2!1sen!2sgh" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                </div>
            </div>
        </div>
    </section>

    <!-- Quick Contact Section -->
    <section class="section" style="background: linear-gradient(135deg, var(--primary) 0%, #026b00 100%); padding: 4rem 0;">
        <div class="container">
            <div style="text-align: center; color: white;">
                <h2 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem;">Need Immediate Assistance?</h2>
                <p style="font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.95;">Our team is here to help you with any urgent inquiries</p>
                <div style="display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap;">
                    <a href="tel:<?php echo htmlspecialchars($contactInfo['phone']); ?>" 
                       style="display: inline-flex; align-items: center; gap: 0.75rem; padding: 1rem 2rem; background: white; color: var(--primary); text-decoration: none; border-radius: 8px; font-weight: 600; transition: all 0.3s ease; box-shadow: var(--shadow-lg);"
                       onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 20px 25px -5px rgba(0, 0, 0, 0.2)';"
                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-lg)';">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        Call Us Now
                    </a>
                    
                    <a href="mailto:<?php echo htmlspecialchars($contactInfo['email']); ?>" 
                       style="display: inline-flex; align-items: center; gap: 0.75rem; padding: 1rem 2rem; background: rgba(255, 255, 255, 0.2); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; border: 2px solid white; transition: all 0.3s ease;"
                       onmouseover="this.style.background='white'; this.style.color='var(--primary)';"
                       onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'; this.style.color='white';">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        Email Us
                    </a>

                    <?php if (!empty($contactInfo['whatsapp'])): ?>
                    <a href="<?php echo htmlspecialchars($contactInfo['whatsapp']); ?>" 
                       target="_blank"
                       style="display: inline-flex; align-items: center; gap: 0.75rem; padding: 1rem 2rem; background: #25D366; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; transition: all 0.3s ease; box-shadow: var(--shadow-lg);"
                       onmouseover="this.style.transform='translateY(-3px)'; this.style.background='#20ba5a';"
                       onmouseout="this.style.transform='translateY(0)'; this.style.background='#25D366';">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
                        </svg>
                        WhatsApp Chat
                    </a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-section">
                    <h4>GNUTS</h4>
                    <p>Ghana National Union of Technical Students — Empowering technical and vocational students across Ghana since 1962.</p>
                </div>
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul class="footer-links">
                        <li><a href="../index.php">Home</a></li>
                        <li><a href="about.php">About Us</a></li>
                        <li><a href="scholarships.php">Scholarships</a></li>
                        <li><a href="innovations.php">Innovations</a></li>
                        <li><a href="blog.php">News & Blog</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Contact Us</h4>
                    <ul class="footer-links">
                        <li>📞 <?php echo htmlspecialchars($contactInfo['phone']); ?></li>
                        <li>📧 <?php echo htmlspecialchars($contactInfo['email']); ?></li>
                        <li>📍 <?php echo htmlspecialchars($contactInfo['address']); ?></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Resources</h4>
                    <ul class="footer-links">
                        <li><a href="about.php#resources">Constitution</a></li>
                        <li><a href="about.php#history">Our History</a></li>
                        <li><a href="contact.php">Contact</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; <?php echo date('Y'); ?> Ghana National Union of Technical Students (GNUTS). All rights reserved. <b>By Joe Vardy Group</b></p>
            </div>
        </div>
    </footer>

    <script>
        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobile-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileOverlay = document.getElementById('mobile-overlay');

        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        mobileOverlay.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        document.querySelectorAll('.mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Desktop drawer toggle
        const desktopToggle = document.getElementById('desktop-toggle');
        const desktopDrawer = document.getElementById('desktop-drawer');
        const desktopOverlay = document.getElementById('desktop-overlay');

        desktopToggle.addEventListener('click', () => {
            desktopToggle.classList.toggle('active');
            desktopDrawer.classList.toggle('active');
            desktopOverlay.classList.toggle('active');
            document.body.style.overflow = desktopDrawer.classList.contains('active') ? 'hidden' : '';
        });

        desktopOverlay.addEventListener('click', () => {
            desktopToggle.classList.remove('active');
            desktopDrawer.classList.remove('active');
            desktopOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        document.querySelectorAll('.desktop-drawer a').forEach(link => {
            link.addEventListener('click', () => {
                desktopToggle.classList.remove('active');
                desktopDrawer.classList.remove('active');
                desktopOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth < 1025) {
                desktopToggle.classList.remove('active');
                desktopDrawer.classList.remove('active');
                desktopOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Form validation
        document.querySelector('form').addEventListener('submit', function(e) {
            const name = document.querySelector('input[name="name"]').value.trim();
            const email = document.querySelector('input[name="email"]').value.trim();
            const message = document.querySelector('textarea[name="message"]').value.trim();
            const subject = document.querySelector('select[name="subject"]').value;

            if (!name || !email || !message || !subject) {
                e.preventDefault();
                alert('Please fill in all required fields.');
                return false;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                e.preventDefault();
                alert('Please enter a valid email address.');
                return false;
            }
        });

        // Auto-hide success message after 5 seconds
        const successAlert = document.querySelector('.alert-success');
        if (successAlert) {
            setTimeout(() => {
                successAlert.style.opacity = '0';
                successAlert.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    successAlert.style.display = 'none';
                }, 300);
            }, 5000);
        }

        // Header scroll effect
        const header = document.querySelector('.header');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }
        });
    </script>
</body>
</html>

<?php
// Close database connection
$conn->close();
?>