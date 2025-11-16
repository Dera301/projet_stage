<?php
// Inclure CORS en premier
include_once '../../config/cors.php';

// Puis les autres includes
include_once '../../config/data.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function getResponse($success, $message = '', $data = null) {
    return json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
}

try {
    // Debug: logger les données reçues
    error_log("📥 Données POST reçues: " . print_r($_POST, true));
    error_log("📁 Fichiers reçus: " . print_r($_FILES, true));

    // Vérifier que tous les champs sont présents
    if (!isset($_POST['cinNumber']) || !isset($_FILES['cinRectoImage']) || !isset($_FILES['cinVersoImage']) || !isset($_POST['userId'])) {
        error_log("❌ Champs manquants");
        throw new Exception('Tous les champs sont obligatoires');
    }

    $cinNumber = $_POST['cinNumber'];
    $userId = $_POST['userId'];

    // Valider le numéro CIN (12 chiffres)
    if (!preg_match('/^\d{12}$/', $cinNumber)) {
        throw new Exception('Le numéro CIN doit contenir exactement 12 chiffres');
    }

    // Vérifier les fichiers
    $cinRectoImage = $_FILES['cinRectoImage'];
    $cinVersoImage = $_FILES['cinVersoImage'];

    if ($cinRectoImage['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Erreur lors du téléchargement de l\'image recto');
    }
    
    if ($cinVersoImage['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Erreur lors du téléchargement de l\'image verso');
    }

    // Vérifier les types de fichiers
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!in_array($cinRectoImage['type'], $allowedTypes)) {
        throw new Exception('Type de fichier non autorisé pour le recto');
    }
    
    if (!in_array($cinVersoImage['type'], $allowedTypes)) {
        throw new Exception('Type de fichier non autorisé pour le verso');
    }

    // Vérifier la taille des fichiers (max 5MB)
    $maxSize = 5 * 1024 * 1024;
    if ($cinRectoImage['size'] > $maxSize) {
        throw new Exception('L\'image recto ne doit pas dépasser 5MB');
    }
    
    if ($cinVersoImage['size'] > $maxSize) {
        throw new Exception('L\'image verso ne doit pas dépasser 5MB');
    }

    // Connexion à la base de données
    $db = new Database();
    $pdo = $db->getConnection();

    // Vérifier si l'utilisateur existe
    $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception('Utilisateur non trouvé');
    }

    // Créer le dossier de stockage s'il n'existe pas
    $uploadDir = __DIR__ . "/../../uploads/cin_verifications/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Générer des noms de fichiers uniques
    $rectoFilename = 'cin_recto_' . $userId . '_' . time() . '.' . pathinfo($cinRectoImage['name'], PATHINFO_EXTENSION);
    $versoFilename = 'cin_verso_' . $userId . '_' . time() . '.' . pathinfo($cinVersoImage['name'], PATHINFO_EXTENSION);

    $rectoPath = $uploadDir . $rectoFilename;
    $versoPath = $uploadDir . $versoFilename;

    // Déplacer les fichiers uploadés
    if (!move_uploaded_file($cinRectoImage['tmp_name'], $rectoPath)) {
        throw new Exception('Erreur lors du stockage de l\'image recto');
    }
    
    if (!move_uploaded_file($cinVersoImage['tmp_name'], $versoPath)) {
        // Nettoyer le fichier recto si le verso échoue
        if (file_exists($rectoPath)) {
            unlink($rectoPath);
        }
        throw new Exception('Erreur lors du stockage de l\'image verso');
    }

    // Chemins relatifs pour la base de données
    $relativeRectoPath = "uploads/cin_verifications/" . $rectoFilename;
    $relativeVersoPath = "uploads/cin_verifications/" . $versoFilename;

    // Mettre à jour l'utilisateur dans la base de données
    // Ne pas activer directement - attendre la validation admin
    $stmt = $pdo->prepare("
        UPDATE users 
        SET cin_verified = 0, 
            is_verified = 0,
            cin_number = ?,
            cin_recto_image_path = ?,
            cin_verso_image_path = ?,
            cin_verification_requested_at = NOW(),
            updated_at = NOW()
        WHERE id = ?
    ");

    $success = $stmt->execute([
        $cinNumber,
        $relativeRectoPath,
        $relativeVersoPath,
        $userId
    ]);

    if (!$success) {
        throw new Exception('Erreur lors de la mise à jour de la base de données: ' . implode(', ', $stmt->errorInfo()));
    }

    // Réponse de succès - en attente de validation
    echo getResponse(true, 'Vérification CIN soumise avec succès. En attente de validation par un administrateur.', [
        'cinVerified' => false,
        'cinPending' => true,
        'cinNumber' => $cinNumber
    ]);

} catch (Exception $e) {
    error_log("❌ Erreur verify_cin.php: " . $e->getMessage());
    http_response_code(400);
    echo getResponse(false, $e->getMessage());
}
?>
