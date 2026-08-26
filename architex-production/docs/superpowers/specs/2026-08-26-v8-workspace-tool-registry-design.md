# V8 Workspace Tool Registry parity design

## Objective

Replace the current generic filter-and-card registry presentation with the supplied V8 God Mode HTML's Workspace Tool Registry while preserving the real 47-tool registry, navigation events, project-orientation transition, theme behavior, keyboard access and responsive shell.

## Reference contract

The authoritative source is `E:\Downloads\architex_datum_os_integrated_modules_v8_engineering_godmode.html`, opened through its own `openStandalone()` transition at a 1600 x 1000 viewport.

The central canvas contains, in order:

1. `Workspace Tool Registry` page heading, V8 tools icon, exact explanatory copy and `Open project orientation` action.
2. The `One capability, two orientations.` notice with the supplied scope explanation.
3. A `Complete workspace tool registry` section with the supplied live/scaffold contract copy.
4. One section per canonical tool group, in registry order. Each heading includes its exact tool count.
5. Compact tool buttons with a 23px icon, tool name, stage and `Live sample` or `Scaffold` status pill. Scaffold rows use a dashed border.

## Component boundary

`ToolRegistryView` owns registry state-free presentation and emits only the existing `onOpenTool(toolId)` and `onSetMode('project')` events. A focused V8 registry component may be extracted if it keeps the public view interface shallow. `ALL_TOOLS` remains the sole catalogue source; the reference HTML supplies layout and interaction evidence, not production data.

## Interaction and accessibility

- Every tool row is a real button and retains visible keyboard focus.
- The project-orientation action retains its existing transition.
- Status is written text, not colour alone.
- The grouped layout collapses from the reference auto-fill grid to one column on narrow screens without horizontal page overflow.
- Dark theme and reduced-motion behavior use the existing shell tokens.

The removed search and status-filter toolbar is not part of the supplied V8 registry contract. Canonical browse/open behavior remains, and no tool or tool status is removed.

## Verification

- Component contract test must fail before implementation, then prove exact copy, groups, 47 rows, status labels and navigation events.
- Production build and typecheck must pass.
- Playwright must prove reference structure, key computed geometry, all tool rows, keyboard focus, project-orientation action, one representative tool-open action, mobile overflow and Axe checks.
- Side-by-side screenshots and computed-style evidence must be captured from the reference and production-built implementation at the same viewport.
- Deployment must use the validated FTPS candidate/rollback swap and a cache-busted exact artifact hash comparison.
- Live Chromium certification must use real authentication and unmocked API traffic.

## Scope boundary

Completion certifies only Workspace Tool Registry and its shell transitions. It does not certify the internal UI of the 47 destination tools.
