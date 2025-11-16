<?php
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->messageId)) {
        sendError("ID message requis");
    }

    $database = new Database();
    $db = $database->getConnection();

    // Marquer le message comme lu
    $query = "UPDATE messages SET isRead = 1 WHERE id = :messageId";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":messageId", $data->messageId);

    if ($stmt->execute()) {
        sendResponse(null, "Message marqué comme lu");
    } else {
        sendError("Impossible de marquer le message comme lu");
    }
} else {
    sendError("Méthode non autorisée", 405);
}
?>
