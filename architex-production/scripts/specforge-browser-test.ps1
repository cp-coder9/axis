[CmdletBinding()]
param(
    [switch]$Preflight,
    [string]$Grep = '',
    [string]$DbHost = $(if ($env:SPECFORGE_TEST_DB_HOST) { $env:SPECFORGE_TEST_DB_HOST } elseif ($env:DB_HOST) { $env:DB_HOST } else { 'localhost' }),
    [string]$DbUser = $(if ($env:SPECFORGE_TEST_DB_USER) { $env:SPECFORGE_TEST_DB_USER } else { 'root' }),
    [string]$DbPass = $(if ($null -ne $env:SPECFORGE_TEST_DB_PASS) { $env:SPECFORGE_TEST_DB_PASS } else { '' })
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$harness = Join-Path $PSScriptRoot 'test-api.ps1'
$schema = 'architex_specforge_{0}_{1}_test' -f $PID, ([Guid]::NewGuid().ToString('N').Substring(0, 12))
$leaseDirectory = Join-Path $root '.tmp-api-current'
$lease = Join-Path $leaseDirectory ("specforge-browser-lease-{0}.json" -f $PID)
$uiPort = 32000 + ($PID % 1000)
$apiPort = 33000 + ($PID % 1000)

if ($Preflight) {
    & $harness -Preflight -DbHost $DbHost -DbUser $DbUser -DbPass $DbPass
    if ($LASTEXITCODE -ne 0) { throw 'SpecForge browser database preflight failed.' }
    & npx playwright --version
    if ($LASTEXITCODE -ne 0) { throw 'Playwright is required.' }
    Write-Output "SpecForge browser preflight passed: ui=$uiPort api=$apiPort (no database mutation performed)"
    exit 0
}

New-Item -ItemType Directory -Force -Path $leaseDirectory | Out-Null
$prepared = $false
$testExitCode = 1
try {
    & $harness -PrepareRetained -SchemaName $schema -LeaseFile $lease -DbHost $DbHost -DbUser $DbUser -DbPass $DbPass
    if ($LASTEXITCODE -ne 0) { throw 'SpecForge browser schema preparation failed.' }
    $prepared = $true

    $env:E2E_SPECFORGE_ISOLATED = 'true'
    $env:E2E_UI_PORT = [string]$uiPort
    $env:E2E_API_PORT = [string]$apiPort
    $env:APP_ENV = 'test'
    $env:ARCHITEX_DATA_MODE = 'prototype'
    $env:ARCHITEX_ENABLE_DEMO_SEED = '1'
    $env:DB_HOST = $DbHost
    $env:DB_NAME = $schema
    $env:DB_USER = $DbUser
    $env:DB_PASS = $DbPass
    $env:JWT_SECRET = 'specforge-isolated-browser-test-secret'
    $env:CORS_ORIGIN = "http://127.0.0.1:$uiPort"
    $env:NEXT_PUBLIC_API_BASE_URL = "http://127.0.0.1:$apiPort/api/v1"
    $env:NEXT_PUBLIC_GOD_MODE_ENABLED = 'true'

    if ($Grep) {
        & npx playwright test e2e/v8-specforge-contract.spec.ts --project=chromium --workers=1 --grep $Grep
    } else {
        & npx playwright test e2e/v8-specforge-contract.spec.ts --project=chromium --workers=1
    }
    $testExitCode = $LASTEXITCODE
} finally {
    if ($prepared -and (Test-Path -LiteralPath $lease)) {
        & $harness -DropRetained -LeaseFile $lease -DbHost $DbHost -DbUser $DbUser -DbPass $DbPass
        if ($LASTEXITCODE -ne 0) { throw 'SpecForge browser schema cleanup failed.' }
    }
}

if ($testExitCode -ne 0) { exit $testExitCode }
Write-Output "SpecForge isolated browser contract passed and dropped: schema=$schema"
