<?php
// Inclure CORS en premier - Vérifiez le chemin correct
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/data.php';

try {
    // Utiliser la classe Database
    $database = new Database();
    $pdo = $database->getConnection();
    
    $stmt = $pdo->prepare("
        SELECT 
            a.*,
            JSON_OBJECT(
                'id', u.id,
                'firstName', u.firstName,
                'lastName', u.lastName,
                'userType', u.userType
            ) as author
        FROM announcements a
        LEFT JOIN users u ON a.authorId = u.id
        ORDER BY a.createdAt DESC
    ");
    $stmt->execute();
    $announcements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Convertir les données
    foreach ($announcements as &$announcement) {
        // Convertir les images JSON en tableau
        if ($announcement['images']) {
            $announcement['images'] = json_decode($announcement['images'], true);
        } else {
            $announcement['images'] = [];
        }
        
        // Convertir l'auteur JSON en objet
        if ($announcement['author']) {
            $announcement['author'] = json_decode($announcement['author'], true);
        }
    }
    
    echo json_encode([ 
        'success' => true, 
        'data' => $announcements 
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([ 
        'success' => false, 
        'message' => 'Erreur serveur: ' . $e->getMessage() 
    ]);
}
?>