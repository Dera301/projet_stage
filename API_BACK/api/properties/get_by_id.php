<?php
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (!isset($_GET['id'])) {
        sendError("ID du logement requis");
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
              WHERE p.id = :id";

    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $_GET['id']);
    $stmt->execute();

    if ($stmt->rowCount() == 1) {
        $property = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Convertir les images et équipements de JSON en array
        $property['images'] = json_decode($property['images'], true) ?: [];
        $property['amenities'] = json_decode($property['amenities'], true) ?: [];
        
        // Structurer les données du propriétaire
        $property['owner'] = [
            'id' => $property['ownerId'],
            'firstName' => $property['owner_firstName'],
            'lastName' => $property['owner_lastName'],
            'email' => $property['owner_email'],
            'phone' => $property['owner_phone'],
            'is_verified' => $property['owner_isVerified']
        ];
        
        // Supprimer les champs du propriétaire du tableau principal
        unset($property['owner_firstName'], $property['owner_lastName'], $property['owner_email'], $property['owner_phone'], $property['owner_isVerified']);
        
        sendResponse($property);
    } else {
        sendError("Logement non trouvé", 404);
    }
} else {
    sendError("Méthode non autorisée", 405);
}
?>
