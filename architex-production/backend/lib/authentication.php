<?php
declare(strict_types=1);

function auth_normalize_email(string $email): string
{
    return strtolower(trim($email));
}

/** Return stable validation messages; an empty array means the password is valid. */
function auth_validate_password(string $password): array
{
    $errors = [];
    if (strlen($password) < 12) $errors[] = 'Password must be at least 12 characters';
    if (!preg_match('/[a-z]/', $password)) $errors[] = 'Password must contain a lowercase letter';
    if (!preg_match('/[A-Z]/', $password)) $errors[] = 'Password must contain an uppercase letter';
    if (!preg_match('/\d/', $password)) $errors[] = 'Password must contain a number';
    if (!preg_match('/[^A-Za-z0-9]/', $password)) $errors[] = 'Password must contain a symbol';
    return $errors;
}

function auth_new_opaque_token(): string
{
    return bin2hex(random_bytes(32));
}

function auth_token_hash(string $token): string
{
    return hash('sha256', $token);
}

function auth_cookie_header(string $token, int $maxAge): string
{
    $expires = gmdate('D, d M Y H:i:s T', time() + $maxAge);
    return 'architex_refresh=' . rawurlencode($token)
        . '; Path=/api/v1/auth; Max-Age=' . $maxAge
        . '; Expires=' . $expires
        . '; HttpOnly; Secure; SameSite=None';
}

function auth_clear_cookie_header(): string
{
    return 'architex_refresh=; Path=/api/v1/auth; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None';
}

function auth_refresh_cookie_token(): string
{
    if (isset($_COOKIE['architex_refresh'])) return trim((string) $_COOKIE['architex_refresh']);
    $raw = (string) ($_SERVER['HTTP_COOKIE'] ?? '');
    foreach (explode(';', $raw) as $part) {
        [$name, $value] = array_pad(explode('=', trim($part), 2), 2, '');
        if ($name === 'architex_refresh') return rawurldecode($value);
    }
    return '';
}

function auth_set_refresh_cookie(string $token, int $maxAge = 604800): void
{
    header('Set-Cookie: ' . auth_cookie_header($token, $maxAge), false);
}

function auth_clear_refresh_cookie(): void
{
    header('Set-Cookie: ' . auth_clear_cookie_header(), false);
}

function auth_id(string $prefix): string
{
    return $prefix . '-' . bin2hex(random_bytes(12));
}

function auth_slug(string $name): string
{
    $slug = strtolower(trim((string) preg_replace('/[^a-z0-9]+/i', '-', $name), '-'));
    return ($slug !== '' ? $slug : 'organisation') . '-' . bin2hex(random_bytes(3));
}

function auth_audit(PDO $pdo, string $organizationId, ?string $actorId, string $entityType, string $entityId, string $action, array $after = []): void
{
    $pdo->prepare('INSERT INTO audit_log (organization_id, actor_user_id, entity_type, entity_id, action_key, after_json) VALUES (?, ?, ?, ?, ?, ?)')
        ->execute([$organizationId, $actorId, $entityType, $entityId, $action, json_encode($after, JSON_UNESCAPED_SLASHES)]);
}

function auth_send_link(array $config, string $email, string $subject, string $path, string $token): bool
{
    if (function_exists('architex_demo_data_allowed') && architex_demo_data_allowed($config)) return true;
    $baseUrl = rtrim((string) ($config['frontend_url'] ?? ''), '/');
    $from = trim((string) ($config['mail_from'] ?? ''));
    if ($baseUrl === '' || $from === '') return false;
    $url = $baseUrl . $path . '?token=' . rawurlencode($token);
    return mail($email, $subject, "Open this secure Architex link:\n\n{$url}\n", "From: {$from}\r\nContent-Type: text/plain; charset=UTF-8");
}
