<?php
function sendResponse($data = null, $message = "Success", $code = 200) {
    http_response_code($code);
    echo json_encode([
        "success" => $code >= 200 && $code < 300,
        "message" => $message,
        "data" => $data,
        "timestamp" => date("Y-m-d H:i:s")
    ]);
    exit();
}

function sendError($message = "Error", $code = 400) {
    sendResponse(null, $message, $code);
}
?>
