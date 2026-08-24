# Validation Evidence Index

## Current status

**Release decision: NO-GO.** This index is a guide to the generated evidence manifest; it is not itself acceptance evidence. The current manifest is intentionally marked `unverified` until all phase exits, rehearsal evidence, and independent signatures have been recorded.

## Generate and verify

```powershell
npm run evidence:collect
npm run evidence:verify
```

`evidence:collect` writes `artifacts/release-evidence/manifest.json`, which is an untracked release artifact. It records the source revision, environment, and SHA-256 fingerprints of the package metadata, Phase 8 plan, standalone server, and assembled static assets. `evidence:verify` recomputes those fingerprints and fails closed on a missing or changed artifact.

The generated manifest proves artifact integrity only. It does not prove calculator approval, persistence, authorization, accessibility, visual acceptance, performance, rollback, or release authorization.

## Mandatory evidence still required

| Gate | Required evidence | Current status |
|---|---|---|
| Phase exits 0-7 | Accepted, observed phase evidence records | Missing/incomplete |
| Calculator outcomes | 17 validated or contained outcomes with required parity | Local containment checks only |
| MariaDB and RBAC | Isolated persistence, recovery, tenancy, lifecycle, and audit results | Not evidenced |
| Product validation | Functional, accessibility, visual, and performance release results | Partial local coverage only |
| Release rehearsal | Two-operator isolated deployment, rollback, and restore evidence | Not performed |
| Approval | Professional, security, accessibility, QA, operations, and release signatures | Not recorded |

See [GO_NO_GO.md](GO_NO_GO.md) for the authoritative decision checklist and [RELEASE_RUNBOOK.md](RELEASE_RUNBOOK.md) for the controlled rehearsal procedure.
