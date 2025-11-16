<?php
include_once '../../config/cors.php';
include_once '../../config/data.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
  sendError('Méthode non autorisée', 405);
}

$body = json_decode(file_get_contents('php://input'), true);
if (!isset($body['id']) || !isset($body['isAvailable'])) {
  sendError('id et isAvailable requis', 400);
}

try {
  $database = new Database();
  $db = $database->getConnection();
  $stmt = $db->prepare('UPDATE properties SET isAvailable = :avail WHERE id = :id');
  $stmt->bindValue(':avail', (int)!!$body['isAvailable'], PDO::PARAM_INT);
  $stmt->bindValue(':id', $body['id']);
  $stmt->execute();
  sendResponse(['updated' => true]);
} catch (Throwable $e) {
  sendError('Erreur serveur', 500);
}
?>


