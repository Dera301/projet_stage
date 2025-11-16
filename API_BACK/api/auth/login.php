<?php
include_once '../../config/data.php';
include_once '../../config/cors.php';
include_once '../../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->email) && !empty($data->password)) {
        $database = new Database();
        $db = $database->getConnection();

        $query = "SELECT id, email, password, firstName, lastName, phone, userType, university, studyLevel, is_verified, created_at 
                  FROM users WHERE email = :email";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":email", $data->email);
        $stmt->execute();

        if ($stmt->rowCount() == 1) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (password_verify($data->password, $user['password'])) {
                // Retirer le mot de passe de la réponse
                unset($user['password']);
                // Générer un token simple encodé en Base64 contenant l'ID utilisateur
                $tokenPayload = [
                    'user_id' => $user['id'],
                    'iat' => time()
                ];
                $token = base64_encode(json_encode($tokenPayload));

                // Retourner l'utilisateur et le token au frontend
                sendResponse([
                    'user' => $user,
                    'token' => $token
                ], "Connexion réussie");
            } else {
                sendError("Mot de passe incorrect", 401);
            }
        } else {
            sendError("Utilisateur non trouvé", 404);
        }
    } else {
        sendError("Email et mot de passe requis");
    }
} else {
    sendError("Méthode non autorisée", 405);
}
?>
