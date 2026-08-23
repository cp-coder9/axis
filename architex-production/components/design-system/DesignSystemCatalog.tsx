export function DesignSystemCatalog() {
  return (
    <main className="ax-catalog" data-density="comfortable">
      <p className="ax-catalog__eyebrow">Development catalog · P5-TYP-01</p>
      <div className="ax-catalog__datum" aria-hidden="true" />
      <header className="ax-catalog__header">
        <p>Architex OS · Datum foundation</p>
        <h1>Architex typography roles</h1>
        <p>Display hierarchy, operational body copy, and precise utility data remain distinct without competing with the Datum line.</p>
      </header>
      <section aria-labelledby="ax-type-specimen-title" className="ax-catalog__section">
        <h2 id="ax-type-specimen-title">Type specimen</h2>
        <p className="ax-catalog__display">Project delivery needs a clear line of truth.</p>
        <p className="ax-catalog__body">The body role carries navigation, forms, working notes, and service status at a readable operating density.</p>
        <p className="ax-catalog__mono">REV-08 · 1 234.50 m² · 2026-08-24 09:00 SAST</p>
      </section>
    </main>
  );
}
