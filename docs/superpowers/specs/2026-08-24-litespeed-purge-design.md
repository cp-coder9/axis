# LiteSpeed purge helper design

## Goal

Allow the test deployment workflow to invalidate only the public pages changed by a static frontend upload.

## Design

Add a PowerShell helper that accepts absolute HTTPS URLs, sends an HTTP `PURGE` request to each, and treats only a successful purge response as success. It rejects non-HTTPS and non-Architex URLs, never contains credentials, and prints the URL plus HTTP status for auditability.

The GitHub Actions upload job will call it after `lftp` completes, using `https://test.architex.co.za/` and `https://test.architex.co.za/build-info.json`, only when the repository variable `TEST_ARCHITEX_LITESPEED_PURGE_ENABLED` is `true`. A failed or refused enabled purge stops the workflow so a stale release cannot be reported as deployed.

## Constraints

- FTP/FTPS credentials are upload-only and are not used for cache control.
- The host must allow the GitHub runner source IP as a LiteSpeed trusted IP for remote PURGE requests.
- The helper must not issue a broad wildcard purge, delete host files, or disable caching globally.

## Verification

Tests must prove that allowed HTTPS URLs invoke PURGE, rejected URLs make no request, and a non-2xx response fails. The workflow must invoke the helper after upload.
