<?php
require 'config.php';

$data = json_decode(file_get_contents("php://input"));
$token = $conn->real_escape_string($data->token);

$result = $conn->query("SELECT * FROM sessions WHERE token='$token'");

if ($result->num_rows > 0) {
    echo json_encode(["valid" => true]);
} else {
    echo json_encode(["valid" => false]);
}
?>

