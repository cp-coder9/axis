# Release and Rollback Runbook

## Status and authority

This runbook is for an isolated release-candidate rehearsal and a separately authorized production release. It does not authorize deployment, database mutation, DNS/TLS changes, or secret rotation. The current decision is **NO-GO**; see [GO_NO_GO.md](GO_NO_GO.md).

Never use a production or shared schema for rehearsal. The DBA/release engineer must provision a unique schema ending in `_test`, verify the exact target, and retain a backup/restore record before an application process starts.

| Step | Owner | Command or procedure | Expected result | Stop condition | Evidence | Rollback |
|---|---|---|---|---|---|---|
| 1. Preflight | Release engineer | `npm ci`; `npm run lint`; `npm run typecheck`; `npm run build` | Clean lockfile install and zero errors | Any non-zero command | Command logs and revision | Do not deploy |
| 2. Assemble | Release engineer | `npm run release:assemble`; `npm run release:standalone:verify` | Static/public assets copied, HTTP 200, no remaining server process | Missing asset, failed readiness, or surviving process | Assembly and verifier output | Discard candidate artifact |
| 3. Evidence baseline | QA/evidence custodian | `npm run evidence:collect`; `npm run evidence:verify` | All artifact hashes verify | Missing or changed artifact | Generated manifest and hashes | Rebuild and recollect |
| 4. Database rehearsal | DBA | Verify isolated schema, backup checksum, migrate, seed, restore into a separate validation schema | Exact schema names, migration set, and restored row/audit parity | Shared/prod target, failed backup, migration, or restore | DBA transcript, hashes, parity result | Drop only exact rehearsal schemas; restore prior candidate database |
| 5. Managed-stack validation | QA and release engineer | Run the managed isolated API/standalone server verification once Phase 3 harness is available | Functional, RBAC, accessibility, visual, and performance gates pass without retries | Any failed/skip/retry or unmanaged process | Test reports, screenshots, raw metrics | Stop candidate; terminate exact managed PIDs |
| 6. Deployment rehearsal | Two independent operators | Deploy candidate to isolated release environment, perform smoke and observability checks | Both operators reproduce documented outcome | Ambiguous command, missing owner, or failed observation | Operator records | Roll back application artifact |
| 7. Rollback rehearsal | DBA and release engineer | Restore previous application artifact; validate restore schema and controlled forward-fix policy | Previous artifact and restored data validate | Restore mismatch or data loss risk | Rollback/restore logs | Escalate incident; no production action |
| 8. Go/no-go | Release board | Verify evidence hashes and sign domain rows | All mandatory rows signed GO | Any absent/failed row | Signed decision record | Record NO-GO and owner |

## Production-only controls

Before any production action, the release board must authorize a change window, communications, monitoring ownership, rollback authority, and the exact artifact/database versions. Application rollback may return to the previous artifact. Database rollback must use the approved restore or forward-fix plan; do not apply destructive down migrations to production.

## Incident handoff

On a stop condition, retain logs, hashes, revision, environment details, observed impact, and exact target identifiers. Notify the release manager and the owner of the failed phase. Do not delete evidence, widen database credentials, or retry against a shared target to obtain a green result.
