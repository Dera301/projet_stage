<?php
include_once '../../config/cors.php';
include_once '../../config/data.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
  sendError('Méthode non autorisée', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!isset($input['id']) || !isset($input['userType'])) {
  sendError('id et userType requis', 400);
}

$allowed = ['student','owner','admin'];
if (!in_array($input['userType'], $allowed, true)) {
  sendError('userType invalide', 400);
}

try {
  $database = new Database();
  $db = $database->getConnection();
  $stmt = $db->prepare('UPDATE users SET userType = :role WHERE id = :id');
  $stmt->bindValue(':role', $input['userType']);
  $stmt->bindValue(':id', $input['id']);
  $stmt->execute();
  sendResponse(['updated' => true]);
} catch (Throwable $e) {
  sendError('Erreur serveur', 500);
}
?>


