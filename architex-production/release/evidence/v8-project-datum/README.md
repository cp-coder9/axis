# V8 Project Datum parity evidence

This directory contains identical-state, 1600 x 1000 evidence for the supplied V8 Project Datum reference and the authenticated implementation.

- `reference.png`: supplied standalone V8 reference at its Project Datum state.
- `implementation.png`: production-build implementation with an Architect role lens and light theme.
- `computed-styles.json`: paired region rectangles and computed styles captured from both pages.

The automated contract allows at most one pixel of rectangle variance and separately verifies interaction, zoom, dark theme, mobile ordering, accessibility, and body overflow. These files certify the local Project Datum slice only; they do not certify the live deployment or the remaining product surfaces.

Local certification on 2026-08-26:

- Production `next build`: passed.
- Focused component/contract tests: 6 passed.
- Project Datum plus existing V8 shell browser contracts: 25 passed.
- Original-resolution screenshot inspection: completed; the Project Datum structure is aligned, while current registry copy and queued surrounding-shell surfaces remain intentionally distinct.
