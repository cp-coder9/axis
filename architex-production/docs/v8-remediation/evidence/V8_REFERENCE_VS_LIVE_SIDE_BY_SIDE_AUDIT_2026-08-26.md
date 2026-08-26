# V8 reference versus existing live build — side-by-side audit

**Audit date:** 2026-08-26
**Reference:** `E:\Downloads\architex_datum_os_integrated_modules_v8_engineering_godmode.html`
**Existing deployment:** `https://test.architex.co.za`
**Verdict:** The live entry, real authentication and Project Datum slice are now working and browser-certified. Project Datum has measured local V8 parity evidence, but the wider 47-tool product is still not an exact page-for-page reproduction of the supplied reference.

## 2026-08-26 live remediation certification

This section supersedes the earlier live-entry failure below; that failure is retained as historical evidence.

| Gate | Current result | Evidence |
|---|---|---|
| Atomic test deployment | **Pass** | 45 files / 3,175,137 bytes promoted; prior site retained at `test.architex.co.za.pre-v8-datum-20260826-171946`. |
| Exact deployed artifact | **Pass** | Local and live `index.html` SHA-256 both `6d5226cf0372b124d2eb0a4ca01fc66e464ed1c9f7a081ade81634dfceabcadc`. |
| Landing and real login | **Pass** | Fresh Chromium session reached the supplied landing, signed in through the live API, and received 200 from login and `/me`. |
| MariaDB persistence path | **Pass** | `/api/v1/db-health` returned 200, `connected: true`, MariaDB 11.4.13 and 13 applied migrations. |
| Project Datum | **Pass for this slice** | Eight-stage Datum, spatial world and project context rendered in the authenticated live shell. |
| Theme and session persistence | **Pass** | Theme state and authenticated session survived a browser reload; refresh, `/me`, and `/projects` returned 200. |
| God Mode | **Pass conceptually** | Explorer opened in the live authenticated session while retaining the selected Architect role lens. |
| Logout/revocation path | **Pass** | Live logout returned 200 and restored the public landing. |
| Browser/network gate | **Pass** | No failed requests and no HTTP 5xx. The single clean-context refresh 401 is the expected unauthenticated restore probe before login. |
| LiteSpeed purge | **Not available through HTTP PURGE** | Server returned 405; certification used a no-cache, cache-busted URL and exact live hash comparison. |

Current evidence: [Project Datum](../../../release/evidence/v8-project-datum/live/project-datum.png), [God Mode](../../../release/evidence/v8-project-datum/live/god-mode.png), and [machine-readable certification](../../../release/evidence/v8-project-datum/live-certification.json).

## Direct visual comparison

| Supplied V8 reference | Existing live entry |
|---|---|
| [Reference command-centre screenshot](../../../release/evidence/v8-side-by-side/01-command-centre-reference.png) | [Fresh live mount diagnostic](../../../release/evidence/v8-side-by-side/live-mount-diagnostic.png) |
| The reference opens a usable four-region V8 workspace: OS rail, context navigator, central canvas and context inspector. | A fresh live session loads the public page but throws a fatal runtime exception before Sign in becomes reachable through the browser accessibility/interaction tree. |

Historical authenticated evidence from the preceding release certification is available for context, but it does not prove the current release:

| Historical live Datum workspace | Historical live God Mode |
|---|---|
| [Authenticated dashboard](../../../release/evidence/live-auth/authenticated-dashboard.png) | [God Mode explorer](../../../release/evidence/live-auth/restored-god-mode.png) |

## Historical live failure before this remediation

Two fresh Chromium sessions reproduced the same failure. The public page did not expose Sign in within 30 seconds. Browser evidence showed:

```text
TypeError: Cannot read properties of null (reading 'getRootNode')
```

The deployed bundle injects the Preview 3 runtime using `document.currentScript.getRootNode()`. In this execution path `document.currentScript` is `null`, React unmounts the landing component, and the normal login journey cannot continue.

The defect described here has since been fixed, committed, built, deployed and browser-certified as recorded in the certification section above.

## Page-for-page functional matrix

