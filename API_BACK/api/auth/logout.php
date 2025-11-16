<?php
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Dans une vraie application, vous révoqueriez le token ici
    // Pour cette démo, nous retournons simplement un succès
    
    sendResponse(null, "Déconnexion réussie");
} else {
    sendError("Méthode non autorisée", 405);
}
?>
