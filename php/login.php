<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/session_helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed', [], 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$identifier = trim($input['identifier'] ?? ''); // username or email
$password   = (string) ($input['password'] ?? '');

if ($identifier === '' || $password === '') {
    jsonResponse(false, 'Username/email and password are required.', [], 422);
}

try {
    $pdo = getMysqlConnection();

    $stmt = $pdo->prepare(
        'SELECT id, username, email, password_hash FROM users WHERE username = :u OR email = :e LIMIT 1'
    );
    $stmt->execute(['u' => $identifier, 'e' => $identifier]);
    $user = $stmt->fetch();

    if (!$user) {
        jsonResponse(false, 'Invalid username/email or password.', [], 401);
    }

    if (!password_verify($password, $user['password_hash'])) {
        jsonResponse(false, 'Invalid username/email or password.', [], 401);
    }

    createSession((int) $user['id']);

    jsonResponse(true, 'Login successful.', [
        'user' => [
            'id'       => (int) $user['id'],
            'username' => $user['username'],
            'email'    => $user['email'],
        ],
    ]);

} catch (Throwable $e) {
    error_log('login.php error: ' . $e->getMessage());
    jsonResponse(false, 'Database connection error: ' . $e->getMessage(), [], 500);
}
