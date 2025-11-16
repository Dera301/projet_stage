<?php
include_once '../../config/cors.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  sendError('Méthode non autorisée', 405);
}

$file = __DIR__ . '/policy.json';
if (!file_exists($file)) {
  sendResponse(['content' => '', 'updatedAt' => null]);
}
$data = json_decode(file_get_contents($file), true);
if (!is_array($data)) { $data = ['content' => '', 'updatedAt' => null]; }
sendResponse($data);
?>


