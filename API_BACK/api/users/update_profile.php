<?php
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->id)) {
        sendError("ID utilisateur requis");
    }

    $database = new Database();
    $db = $database->getConnection();

    // Construire la requête dynamiquement
    $updates = [];
    $params = [':id' => $data->id];

    $allowed_fields = ['firstName', 'lastName', 'phone', 'bio', 'university', 'studyLevel', 'budget'];
    
    foreach ($allowed_fields as $field) {
        if (isset($data->$field)) {
            $updates[] = "$field = :$field";
            $params[":$field"] = $data->$field;
        }
    }

    if (empty($updates)) {
        sendError("Aucune donnée à mettre à jour");
    }

    $query = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = :id";
    $stmt = $db->prepare($query);

    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }

    if ($stmt->execute()) {
        // Récupérer l'utilisateur mis à jour
        $query = "SELECT id, email, firstName, lastName, phone, userType, university, studyLevel, bio, budget, isVerified, createdAt 
                  FROM users WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $data->id);
        $stmt->execute();
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        sendResponse($user, "Profil mis à jour avec succès");
    } else {
        sendError("Impossible de mettre à jour le profil");
    }
} else {
    sendError("Méthode non autorisée", 405);
}
?>
