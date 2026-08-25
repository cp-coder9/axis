<?php
declare(strict_types=1);

/** Resolve and validate the process-wide data policy. */
function architex_data_mode(array $config): string
{
    $environment = strtolower(trim((string) ($config['environment'] ?? '')));
    $configured = strtolower(trim((string) ($config['data_mode'] ?? '')));

    if ($configured === '' && $environment === 'local') {
        return 'local';
    }
    if (!in_array($configured, ['local', 'prototype', 'production'], true)) {
        throw new RuntimeException('ARCHITEX_DATA_MODE must be local, prototype, or production');
    }
    if ($environment !== 'local' && $configured === 'local') {
        throw new RuntimeException('Local data mode is not permitted outside APP_ENV=local');
    }

    return $configured;
}

/** Whether fixture records and the explicit demonstration seeder are allowed. */
function architex_demo_data_allowed(array $config): bool
{
    return in_array(architex_data_mode($config), ['local', 'prototype'], true);
}

/** Guard the destructive demonstration seeder against production execution. */
function architex_require_demo_seed_allowed(array $config): void
{
    if (!architex_demo_data_allowed($config)) {
        throw new RuntimeException('Demo seed execution is disabled in production data mode');
    }
}
