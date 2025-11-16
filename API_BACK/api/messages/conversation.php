<?php
include_once '../../config/data.php'; // Corriger data.php en database.php
include_once '../../config/cors.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (!isset($_GET['userId'])) {
        sendError("ID utilisateur requis");
    }

    $database = new Database();
    $db = $database->getConnection();

    // Requête corrigée
    $query = "SELECT 
                c.id, 
                c.createdAt,
                c.updatedAt,
                CASE 
                    WHEN c.user1_id = :userId THEN c.user2_id
                    ELSE c.user1_id
                END as other_user_id,
                u.firstName as other_user_firstName,
                u.lastName as other_user_lastName,
                u.userType as other_user_type,
                u.email as other_user_email,
                u.phone as other_user_phone,
                last_msg.content as last_message_content,
                last_msg.createdAt as last_message_createdAt,
                last_msg.senderId as last_message_senderId,
                last_msg.isRead as last_message_isRead,
                (SELECT COUNT(*) FROM messages m 
                 WHERE m.conversationId = c.id 
                 AND m.receiverId = :userId 
                 AND m.isRead = 0) as unread_count
            FROM conversations c
            LEFT JOIN users u ON (
                CASE 
                    WHEN c.user1_id = :userId THEN c.user2_id
                    ELSE c.user1_id
                END
            ) = u.id
            LEFT JOIN (
                SELECT 
                    conversationId,
                    content,
                    createdAt,
                    senderId,
                    isRead
                FROM messages
                WHERE (conversationId, createdAt) IN (
                    SELECT conversationId, MAX(createdAt)
                    FROM messages
                    GROUP BY conversationId
                )
            ) last_msg ON c.id = last_msg.conversationId
            WHERE (c.user1_id = :userId OR c.user2_id = :userId)
            ORDER BY c.updatedAt DESC";

    $stmt = $db->prepare($query);
    $stmt->bindParam(":userId", $_GET['userId']);
    $stmt->execute();

    $conversations = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Corriger la syntaxe du tableau pour lastMessage
        $lastMessage = null;
        if ($row['last_message_content']) {
            $lastMessage = [
                'content' => $row['last_message_content'],
                'createdAt' => $row['last_message_createdAt'],
                'senderId' => $row['last_message_senderId'],
                'isRead' => (bool)$row['last_message_isRead']
            ];
        }

        $conversations[] = [
            'id' => $row['id'],
            'participants' => [
                [
                    'id' => $row['other_user_id'],
                    'firstName' => $row['other_user_firstName'],
                    'lastName' => $row['other_user_lastName'],
                    'userType' => $row['other_user_type'],
                    'email' => $row['other_user_email'],
                    'phone' => $row['other_user_phone']
                ]
            ],
            'lastMessage' => $lastMessage,
            'unreadCount' => (int)$row['unread_count'],
            'createdAt' => $row['createdAt'],
            'updatedAt' => $row['updatedAt']
        ];
    }

    sendResponse($conversations);
} else {
    sendError("Méthode non autorisée", 405);
}
?>
