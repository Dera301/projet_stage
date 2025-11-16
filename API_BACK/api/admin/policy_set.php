<?php
include_once '../../config/cors.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  sendError('Méthode non autorisée', 405);
}

$body = json_decode(file_get_contents('php://input'), true);
if (!isset($body['content'])) {
  sendError('content requis', 400);
}

$file = __DIR__ . '/policy.json';
file_put_contents($file, json_encode(['content' => $body['content'], 'updatedAt' => date('c')], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
sendResponse(['saved' => true]);
?>


