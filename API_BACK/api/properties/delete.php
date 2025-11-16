<?php
// api/properties/delete.php
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    if (!isset($_GET['id'])) {
        sendError("ID de la propriété requis");
    }

    $database = new Database();
    $db = $database->getConnection();

    // Vérifier que la propriété existe
    $checkQuery = "SELECT id FROM properties WHERE id = :id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(":id", $_GET['id']);
    $checkStmt->execute();

    if ($checkStmt->rowCount() == 0) {
        sendError("Propriété non trouvée");
    }

    $query = "DELETE FROM properties WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $_GET['id']);

    if ($stmt->execute()) {
        sendResponse(null, "Propriété supprimée avec succès");
    } else {
        sendError("Impossible de supprimer la propriété");
    }
} else {
    sendError("Méthode non autorisée", 405);
}
?>
