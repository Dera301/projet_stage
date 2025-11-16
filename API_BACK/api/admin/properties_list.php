<?php
include_once '../../config/cors.php';
include_once '../../config/data.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  sendError('Méthode non autorisée', 405);
}

try {
  $database = new Database();
  $db = $database->getConnection();
  $stmt = $db->prepare("SELECT id, title, ownerId, district, isAvailable, price, createdAt FROM properties ORDER BY createdAt DESC");
  $stmt->execute();
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
  sendResponse($rows);
} catch (Throwable $e) {
  sendError('Erreur serveur', 500);
}
?>


