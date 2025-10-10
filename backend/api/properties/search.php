<?php
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $database = new Database();
    $db = $database->getConnection();

    // Construire la requête avec les filtres
    $query = "SELECT p.*, 
                     u.firstName as owner_firstName, 
                     u.lastName as owner_lastName,
                     u.email as owner_email,
                     u.phone as owner_phone,
                     u.isVerified as owner_isVerified
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
            'isVerified' => $row['owner_isVerified']
        ];
        
        unset($row['owner_firstName'], $row['owner_lastName'], $row['owner_email'], $row['owner_phone'], $row['owner_isVerified']);
        
        $properties[] = $row;
    }

    sendResponse($properties);
} else {
    sendError("Méthode non autorisée", 405);
}
?>
