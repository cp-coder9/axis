<?php
return [
    'app_name' => 'Architex OS API',
    'environment' => getenv('APP_ENV') ?: 'local',
    'data_mode' => getenv('ARCHITEX_DATA_MODE') ?: '',
    'database' => [
        'host' => getenv('DB_HOST') ?: 'localhost',
        'name' => getenv('DB_NAME') ?: 'architex_os',
        'user' => getenv('DB_USER') ?: 'architex_user',
        'pass' => getenv('DB_PASS') ?: '',
        'charset' => 'utf8mb4',
    ],
    'jwt_secret' => getenv('JWT_SECRET') ?: 'change-this-before-production',
    'cors_origin' => getenv('CORS_ORIGIN') ?: '*',
    'frontend_url' => getenv('FRONTEND_URL') ?: '',
    'mail_from' => getenv('AUTH_MAIL_FROM') ?: '',
];
