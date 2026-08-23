# E2E Test Suite (Playwright)

End-to-end tests for the Architex OS frontend, covering the app shell, all 46
modules, and the governed workflows (Meetings consent flow, Approvals RBAC).

## Layout

| File | Purpose |
| --- | --- |
| `playwright.config.ts` | Config: `e2e/` test dir, 4 parallel workers, Chromium, traces/screenshots on failure |
| `e2e/app.spec.ts` | Full suite (51 tests) |

## Test coverage

1. **App shell** (2 tests) — page loads, role switcher visible and functional.
2. **All 46 modules open** (46 tests) — each module is opened from the
   standalone tool registry and must render its "Inside <tool>" tab view with
   no runtime errors. Standalone mode is used because project mode filters the
   tool list by role (`ROLE_TOOL_MAP`).
3. **Meetings governed workflow** (2 tests) — Meet Now opens the consent/pre-join
   screen; Schedule opens the 5-step wizard (Context → Policy).
4. **Approvals RBAC** (1 test) — a non-owning role (`client`) sees all pending
   gate buttons disabled.

## Running

```bash
# 1. Build and start the production server (recommended — fast, stable)
npm run build
npx next start -H 127.0.0.1 -p 3001

# 2. Run the suite against it
E2E_BASE_URL=http://127.0.0.1:3001 npm run test:e2e
```

Or against the dev server (slower, per-page compile):

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
npm run test:e2e   # defaults to http://127.0.0.1:3000
```

### Browser cache (this machine)

Chromium is installed under `E:\Hermes\cache\playwright` (not the default
`%LOCALAPPDATA%` location). The env var is already set in this environment:

```bash
export PLAYWRIGHT_BROWSERS_PATH='E:\Hermes\cache\playwright'
npx playwright install chromium   # reinstall if the cache is wiped
```

## Test IDs

Tests target stable `data-testid` attributes — keep these when refactoring:

| Test ID | Element |
| --- | --- |
| `role-switcher` | TopBar role `<select>` |
| `mode-project` / `mode-standalone` | ContextNavigator orientation switcher |
| `tool-<id>` | Navigator button for each of the 46 tools |
| `meetings-meet-now` / `meetings-schedule` | Meetings hub actions |
| `approval-approve-<id>` / `approval-reject-<id>` | Approvals gate decisions |

## Failure artifacts

On failure Playwright writes `test-results/<test>/` with `error-context.md`,
a screenshot, and a trace zip (`trace.zip`, viewable via
`npx playwright show-trace`).
