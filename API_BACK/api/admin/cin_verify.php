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

if (empty($data->userId)) {
    sendError('ID utilisateur requis');
}

if (!isset($data->approved)) {
    sendError('Statut de vérification requis (approved: true/false)');
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Mettre à jour selon approuvé / rejeté
    if ($data->approved) {
        // Approbation: marquer vérifié
        $stmt = $db->prepare("
            UPDATE users 
            SET cin_verified = 1,
                is_verified = 1,
                cin_verified_at = NOW(),
                updated_at = NOW()
            WHERE id = :userId
        ");
        $stmt->bindParam(':userId', $data->userId);
    } else {
        // Rejet: nettoyer toutes les colonnes liées à la CIN et désactiver la vérification
        $stmt = $db->prepare("
            UPDATE users 
            SET cin_verified = 0,
                is_verified = 0,
                cin_number = NULL,
                cin_data = NULL,
                cin_recto_image_path = NULL,
                cin_verso_image_path = NULL,
                cin_verification_confidence = NULL,
                cin_verification_errors = NULL,
                cin_verified_at = NULL,
                cin_verification_requested_at = NULL,
                updated_at = NOW()
            WHERE id = :userId
        ");
        $stmt->bindParam(':userId', $data->userId);
    }

    if ($stmt->execute()) {
        // Récupérer les informations utilisateur pour l'email
        $stmt = $db->prepare("SELECT email, firstName, lastName FROM users WHERE id = :userId");
        $stmt->bindParam(':userId', $data->userId);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Envoyer email de notification
        $subject = $data->approved 
            ? "Votre CIN a été vérifiée - ColocAntananarivo"
            : "Votre CIN n'a pas été approuvée - ColocAntananarivo";
        
        $message = $data->approved
            ? "Bonjour {$user['firstName']}, votre CIN a été vérifiée avec succès. Votre compte est maintenant vérifié."
            : "Bonjour {$user['firstName']}, votre CIN n'a pas été approuvée. Veuillez réessayer avec des documents valides.";
        
        // mail($user['email'], $subject, $message);
        
        sendResponse([
            'verified' => $data->approved ? 1 : 0,
            'userId' => $data->userId
        ], $data->approved ? 'CIN vérifiée avec succès' : 'CIN rejetée et données effacées');
    } else {
        sendError('Erreur lors de la vérification', 500);
    }
} catch (Exception $e) {
    sendError('Erreur serveur: ' . $e->getMessage(), 500);
}
?>

