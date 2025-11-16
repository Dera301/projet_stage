<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if (!isset($_GET['id'])) {
  http_response_code(400);
  echo json_encode([ 'success' => false, 'message' => 'id requis' ]);
  exit;
}

$storageDir = __DIR__;
$dataFile = $storageDir . '/data.json';
if (!file_exists($dataFile)) { file_put_contents($dataFile, json_encode([])); }

$announcements = json_decode(file_get_contents($dataFile), true);
if (!is_array($announcements)) { $announcements = []; }

$id = (string)$_GET['id'];
$found = null;
foreach ($announcements as $a) {
  if (isset($a['id']) && (string)$a['id'] === $id) { $found = $a; break; }
}

if (!$found) {
  http_response_code(404);
  echo json_encode([ 'success' => false, 'message' => 'Annonce introuvable' ]);
  exit;
}

echo json_encode([ 'success' => true, 'data' => $found ]);
?>


