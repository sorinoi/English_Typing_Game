<?php
// save-vocabulary.php
// Optional PHP backend for saving vocabulary to JSON file

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the JSON data from the request
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if ($data === null) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON data']);
        exit;
    }
    
    // Validate the data structure
    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(['error' => 'Data must be an object']);
        exit;
    }
    
    // Save to vocabulary.json file
    $result = file_put_contents('vocabulary.json', json_encode($data, JSON_PRETTY_PRINT));
    
    if ($result !== false) {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Vocabulary saved successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save vocabulary']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
