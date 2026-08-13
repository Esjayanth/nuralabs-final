<?php
require_once __DIR__ . '/config.php';

function usingNativeFallback(): bool {
    static $usingFallback = null;
    if ($usingFallback === null) {
        $usingFallback = (getRedisConnection() === null);
        if ($usingFallback && session_status() !== PHP_SESSION_ACTIVE) {
            session_name(SESSION_COOKIE_NAME);
            session_set_cookie_params([
                'lifetime' => SESSION_TTL_SECONDS,
                'path'     => '/',
                'httponly' => true,
                'samesite' => 'Lax',
            ]);
            session_start();
        }
    }
    return $usingFallback;
}

function createSession(int $userId): string {
    if (usingNativeFallback()) {
        $_SESSION['user_id'] = $userId;
        return session_id();
    }
    $redis = getRedisConnection();
    $token = bin2hex(random_bytes(32));
    $redis->setex("session:$token", SESSION_TTL_SECONDS, (string) $userId);
    setcookie(SESSION_COOKIE_NAME, $token, [
        'expires'  => time() + SESSION_TTL_SECONDS,
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    return $token;
}

function getUserIdFromSession(): ?int {
    if (usingNativeFallback()) {
        return isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : null;
    }
    if (empty($_COOKIE[SESSION_COOKIE_NAME])) {
        return null;
    }
    $token = $_COOKIE[SESSION_COOKIE_NAME];
    $redis = getRedisConnection();
    $userId = $redis->get("session:$token");
    if ($userId === false) {
        return null;
    }
    $redis->expire("session:$token", SESSION_TTL_SECONDS);
    return (int) $userId;
}

function destroySession(): void {
    if (usingNativeFallback()) {
        $_SESSION = [];
        session_destroy();
        return;
    }
    if (!empty($_COOKIE[SESSION_COOKIE_NAME])) {
        $token = $_COOKIE[SESSION_COOKIE_NAME];
        getRedisConnection()->del("session:$token");
        setcookie(SESSION_COOKIE_NAME, '', [
            'expires'  => time() - 3600,
            'path'     => '/',
            'httponly' => true,
        ]);
    }
}

function requireAuth(): int {
    $userId = getUserIdFromSession();
    if ($userId === null) {
        jsonResponse(false, 'Not authenticated. Please log in.', [], 401);
    }
    return $userId;
}
