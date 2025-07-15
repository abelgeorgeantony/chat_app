<?php
require 'config.php';
error_log("Hello from register.php", 0);
$data = json_decode(file_get_contents("php://input"));

$email = $conn->real_escape_string($data->email);
$password = $data->password;
$display_name = $conn->real_escape_string($data->display_name);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    #http_response_code(400);
    echo json_encode(["error" => "Invalid email"]);
    exit;
}

$hash = password_hash($password, PASSWORD_BCRYPT);

$stmt = $conn->prepare("INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $email, $hash, $display_name);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    http_response_code(409); // Conflict (email exists)
    echo json_encode(["error" => "Email already registered"]);
}
?>

