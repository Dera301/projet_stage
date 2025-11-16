<?php
include_once '../../config/cors.php';
include_once '../../config/data.php';
include_once '../../utils/response.php';

// Forcer content-type JSON
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Méthode non autorisée', 405);
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        sendError('Impossible de se connecter à la base de données', 500);
    }

    // Vérifier si la table users existe
    $checkTable = $db->query("SHOW TABLES LIKE 'users'");
    if ($checkTable->rowCount() === 0) {
        sendError('Table users non trouvée', 500);
    }

    // Récupérer la liste des utilisateurs
    // Note: J'utilise les mêmes noms de colonnes que dans seed_admin.php
    $stmt = $db->prepare("
        SELECT 
            id, 
            email, 
            firstName, 
            lastName, 
            phone, 
            userType, 
            is_verified, 
            created_at 
        FROM users 
        ORDER BY created_at DESC
    ");
    
    if (!$stmt->execute()) {
        throw new Exception('Erreur lors de l\'exécution de la requête');
    }
    
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formater les données si nécessaire
    $formattedUsers = array_map(function($user) {
        return [
            'id' => $user['id'],
            'email' => $user['email'],
            'firstName' => $user['firstName'],
            'lastName' => $user['lastName'],
            'phone' => $user['phone'],
            'userType' => $user['userType'],
            'is_verified' => (bool)$user['is_verified'],
            'created_at' => $user['created_at']
        ];
    }, $users);
    
    sendResponse($formattedUsers);
    
} catch (PDOException $ex) {
    sendError('Erreur base de données: ' . $ex->getMessage(), 500);
} catch (Throwable $e) {
    sendError('Erreur serveur: ' . $e->getMessage(), 500);
}
?>