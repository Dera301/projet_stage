<?php
// api/properties/get_by_user.php
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (!isset($_GET['userId'])) {
        sendError("ID utilisateur requis");
    }

    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT p.*, 
                     u.firstName as owner_firstName, 
                     u.lastName as owner_lastName,
                     u.email as owner_email,
                     u.phone as owner_phone,
                     u.is_verified as owner_isVerified
              FROM properties p 
              LEFT JOIN users u ON p.ownerId = u.id 
              WHERE p.ownerId = :userId
              ORDER BY p.createdAt DESC";

    $stmt = $db->prepare($query);
    $stmt->bindParam(":userId", $_GET['userId']);
    $stmt->execute();

    $properties = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $row['images'] = json_decode($row['images'], true) ?: [];
        $row['amenities'] = json_decode($row['amenities'], true) ?: [];
        
        $row['owner'] = [
            'id' => $row['ownerId'],
            'firstName' => $row['owner_firstName'],
            'lastName' => $row['owner_lastName'],
            'email' => $row['owner_email'],
            'phone' => $row['owner_phone'],
            'is_verified' => $row['owner_isVerified']
        ];
        
        unset($row['owner_firstName'], $row['owner_lastName'], $row['owner_email'], $row['owner_phone'], $row['owner_isVerified']);
        
        $properties[] = $row;
    }

    sendResponse($properties);
} else {
    sendError("Méthode non autorisée", 405);
}
?>
