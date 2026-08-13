<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed', [], 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$username = trim($input['username'] ?? '');
$email    = trim($input['email'] ?? '');
$password = (string) ($input['password'] ?? '');

// ---- Validation ----
$errors = [];
if ($username === '' || !preg_match('/^[a-zA-Z0-9_.]{3,30}$/', $username)) {
    $errors[] = 'Username must be 3-30 characters (letters, numbers, . or _).';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'A valid email is required.';
}
if (strlen($password) < 8) {
    $errors[] = 'Password must be at least 8 characters.';
}

if ($errors) {
    jsonResponse(false, implode(' ', $errors), [], 422);
}

try {
    $pdo = getMysqlConnection();

    // Check for existing username/email
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = :username OR email = :email LIMIT 1');
    $stmt->execute(['username' => $username, 'email' => $email]);
    if ($stmt->fetch()) {
        jsonResponse(false, 'Username or email is already registered.', [], 409);
    }

    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $pdo->prepare(
        'INSERT INTO users (username, email, password_hash, created_at) VALUES (:username, :email, :password_hash, NOW())'
    );
    $stmt->execute([
        'username'      => $username,
        'email'         => $email,
        'password_hash' => $passwordHash,
    ]);
    $userId = (int) $pdo->lastInsertId();

    // Create an empty profile document in MongoDB for this user
    try {
        $collection = getMongoCollection();
        $collection->insertOne([
            'user_id'   => $userId,
            'name'      => '',
            'age'       => null,
            'bio'       => '',
            'interests' => [],
        ]);
    } catch (Throwable $mongoErr) {
        // Don't fail registration if Mongo is briefly unavailable; profile.php
        // upserts on first save, so this is recoverable.
        error_log('MongoDB profile init failed: ' . $mongoErr->getMessage());
    }

    jsonResponse(true, 'Registration successful. Please log in.', ['user_id' => $userId], 201);

} catch (Throwable $e) {
    error_log('register.php error: ' . $e->getMessage());
    jsonResponse(false, 'Something went wrong. Please try again.', [], 500);
}
