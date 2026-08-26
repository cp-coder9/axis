# V8 OS Command Centre parity evidence

Captured at 1600 x 1000 from the supplied V8 HTML and the production-built implementation.

- `reference.png`: supplied HTML after its own `openGlobal('command')` transition.
- `implementation.png`: authenticated local production build after selecting Command Centre in the OS rail.
- `computed-styles.json`: source paths, visible text, rectangles and computed styles for the page head, icon, title, grid and four cards.

Key measured result: the page-head, icon and title rectangles match exactly; both implementations use 409px cards and a 14px column gap. The first-row implementation height differs from the browser-rendered reference by 0.09375px and the second-row height matches exactly.
