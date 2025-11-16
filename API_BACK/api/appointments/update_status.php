<?php
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Méthode non autorisée', 405);
}

$json = file_get_contents('php://input');
$data = json_decode($json);

if (empty($data->id) || empty($data->status)) {
    sendError('ID et statut requis');
}

$allowedStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
if (!in_array($data->status, $allowedStatuses)) {
    sendError('Statut invalide');
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $stmt = $db->prepare("
        UPDATE appointments 
        SET status = :status, updatedAt = NOW()
        WHERE id = :id
    ");
    
    $stmt->bindParam(':status', $data->status);
    $stmt->bindParam(':id', $data->id);
    
    if ($stmt->execute()) {
        sendResponse(['id' => $data->id, 'status' => $data->status], 'Statut mis à jour avec succès');
    } else {
        sendError('Erreur lors de la mise à jour', 500);
    }
} catch (Exception $e) {
    sendError('Erreur serveur: ' . $e->getMessage(), 500);
}
?>

