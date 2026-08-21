<?php
require_once __DIR__ . '/../vendor/autoload.php';

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================

// --- Primary MySQL Configuration (InfinityFree) ---
define('DB_HOST', 'sql205.infinityfree.com');
define('DB_PORT', '3306');
define('DB_NAME', 'if0_42710561_nurahub');
define('DB_USER', 'if0_42710561');
define('DB_PASS', '7igD0ACTvi63B');

// --- Localhost MySQL Fallback (For local development/XAMPP) ---
define('LOCAL_DB_HOST', '127.0.0.1');
define('LOCAL_DB_PORT', '3306');
define('LOCAL_DB_NAME', 'if0_42710561_nurahub');
define('LOCAL_DB_USER', 'root');
define('LOCAL_DB_PASS', '');

// --- MongoDB Atlas Configuration ---
define('MONGO_URI', 'mongodb+srv://jbadithya2005_db_user:NuraHub2026Test@cluster0.jxsbeo9.mongodb.net/?appName=Cluster0');
define('MONGO_DB', 'nurahub_auth');

// --- Redis Cloud Configuration ---
define('REDIS_HOST', 'guide-hearty-translucent-91388.db.redis.io');
define('REDIS_PORT', 15590);
define('REDIS_PASS', '@Jaibala7');

// --- Session Constants ---
const SESSION_TTL_SECONDS = 3600;
const SESSION_COOKIE_NAME = 'nh_session';

/**
 * Returns a singleton PDO MySQL instance.
 * Connects to InfinityFree host when on live server, or falls back to localhost when running locally.
 */
function getMysqlConnection(): PDO {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    // 1. Try Primary Host (InfinityFree)
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_TIMEOUT            => 2,
        ]);
        return $pdo;
    } catch (Throwable $e1) {
        // 2. If running locally where InfinityFree remote host is unresolvable/blocked, try Localhost
        try {
            $localDsn = "mysql:host=" . LOCAL_DB_HOST . ";port=" . LOCAL_DB_PORT . ";dbname=" . LOCAL_DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($localDsn, LOCAL_DB_USER, LOCAL_DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::ATTR_TIMEOUT            => 2,
            ]);
            return $pdo;
        } catch (Throwable $e2) {
            // Also try fallback database name 'nurahub_auth' on localhost
            try {
                $altDsn = "mysql:host=" . LOCAL_DB_HOST . ";port=" . LOCAL_DB_PORT . ";dbname=nurahub_auth;charset=utf8mb4";
                $pdo = new PDO($altDsn, LOCAL_DB_USER, LOCAL_DB_PASS, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                    PDO::ATTR_TIMEOUT            => 2,
                ]);
                return $pdo;
            } catch (Throwable $e3) {
                throw new RuntimeException("MySQL Connection Failed: " . $e1->getMessage());
            }
        }
    }
}

/**
 * Returns a MongoDB Collection instance
 */
function getMongoCollection(): ?MongoDB\Collection {
    try {
        if (!class_exists('MongoDB\Client') || !extension_loaded('mongodb')) {
            return null;
        }

        if (!defined('MONGO_URI') || empty(MONGO_URI)) {
            return null;
        }

        $client = new MongoDB\Client(MONGO_URI);
        $db = $client->selectDatabase(MONGO_DB);
        return $db->selectCollection('profiles');

    } catch (Throwable $e) {
        error_log('MongoDB notice: ' . $e->getMessage());
        return null;
    }
}

/**
 * Returns a Redis instance or null (falls back to native session)
 */
function getRedisConnection(): ?Redis {
    static $redis = null;
    static $attempted = false;
    if ($redis === null && !$attempted) {
        $attempted = true;
        try {
            if (!class_exists('Redis') || !extension_loaded('redis')) {
                return null;
            }
            $candidate = new Redis();
            $candidate->connect(REDIS_HOST, (int) REDIS_PORT, 2);
            if (defined('REDIS_PASS') && REDIS_PASS !== '') {
                $candidate->auth(REDIS_PASS);
            }
            $candidate->ping();
            $redis = $candidate;
        } catch (Throwable $e) {
            error_log('Redis unavailable, using native PHP session: ' . $e->getMessage());
            $redis = null;
        }
    }
    return $redis;
}

/**
 * Helper to output standardized JSON responses and exit
 */
function jsonResponse(bool $ok, string $message = '', array $data = [], int $httpCode = 200): void {
    http_response_code($httpCode);
    header('Content-Type: application/json');
    echo json_encode(array_merge(['ok' => $ok, 'message' => $message], $data));
    exit;
}
