<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$storageDir = __DIR__;
$dataFile = $storageDir . '/data.json';
if (!file_exists($dataFile)) { file_put_contents($dataFile, json_encode([])); }

parse_str($_SERVER['QUERY_STRING'] ?? '', $query);
if (!isset($query['id'])) {
  http_response_code(400);
  echo json_encode([ 'success' => false, 'message' => 'id requis' ]);
  exit;
}

$id = (string)$query['id'];
$raw = file_get_contents('php://input');
$body = json_decode($raw, true);
if (!is_array($body)) { $body = []; }

$announcements = json_decode(file_get_contents($dataFile), true);
if (!is_array($announcements)) { $announcements = []; }

$found = false;
for ($i = 0; $i < count($announcements); $i++) {
  if (isset($announcements[$i]['id']) && (string)$announcements[$i]['id'] === $id) {
    $found = true;
    if (isset($body['content'])) {
      $announcements[$i]['content'] = trim((string)$body['content']);
    }
    if (isset($body['images']) && is_array($body['images'])) {
      $announcements[$i]['images'] = $body['images'];
    }
    if (array_key_exists('contact', $body)) {
      $announcements[$i]['contact'] = $body['contact'];
    }
    break;
  }
}

if (!$found) {
  http_response_code(404);
  echo json_encode([ 'success' => false, 'message' => 'Annonce introuvable' ]);
  exit;
}

file_put_contents($dataFile, json_encode($announcements, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

echo json_encode([ 'success' => true, 'data' => $announcements[$i] ]);
?>


