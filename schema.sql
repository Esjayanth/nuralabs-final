-- ============================================================================
-- NuraHub Auth MySQL Schema & Initial Data
-- Database: if0_42710561_nurahub
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(30)  NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample Test Account (Password is: Password123!)
INSERT INTO users (username, email, password_hash, created_at) 
VALUES ('alex_dev', 'alex@example.com', '$2y$10$GMUrr4NxtYVijfjTBtjRSu2ffjlB.IFdelVTRAPGt.UKclf1hzHZy', NOW())
ON DUPLICATE KEY UPDATE id=id;
