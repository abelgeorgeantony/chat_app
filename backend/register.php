<?php
require 'config.php';
error_log("Hello from register.php", 0);
$data = json_decode(file_get_contents("php://input"));

$username = $conn->real_escape_string($data->username);
$email = $conn->real_escape_string($data->email);
$password = $data->password;
$display_name = $conn->real_escape_string($data->display_name);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    #http_response_code(400);
    echo json_encode(["error" => "Invalid email"]);
    exit;
}

$hash = password_hash($password, PASSWORD_BCRYPT);

$stmt = $conn->prepare("INSERT INTO users (username, display_name, email, password_hash) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $username, $display_name, $email, $hash);

if ($stmt->execute()) {
    $new_user_id = $stmt->insert_id;  // Get new user's ID

    // ✅ Create inbox table for this user
    $inbox_table = "inbox_" . intval($new_user_id);
    $create_inbox_sql = "
        CREATE TABLE $inbox_table (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sender_id INT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ";
    if ($conn->query($create_inbox_sql)) {
        error_log("Inbox created for user $new_user_id");
    } else {
        error_log("Failed to create inbox for $new_user_id : " . $conn->error);
    }

    // ✅ Create contacts_<user_id> table
    $contacts_table = "contacts_" . intval($new_user_id);
    $create_contacts_sql = "
        CREATE TABLE $contacts_table (
            id INT AUTO_INCREMENT PRIMARY KEY,
            contact_id INT NOT NULL,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contact_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ";
    if ($conn->query($create_contacts_sql)) {
        error_log("Contacts table created for user $new_user_id");
    } else {
        error_log("Failed to create contacts for $new_user_id: " . $conn->error);
    }


    echo json_encode(["success" => true]);
} else {
    http_response_code(409); // Conflict (email exists)
    echo json_encode(["error" => "Email already registered"]);
}
?>

