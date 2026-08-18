<?php
// api/get_innovations.php
header('Content-Type: application/json');
require_once '../includes/db.php';

try {
    // Fetch approved innovations
    $stmt = $pdo->prepare("
        SELECT 
            id, 
            title, 
            description, 
            project_image, 
            video_url, 
            institution, 
            student_name,
            created_at
        FROM innovations 
        WHERE status = 'approved' 
        ORDER BY created_at DESC
    ");
    $stmt->execute();
    $innovations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Add default image if none exists
    foreach ($innovations as &$innovation) {
        if (empty($innovation['project_image'])) {
            $innovation['project_image'] = 'assets/placeholder.jpg';
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $innovations
    ]);
    
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch innovations'
    ]);
}
?>