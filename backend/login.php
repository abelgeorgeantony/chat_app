<?php
require 'config.php';

$data = json_decode(file_get_contents("php://input"));

$email = $conn->real_escape_string($data->email);
$password = $data->password;

$result = $conn->query("SELECT * FROM users WHERE email='$email'");

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid credentials"]);
    exit;
}

$user = $result->fetch_assoc();

if (!password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid credentials"]);
    exit;
}


// Generate a random token
$token = bin2hex(random_bytes(32));
$user_id = $user['id'];

// Save token in DB
$conn->query("INSERT INTO sessions (user_id, token, created_at) VALUES ($user_id, '$token', NOW())");

echo json_encode(["success" => true, "token" => $token, "display_name" => $user['display_name']]);
?>

