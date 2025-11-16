<?php
// Inclure CORS en premier
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/data.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(204); 
    exit; 
}

$input = file_get_contents('php://input');
$body = json_decode($input, true);

if (!$body || !isset($body['authorId']) || !isset($body['content'])) {
    http_response_code(400);
    echo json_encode([ 
        'success' => false, 
        'message' => 'authorId et content sont requis' 
    ]);
    exit;
}

try {
    // Utiliser la classe Database
    $database = new Database();
    $pdo = $database->getConnection();
    
    // Récupérer les informations de l'utilisateur
    $userStmt = $pdo->prepare("SELECT id, firstName, lastName, userType FROM users WHERE id = ?");
    $userStmt->execute([$body['authorId']]);
    $author = $userStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$author) {
        http_response_code(404);
        echo json_encode([ 
            'success' => false, 
            'message' => 'Utilisateur non trouvé' 
        ]);
        exit;
    }
    
    // Insérer l'annonce
    $stmt = $pdo->prepare("
        INSERT INTO announcements (authorId, content, images, contact) 
        VALUES (?, ?, ?, ?)
    ");

    $imagesJson = isset($body['images']) && is_array($body['images']) ? json_encode($body['images']) : '[]';
    $contact = isset($body['contact']) ? $body['contact'] : null;

    $stmt->execute([
        $body['authorId'],
        trim($body['content']),
        $imagesJson,
        $contact
    ]);
    
    $announcementId = $pdo->lastInsertId();
    
    // Récupérer l'annonce créée avec les informations de l'auteur
    $selectStmt = $pdo->prepare("
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
        WHERE a.id = ?
    ");
    $selectStmt->execute([$announcementId]);
    $createdAnnouncement = $selectStmt->fetch(PDO::FETCH_ASSOC);
    
    // Convertir les images JSON en tableau PHP
    if ($createdAnnouncement['images']) {
        $createdAnnouncement['images'] = json_decode($createdAnnouncement['images'], true);
    } else {
        $createdAnnouncement['images'] = [];
    }
    
    // Convertir l'auteur JSON en objet PHP
    if ($createdAnnouncement['author']) {
        $createdAnnouncement['author'] = json_decode($createdAnnouncement['author'], true);
    }
    
    echo json_encode([ 
        'success' => true, 
        'data' => $createdAnnouncement 
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([ 
        'success' => false, 
        'message' => 'Erreur serveur: ' . $e->getMessage() 
    ]);
}
?>