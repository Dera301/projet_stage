<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

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
$before = count($announcements);
$announcements = array_values(array_filter($announcements, function($a) use ($id) {
  return isset($a['id']) && (string)$a['id'] !== $id;
}));
$after = count($announcements);

file_put_contents($dataFile, json_encode($announcements, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

echo json_encode([ 'success' => true, 'data' => [ 'removed' => ($before - $after) ] ]);
