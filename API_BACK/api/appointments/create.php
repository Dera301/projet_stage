<?php
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Méthode non autorisée', 405);
}

$json = file_get_contents('php://input');
$data = json_decode($json);

$required = ['propertyId', 'studentId', 'ownerId', 'appointmentDate', 'message'];
foreach ($required as $field) {
    if (empty($data->$field)) {
        sendError("Le champ '$field' est requis");
    }
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Vérifier que la propriété existe
    $stmt = $db->prepare("SELECT id, ownerId FROM properties WHERE id = :id");
    $stmt->bindParam(':id', $data->propertyId);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        sendError('Propriété non trouvée', 404);
    }
    
    $property = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($property['ownerId'] != $data->ownerId) {
        sendError('Le propriétaire ne correspond pas à cette propriété', 403);
    }

    // Créer le rendez-vous
    $stmt = $db->prepare("
        INSERT INTO appointments 
        (propertyId, studentId, ownerId, appointmentDate, status, message, createdAt)
        VALUES 
        (:propertyId, :studentId, :ownerId, :appointmentDate, 'pending', :message, NOW())
    ");
    
    $stmt->bindParam(':propertyId', $data->propertyId);
    $stmt->bindParam(':studentId', $data->studentId);
    $stmt->bindParam(':ownerId', $data->ownerId);
    $stmt->bindParam(':appointmentDate', $data->appointmentDate);
    $stmt->bindParam(':message', $data->message);
    
    if ($stmt->execute()) {
        $appointmentId = $db->lastInsertId();
        sendResponse(['id' => $appointmentId, 'appointmentId' => $appointmentId], 'Rendez-vous créé avec succès', 201);
    } else {
        sendError('Erreur lors de la création du rendez-vous', 500);
    }
} catch (Exception $e) {
    sendError('Erreur serveur: ' . $e->getMessage(), 500);
}
?>

