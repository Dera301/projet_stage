<?php
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    // Validation des données requises
    $required_fields = ['title', 'description', 'address', 'district', 'price', 'deposit', 'availableRooms', 'totalRooms', 'propertyType', 'ownerId'];
    
    foreach ($required_fields as $field) {
        if (empty($data->$field)) {
            sendError("Le champ '$field' est requis");
        }
    }

    $database = new Database();
    $db = $database->getConnection();

    // Vérifier que le propriétaire existe
    $query = "SELECT id FROM users WHERE id = :ownerId AND userType = 'owner'";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":ownerId", $data->ownerId);
    $stmt->execute();

    if ($stmt->rowCount() == 0) {
        sendError("Propriétaire non trouvé");
    }

    $query = "INSERT INTO properties SET 
              title = :title,
              description = :description,
              address = :address,
              district = :district,
              price = :price,
              deposit = :deposit,
              availableRooms = :availableRooms,
              totalRooms = :totalRooms,
              propertyType = :propertyType,
              amenities = :amenities,
              images = :images,
              ownerId = :ownerId,
              isAvailable = 1,
              createdAt = NOW()";

    $stmt = $db->prepare($query);

    $stmt->bindParam(":title", $data->title);
    $stmt->bindParam(":description", $data->description);
    $stmt->bindParam(":address", $data->address);
    $stmt->bindParam(":district", $data->district);
    $stmt->bindParam(":price", $data->price);
    $stmt->bindParam(":deposit", $data->deposit);
    $stmt->bindParam(":availableRooms", $data->availableRooms);
    $stmt->bindParam(":totalRooms", $data->totalRooms);
    $stmt->bindParam(":propertyType", $data->propertyType);
    
    // Convertir les arrays en JSON
    $amenities_json = json_encode($data->amenities ?: []);
    $images_json = json_encode($data->images ?: []);
    
    $stmt->bindParam(":amenities", $amenities_json);
    $stmt->bindParam(":images", $images_json);
    $stmt->bindParam(":ownerId", $data->ownerId);

    if ($stmt->execute()) {
        $property_id = $db->lastInsertId();
        
        // Récupérer le logement créé
        $query = "SELECT p.*, 
                         u.firstName as owner_firstName, 
                         u.lastName as owner_lastName,
                         u.email as owner_email,
                         u.phone as owner_phone,
                         u.is_verified as owner_isVerified
                  FROM properties p 
                  LEFT JOIN users u ON p.ownerId = u.id 
                  WHERE p.id = ?";
        $stmt = $db->prepare($query);
        $stmt->bindParam(1, $property_id);
        $stmt->execute();
        
        $property = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Convertir les JSON en arrays
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
        
        unset($property['owner_firstName'], $property['owner_lastName'], $property['owner_email'], $property['owner_phone'], $property['owner_isVerified']);
        
        sendResponse($property, "Logement créé avec succès", 201);
    } else {
        sendError("Impossible de créer le logement");
    }
} else {
    sendError("Méthode non autorisée", 405);
}
?>
