<?php
require_once "auth.php";
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$token = $data['token'] ?? null;
$contact_id = intval($data['contact_id'] ?? 0);

$user_id = validate_token($token);
if (!$user_id || !$contact_id) {
    echo json_encode(["success" => false]);
    exit;
}

require_once "config.php";
global $conn;

$contacts_table = "contacts_" . intval($user_id);

// Insert only if not already present
$stmt = $conn->prepare("SELECT id FROM $contacts_table WHERE contact_id = ?");
$stmt->bind_param("i", $contact_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt = $conn->prepare("INSERT INTO $contacts_table (contact_id) VALUES (?)");
    $stmt->bind_param("i", $contact_id);
    $stmt->execute();
}

echo json_encode(["success" => true]);

