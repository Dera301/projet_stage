<?php
include_once '../../config/cors.php';
include_once '../../config/data.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  sendError('Méthode non autorisée', 405);
}

// Annonces stockées en fichier (announcements/data.json) + potentielle table futur
$file = __DIR__ . '/../announcements/data.json';
if (!file_exists($file)) { file_put_contents($file, json_encode([])); }

$ann = json_decode(file_get_contents($file), true);
if (!is_array($ann)) { $ann = []; }
sendResponse($ann);
?>


