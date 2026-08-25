<?php
declare(strict_types=1);

$source = file_get_contents(dirname(__DIR__) . '/public/index.php')
    . file_get_contents(dirname(__DIR__) . '/lib/authentication.php');
function session_policy_assert(bool $condition, string $message): void
{
    if (!$condition) throw new RuntimeException($message);
}

session_policy_assert(!str_contains($source, "'refresh_token' => issue_jwt"), 'login must not return a bearer refresh token');
session_policy_assert(str_contains($source, 'INSERT INTO auth_sessions'), 'login must persist a refresh session');
session_policy_assert(str_contains($source, "HTTP_COOKIE"), 'refresh must read the HttpOnly cookie');
session_policy_assert(str_contains($source, 'FOR UPDATE'), 'rotation must lock the refresh session row');
session_policy_assert(str_contains($source, 'replaced_by'), 'rotation must link the replaced session');
session_policy_assert(str_contains($source, '/auth/logout'), 'logout route is missing');

require_once dirname(__DIR__) . '/lib/authentication.php';
$cleared = auth_clear_cookie_header();
session_policy_assert(str_contains($cleared, 'Max-Age=0'), 'logout cookie must expire immediately');
session_policy_assert(str_contains($cleared, 'HttpOnly') && str_contains($cleared, 'Secure'), 'cleared cookie must retain security attributes');

echo "authentication session policy passed\n";
