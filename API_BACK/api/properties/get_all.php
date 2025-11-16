<?php
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
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
              WHERE p.isAvailable = 1
              ORDER BY p.createdAt DESC";

    $stmt = $db->prepare($query);
    $stmt->execute();

    $properties = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Convertir les images de JSON en array
        $row['images'] = json_decode($row['images'], true) ?: [];
        $row['amenities'] = json_decode($row['amenities'], true) ?: [];
        
        // Structurer les données du propriétaire
        $row['owner'] = [
            'id' => $row['ownerId'],
            'firstName' => $row['owner_firstName'],
            'lastName' => $row['owner_lastName'],
            'email' => $row['owner_email'],
            'phone' => $row['owner_phone'],
            'is_verified' => $row['owner_isVerified']
        ];
        
        // Supprimer les champs du propriétaire du tableau principal
        unset($row['owner_firstName'], $row['owner_lastName'], $row['owner_email'], $row['owner_phone'], $row['owner_isVerified']);
        
        $properties[] = $row;
    }

    sendResponse($properties);
} else {
    sendError("Méthode non autorisée", 405);
}
?>
