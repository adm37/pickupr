<?php
// upload.php - Example upload script for Hostinger
// Make sure to configure CORS properly so your React app can upload here
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Upload-Secret");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$EXPECTED_SECRET = "VERVANG_DIT_DOOR_EEN_EIGEN_GEHEIM_WACHTWOORD"; // Change this to your actual secret!

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Basic security check: Validate upload secret
    $providedSecret = isset($_SERVER['HTTP_X_UPLOAD_SECRET']) ? $_SERVER['HTTP_X_UPLOAD_SECRET'] : '';
    
    if ($providedSecret !== $EXPECTED_SECRET) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Unauthorized: Invalid upload secret."]);
        exit();
    }

    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = 'uploads/';
        
        // Create directory if it does not exist
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $fileName = basename($_FILES['file']['name']);
        // Sanitize the file name
        $fileName = preg_replace("/[^a-zA-Z0-9.\-_]/", "", $fileName);
        
        // Add timestamp to prevent overwriting
        $newFileName = time() . '_' . $fileName;
        $targetFilePath = $uploadDir . $newFileName;

        if (move_uploaded_file($_FILES['file']['tmp_name'], $targetFilePath)) {
            // Success
            $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
            $domain = $_SERVER['HTTP_HOST'];
            $fileUrl = $protocol . "://" . $domain . dirname($_SERVER['PHP_SELF']) . '/' . $targetFilePath;
            
            echo json_encode([
                "success" => true,
                "message" => "File uploaded successfully",
                "fileUrl" => $fileUrl
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "success" => false, 
                "message" => "Error moving the uploaded file."
            ]);
        }
    } else {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "message" => "No file uploaded or file upload error."
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Method not allowed. Use POST."
    ]);
}
?>
