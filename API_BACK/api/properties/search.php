<?php
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

// Définir le header JSON en premier
header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] == 'GET') {
        $database = new Database();
        $db = $database->getConnection();

        // Construire la requête avec les filtres
        $query = "SELECT p.*, 
                         u.firstName as owner_firstName, 
                         u.lastName as owner_lastName,
                         u.email as owner_email,
                         u.phone as owner_phone,
                         u.is_verified as owner_isVerified
                  FROM properties p 
                  LEFT JOIN users u ON p.ownerId = u.id 
                  WHERE p.isAvailable = 1";

        $params = [];

        // Filtres
        if (isset($_GET['district']) && !empty($_GET['district'])) {
            $query .= " AND p.district = :district";
            $params[':district'] = $_GET['district'];
        }

        if (isset($_GET['propertyType']) && !empty($_GET['propertyType'])) {
            $query .= " AND p.propertyType = :propertyType";
            $params[':propertyType'] = $_GET['propertyType'];
        }

        if (isset($_GET['minPrice']) && is_numeric($_GET['minPrice'])) {
            $query .= " AND p.price >= :minPrice";
            $params[':minPrice'] = $_GET['minPrice'];
        }

        if (isset($_GET['maxPrice']) && is_numeric($_GET['maxPrice'])) {
            $query .= " AND p.price <= :maxPrice";
            $params[':maxPrice'] = $_GET['maxPrice'];
        }

        if (isset($_GET['availableRooms']) && is_numeric($_GET['availableRooms'])) {
            $query .= " AND p.availableRooms >= :availableRooms";
            $params[':availableRooms'] = $_GET['availableRooms'];
        }

        // --- DÉBUT DE LA CORRECTION ---
        // Gérer le filtre des équipements
        if (isset($_GET['amenities']) && is_array($_GET['amenities']) && !empty($_GET['amenities'])) {
            foreach ($_GET['amenities'] as $index => $amenity) {
                // Nous devons lier chaque valeur d'équipement en tant que chaîne JSON
                // Par exemple, "Internet" devient "\"Internet\""
                $paramName = ':amenity' . $index;
                $query .= " AND JSON_CONTAINS(p.amenities, :{$paramName})";
                $params[':' . $paramName] = json_encode($amenity);
            }
        }
        // --- FIN DE LA CORRECTION ---


        // Tri
        $sort = $_GET['sort'] ?? 'createdAt DESC';
        $allowed_sorts = ['price ASC', 'price DESC', 'createdAt ASC', 'createdAt DESC'];
        if (in_array($sort, $allowed_sorts)) {
            $query .= " ORDER BY p." . $sort;
        } else {
            $query .= " ORDER BY p.createdAt DESC";
        }

        $stmt = $db->prepare($query);
        
        // Lier les paramètres
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        $stmt->execute();

        $properties = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $row['images'] = json_decode($row['images'], true) ?: [];
            $row['amenities'] = json_decode($row['amenities'], true) ?: [];
            
            $row['owner'] = [
                'id' => $row['ownerId'],
                'firstName' => $row['owner_firstName'],
                'lastName' => $row['owner_lastName'],
                'email' => $row['owner_email'],
                'phone' => $row['owner_phone'],
                'is_verified' => $row['owner_isVerified']
            ];
            
            unset($row['owner_firstName'], $row['owner_lastName'], $row['owner_email'], $row['owner_phone'], $row['owner_isVerified']);
            
            $properties[] = $row;
        }

        // Retourner un tableau vide si pas de résultats
        echo json_encode([
            'success' => true,
            'data' => $properties
        ]);
        exit;
        
    } else {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Méthode non autorisée'
        ]);
        exit;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur serveur: ' . $e->getMessage()
    ]);
    exit;
}
?>
