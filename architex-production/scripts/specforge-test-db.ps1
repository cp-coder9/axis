[CmdletBinding()]
param(
    [switch]$Preflight,
    [string]$DbHost = $(if ($env:SPECFORGE_TEST_DB_HOST) { $env:SPECFORGE_TEST_DB_HOST } elseif ($env:DB_HOST) { $env:DB_HOST } else { 'localhost' }),
    [string]$DbUser = $(if ($env:SPECFORGE_TEST_DB_USER) { $env:SPECFORGE_TEST_DB_USER } else { 'root' }),
    [string]$DbPass = $(if ($null -ne $env:SPECFORGE_TEST_DB_PASS) { $env:SPECFORGE_TEST_DB_PASS } else { '' })
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$harness = Join-Path $PSScriptRoot 'test-api.ps1'
$schema = 'architex_specforge_{0}_{1}_test' -f $PID, ([Guid]::NewGuid().ToString('N').Substring(0, 12))
$leaseDirectory = Join-Path $root '.tmp-api-current'
$lease = Join-Path $leaseDirectory ("specforge-lease-{0}.json" -f $PID)

if ($schema -notmatch '^architex_specforge_[0-9]+_[a-f0-9]{12}_test$') {
    throw "SpecForge test harness generated an unsafe schema name: $schema"
}

if ($Preflight) {
    & $harness -Preflight -DbHost $DbHost -DbUser $DbUser -DbPass $DbPass
    if ($LASTEXITCODE -ne 0) { throw 'SpecForge database preflight failed.' }
    Write-Output "SpecForge preflight passed: schema-pattern=$schema (no database mutation performed)"
    exit 0
}

New-Item -ItemType Directory -Force -Path $leaseDirectory | Out-Null
$prepared = $false
$testExitCode = 1
try {
    & $harness -PrepareRetained -SchemaName $schema -LeaseFile $lease -DbHost $DbHost -DbUser $DbUser -DbPass $DbPass
    if ($LASTEXITCODE -ne 0) { throw 'SpecForge disposable schema preparation failed.' }
    $prepared = $true

    $env:SPECFORGE_TEST_DB = $schema
    $env:SPECFORGE_TEST_DB_HOST = $DbHost
    $env:SPECFORGE_TEST_DB_USER = $DbUser
    $env:SPECFORGE_TEST_DB_PASS = $DbPass
    & node (Join-Path $root 'backend/tests/specforge-api.mjs')
    $testExitCode = $LASTEXITCODE
} finally {
    if ($prepared -and (Test-Path -LiteralPath $lease)) {
        & $harness -DropRetained -LeaseFile $lease -DbHost $DbHost -DbUser $DbUser -DbPass $DbPass
        if ($LASTEXITCODE -ne 0) { throw 'SpecForge disposable schema cleanup failed.' }
    }
    Remove-Item Env:SPECFORGE_TEST_DB -ErrorAction SilentlyContinue
}

if ($testExitCode -ne 0) { exit $testExitCode }
Write-Output "SpecForge disposable API contract passed and dropped: schema=$schema"
