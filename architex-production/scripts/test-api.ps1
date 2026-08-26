[CmdletBinding()]
param(
    [ValidateSet('all', 'repository', 'security', 'lifecycle', 'endpoints', 'persistence', 'recovery')]
    [string]$Group = 'all',
    [switch]$Preflight,
    [switch]$PrepareRetained,
    [switch]$DropRetained,
    [string]$SchemaName,
    [string]$LeaseFile,
    [string]$DbHost = $(if ($env:DB_HOST) { $env:DB_HOST } else { 'localhost' }),
    [string]$DbUser = $(if ($env:DB_USER) { $env:DB_USER } else { 'architex_user' }),
    [string]$DbPass = $(if ($null -ne $env:DB_PASS) { $env:DB_PASS } else { '' })
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

function Fail([string]$Message) { throw "V8-P3 test harness: $Message" }
function Require-TestSchema([string]$Name) {
    if ([string]::IsNullOrWhiteSpace($Name) -or $Name -notmatch '^[A-Za-z0-9_]+_test$') {
        Fail 'database schema must be a unique alphanumeric/underscore name ending in _test'
    }
}
function Assert-SafeHost([string]$DatabaseHost) {
    $loopback = @('localhost', '127.0.0.1', '::1')
    if ($loopback -contains $DatabaseHost) { return }
    $allowlist = @($env:ARCHITEX_TEST_DB_HOST_ALLOWLIST -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ })
    if ($allowlist -notcontains $DatabaseHost) {
        Fail "DB host '$DatabaseHost' is not loopback and is not in ARCHITEX_TEST_DB_HOST_ALLOWLIST"
    }
}
function Require-PhpPdoMysql {
    $php = Get-Command php -ErrorAction SilentlyContinue
    if ($null -eq $php) { Fail 'php executable is required' }
    $modules = & $php.Source -m
    if ($LASTEXITCODE -ne 0 -or $modules -notcontains 'pdo_mysql') { Fail 'PHP pdo_mysql extension is required' }
    return $php.Source
}
function New-TestSchemaName {
    return ('architex_v8_api_{0}_{1}_test' -f $PID, ([Guid]::NewGuid().ToString('N').Substring(0, 12)))
}
function Invoke-PdoAdmin([string]$Php, [string]$Sql) {
    $env:ARCHITEX_HARNESS_SQL = $Sql
    $env:ARCHITEX_HARNESS_HOST = $DbHost
    $env:ARCHITEX_HARNESS_USER = $DbUser
    $env:ARCHITEX_HARNESS_PASS = $DbPass
    & $Php -r 'try { $pdo = new PDO("mysql:host=" . getenv("ARCHITEX_HARNESS_HOST") . ";charset=utf8mb4", getenv("ARCHITEX_HARNESS_USER"), getenv("ARCHITEX_HARNESS_PASS"), [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]); $pdo->exec(getenv("ARCHITEX_HARNESS_SQL")); } catch (Throwable $error) { fwrite(STDERR, $error->getMessage()); exit(1); }'
    if ($LASTEXITCODE -ne 0) { Fail 'database administrative operation failed' }
}
function Write-Lease([string]$Path, [string]$Schema) {
    $directory = Split-Path -Parent $Path
    if ($directory) { New-Item -ItemType Directory -Force -Path $directory | Out-Null }
    if (Test-Path -LiteralPath $Path) { Fail 'lease file already exists' }
    $lease = [ordered]@{ schema = $Schema; host = $DbHost; token = [Guid]::NewGuid().ToString('N'); createdAt = [DateTime]::UtcNow.ToString('o') }
    [System.IO.File]::WriteAllText((Resolve-Path -LiteralPath $directory).Path + [IO.Path]::DirectorySeparatorChar + (Split-Path -Leaf $Path), ($lease | ConvertTo-Json -Compress), [Text.UTF8Encoding]::new($false))
    return $lease
}

if (($PrepareRetained.IsPresent -and $DropRetained.IsPresent) -or (($PrepareRetained.IsPresent -or $DropRetained.IsPresent) -and $Preflight.IsPresent)) {
    Fail 'Preflight, PrepareRetained, and DropRetained modes are mutually exclusive'
}
Assert-SafeHost $DbHost

if ($Preflight) {
    $php = Require-PhpPdoMysql
    Write-Output "V8-P3 preflight passed: php=$php host=$DbHost (no database mutation performed)"
    exit 0
}

if ($PrepareRetained) {
    if ([string]::IsNullOrWhiteSpace($LeaseFile)) { Fail 'LeaseFile is required for PrepareRetained' }
    Require-TestSchema $SchemaName
    $php = Require-PhpPdoMysql
    Invoke-PdoAdmin $php ("CREATE DATABASE ``$SchemaName`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    try {
        $env:APP_ENV = 'test'; $env:ARCHITEX_DATA_MODE = 'prototype'; $env:DB_HOST = $DbHost; $env:DB_NAME = $SchemaName; $env:DB_USER = $DbUser; $env:DB_PASS = $DbPass; $env:JWT_SECRET = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes(([Guid]::NewGuid().ToString('N') + [Guid]::NewGuid().ToString('N'))))
        & $php (Join-Path $root 'backend/database/migrate.php'); if ($LASTEXITCODE -ne 0) { Fail 'migration failed for retained schema' }
        & $php (Join-Path $root 'backend/database/seed.php'); if ($LASTEXITCODE -ne 0) { Fail 'seed failed for retained schema' }
        $lease = Write-Lease $LeaseFile $SchemaName
        Write-Output "V8-P3 retained schema prepared: schema=$($lease.schema) lease=$LeaseFile"
    } catch {
        Invoke-PdoAdmin $php ("DROP DATABASE IF EXISTS ``$SchemaName``")
        throw
    }
    exit 0
}

if ($DropRetained) {
    if ([string]::IsNullOrWhiteSpace($LeaseFile) -or -not (Test-Path -LiteralPath $LeaseFile)) { Fail 'a valid existing LeaseFile is required for DropRetained' }
    $lease = Get-Content -LiteralPath $LeaseFile -Raw | ConvertFrom-Json
    if ($lease.host -ne $DbHost -or [string]::IsNullOrWhiteSpace($lease.token)) { Fail 'lease host/token mismatch' }
    Require-TestSchema $lease.schema
    $php = Require-PhpPdoMysql
    Invoke-PdoAdmin $php ("DROP DATABASE IF EXISTS ``$($lease.schema)``")
    Remove-Item -LiteralPath $LeaseFile -Force
    Write-Output "V8-P3 retained schema dropped: schema=$($lease.schema)"
    exit 0
}

Fail "group '$Group' requires a provisioned isolated MariaDB harness; use -Preflight to verify local prerequisites"
