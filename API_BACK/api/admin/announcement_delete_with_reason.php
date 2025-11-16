<?php
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Méthode non autorisée', 405);
}

$json = file_get_contents('php://input');
$data = json_decode($json);

if (empty($data->id)) {
    sendError('ID annonce requis');
}

if (empty($data->reason)) {
    sendError('Raison de suppression requise');
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Récupérer l'annonce et l'auteur
    $stmt = $db->prepare("
        SELECT a.id, a.authorId, a.content, u.email, u.firstName, u.lastName 
        FROM announcements a 
        JOIN users u ON a.authorId = u.id 
        WHERE a.id = :id
    ");
    $stmt->bindParam(':id', $data->id);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        sendError('Annonce non trouvée', 404);
    }
    
    $announcement = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Envoyer un email de notification
    $to = $announcement['email'];
    $subject = "Suppression de votre annonce - ColocAntananarivo";
    $message = "
    Bonjour {$announcement['firstName']} {$announcement['lastName']},
    
    Votre annonce sur ColocAntananarivo a été supprimée par un administrateur.
    
    Raison de la suppression:
    {$data->reason}
    
    Si vous pensez qu'il s'agit d'une erreur, veuillez contacter le support.
    
    Cordialement,
    L'équipe ColocAntananarivo
    ";
    
    // En production, utiliser PHPMailer ou un service d'email
    // mail($to, $subject, $message);
    
    // Supprimer l'annonce
    $stmt = $db->prepare("DELETE FROM announcements WHERE id = :id");
    $stmt->bindParam(':id', $data->id);
    
    if ($stmt->execute()) {
        sendResponse(['deleted' => true, 'announcementId' => $data->id], 'Annonce supprimée avec succès');
    } else {
        sendError('Erreur lors de la suppression', 500);
    }
} catch (Exception $e) {
    sendError('Erreur serveur: ' . $e->getMessage(), 500);
}
?>

