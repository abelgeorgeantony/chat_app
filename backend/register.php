<?php
require 'config.php';
//header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"));

$username = $conn->real_escape_string($data->username);
$default_display_name = strtoupper($username);
$email = $conn->real_escape_string($data->email);
$password = $data->password;

// --- Basic Validation ---
if (empty($username) || empty($email) || empty($password)) {
    echo json_encode(["success" => false, "error" => "All fields are required."]);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "error" => "Invalid email format."]);
    exit;
}

// --- Check for existing user ---
$stmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
$stmt->bind_param("ss", $username, $email);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) {
    echo json_encode(["success" => false, "error" => "Username or email already exists."]);
    exit;
}

// --- Create User with verification code ---
$hash = password_hash($password, PASSWORD_BCRYPT);
$verification_code = random_int(100000, 999999); // 6-digit code

// Insert a basic user entry, not yet fully profiled
$stmt = $conn->prepare("INSERT INTO users (username, display_name, email, password_hash, verification_code, email_verified) VALUES (?, ?, ?, ?, ?, FALSE)");
$stmt->bind_param("sssss", $username, $default_display_name, $email, $hash, $verification_code);

if ($stmt->execute()) {
    $to = $email;
    $subject = "Verify Your Account - Perfect Chat";
    
    // To send HTML mail, the Content-type header must be set
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= 'From: <no-reply@perfectchat.com>' . "\r\n"; // Replace with your domain

    $message = "
    <html>
    <head>
        <title>Verification Code</title>
    </head>
    <body>
        <h2>Welcome to Perfect Chat!</h2>
        <p>Your verification code is: <b>$verification_code</b></p>
        <p>Please enter this code on the registration page to complete your signup.</p>
    </body>
    </html>
    ";

    // The @ symbol suppresses errors if mail() fails, which is common on local dev environments
    if (@mail($to, $subject, $message, $headers)) {
        echo json_encode(["success" => true]);
    } else {
        // Even if mail fails, we don't want to block registration.
        // Log the error for the developer to see.
        error_log("Email sending failed for $to. Code: $verification_code");
        // Still return success to the user so they can manually use the code from the logs.
        echo json_encode(["success" => true, "warning" => "Could not send verification email. Check server logs."]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Failed to create account."]);
}
?>

