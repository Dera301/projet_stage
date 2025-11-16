<?php
// api/upload/image.php
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Méthode non autorisée'
    ]);
    exit();
}

// CORRECTION : Chemin relatif depuis la racine du projet
$uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/Projet_stage/uploads/properties/';

// Vérifier et créer le dossier si nécessaire
if (!file_exists($uploadDir)) {
    if (!mkdir($uploadDir, 0777, true)) {
        echo json_encode([
            'success' => false,
            'message' => 'Impossible de créer le dossier de destination: ' . $uploadDir
        ]);
        exit();
    }
}

// Vérifier les permissions d'écriture
if (!is_writable($uploadDir)) {
    echo json_encode([
        'success' => false,
        'message' => 'Le dossier n\'est pas accessible en écriture: ' . $uploadDir
    ]);
    exit();
}

try {
    // Vérifier si un fichier a été uploadé
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        $errorCode = $_FILES['image']['error'] ?? 'unknown';
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'Fichier trop volumineux',
            UPLOAD_ERR_FORM_SIZE => 'Fichier trop volumineux',
            UPLOAD_ERR_PARTIAL => 'Fichier partiellement uploadé',
            UPLOAD_ERR_NO_FILE => 'Aucun fichier sélectionné',
            UPLOAD_ERR_NO_TMP_DIR => 'Dossier temporaire manquant',
            UPLOAD_ERR_CANT_WRITE => 'Erreur d\'écriture',
            UPLOAD_ERR_EXTENSION => 'Extension PHP a arrêté l\'upload'
        ];
        throw new Exception($errorMessages[$errorCode] ?? 'Erreur d\'upload: ' . $errorCode);
    }
    
    $uploadedFile = $_FILES['image'];
    
    // Vérifications de sécurité
    $allowedTypes = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png', 
        'image/gif' => 'gif',
        'image/webp' => 'webp'
    ];
    $maxFileSize = 5 * 1024 * 1024; // 5MB
    
    // Vérifier la taille
    if ($uploadedFile['size'] > $maxFileSize) {
        throw new Exception("Fichier trop volumineux. Maximum 5MB autorisé");
    }
    
    // Vérifier le type MIME
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $uploadedFile['tmp_name']);
    finfo_close($finfo);
    
    if (!array_key_exists($mimeType, $allowedTypes)) {
        throw new Exception("Type de fichier non autorisé. Formats acceptés: JPG, PNG, GIF, WebP");
    }
    
    // Nettoyer le nom du fichier
    $originalName = preg_replace('/[^a-zA-Z0-9\.\_\-]/', '_', $uploadedFile['name']);
    
    // Générer un nom de fichier unique
    $fileExtension = $allowedTypes[$mimeType];
    $fileName = uniqid() . '_' . time() . '.' . $fileExtension;
    $filePath = $uploadDir . $fileName;
    
    // Déplacer le fichier uploadé
    if (!move_uploaded_file($uploadedFile['tmp_name'], $filePath)) {
        throw new Exception("Erreur de permission: impossible d\'écrire dans le dossier de destination");
    }
    
    // Vérifier que le fichier a bien été créé
    if (!file_exists($filePath)) {
        throw new Exception("Le fichier n'a pas été créé après l'upload");
    }
    
    // CORRECTION : URL d'accès aux images
    $imageUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/Projet_stage/uploads/properties/' . $fileName;
    
    // Réponse de succès
    echo json_encode([
        'success' => true,
        'message' => 'Image uploadée avec succès',
        'data' => [
            'imageUrl' => $imageUrl,
            'fileName' => $fileName,
            'fileSize' => $uploadedFile['size'],
            'mimeType' => $mimeType
        ]
    ]);
    
} catch (Exception $e) {
    // Réponse d'erreur
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
