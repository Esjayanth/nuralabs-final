CREATE DATABASE IF NOT EXISTS nurahub_auth CHARACTER SET utf8mb4;
USE nurahub_auth;

CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(30)  NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- MongoDB `profiles` collection (created automatically, no DDL needed):
-- { user_id: Int, name: String, age: Int|null, bio: String, interests: [String] }

-- Redis key pattern (created automatically at login, no DDL needed):
-- session:<token>  ->  user_id   (TTL 3600s)
