<?php
/**
 * GNUTS Database Configuration
 * Database: gnuts
 */

// Database credentials
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'gnuts');
define('DB_USER', 'root');
define('DB_PASS', '');

try {
    // Create PDO connection
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch(PDOException $e) {
    // Log error and show user-friendly message
    error_log("Database Connection Error: " . $e->getMessage());
    die("Database connection failed. Please contact the administrator.");
}

// Helper function to execute queries safely
function executeQuery($pdo, $sql, $params = []) {
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    } catch(PDOException $e) {
        error_log("Query Error: " . $e->getMessage());
        return false;
    }
}

// Helper function to get single record
function getRecord($pdo, $table, $id) {
    $stmt = $pdo->prepare("SELECT * FROM $table WHERE id = ?");
    $stmt->execute([$id]);
    return $stmt->fetch();
}

// Helper function to get all records
function getAllRecords($pdo, $table, $orderBy = 'created_at DESC', $limit = null) {
    $sql = "SELECT * FROM $table ORDER BY $orderBy";
    if ($limit) {
        $sql .= " LIMIT $limit";
    }
    $stmt = $pdo->query($sql);
    return $stmt->fetchAll();
}

// Helper function to count records
function countRecords($pdo, $table, $where = '') {
    $sql = "SELECT COUNT(*) FROM $table";
    if ($where) {
        $sql .= " WHERE $where";
    }
    return $pdo->query($sql)->fetchColumn();
}


?>


