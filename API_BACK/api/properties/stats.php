<?php
// api/properties/stats.php
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

function getAuthorizedUserId() {
    $authHeader = '';

    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
        }
    }
    if (empty($authHeader)) {
        foreach (getallheaders() as $name => $value) {
            if (strtolower($name) === 'authorization') {
                $authHeader = $value;
                break;
            }
        }
    }
    if (empty($authHeader)) {
        return null;
    }

    $token = str_replace('Bearer ', '', $authHeader);
    if (empty($token) || $token === 'null') {
        return null;
    }

    if ($token === 'demo-token') {
        $database = new Database();
        $db = $database->getConnection();
        $query = "SELECT id FROM users LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->execute();
        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            return $user['id'];
        }
        return 1;
    }

    try {
        $tokenData = json_decode(base64_decode($token), true);
        return $tokenData['user_id'] ?? null;
    } catch (Exception $e) {
        return null;
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError("Méthode non autorisée", 405);
}

$userId = getAuthorizedUserId();
if (!$userId) {
    sendError("Utilisateur non authentifié", 401);
}

$database = new Database();
$db = $database->getConnection();

$userQuery = "SELECT userType FROM users WHERE id = :id";
$userStmt = $db->prepare($userQuery);
$userStmt->bindParam(":id", $userId);
$userStmt->execute();

if ($userStmt->rowCount() !== 1) {
    sendError("Utilisateur non trouvé", 404);
}

$user = $userStmt->fetch(PDO::FETCH_ASSOC);
$userType = $user['userType'];

if ($userType === 'owner') {
    $countQuery = "SELECT 
        COUNT(*) AS totalProperties,
        SUM(CASE WHEN isAvailable = 1 THEN 1 ELSE 0 END) AS availableProperties
        FROM properties
        WHERE ownerId = :ownerId";
    $countStmt = $db->prepare($countQuery);
    $countStmt->bindParam(":ownerId", $userId);
    $countStmt->execute();
    $counts = $countStmt->fetch(PDO::FETCH_ASSOC);

    $msgQuery = "SELECT COUNT(*) AS messagesReceived
        FROM messages
        WHERE receiverId = :ownerId";
    $msgStmt = $db->prepare($msgQuery);
    $msgStmt->bindParam(":ownerId", $userId);
    $msgStmt->execute();
    $msgs = $msgStmt->fetch(PDO::FETCH_ASSOC);

    sendResponse([
        "role" => "owner",
        "totalProperties" => (int)$counts['totalProperties'],
        "availableProperties" => (int)$counts['availableProperties'],
        "messagesReceived" => (int)$msgs['messagesReceived'],
    ]);
    exit;
}

$msgQuery = "SELECT COUNT(*) AS messagesReceived
    FROM messages
    WHERE receiverId = :uid";
$msgStmt = $db->prepare($msgQuery);
$msgStmt->bindParam(":uid", $userId);
$msgStmt->execute();
$msgs = $msgStmt->fetch(PDO::FETCH_ASSOC);

$propQuery = "SELECT COUNT(*) AS availableListings FROM properties WHERE isAvailable = 1";
$propStmt = $db->prepare($propQuery);
$propStmt->execute();
$props = $propStmt->fetch(PDO::FETCH_ASSOC);

sendResponse([
    "role" => "student",
    "messagesReceived" => (int)$msgs['messagesReceived'],
    "availableListings" => (int)$props['availableListings'],
]);
