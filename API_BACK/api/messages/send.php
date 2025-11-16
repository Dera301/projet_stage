<?php
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->senderId) || empty($data->receiverId) || empty($data->content)) {
        sendError("Données manquantes");
    }

    $database = new Database();
    $db = $database->getConnection();

    // Vérifier utilisateurs
    $query = "SELECT id FROM users WHERE id IN (:senderId, :receiverId)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":senderId", $data->senderId);
    $stmt->bindParam(":receiverId", $data->receiverId);
    $stmt->execute();

    if ($stmt->rowCount() != 2) {
        sendError("Utilisateur non trouvé");
    }

    // Créer ou récupérer la conversation
    $query = "SELECT id FROM conversations 
              WHERE (user1_id = :user1 AND user2_id = :user2) 
                 OR (user1_id = :user2 AND user2_id = :user1)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":user1", $data->senderId);
    $stmt->bindParam(":user2", $data->receiverId);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $conversation = $stmt->fetch(PDO::FETCH_ASSOC);
        $conversationId = $conversation['id'];
        $query = "UPDATE conversations SET updatedAt = NOW() WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $conversationId);
        $stmt->execute();
    } else {
        $query = "INSERT INTO conversations SET 
                  user1_id = :user1,
                  user2_id = :user2,
                  createdAt = NOW(),
                  updatedAt = NOW()";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":user1", $data->senderId);
        $stmt->bindParam(":user2", $data->receiverId);
        $stmt->execute();
        $conversationId = $db->lastInsertId();
    }

    // 🔹 Envoyer le message
    $query = "INSERT INTO messages SET 
              conversationId = :conversationId,
              senderId = :senderId,
              receiverId = :receiverId,
              content = :content,
              isRead = 0,
              createdAt = NOW()";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":conversationId", $conversationId);
    $stmt->bindParam(":senderId", $data->senderId);
    $stmt->bindParam(":receiverId", $data->receiverId);
    $stmt->bindParam(":content", $data->content);
    $stmt->execute();
    $messageId = $db->lastInsertId();

    // 🔹 Incrémenter le compteur de non lus pour le destinataire
    $updateUnread = "UPDATE conversations 
                     SET unreadCount = unreadCount + 1 
                     WHERE id = :conversationId
                     AND (
                         (user1_id = :receiverId)
                         OR (user2_id = :receiverId)
                     )";
    $stmt = $db->prepare($updateUnread);
    $stmt->bindParam(":conversationId", $conversationId);
    $stmt->bindParam(":receiverId", $data->receiverId);
    $stmt->execute();

    // 🔹 Récupérer le message créé
    $query = "SELECT m.*, 
                     u1.firstName as sender_firstName,
                     u1.lastName as sender_lastName,
                     u2.firstName as receiver_firstName,
                     u2.lastName as receiver_lastName
              FROM messages m
              LEFT JOIN users u1 ON m.senderId = u1.id
              LEFT JOIN users u2 ON m.receiverId = u2.id
              WHERE m.id = ?";
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $messageId);
    $stmt->execute();
    $message = $stmt->fetch(PDO::FETCH_ASSOC);

    sendResponse($message, "Message envoyé avec succès", 201);

} else {
    sendError("Méthode non autorisée", 405);
}
?>

