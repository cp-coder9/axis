$ErrorActionPreference = 'Stop'

$scriptPath = Join-Path $PSScriptRoot '..\purge-litespeed-cache.ps1'
$scriptSource = Get-Content -Raw $scriptPath
if ($scriptSource -notmatch 'HttpRequestMessage') {
  throw 'Expected the default executor to support LiteSpeed custom PURGE requests.'
}
if ($scriptSource -notmatch 'Add-Type -AssemblyName System.Net.Http') {
  throw 'Expected the default executor to load the HttpClient assembly on Windows PowerShell.'
}
. $scriptPath -NoExecute

$capturedRequests = [System.Collections.Generic.List[string]]::new()
$successExecutor = {
  param([uri] $Uri, [string] $Method)
  $capturedRequests.Add("$Method $($Uri.AbsoluteUri)")
  [pscustomobject]@{ StatusCode = 200; StatusDescription = 'Purged' }
}

Invoke-LiteSpeedPurge -Url @('https://test.architex.co.za/', 'https://test.architex.co.za/build-info.json') -RequestExecutor $successExecutor

if ($capturedRequests.Count -ne 2 -or $capturedRequests[0] -ne 'PURGE https://test.architex.co.za/') {
  throw 'Expected one PURGE request for each approved test URL.'
}

$capturedRequests.Clear()
Invoke-LiteSpeedPurge -Url @('https://test.architex.co.za/,https://test.architex.co.za/build-info.json') -RequestExecutor $successExecutor

if ($capturedRequests.Count -ne 2 -or $capturedRequests[1] -ne 'PURGE https://test.architex.co.za/build-info.json') {
  throw 'Expected comma-delimited URLs to be purged separately.'
}

try {
  Invoke-LiteSpeedPurge -Url @('http://test.architex.co.za/') -RequestExecutor $successExecutor
  throw 'Expected HTTP URL to be rejected.'
} catch {
  if ($_.Exception.Message -notmatch 'HTTPS') { throw }
}

try {
  Invoke-LiteSpeedPurge -Url @('https://example.com/') -RequestExecutor $successExecutor
  throw 'Expected non-test host to be rejected.'
} catch {
  if ($_.Exception.Message -notmatch 'not permitted') { throw }
}

try {
  Invoke-LiteSpeedPurge -Url @('https://test.architex.co.za/') -RequestExecutor {
    param([uri] $Uri, [string] $Method)
    [pscustomobject]@{ StatusCode = 403; StatusDescription = 'Forbidden' }
  }
  throw 'Expected unsuccessful purge to fail.'
} catch {
  if ($_.Exception.Message -notmatch '403') { throw }
}

Write-Host 'PASS purge-litespeed-cache tests'
