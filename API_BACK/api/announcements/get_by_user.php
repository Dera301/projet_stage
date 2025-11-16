<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if (!isset($_GET['userId'])) {
  http_response_code(400);
  echo json_encode([ 'success' => false, 'message' => 'userId requis' ]);
  exit;
}

$storageDir = __DIR__;
$dataFile = $storageDir . '/data.json';
if (!file_exists($dataFile)) { file_put_contents($dataFile, json_encode([])); }

$announcements = json_decode(file_get_contents($dataFile), true);
if (!is_array($announcements)) { $announcements = []; }

$userId = (string)$_GET['userId'];
$filtered = array_values(array_filter($announcements, function($a) use ($userId) {
  return isset($a['authorId']) && (string)$a['authorId'] === $userId;
}));

echo json_encode([ 'success' => true, 'data' => $filtered ]);
