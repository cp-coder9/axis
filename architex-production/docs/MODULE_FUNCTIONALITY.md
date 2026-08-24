# Architex Module Functionality — Historical Graduation Notes

**Status: partial / historical.** This document predates the canonical 47-module registry and is not release evidence. Phase 8 must replace it with a generated 47-ID inventory before any completion claim is made.

## Registry-driven dispatch

`app/page.tsx` → `lib/module-registry.tsx` (`ModuleRouter`). Adding or upgrading a
module is one import + one registry entry + one status change.

## Historical module inventory (non-authoritative)

### Platform shell
- **Datum canvas** — project line-of-truth with stage/role-filtered tool cards
- **Workspace Tool Registry** — searchable 46-module catalogue with live/scaffold filters

### Flagship native modules (12)
| Module | Tabs | Key workflows |
|---|---|---|
| Meetings (reference) | my-day, upcoming, invitations, recordings, reviews, templates, settings | Consent-gated live room, chair-governed review, idempotent publish + write-backs |
| Practice Command Centre | dashboard, actions, notifications, programme, tasks, milestones, calendar, team, site_diary, rfis, risks, quality, fees, timesheets, profitability, forecast, budget | Kanban, Gantt, fee planning |
| Wingman AI | conversations, byoai, provenance, draft_rfi, status_summary, compliance_scan | Cited AI workspace |
| Town Planning | dashboard, applications, deadlines, participation, conditions, hearings, municipalities, payments | SPLUMA tracking |
| Municipal Approval Readiness | overview, landuse, circulation, pack, certificate, outcomes | Readiness scorecard |
| SANS 10400-XA | overview, basics, shading, fenestration, walls, roof, floors, hotwater, lighting, results | Clause-by-clause compliance |
| Integrated Forms | library, editor, drafts, export, audit | Passport auto-fill |
| SpecForge | overview, pictorial, sections, products, docpreview, approvals, budget, bomboq, drawings, issue | Clause management |
| BoM / BoQ | takeoff, bomlines, flagged, procurement, qs_review, tender, export, audit | Priced quantities |
| ITP | overview, items, hold_points, materials, lab_results, ncr_link | Hold-point sign-off |
| Health & Safety | overview, safety_file, permits, hira, incidents, inducted, plans, fall_protection | Reg 7 file, PTW |
| Feedback Intelligence | overview, clusters, trends, brief, roadmap | Severity clustering |

### Foundation modules (4)
- **Project Passport** — overview, identity, site, stakeholders, health · draft→publish gate
- **Documents & Drawings** — register, current_set, transmittals, markups · revision control
- **Action Centre** — my_actions, inbox, decisions, all
- **Approvals Queue** — pending, submitted, history · role-gated decisions

### Graduated scaffolds (30)
- **Collaboration:** Issues/RFIs, Team Workspace (RACI), Professional Directory (council verification), Project Explorer (universal search + relational graph)
- **Site execution:** Site Instructions, NCR Manager (ITP linkage), Snag Manager (zone walkthroughs), Contractor Compliance (COIDA/CIDB), FM Bridge (handover pack)
- **Commercial:** Fee Proposal, RFQ Marketplace (quote comparison), Supplier Catalogue (verification), Contract Administration (JBCC certificates), Insurance Register, Payments & Escrow (workflow-only), Market Insights (cost indices), Dispute Resolution (adjudication)
- **Planning/compliance:** Council Navigator, Municipal Tracker (deadline alerts), Compliance Hub (SANS/NBR/OHS), Environmental & Heritage (NEMA/SAHRA), EIA Workspace (BAR/EMPr), Refuse Calculator (statutory sizing), NHBRC Enrolment, BIM/IFC Extraction (shared drawing intelligence), Survey & Geomatics
- **Platform services:** Remote Desktop (provider-brokered), CPD & Learning (SACAP tracking), Admin Review (system health), Iconography Registry (design tokens)

## Governance invariants (enforced across modules)
- AI outputs (Wingman drafts, drawing extraction, fenestration values, minutes) remain **draft until a human accepts/publishes**
- Approvals are **role-gated and immutable**; rejection requires a reason
- Meeting publish requires **chair authority + consent + no pending outcomes**; write-backs are idempotency-keyed
- Passport changes require a **human publish action** to become canonical
- Payments & Escrow is **workflow-only**; fund holding deferred pending legal review

## Historical verification record (non-authoritative)
```bash
npm test          # historical command; current results must be recorded in Phase 8 evidence
npm run typecheck # historical command
npm run lint      # historical command
npm run build     # historical command
```

Frontend: http://127.0.0.1:3000 · API: http://127.0.0.1:8080/api/v1
