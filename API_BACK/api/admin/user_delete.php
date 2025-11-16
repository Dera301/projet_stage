<?php
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Méthode non autorisée', 405);
}

// Récupérer l'ID de l'utilisateur et la raison depuis le body
$json = file_get_contents('php://input');
$data = json_decode($json);

if (empty($data->id)) {
    sendError('ID utilisateur requis');
}

if (empty($data->reason)) {
    sendError('Raison de suppression requise');
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Vérifier que l'utilisateur existe
    $stmt = $db->prepare("SELECT id, email, firstName, lastName FROM users WHERE id = :id");
    $stmt->bindParam(':id', $data->id);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        sendError('Utilisateur non trouvé', 404);
    }
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Envoyer un email de notification (simulation - à remplacer par un vrai service email)
    $to = $user['email'];
    $subject = "Suppression de votre compte - ColocAntananarivo";
    $message = "
    Bonjour {$user['firstName']} {$user['lastName']},
    
    Votre compte sur ColocAntananarivo a été supprimé par un administrateur.
    
    Raison de la suppression:
    {$data->reason}
    
    Si vous pensez qu'il s'agit d'une erreur, veuillez contacter le support.
    
    Cordialement,
    L'équipe ColocAntananarivo
    ";
    
    // En production, utiliser PHPMailer ou un service d'email
    // mail($to, $subject, $message);
    
    // Supprimer l'utilisateur
    $stmt = $db->prepare("DELETE FROM users WHERE id = :id");
    $stmt->bindParam(':id', $data->id);
    
    if ($stmt->execute()) {
        sendResponse(['deleted' => true, 'userId' => $data->id], 'Utilisateur supprimé avec succès');
    } else {
        sendError('Erreur lors de la suppression', 500);
    }
} catch (Exception $e) {
    sendError('Erreur serveur: ' . $e->getMessage(), 500);
}
?>

