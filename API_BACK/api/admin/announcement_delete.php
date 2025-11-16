<?php
include_once '../../config/cors.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
  sendError('Méthode non autorisée', 405);
}

if (!isset($_GET['id'])) {
  sendError('id requis', 400);
}

$file = __DIR__ . '/../announcements/data.json';
if (!file_exists($file)) { file_put_contents($file, json_encode([])); }

$list = json_decode(file_get_contents($file), true);
if (!is_array($list)) { $list = []; }

$id = (string)$_GET['id'];
$before = count($list);
$list = array_values(array_filter($list, function($a) use ($id) {
  return isset($a['id']) && (string)$a['id'] !== $id;
}));

file_put_contents($file, json_encode($list, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
sendResponse(['removed' => $before - count($list)]);
?>