| Surface | V8 reference | Existing authenticated build | Assessment |
|---|---|---|---|
| OS Command Centre | Dedicated global landing with four clear destination cards | Command Centre exists, but fresh access is blocked and restored state can open another workspace | **Partial** |
| Project Space / Datum | Project-first canvas, eight-stage lifecycle and context inspector | Present with project, stage and inspector concepts | **Closest match, still not certified exact** |
| Workspace Tools | 45 tools advertised | 47 tools advertised | **Different catalogue** |
| Practice & Project Management | Reference naming and scaffold hierarchy | “Practice Management — Command Centre” with expanded operational implementation | **Functional expansion, visual/content drift** |
| Wingman AI Workspace | Supplied V8 workspace entry | Present with project-memory implementation | **Present, not page-parity certified** |
| Town Planning Tracker | Supplied V8 tool entry | Present | **Present, not page-parity certified** |
| Municipal Approval Readiness | Supplied V8 tool entry | Present | **Present, not page-parity certified** |
| SANS 10400-XA Energy | Supplied V8 tool entry | Renamed “SANS 10400-XA Energy Compliance” | **Naming and implementation drift** |
| Integrated Form System | Supplied V8 tool entry | Present | **Present, not page-parity certified** |
| SpecForge | Reference tool | Presented as “SpecForge V2” | **Version/content drift** |
| Documents & Drawings | Marked Scaffold in the reference | Presented as project-connected/live | **Status semantics differ** |
| BoM / BoQ & Tender Builder | Supplied V8 tool entry | Present with priced-line status | **Expanded, not page-parity certified** |
| Project Passport | Marked Scaffold in the reference | Presented as an available project tool | **Status semantics differ** |
| Architex Meetings | Supplied V8 entry | Present, with badge/count and live-coordination copy | **Expanded, not page-parity certified** |
| Action Centre | Reference badge count 7 | “Inbox / Action Centre” | **Naming/content drift** |
| God Mode | Explorer over reference catalogue, stages and roles | Explorer reports 47 tools, 8 stages and 21 role lenses | **Concept present; catalogue differs** |
| Engineering Hub | Explicit God Mode destination | Implemented in source navigation, not proven in current live inventory | **Uncertified** |
| ITP | Not a primary reference entry in the captured default inventory | Added as a live workspace tool | **Extra live surface** |
| Health & Safety | Not a primary reference entry in the captured default inventory | Added as a live workspace tool | **Extra live surface** |
| Approvals Queue | Not a primary reference entry in the captured default inventory | Added as a live workspace tool | **Extra live surface** |

## Structural comparison

| Criterion | Result | Evidence-based assessment |
|---|---|---|
| Four-region shell | Partial pass | Both use OS rail, navigator, canvas and inspector. |
| Exact geometry | Not proven | No current live bounding-rectangle suite passed page by page. |
| Exact typography | Fail / unproven | Historical screenshots show different density, sizing and wrapping in several regions. |
| Exact iconography | Fail / unproven | Icon/badge treatments and navigation labels differ across the inventories. |
| Exact page hierarchy | Partial | Core destinations exist, but names, counts, status semantics and added pages differ. |
| God Mode concept | Pass conceptually | Full-system explorer, stages and role lens are present. |
| God Mode reference fidelity | Partial | Tool count is 47 live versus 45 in the supplied reference inventory. |
| Real authentication/API | Pass for the certified prototype path | Fresh login, `/me`, `/projects`, refresh and logout succeeded without route mocking. |
| Current browser certification | Pass for landing, shell and Project Datum | Live Chromium proof covers login, reload, theme, God Mode and logout; remaining pages are not thereby certified. |

## Honest quality assessment

I did **not** do a sufficiently good job against the requirement “look and feel exactly like the V8 HTML.” The implementation captured the broad product model and some shell structure, and it added valuable real authentication, persistence and richer tool behaviour. Those are meaningful engineering gains, but they do not satisfy exact visual and page-for-page fidelity.

The Project Datum remediation is now defensibly certified, but whole-product completion still requires:

1. define the canonical 45-versus-47 tool catalogue decision;
2. capture every remaining reference surface and its live counterpart at identical viewports;
3. compare shell rectangles, computed typography, colors, icon dimensions and interaction states;
4. correct each mismatch before marking that page complete.

## Audit limitations

- The current live entry defect prevented normal authenticated navigation.
- Authenticated DOM inventory was obtained through the real login API solely to inspect the protected interface; this is not counted as a passing user journey.
- The broad 16-page screenshot harness became unstable after the live failure and was stopped. Missing screenshots are reported as missing, not treated as passes.
- No production or source changes were made by this audit.
