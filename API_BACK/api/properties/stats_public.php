<?php
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  sendError('Méthode non autorisée', 405);
}

try {
  $database = new Database();
  $db = $database->getConnection();

  $propStmt = $db->prepare("SELECT COUNT(*) AS totalProperties, SUM(CASE WHEN isAvailable = 1 THEN 1 ELSE 0 END) AS availableProperties FROM properties");
  $propStmt->execute();
  $props = $propStmt->fetch(PDO::FETCH_ASSOC);

  $userStmt = $db->prepare("SELECT COUNT(*) AS totalUsers FROM users");
  $userStmt->execute();
  $users = $userStmt->fetch(PDO::FETCH_ASSOC);

<<<<<<< HEAD:backend/api/properties/stats_public.php
  sendResponse([
    'totalProperties' => (int)($props['totalProperties'] ?? 0),
    'availableProperties' => (int)($props['availableProperties'] ?? 0),
    'totalUsers' => (int)($users['totalUsers'] ?? 0)
=======
  $studentStmt = $db->prepare("SELECT COUNT(*) AS totalStudents FROM users WHERE userType = 'student'");
  $studentStmt->execute();
  $students = $studentStmt->fetch(PDO::FETCH_ASSOC);

  $ownerStmt = $db->prepare("SELECT COUNT(*) AS totalOwners FROM users WHERE userType = 'owner'");
  $ownerStmt->execute();
  $owners = $ownerStmt->fetch(PDO::FETCH_ASSOC);

  sendResponse([
    'totalProperties' => (int)($props['totalProperties'] ?? 0),
    'availableProperties' => (int)($props['availableProperties'] ?? 0),
    'totalUsers' => (int)($users['totalUsers'] ?? 0),
    'totalStudents' => (int)($students['totalStudents'] ?? 0),
    'totalOwners' => (int)($owners['totalOwners'] ?? 0)
>>>>>>> 5a3d279 (dernier modification):API_BACK/api/properties/stats_public.php
  ]);
} catch (Throwable $e) {
  sendError('Erreur serveur', 500);
}
?>


