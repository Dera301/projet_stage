<?php
include_once '../../config/database.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->name) || empty($data->email) || empty($data->subject) || empty($data->message)) {
        sendError("Tous les champs sont requis");
    }

    $database = new Database();
    $db = $database->getConnection();

    $query = "INSERT INTO contact_messages SET 
              name = :name,
              email = :email,
              subject = :subject,
              message = :message,
              createdAt = NOW()";

    $stmt = $db->prepare($query);

    $stmt->bindParam(":name", $data->name);
    $stmt->bindParam(":email", $data->email);
    $stmt->bindParam(":subject", $data->subject);
    $stmt->bindParam(":message", $data->message);

    if ($stmt->execute()) {
        sendResponse(null, "Message de contact envoyé avec succès", 201);
    } else {
        sendError("Impossible d'envoyer le message");
    }
} else {
    sendError("Méthode non autorisée", 405);
}
?>
