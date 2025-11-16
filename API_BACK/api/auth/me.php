<?php
// me.php - VERSION CORRIGÉE POUR NOUVELLE STRUCTURE
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Récupérer le header Authorization
    $authHeader = '';
    
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
        }
    }
    
    if (empty($authHeader)) {
        foreach (getallheaders() as $name => $value) {
            if (strtolower($name) === 'authorization') {
                $authHeader = $value;
                break;
            }
        }
    }
    
    if (empty($authHeader)) {
        sendError("Utilisateur non authentifié", 401);
    }

    // Extraire le token du header
    $token = str_replace('Bearer ', '', $authHeader);
    
    if (empty($token) || $token === 'null') {
        sendError("Token invalide ou vide", 401);
    }

    // Récupérer l'userId du token
    $userId = extractUserIdFromToken($token);

    if (!$userId) {
        sendError("Token invalide", 401);
    }

    // Requête adaptée à la nouvelle structure
    $query = "SELECT 
                id, email, firstName, lastName, phone, userType, 
                university, studyLevel, bio, budget, is_verified,
                cin_number, cin_verified, cin_verified_at,
                cin_recto_image_path, cin_verso_image_path,
                cin_verification_requested_at,
                account_activation_deadline,
                created_at, updated_at
              FROM users WHERE id = :id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $userId);
    $stmt->execute();

    if ($stmt->rowCount() == 1) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        sendResponse($user);
    } else {
        sendError("Utilisateur non trouvé", 404);
    }
} else {
    sendError("Méthode non autorisée", 405);
}

function extractUserIdFromToken($token) {
    // Pour le token de démo
    if ($token === 'demo-token') {
        $database = new Database();
        $db = $database->getConnection();
        
        $query = "SELECT id FROM users LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            return $user['id'];
        }
        return 1; // Fallback
    }
    
    // Pour les tokens réels
    try {
        $tokenData = json_decode(base64_decode($token), true);
        return $tokenData['user_id'] ?? null;
    } catch (Exception $e) {
        return null;
    }
}
?>
