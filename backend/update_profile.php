<?php
require_once "auth.php";
require_once "config.php";
header('Content-Type: application/json');

// Get data from request
$data = json_decode(file_get_contents("php://input"), true);
$token = $data['token'] ?? null;

// Validate token and get user_id
$user_id = validate_token($token);
if (!$user_id) {
    echo json_encode(["success" => false, "error" => "Invalid session"]);
    exit;
}

// Get new profile data
$display_name = trim($data['display_name'] ?? '');
$username = trim($data['username'] ?? '');
$bio = trim($data['bio'] ?? '');

if (empty($display_name) || empty($username)) {
    echo json_encode(["success" => false, "error" => "Display Name and Username cannot be empty"]);
    exit;
}

global $conn;

// Check if username is already taken by another user
$stmt = $conn->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
$stmt->bind_param("si", $username, $user_id);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) {
    echo json_encode(["success" => false, "error" => "Username is already taken"]);
    exit;
}

// Update the user's profile
$stmt = $conn->prepare("UPDATE users SET display_name = ?, username = ?, bio = ? WHERE id = ?");
$stmt->bind_param("sssi", $display_name, $username, $bio, $user_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => "Database error: " . $stmt->error]);
}
?>
