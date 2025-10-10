<?php
// api/properties/update.php
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

// 🔧 Accepter PUT et POST (InfinityFree bloque PUT)
if ($_SERVER['REQUEST_METHOD'] == 'PUT' || $_SERVER['REQUEST_METHOD'] == 'POST') {

    if (!isset($_GET['id'])) {
        sendError("ID de la propriété requis");
    }

    // Lire le corps JSON
    $data = json_decode(file_get_contents("php://input"));

    if (!$data) {
        sendError("Aucune donnée reçue ou JSON invalide");
    }

    $database = new Database();
    $db = $database->getConnection();

    // Vérifier que la propriété existe
    $checkQuery = "SELECT ownerId FROM properties WHERE id = :id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(":id", $_GET['id']);
    $checkStmt->execute();

    if ($checkStmt->rowCount() == 0) {
        sendError("Propriété non trouvée");
    }

    $query = "UPDATE properties SET 
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
              isAvailable = :isAvailable,
              latitude = :latitude,
              longitude = :longitude,
              updatedAt = NOW()
              WHERE id = :id";

    $stmt = $db->prepare($query);

    $stmt->bindParam(":id", $_GET['id']);
    $stmt->bindParam(":title", $data->title);
    $stmt->bindParam(":description", $data->description);
    $stmt->bindParam(":address", $data->address);
    $stmt->bindParam(":district", $data->district);
    $stmt->bindParam(":price", $data->price);
    $stmt->bindParam(":deposit", $data->deposit);
    $stmt->bindParam(":availableRooms", $data->availableRooms);
    $stmt->bindParam(":totalRooms", $data->totalRooms);
    $stmt->bindParam(":propertyType", $data->propertyType);
    $stmt->bindParam(":isAvailable", $data->isAvailable);
    $stmt->bindParam(":latitude", $data->latitude);
    $stmt->bindParam(":longitude", $data->longitude);
    
    $amenities_json = json_encode($data->amenities ?: []);
$images_json = json_encode($data->images ?: []);

$stmt->bindParam(":amenities", $amenities_json);
$stmt->bindParam(":images", $images_json);


    if ($stmt->execute()) {
        sendResponse($data, "Propriété modifiée avec succès");
    } else {
        sendError("Impossible de modifier la propriété");
    }
} else {
    sendError("Méthode non autorisée", 405);
}
?>

