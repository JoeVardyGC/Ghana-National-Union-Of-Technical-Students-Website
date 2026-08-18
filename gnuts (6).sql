-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 24, 2025 at 06:00 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gnuts`
--

-- --------------------------------------------------------

--
-- Table structure for table `about_page`
--

CREATE TABLE `about_page` (
  `id` int(11) NOT NULL,
  `hero_title` varchar(255) NOT NULL,
  `hero_subtitle` varchar(255) NOT NULL,
  `hero_image` varchar(255) DEFAULT NULL,
  `about_title` varchar(255) NOT NULL,
  `about_content` text NOT NULL,
  `mission_title` varchar(255) NOT NULL,
  `mission_content` text NOT NULL,
  `mission_image` varchar(255) DEFAULT NULL,
  `vision_title` varchar(255) NOT NULL,
  `vision_content` text NOT NULL,
  `vision_image` varchar(255) DEFAULT NULL,
  `values_title` varchar(255) NOT NULL,
  `values_content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `about_page`
--

INSERT INTO `about_page` (`id`, `hero_title`, `hero_subtitle`, `hero_image`, `about_title`, `about_content`, `mission_title`, `mission_content`, `mission_image`, `vision_title`, `vision_content`, `vision_image`, `values_title`, `values_content`, `created_at`, `updated_at`) VALUES
(1, 'About GNUTS', 'Empowering Technical Students. Shaping Ghana’s Development.', 'uploads/about/hero_694b482cedea9.jpg', 'Who We Are', 'The Ghana National Union of Technical Students (GNUTS) is the national representative body of students in Technical Universities and Technical and Vocational Education and Training (TVET) institutions across Ghana. The union was established to provide a unified platform for technical students to collectively advocate for their academic, social, and professional interests.\r\n\r\nGNUTS traces its roots to 1987, when technical students, then under the Ghana National Union of Polytechnic Students (GNUPS), broke away from the National Union of Ghana Students (NUGS) due to marginalization and lack of adequate representation. This struggle culminated in the Tamale Declaration of 2000, where GNUPS was formally operationalized with a constitution.\r\n\r\nIn 2016, following the conversion of Ghana’s polytechnics into Technical Universities, GNUPS transitioned into GNUTS, reflecting the evolving identity and aspirations of technical students nationwide. Since then, GNUTS has remained the legitimate voice of technical students, advocating for quality education, student welfare, policy reforms, and national recognition of technical education as a key driver of development.', 'Our Mission', 'To represent, unite, and empower technical students across Ghana by advocating for quality and inclusive technical education, promoting student welfare and leadership development, engaging stakeholders for national progress, and strengthening communication and participation within the union.\r\n\r\nGNUTS is committed to ensuring that the concerns, aspirations, and contributions of technical students are reflected in national educational policies and development frameworks.', 'uploads/about/mission_694b482ced2fb.jpg', 'Our Vision', 'To build a strong, credible, united, and nationally respected student union that effectively represents the collective interests of students in Technical Universities and Technical and Vocational Education and Training (TVET) institutions across Ghana; a union that champions excellence, innovation, professionalism, accountability, and integrity in technical education, actively influences national educational policies, promotes skills development and employability, and positions technical students as indispensable contributors to Ghana’s industrial growth, socio-economic transformation, and sustainable national development.', 'uploads/about/vision_694b482ceda8b.jpg', 'Our Core Values', 'GNUTS is guided by principles that define our identity and shape our actions:\r\n\r\nIntegrity – Upholding honesty, transparency, and ethical leadership in all union activities.\r\n\r\nProfessionalism – Conducting our affairs with discipline, competence, and respect.\r\n\r\nAccountability – Being responsible to our members and stakeholders at all levels.\r\n\r\nInclusiveness – Ensuring equal representation and participation of all technical students, regardless of background or gender.\r\n\r\nInnovation – Embracing creativity and digital solutions to enhance engagement and advocacy.\r\n\r\nUnity – Strengthening solidarity among technical institutions to speak with one national voice.', '2025-12-22 20:00:00', '2025-12-24 01:55:56');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `executives`
--

CREATE TABLE `executives` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `position` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `bio` text DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `display_order` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `executives`
--

