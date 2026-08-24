# LiteSpeed Purge Helper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Purge the two public test-site URLs after a successful static FTPS upload.

**Architecture:** A standalone PowerShell helper owns URL validation and PURGE execution. Its tests invoke the script against a local server. The GitHub Actions workflow calls the helper only after `lftp` succeeds.

**Tech Stack:** PowerShell, GitHub Actions, LiteSpeed HTTP PURGE.

## Global Constraints

- Accept HTTPS URLs only for `test.architex.co.za`.
- Never embed hosting credentials or perform cache-directory deletion.
- Treat any non-2xx response as deployment failure.

---

### Task 1: Test and implement the purge helper

**Files:**
- Create: `architex-production/scripts/purge-litespeed-cache.ps1`
- Create: `architex-production/scripts/tests/purge-litespeed-cache.Tests.ps1`

**Interfaces:**
- Consumes: `[string[]] $Url`
- Produces: one PURGE request per URL; non-zero exit on validation or response failure.

- [ ] Write tests that prove the method is PURGE, invalid URLs make no request, and unsuccessful responses fail.
- [ ] Run tests and observe the expected missing-script failure.
- [ ] Implement the minimal helper.
- [ ] Re-run tests and verify success.

### Task 2: Invoke the helper from test deployment

**Files:**
- Modify: `.github/workflows/deploy-test.yml`

**Interfaces:**
- Consumes: the Task 1 helper and the two fixed public test URLs.
- Produces: an explicit post-upload cache purge gate.

- [ ] Add an opt-in PowerShell workflow step after `lftp` that calls the helper for `/` and `/build-info.json` only when `TEST_ARCHITEX_LITESPEED_PURGE_ENABLED` is `true`.
- [ ] Validate the workflow diff and helper tests.
