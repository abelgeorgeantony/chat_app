-- Create the main users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    bio TEXT DEFAULT NULL,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_online BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(10) DEFAULT NULL,
    profile_picture_url VARCHAR(255) DEFAULT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    account_status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create the sessions table for token-based login
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create a inbox table for each registered user. To be used only on register.php.
CREATE TABLE inbox_<user_id> (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Create a contacts table for each registered user. To be used only on register.php
CREATE TABLE contacts_<user_id> (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contact_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES users(id) ON DELETE CASCADE
);

