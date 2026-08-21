<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/session_helper.php';

$method = $_SERVER['REQUEST_METHOD'];

// Logout: POST with { "action": "logout" }
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    if (($input['action'] ?? '') === 'logout') {
        destroySession();
        jsonResponse(true, 'Logged out.');
    }
}

$userId = requireAuth(); // 401s automatically if not logged in

try {
    $pdo = getMysqlConnection();
    $stmt = $pdo->prepare('SELECT id, username, email, created_at FROM users WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $userId]);
    $account = $stmt->fetch();

    if (!$account) {
        jsonResponse(false, 'User not found.', [], 404);
    }

    $collection = getMongoCollection();

    if ($method === 'GET') {
        $profileData = [
            'name'      => '',
            'age'       => null,
            'bio'       => '',
            'interests' => [],
        ];

        if ($collection !== null) {
            try {
                $profile = $collection->findOne(['user_id' => $userId]);
                if ($profile) {
                    $profileData['name']      = $profile['name'] ?? '';
                    $profileData['age']       = $profile['age'] ?? null;
                    $profileData['bio']       = $profile['bio'] ?? '';
                    $profileData['interests'] = $profile['interests'] ?? [];
                }
            } catch (Throwable $e) {
                error_log('Mongo profile find notice: ' . $e->getMessage());
            }
        }

        jsonResponse(true, '', [
            'account' => $account,
            'profile' => $profileData,
        ]);
    }

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $name      = trim((string) ($input['name'] ?? ''));
        $age       = isset($input['age']) && $input['age'] !== '' ? (int) $input['age'] : null;
        $bio       = trim((string) ($input['bio'] ?? ''));
        $interests = is_array($input['interests'] ?? null) ? array_values($input['interests']) : [];

        if ($age !== null && ($age < 0 || $age > 130)) {
            jsonResponse(false, 'Please enter a valid age between 0 and 130.', [], 422);
        }
        if (strlen($bio) > 500) {
            jsonResponse(false, 'Bio must be 500 characters or fewer.', [], 422);
        }

        if ($collection !== null) {
            try {
                $collection->updateOne(
                    ['user_id' => $userId],
                    ['$set' => [
                        'user_id'   => $userId,
                        'name'      => $name,
                        'age'       => $age,
                        'bio'       => $bio,
                        'interests' => $interests,
                    ]],
                    ['upsert' => true]
                );
            } catch (Throwable $e) {
                error_log('Mongo profile save notice: ' . $e->getMessage());
            }
        }

        jsonResponse(true, 'Profile updated successfully.');
    }

    jsonResponse(false, 'Method not allowed', [], 405);

} catch (Throwable $e) {
    error_log('profile.php error: ' . $e->getMessage());
    jsonResponse(false, 'Database error: ' . $e->getMessage(), [], 500);
}
