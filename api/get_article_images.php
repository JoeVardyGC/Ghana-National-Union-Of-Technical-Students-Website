<?php
// api/get_article_images.php
header('Content-Type: application/json');
require_once '../config/db.php';

$articleId = $_GET['id'] ?? 0;

if (!$articleId) {
    echo json_encode([]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT image_path, caption FROM news_additional_images WHERE news_id = ? ORDER BY display_order ASC");
    $stmt->execute([$articleId]);
    $images = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($images);
} catch (Exception $e) {
    echo json_encode([]);
}