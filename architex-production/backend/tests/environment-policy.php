<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/lib/environment_policy.php';

function policy_assert(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

policy_assert(architex_data_mode(['environment' => 'local', 'data_mode' => '']) === 'local', 'local defaults to local data mode');
policy_assert(architex_data_mode(['environment' => 'production', 'data_mode' => 'prototype']) === 'prototype', 'prototype mode is explicit');
policy_assert(architex_demo_data_allowed(['environment' => 'production', 'data_mode' => 'prototype']), 'prototype permits demo data');
policy_assert(!architex_demo_data_allowed(['environment' => 'production', 'data_mode' => 'production']), 'production rejects demo data');

$failedClosed = false;
try {
    architex_data_mode(['environment' => 'production', 'data_mode' => '']);
} catch (RuntimeException) {
    $failedClosed = true;
}
policy_assert($failedClosed, 'non-local environment requires explicit data mode');

$rejectedLocalMode = false;
try {
    architex_data_mode(['environment' => 'production', 'data_mode' => 'local']);
} catch (RuntimeException) {
    $rejectedLocalMode = true;
}
policy_assert($rejectedLocalMode, 'local data mode is forbidden outside local environment');

echo "environment policy passed\n";
