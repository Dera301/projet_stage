<?php
// seed_admin.php
// Création d'un compte administrateur via POST JSON.
// Remplace le fichier existant par celui-ci.

// Inclure les headers CORS et la config DB/response
include_once '../../config/cors.php';
include_once '../../config/data.php';
include_once '../../utils/response.php';

// Forcer content-type JSON
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Méthode non autorisée', 405);
}

try {
    // Récupérer la connexion DB
    $database = new Database();
    $db = $database->getConnection();
    if (!$db) {
        sendError('Impossible de se connecter à la base de données', 500);
    }

    // Lire le JSON envoyé dans le body
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!is_array($data)) {
        sendError('Données invalides: JSON attendu', 400);
    }

    // Champs attendus (ajuste selon ton schéma)
    $email = isset($data['email']) ? trim($data['email']) : null;
    $password = isset($data['password']) ? $data['password'] : null;
    $firstName = isset($data['firstName']) ? trim($data['firstName']) : '';
    $lastName = isset($data['lastName']) ? trim($data['lastName']) : '';
    $phone = isset($data['phone']) ? trim($data['phone']) : null;

    // Validation basique
    if (empty($email) || empty($password)) {
        sendError('Email et mot de passe requis', 400);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendError('Email invalide', 400);
    }

    // Vérifier si l'utilisateur existe déjà
    $checkStmt = $db->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
    $checkStmt->bindValue(':email', $email);
    $checkStmt->execute();
    if ($checkStmt->fetch(PDO::FETCH_ASSOC)) {
        sendError('Un compte avec cet email existe déjà', 409);
    }

    // Hash du mot de passe
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    // Préparer la date de création
    $now = date('Y-m-d H:i:s');

    // Préparer l'INSERT - adapte les colonnes aux colonnes réelles de ta table users
    $sql = "INSERT INTO users (email, password, firstName, lastName, phone, userType, is_verified, created_at)
            VALUES (:email, :password, :firstName, :lastName, :phone, :userType, :is_verified, :created_at)";
    $stmt = $db->prepare($sql);	

    $stmt->bindValue(':email', $email);
    $stmt->bindValue(':password', $passwordHash);
    $stmt->bindValue(':firstName', $firstName);
    $stmt->bindValue(':lastName', $lastName);
    $stmt->bindValue(':phone', $phone);
    // role 'admin' (adapte selon ton système: 'ADMIN', 'admin', 1, etc.)
    $stmt->bindValue(':userType', 'admin');
    // isVerified par défaut à 1 pour un seed admin, ou 0 selon ce que tu veux
    $stmt->bindValue(':is_verified', 1);
    $stmt->bindValue(':created_at', $now);

    if ($stmt->execute()) {
        // Récupérer l'id créé si nécessaire
        $newId = $db->lastInsertId();
        sendResponse(['id' => $newId, 'email' => $email], 'Compte administrateur créé avec succès', 201);
    } else {
        sendError('Erreur lors de la création du compte administrateur', 500);
    }
} catch (PDOException $ex) {
    // Erreurs DB -> renvoyer message et code 500
    // En prod tu peux logger $ex->getMessage() et renvoyer message générique
    sendError('Erreur serveur (PDO): ' . $ex->getMessage(), 500);
} catch (Throwable $e) {
    sendError('Erreur serveur: ' . $e->getMessage(), 500);
}
