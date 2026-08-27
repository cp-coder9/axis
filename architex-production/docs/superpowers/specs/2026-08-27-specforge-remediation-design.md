# SpecForge Remediation Design

**Date:** 2026-08-27

**Status:** Approved

**Target:** `E:\axis-1\architex-production`

**Parent design:** `docs/superpowers/specs/2026-08-26-specforge-v2-integration-design.md`

## Purpose

Close the identified SpecForge authentication, tenant-isolation, test-isolation, authorization-parity, issue-immutability, browser-certification, responsive-layout, denial-auditing, and Smart Add gaps without redesigning the existing workspace.

The remediation must preserve the current Datum OS V8 shell, real authentication, MariaDB persistence, record-level RBAC, and the distinction between local verification and live release certification.

## Selected approach

Apply a bounded remediation around shared policy contracts and repository helpers. This avoids both scattered one-off patches, which would preserve policy drift, and a high-risk rewrite of the SpecForge module and persistence layer.

## Authentication boundary

- Remove `SpecForgeIdentity` and all identity arguments from the browser client, workspace hook, and SpecForge components.
- Remove `demoIdentity` and `localIdentityHeaders` from the SpecForge runtime path.
- `authenticatedFetch` is the only client-side mechanism allowed to attach authentication or authorization information.
- The server continues to derive user, organization, role, project membership, and assignment scope from the authenticated session.

## Authorization parity

- Add one canonical TypeScript SpecForge capability contract for UI visibility and interaction decisions.
- Include assigned technical author roles: `engineer`, `energy_professional`, and `fire_engineer`.
- Keep server-side PHP authorization authoritative.
- Add an executable parity contract comparing the canonical TypeScript role matrix with the PHP policy matrix so drift fails verification.
- UI capability checks control presentation only and never replace server authorization.

## Tenant isolation

- Every query over a tenant-owned SpecForge table must include `organization_id`.
- Repository helpers for aggregate rows, issue readiness, snapshots, commands, findings, and record lookup must require the organization identifier rather than accepting only a workspace identifier.
- Mutations must bind both record/workspace identity and organization identity.
- Cross-organization access must return a non-disclosing denial and must not reveal record existence.

## Issued-record immutability

- An item included in an issued snapshot is immutable.
- Updating such an item creates a new draft successor in the current draft revision instead of modifying the issued row.
- The issued source row records its successor through `superseded_by`; the successor retains provenance through its source revision and audit payload.
- The issued snapshot JSON and its hash must remain unchanged after successor creation.
- Optimistic concurrency still applies to the source row and stale updates return `409`.

## Audited denials

- Organization, membership, capability, assignment, and record-state denials are written to `audit_log` when an authenticated organization and actor are available.
- Denial audit payloads contain the requested project, capability, and denial reason but never foreign record data.
- Auditing a denial must not replace or weaken the denial response.

## Isolated verification data

- SpecForge API tests must provision a unique schema ending in `_test` through the existing disposable-database harness.
- The harness must run migrations and seed fixtures, then drop the schema in a guaranteed cleanup block.
- Tests must reject non-test schemas and non-approved database hosts.
- Browser-created records use unique identifiers and an authenticated cleanup endpoint or fixture teardown. Cleanup is required even after a failed assertion.
- Shared demo, test-host, and production data must not be cleared or repurposed.

## Issue browser certification

The browser contract must prove the complete ready-issue path:

1. reach a persisted ready workspace;
2. call server-side readiness validation and inspect the returned blockers;
3. create the issue with an idempotency key;
4. reload and verify the immutable issued revision;
5. query and render real downstream job states;
6. confirm idempotent replay does not create another issue; and
7. clean up the browser fixture.

The test must fail on unexpected requests, console errors, or `5xx` responses.

## Smart Add behavior

- Manual input, supplier URL, product image, practice library, and project drawing entry points are interactive and keyboard accessible.
- Manual input continues to create a reviewable candidate before persistence.
- Project drawing requests use the existing drawing-scan API.
- A source without a configured connector returns an explicit `integration_required` review state that names the missing capability.
- An unavailable source never fabricates a product, supplier response, library match, AI result, or successful downstream action.
- Only an authorized user confirmation may persist a candidate as a specification item.
- Candidate UI shows source type and provenance or the integration-required reason.

## Responsive behavior

- SpecForge metrics, pictorial cards, sections, approvals, and recent items collapse to one column at `700px`.
- Tables remain horizontally contained within their panel.
- The workspace must not cause body-level horizontal overflow at or below the breakpoint.

## Error handling

- `401` and `403` remain authenticated-session and scoped-access states; no mock fallback is allowed.
- `409` retains the user's draft and offers reload/compare guidance.
- `422` maps validation errors to the relevant control.
- Missing source integrations return an honest `integration_required` state without persisting a record.
- Database setup or cleanup failure fails the corresponding test gate rather than falling back to a shared schema.

## Verification

Implementation follows red-green-refactor for each boundary. Required local evidence is:

- client tests proving no caller identity headers or identity parameters;
- policy-parity tests covering every SpecForge role;
- repository/API tests for organization predicates, cross-tenant denial, audited denial, successor revision creation, immutable snapshot/hash, stale-write conflict, and disposable-schema cleanup;
- component tests for technical-author Smart Add access and every Smart Add source state;
- browser tests for validate, issue, reload, downstream states, idempotent replay, cleanup, keyboard access, and 700px overflow;
- PHP syntax and policy contracts;
- targeted ESLint, TypeScript typecheck, production build, and focused SpecForge suites.

Local passing evidence does not certify remote migration, deployment, MariaDB persistence, or live release readiness.

## Out of scope

- Direct unlicensed supplier scraping.
- Fabricated supplier, library, drawing, or AI results.
- Replacing the existing V8 shell or ToolHost.
- Remote database migration or deployment without separate authorization and certification.
- Unrelated refactors outside the SpecForge seams required by this remediation.
