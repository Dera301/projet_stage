<?php
// Inclure CORS en premier
include_once '../../config/cors.php';

// Puis les autres includes
include_once '../../config/data.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError("Méthode non autorisée. Utilisez POST.", 405);
}

try {
    // Récupérer et décoder les données JSON
    $json = file_get_contents('php://input');
    
    if (empty($json)) {
        sendError("Données JSON manquantes");
    }
    
    $data = json_decode($json);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendError("JSON invalide: " . json_last_error_msg());
    }

    // Validation des champs requis
    $required = ['email', 'password', 'firstName', 'lastName', 'phone', 'userType'];
    foreach ($required as $field) {
        if (empty($data->$field)) {
            sendError("Le champ '$field' est requis");
        }
    }

    $database = new Database();
    $db = $database->getConnection();

    // Vérifier si l'email existe déjà
    $query = "SELECT id FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $data->email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        sendError("Cet email est déjà utilisé");
    }

    // Hasher le mot de passe
    $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);

    // Valeurs par défaut
    $university = $data->university ?? '';
    $studyLevel = $data->studyLevel ?? '';
    $budget = isset($data->budget) && $data->budget > 0 ? $data->budget : null;

    // Insérer l'utilisateur avec la nouvelle structure
    $query = "INSERT INTO users SET 
          email = :email,
          password = :password,
          firstName = :firstName,
          lastName = :lastName,
          phone = :phone,
          userType = :userType,
          university = :university,
          studyLevel = :studyLevel,
          budget = :budget,
          bio = :bio,
          avatar = :avatar,
          is_verified = 0,
          account_activation_deadline = DATE_ADD(NOW(), INTERVAL 24 HOUR),
          created_at = NOW()";

    $stmt = $db->prepare($query);

    $stmt->bindParam(":email", $data->email);
    $stmt->bindParam(":password", $hashed_password);
    $stmt->bindParam(":firstName", $data->firstName);
    $stmt->bindParam(":lastName", $data->lastName);
    $stmt->bindParam(":phone", $data->phone);
    $stmt->bindParam(":userType", $data->userType);
    $stmt->bindParam(":university", $university);
    $stmt->bindParam(":studyLevel", $studyLevel);
    $stmt->bindParam(":budget", $budget);
    $stmt->bindParam(":bio", $bio);
    $stmt->bindParam(":avatar", $avatar);

    if ($stmt->execute()) {
        $user_id = $db->lastInsertId();
        
        // Récupérer l'utilisateur créé
        $query = "SELECT id, email, firstName, lastName, phone, userType, university, studyLevel, budget, bio, avatar, is_verified, created_at 
                  FROM users WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->bindParam(1, $user_id);
        $stmt->execute();
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Générer un token simple
        $token = base64_encode(json_encode([
            'user_id' => $user_id,
            'email' => $data->email,
            'expires' => time() + (24 * 60 * 60)
        ]));
        
        $response_data = [
            'user' => $user,
            'token' => $token
        ];
        
        sendResponse($response_data, "Compte créé avec succès", 201);
    } else {
        sendError("Impossible de créer le compte: " . implode(', ', $stmt->errorInfo()));
    }

} catch (Exception $e) {
    sendError("Erreur serveur: " . $e->getMessage(), 500);
}
?>