INSERT INTO `executives` (`id`, `full_name`, `position`, `email`, `phone`, `bio`, `photo`, `display_order`, `created_at`) VALUES
(9, 'Abdul Karim Abubakar ', 'Representative for Ghanaian Student Loan Trust Fund', 'abdulkarim@gmail.com', '0544017995', '', 'uploads/executives/694b476a1f87d.jpg', 1, '2025-12-22 20:14:21'),
(10, 'Mustapha Abdul Basit ', 'Coordinating Secretary', 'basit@gmail.com', '0502329181', '', 'uploads/executives/694b475ce87de.jpg', 2, '2025-12-22 20:16:36');

-- --------------------------------------------------------

--
-- Table structure for table `hero_slides`
--

CREATE TABLE `hero_slides` (
  `id` int(11) NOT NULL,
  `title` varchar(150) DEFAULT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `cta_text` varchar(50) DEFAULT NULL,
  `cta_link` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `history_milestones`
--

CREATE TABLE `history_milestones` (
  `id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `history_milestones`
--

INSERT INTO `history_milestones` (`id`, `year`, `title`, `description`, `image`, `display_order`, `created_at`, `updated_at`) VALUES
(2, 1987, '1987', 'The Ghana National Union of Polytechnic Students (GNUPS) was established after technical students broke away from the National Union of Ghana Students (NUGS). This decision was driven by concerns of marginalization and the need for a dedicated national body to represent the unique academic, professional, and welfare interests of polytechnic students across Ghana.', NULL, 1, '2025-12-22 23:32:40', '2025-12-22 23:32:40'),
(3, 2000, 'The Tamale Declaration', 'GNUPS was formally operationalized at a national congress held in Tamale, where its first constitution was adopted. This historic congress, widely referred to as the Tamale Declaration, provided a legal and administrative framework for the Union and strengthened its legitimacy as the recognized voice of polytechnic students nationwide.', '', 2, '2025-12-22 23:33:44', '2025-12-22 23:34:07'),
(4, 2016, 'Transition from GNUPS to GNUTS', 'Following the Government of Ghana’s conversion of polytechnics into technical universities, GNUPS was rebranded as the Ghana National Union of Technical Students (GNUTS). The change reflected the evolving identity of technical students and was ratified at the First Central Committee and Mini Congress held at Tamale Technical University from December 1–4, 2016.', NULL, 3, '2025-12-22 23:37:13', '2025-12-22 23:37:13'),
(5, 2017, 'Public Recognition and Rebranding', 'GNUTS issued official press statements to announce and affirm its new identity. The Union emphasized legal compliance, institutional continuity, and urged stakeholders, media organizations, and the general public to recognize GNUTS as the legitimate national representative body of technical university students.', NULL, 4, '2025-12-22 23:39:12', '2025-12-22 23:39:12');

-- --------------------------------------------------------

--
-- Table structure for table `innovations`
--

CREATE TABLE `innovations` (
  `id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `project_image` varchar(255) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `institution` varchar(100) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `student_name` varchar(100) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `innovations`
--

INSERT INTO `innovations` (`id`, `title`, `description`, `project_image`, `video_url`, `institution`, `category_id`, `student_name`, `status`, `created_at`, `updated_at`) VALUES
(7, 'Green Campus Concept', 'The University is confronted with unique challenges as the campus has grown considerably over the past several years, growing from just 4,000 students, to over 10,000 students in recent times. The population is expected to increase further with the conversion from polytechnic to technical university. This growth has necessitated the expansion of the campus facilities and the construction of new buildings thereby increasing the energy demand and waste generation on campus. \r\n\r\nThe university presently consumes about 10 GWh of electricity annually. Paying of electricity bill has always been a major problem, inability to pay, sometimes results in the university being disconnected by the power company. Besides, the university also experiences frequent power outages due to unreliable supply from the national grid. \r\n\r\nThere is no data on the volume of waste generated on KsTU campus presently, however the indiscriminate disposal of waste around the campus and in lecture halls, hip of solid waste left unattended to for several days, inadequate, and inappropriate waste collection bin, are evident of waste management challenges on campus. ', 'uploads/innovations/694b47bd1b626.png', 'https://kstu.edu.gh/about-us/green-campus-concept', 'Kumasi Technical University', NULL, 'Kumasi Technical University', 'approved', '2025-12-22 19:39:00', '2025-12-24 01:54:05'),
(8, 'Intelligent Baby Incubator', 'This project was developed for the 2025 Energy Commission Senior High School Renewable Energy Challenge. It features a baby incubator that runs entirely on solar power, incorporating intelligent sensors to monitor temperature and humidity. It aims to solve the problem of power instability in rural Ghanaian health facilities, ensuring consistent life-support for neonates.', 'uploads/innovations/694b62083312a.png', 'https://youtu.be/0-SVwLbonAE?si=BVGionni-dN_KDB7', 'Dabokpa Technical Institute ', NULL, 'Dabokpa Technical Institute ', 'approved', '2025-12-22 19:43:40', '2025-12-24 03:46:16');

-- --------------------------------------------------------

--
-- Table structure for table `news`
--

CREATE TABLE `news` (
  `id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `content` text NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `author` varchar(100) DEFAULT NULL,
  `published_at` date DEFAULT curdate(),
  `status` enum('draft','published') DEFAULT 'draft',
  `view_count` int(11) DEFAULT 0,
  `allow_sharing` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `image2` varchar(255) DEFAULT NULL,
  `image3` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `news_additional_images`
--

CREATE TABLE `news_additional_images` (
  `id` int(11) NOT NULL,
  `news_id` int(11) NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `position` int(11) DEFAULT 1 COMMENT 'Position in the article (1, 2, 3, etc.)',
  `display_order` int(11) DEFAULT 0 COMMENT 'Order of image display in article',
  `caption` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `opportunities`
--

CREATE TABLE `opportunities` (
  `id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `type` enum('internship','skill_camp','grant') DEFAULT 'internship',
  `location` varchar(100) DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `status` enum('active','closed') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `opportunities`
--

INSERT INTO `opportunities` (`id`, `title`, `description`, `type`, `location`, `deadline`, `link`, `status`, `created_at`, `updated_at`) VALUES
(2, 'Hilltop Global Group Internship', 'A professional immersion program connecting students and graduates to placements in technology, finance, agriculture, and creative industries.The program includes leadership development sessions and cultural tours.', 'internship', 'Accra, Ghana (with hybrid options)', '2026-03-14', 'https://hilltopglobalgroup.com/internships/', 'active', '2025-12-22 18:57:31', '2025-12-22 18:57:31'),
(3, 'Next Generation Resource Governance Leaders Program', 'A specialized program by the Africa Centre for Energy Policy (ACEP) for young Africans to gain hands-on experience in oil and gas, mining, and energy transition policy research and advocacy.', 'internship', 'Accra, Ghana', '2026-01-15', 'https://acep.africa/nextgen10/', 'active', '2025-12-22 18:58:46', '2025-12-22 18:58:46'),
(4, 'MEST Africa-Mastercard Foundation EdTech Fellowship 2026', 'This program provides acceleration support and funding for edtech startups and young entrepreneurs. It offers equity-free funding and intensive business and technology training.', 'skill_camp', 'Accra (East Legon)', '2026-01-30', 'https://www.google.com/search?q=https://meltwater.org/fellowship/', 'active', '2025-12-22 19:00:14', '2025-12-22 19:00:14'),
(5, 'AmaliTech Immersive Internship Programme (IIP)', 'An intensive training and internship program for STEM students (Computer Science, IT, Engineering) focused on software development, cloud computing, and preparing for the global digital economy.', 'skill_camp', 'Takoradi / Accra (Virtual options available)', '0000-00-00', 'https://amalitech.com/immersive-internship-programme/', 'active', '2025-12-22 19:02:33', '2025-12-24 02:52:48');

-- --------------------------------------------------------

--
-- Table structure for table `resources`
--

CREATE TABLE `resources` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `category` enum('constitution','policy','handbook','forms','reports','other') NOT NULL DEFAULT 'other',
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` bigint(20) NOT NULL COMMENT 'File size in bytes',
  `display_order` int(11) DEFAULT 0,
  `downloads` int(11) DEFAULT 0 COMMENT 'Track download count',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Resources and document files';

--
-- Dumping data for table `resources`
--

INSERT INTO `resources` (`id`, `title`, `description`, `category`, `file_path`, `file_name`, `file_size`, `display_order`, `downloads`, `created_at`, `updated_at`) VALUES
(3, 'GNUTS Constitution (Revised Edition)', 'The official constitutional document of the Ghana National Union of Technical Students outlining its structure, leadership, functions, and governance framework.', 'constitution', 'uploads/resources/694b49528bff5.pdf', '6949f0ee94653 (1).pdf', 3873697, 1, 0, '2025-12-24 02:00:50', '2025-12-24 02:00:50');

-- --------------------------------------------------------

--
-- Table structure for table `scholarships`
--

CREATE TABLE `scholarships` (
  `id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `requirements` text DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `status` enum('active','closed') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `scholarships`
--

INSERT INTO `scholarships` (`id`, `title`, `description`, `requirements`, `deadline`, `link`, `status`, `created_at`, `updated_at`) VALUES
(3, 'Ghana Education Trust Fund (GETFund)', 'The GETFund scholarship provides financial assistance to brilliant but needy Ghanaian students pursuing undergraduate (Diploma, HND, Degree) and postgraduate (Masters, PhD) programs at accredited local public tertiary institutions. It is designed to alleviate the financial burden of tuition and academic fees to ensure equitable access to higher education.', 'Proof of Nationality: Scanned copy of Ghana Card or Passport Bio-data page.\r\n\r\nAdmission Letter: A scanned copy of your official admission letter stating the program duration.\r\n\r\nAcademic Records: WASSCE results (for freshers) or previous academic transcripts (for continuing students).\r\n\r\nFee Schedule: Approved fee schedule for the current academic year.\r\n\r\nApplication Letter: A formal letter addressed to the Administrator of GETFund.\r\n\r\nPostgraduate specific: Curriculum Vitae (CV) and National Service Certificate.\r\n\r\nProof of Need: Documentation demonstrating financial hardship (where applicable).', '2026-01-31', 'https://scholarships.getfund.gov.gh/', 'active', '2025-12-22 18:51:18', '2025-12-24 02:53:38'),
(4, 'Student Loan Trust Fund (SLTF)', 'The SLTF provides financial resources to Ghanaian students in accredited tertiary institutions (both public and private). The fund is designed to cover academic fees, books, and living expenses. A major feature of the current system is the \"No Guarantor\" policy, which allows students to access the loan using only their Ghana Card, removing the previous barrier of needing a SSNIT contributor as a guarantor.', 'Ghana Card: A valid Ghana Card number is the primary requirement for identity and security.\r\n\r\nAdmission Letter / Student ID: Proof of enrollment in an accredited program at an accredited institution.\r\n\r\nE-zwich Card: A valid E-zwich card linked to your bank account for disbursement.\r\n\r\nAccreditation: Both your school and your specific program of study must be accredited by the Ghana Tertiary Education Commission (GTEC).\r\n\r\nSSNIT Number: Though the Ghana Card is the primary ID, you may still need to provide your SSNIT number for record-keeping.\r\n\r\nBiometric Verification: Successful applicants must visit an SLTF Zonal or Campus office for fingerprinting.', '0000-00-00', 'https://application.sltf.gov.gh/', 'active', '2025-12-22 18:53:25', '2025-12-22 18:53:25'),
(5, 'No-Fees-Stress Tertiary Intervention', 'This is a government initiative aimed at ensuring that no student is denied higher education due to an inability to pay upfront admission fees. It specifically targets first-year (Level 100) Ghanaian students admitted to public tertiary institutions, including universities, polytechnics, colleges of education, and nursing training colleges. The program reimburses or pays for academic fees to relieve the immediate financial burden on parents and guardians during the freshers\' registration period.', 'Level 100 Status: Must be a newly admitted first-year student in a public tertiary institution.\r\n\r\nGhana Card: A valid Ghana Card is mandatory for identity verification.\r\n\r\nAdmission Letter: A scanned copy of the official admission letter from a public institution.\r\n\r\nBank Account: Applicants are typically required to have (or open) a GCB Bank account for the disbursement.\r\n\r\nProgram Type: Must be enrolled in an accredited undergraduate program (Diploma or Degree).\r\n\r\nDisability Status (Optional): Students with disabilities may be eligible for expanded support throughout their entire program duration.', '0000-00-00', 'https://nofeesstress.sltf.gov.gh/', 'active', '2025-12-22 18:54:47', '2025-12-22 18:54:47');

-- --------------------------------------------------------

--
-- Table structure for table `site_content`
--

CREATE TABLE `site_content` (
  `id` int(11) NOT NULL,
  `section` varchar(100) NOT NULL,
  `content` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `site_content`
--

INSERT INTO `site_content` (`id`, `section`, `content`, `updated_at`) VALUES
(1, 'contact_info', '{\"phone\":\"000000000000000\",\"email\":\"infos@gnuts.org.gh\",\"address\":\"P.O. Box LG 1237, Accra\",\"office_hours\":\"Monday - Friday: 8:00 AM - 5:00 PM\",\"facebook\":\"\",\"twitter\":\"\",\"instagram\":\"\",\"youtube\":\"\",\"linkedin\":\"\",\"whatsapp\":\"\"}', '2025-12-22 19:53:46');

-- --------------------------------------------------------

--
-- Table structure for table `social_media_settings`
--

CREATE TABLE `social_media_settings` (
  `id` int(11) NOT NULL,
  `platform` varchar(50) NOT NULL COMMENT 'facebook, twitter, linkedin, instagram, email, whatsapp',
  `url` varchar(255) NOT NULL,
  `icon` varchar(100) DEFAULT NULL COMMENT 'Font Awesome icon class',
  `is_active` tinyint(1) DEFAULT 1,
  `display_order` int(11) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `social_media_settings`
--

INSERT INTO `social_media_settings` (`id`, `platform`, `url`, `icon`, `is_active`, `display_order`, `updated_at`) VALUES
(1, 'Facebook', 'https://facebook.com/gnuts', 'fab fa-facebook-f', 1, 1, '2025-12-16 12:33:41'),
(2, 'Twitter', 'https://twitter.com/gnuts', 'fab fa-twitter', 1, 2, '2025-12-16 12:33:41'),
(3, 'LinkedIn', 'https://linkedin.com/company/gnuts', 'fab fa-linkedin-in', 1, 3, '2025-12-16 12:33:41'),
(4, 'Instagram', 'https://instagram.com/gnuts', 'fab fa-instagram', 1, 4, '2025-12-16 12:33:41'),
(5, 'Email', 'mailto:infos@gnuts.org.gh', 'fas fa-envelope', 1, 5, '2025-12-16 12:33:41'),
(6, 'WhatsApp', 'https://wa.me/233243163135', 'fab fa-whatsapp', 1, 6, '2025-12-16 12:33:41');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(3, 'Joe Vardy', 'abubakarsadikmusah2004@gmail.com', 'abubakarsadikmusah2004@gmail.com', 'admin', '2025-12-13 15:51:22', '2025-12-13 15:51:22'),
(4, 'GNUTS', 'admin@gnuts.org.gh', 'admin123', 'admin', '2025-12-14 22:06:57', '2025-12-14 22:06:57');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `about_page`
--
ALTER TABLE `about_page`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `executives`
--
ALTER TABLE `executives`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hero_slides`
--
ALTER TABLE `hero_slides`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `history_milestones`
--
ALTER TABLE `history_milestones`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `innovations`
--
ALTER TABLE `innovations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_category` (`category_id`);

--
-- Indexes for table `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `news_additional_images`
--
ALTER TABLE `news_additional_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_news_id` (`news_id`),
  ADD KEY `idx_position` (`position`),
  ADD KEY `idx_display_order` (`display_order`);

--
-- Indexes for table `opportunities`
--
ALTER TABLE `opportunities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `resources`
--
ALTER TABLE `resources`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_display_order` (`display_order`);

--
-- Indexes for table `scholarships`
--
ALTER TABLE `scholarships`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `site_content`
--
ALTER TABLE `site_content`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `section` (`section`);

--
-- Indexes for table `social_media_settings`
--
ALTER TABLE `social_media_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_platform` (`platform`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `about_page`
--
ALTER TABLE `about_page`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `executives`
--
ALTER TABLE `executives`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `hero_slides`
--
ALTER TABLE `hero_slides`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `history_milestones`
--
ALTER TABLE `history_milestones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `innovations`
--
ALTER TABLE `innovations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `news`
--
ALTER TABLE `news`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `news_additional_images`
--
ALTER TABLE `news_additional_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `opportunities`
--
ALTER TABLE `opportunities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `resources`
--
ALTER TABLE `resources`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `scholarships`
--
ALTER TABLE `scholarships`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `site_content`
--
ALTER TABLE `site_content`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `social_media_settings`
--
ALTER TABLE `social_media_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `innovations`
--
ALTER TABLE `innovations`
  ADD CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `news_additional_images`
--
ALTER TABLE `news_additional_images`
  ADD CONSTRAINT `fk_news_additional_images` FOREIGN KEY (`news_id`) REFERENCES `news` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
