[CmdletBinding()]
param(
  [string[]] $Url,
  [switch] $NoExecute
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Net.Http

function Assert-AllowedPurgeUrl {
  param([string] $Value)

  $uri = [uri]::new($Value, [System.UriKind]::Absolute)
  if ($uri.Scheme -ne 'https') {
    throw "LiteSpeed purge URL must use HTTPS: $Value"
  }

  if ($uri.Host -ne 'test.architex.co.za') {
    throw "LiteSpeed purge host is not permitted: $($uri.Host)"
  }

  return $uri
}

function Invoke-LiteSpeedPurge {
  param(
    [Parameter(Mandatory)]
    [string[]] $Url,
    [scriptblock] $RequestExecutor = {
      param([uri] $Uri, [string] $Method)
      $client = [System.Net.Http.HttpClient]::new()
      $request = [System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]::new($Method), $Uri)
      try {
        $response = $client.SendAsync($request).GetAwaiter().GetResult()
        try {
          [pscustomobject]@{
            StatusCode = [int] $response.StatusCode
            StatusDescription = $response.ReasonPhrase
          }
        } finally {
          $response.Dispose()
        }
      } finally {
        $request.Dispose()
        $client.Dispose()
      }
    }
  )

  foreach ($value in $Url) {
    foreach ($singleUrl in $value.Split(',', [System.StringSplitOptions]::RemoveEmptyEntries)) {
      $uri = Assert-AllowedPurgeUrl -Value $singleUrl.Trim()
      $response = & $RequestExecutor $uri 'PURGE'
      $statusCode = [int] $response.StatusCode

      Write-Host "LiteSpeed PURGE $($uri.AbsoluteUri) -> $statusCode $($response.StatusDescription)"
      if ($statusCode -lt 200 -or $statusCode -ge 300) {
        throw "LiteSpeed purge failed for $($uri.AbsoluteUri): HTTP $statusCode $($response.StatusDescription)"
      }
    }
  }
}

if (-not $NoExecute) {
  if (-not $Url -or $Url.Count -eq 0) {
    throw 'Provide one or more -Url values to purge.'
  }

  Invoke-LiteSpeedPurge -Url $Url
}
