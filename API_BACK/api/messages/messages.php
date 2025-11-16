<?php
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (!isset($_GET['conversationId'])) {
        sendError("ID conversation requis");
    }

    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT m.*,
                     u1.firstName as sender_firstName,
                     u1.lastName as sender_lastName,
                     u2.firstName as receiver_firstName,
                     u2.lastName as receiver_lastName
              FROM messages m
              LEFT JOIN users u1 ON m.senderId = u1.id
              LEFT JOIN users u2 ON m.receiverId = u2.id
              WHERE m.conversationId = :conversationId
              ORDER BY m.createdAt ASC";

    $stmt = $db->prepare($query);
    $stmt->bindParam(":conversationId", $_GET['conversationId']);
    $stmt->execute();

    $messages = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $messages[] = [
            'id' => $row['id'],
            'conversationId' => $row['conversationId'],
            'senderId' => $row['senderId'],
            'receiverId' => $row['receiverId'],
            'content' => $row['content'],
            'isRead' => (bool)$row['isRead'],
            'createdAt' => $row['createdAt'],
            'sender' => [
                'firstName' => $row['sender_firstName'],
                'lastName' => $row['sender_lastName']
            ],
            'receiver' => [
                'firstName' => $row['receiver_firstName'],
                'lastName' => $row['receiver_lastName']
            ]
        ];
    }

    sendResponse($messages);
} else {
    sendError("Méthode non autorisée", 405);
}
?>
