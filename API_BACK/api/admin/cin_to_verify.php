<?php
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Méthode non autorisée', 405);
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Récupérer tous les utilisateurs avec CIN non vérifiée mais avec images uploadées
    $query = "
        SELECT 
            id, 
            email, 
            firstName, 
            lastName, 
            cin_number, 
            cin_recto_image_path, 
            cin_verso_image_path,
            cin_verified,
            created_at,
            account_activation_deadline
        FROM users 
        WHERE (cin_recto_image_path IS NOT NULL OR cin_verso_image_path IS NOT NULL)
        AND (cin_verified = 0 OR cin_verified IS NULL)
        AND userType IN ('student', 'owner')
        ORDER BY created_at DESC
    ";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $cinToVerify = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Calculer si le compte dépasse 24h
        $createdAt = new DateTime($row['created_at']);
        $now = new DateTime();
        $deadline = $createdAt->modify('+24 hours');
        $isExpired = $now > $deadline;
        
        $cinToVerify[] = [
            'id' => $row['id'],
            'email' => $row['email'],
            'firstName' => $row['firstName'],
            'lastName' => $row['lastName'],
            'cinNumber' => $row['cin_number'],
            'cinRectoImagePath' => $row['cin_recto_image_path'],
            'cinVersoImagePath' => $row['cin_verso_image_path'],
            'cinVerified' => $row['cin_verified'],
            'createdAt' => $row['created_at'],
            'isExpired' => $isExpired,
            'deadline' => $deadline->format('Y-m-d H:i:s')
        ];
    }
    
    sendResponse($cinToVerify, 'Liste des CIN à vérifier récupérée avec succès');
} catch (Exception $e) {
    sendError('Erreur serveur: ' . $e->getMessage(), 500);
}
?>

