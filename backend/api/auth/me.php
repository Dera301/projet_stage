<?php
// me.php - VERSION AVEC DÉBOGAGE
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    
    // 🔹 DÉBOGAGE : Afficher tous les headers reçus
    error_log("=== DÉBOGAGE me.php ===");
    error_log("Headers reçus:");
    foreach (getallheaders() as $name => $value) {
        error_log("$name: $value");
    }
    error_log("SERVER Headers:");
    foreach ($_SERVER as $name => $value) {
        if (strpos($name, 'HTTP_') === 0 || $name === 'Authorization' || $name === 'REDIRECT_HTTP_AUTHORIZATION') {
            error_log("$name: $value");
        }
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    // 🔹 CORRECTION : Méthode universelle pour récupérer le header Authorization
    $authHeader = '';
    
    // Essayer dans l'ordre de priorité
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        error_log("✅ Authorization depuis HTTP_AUTHORIZATION: " . $authHeader);
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        error_log("✅ Authorization depuis REDIRECT_HTTP_AUTHORIZATION: " . $authHeader);
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        error_log("Apache headers: " . print_r($headers, true));
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
            error_log("✅ Authorization depuis apache_request_headers: " . $authHeader);
        }
    }
    
    // 🔹 CORRECTION : Si toujours vide, chercher dans tous les headers
    if (empty($authHeader)) {
        foreach (getallheaders() as $name => $value) {
            if (strtolower($name) === 'authorization') {
                $authHeader = $value;
                error_log("✅ Authorization depuis getallheaders: " . $authHeader);
                break;
            }
        }
    }
    
    if (empty($authHeader)) {
        error_log("❌ Aucun header Authorization trouvé");
        sendError("Utilisateur non authentifié (header manquant). Headers reçus: " . json_encode(getallheaders()), 401);
    }

    // Extraire le token du header
    $token = str_replace('Bearer ', '', $authHeader);
    
    if (empty($token) || $token === 'null') {
        sendError("Token invalide ou vide", 401);
    }

    error_log("🔐 Token extrait: " . $token);
    
    // Récupérer l'userId du token
    $userId = extractUserIdFromToken($token);
    error_log("👤 User ID extrait: " . $userId);

    if (!$userId) {
        sendError("Token invalide - impossible d'extraire l'ID utilisateur", 401);
    }

    $query = "SELECT id, email, firstName, lastName, phone, userType, university, studyLevel, bio, budget, isVerified, createdAt 
              FROM users WHERE id = :id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $userId);
    $stmt->execute();

    if ($stmt->rowCount() == 1) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        error_log("✅ Utilisateur trouvé: " . $user['email']);
        sendResponse($user);
    } else {
        error_log("❌ Utilisateur non trouvé avec ID: " . $userId);
        sendError("Utilisateur non trouvé", 404);
    }
} else {
    sendError("Méthode non autorisée", 405);
}

function extractUserIdFromToken($token) {
    error_log("🔍 Extraction UserID depuis token: " . $token);
    
    // Pour le token de démo
    if ($token === 'demo-token') {
        error_log("🎯 Token de démo détecté");
        // Chercher un utilisateur de test dans la base
        $database = new Database();
        $db = $database->getConnection();
        
        $query = "SELECT id FROM users LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            error_log("👤 Utilisateur de démo trouvé ID: " . $user['id']);
            return $user['id'];
        } else {
            error_log("❌ Aucun utilisateur trouvé dans la base");
            return 1; // Fallback
        }
    }
    
    // Pour les tokens réels, vous implémenterez la logique JWT ici
    return 1; // Fallback pour les tests
}
?>
