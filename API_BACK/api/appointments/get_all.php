<?php
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Méthode non autorisée', 405);
}

$userId = $_GET['userId'] ?? null;
$userType = $_GET['userType'] ?? null;

if (!$userId) {
    sendError('ID utilisateur requis', 400);
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Récupérer les rendez-vous selon le type d'utilisateur
    if ($userType === 'student') {
        $query = "
            SELECT a.*, p.title as propertyTitle, p.address, 
                   o.firstName as ownerFirstName, o.lastName as ownerLastName, o.email as ownerEmail, o.phone as ownerPhone
            FROM appointments a
            JOIN properties p ON a.propertyId = p.id
            JOIN users o ON a.ownerId = o.id
            WHERE a.studentId = :userId
            ORDER BY a.appointmentDate DESC
        ";
    } else if ($userType === 'owner') {
        $query = "
            SELECT a.*, p.title as propertyTitle, p.address,
                   s.firstName as studentFirstName, s.lastName as studentLastName, s.email as studentEmail, s.phone as studentPhone
            FROM appointments a
            JOIN properties p ON a.propertyId = p.id
            JOIN users s ON a.studentId = s.id
            WHERE a.ownerId = :userId
            ORDER BY a.appointmentDate DESC
        ";
    } else {
        sendError('Type d\'utilisateur invalide', 400);
    }

    $stmt = $db->prepare($query);
    $stmt->bindParam(':userId', $userId);
    $stmt->execute();
    
    $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendResponse($appointments, 'Rendez-vous récupérés avec succès');
} catch (Exception $e) {
    sendError('Erreur serveur: ' . $e->getMessage(), 500);
}
?>

