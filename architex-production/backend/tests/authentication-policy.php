<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/lib/authentication.php';

function auth_policy_assert(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

auth_policy_assert(auth_normalize_email('  Owner@Architex.CO.ZA ') === 'owner@architex.co.za', 'email normalization failed');
auth_policy_assert(auth_validate_password('short') !== [], 'short passwords must fail');
auth_policy_assert(auth_validate_password('longbutlowercase1!') !== [], 'uppercase is required');
auth_policy_assert(auth_validate_password('LongButNoNumber!') !== [], 'number is required');
auth_policy_assert(auth_validate_password('LongButNoSymbol1') !== [], 'symbol is required');
auth_policy_assert(auth_validate_password('Correct Horse 9!') === [], 'strong password should pass');

$token = auth_new_opaque_token();
auth_policy_assert(strlen($token) === 64, 'opaque token must contain 32 random bytes');
auth_policy_assert(strlen(auth_token_hash($token)) === 64, 'token hash must be SHA-256 hex');
auth_policy_assert(hash_equals(hash('sha256', $token), auth_token_hash($token)), 'token hashing mismatch');

$cookie = auth_cookie_header($token, 3600);
foreach (['HttpOnly', 'Secure', 'SameSite=None', 'Path=/api/v1/auth', 'Max-Age=3600'] as $attribute) {
    auth_policy_assert(str_contains($cookie, $attribute), "refresh cookie missing {$attribute}");
}

$source = file_get_contents(dirname(__DIR__) . '/public/index.php');
foreach (['/auth/register', '/auth/verify-email', '/invitations/([^/]+)/accept', '/users/invitations'] as $route) {
    auth_policy_assert(str_contains($source, $route), "API route missing {$route}");
}

echo "authentication policy passed\n";
