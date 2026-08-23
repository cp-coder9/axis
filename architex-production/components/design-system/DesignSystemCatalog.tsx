import { ActionSpecimens } from './ActionSpecimens';
import { DataEntrySpecimens } from './DataEntrySpecimens';
import { WorkflowSpecimens } from './WorkflowSpecimens';

export function DesignSystemCatalog() {
  return (
    <main className="ax-catalog">
      <p className="ax-catalog__eyebrow">Development catalog · P5-TYP-01</p>
      <div className="ax-catalog__datum" aria-hidden="true" />
      <header id="ax-catalog-identity" className="ax-catalog__header">
        <p>Architex OS · Datum foundation</p>
        <h1>Architex typography roles</h1>
        <p>Display hierarchy, operational body copy, and precise utility data remain distinct without competing with the Datum line.</p>
      </header>
      <section id="ax-catalog-colour-semantics" aria-labelledby="ax-colour-semantics-title" className="ax-catalog__section">
        <h2 id="ax-colour-semantics-title">Colour semantics</h2>
        <div className="ax-catalog__swatches">
          {['--ax-canvas', '--ax-surface-1', '--ax-surface-2', '--ax-action-primary', '--ax-datum'].map((token) => (
            <span key={token} className="ax-catalog__swatch" style={{ background: `var(${token})` }}><code>{token}</code></span>
          ))}
        </div>
      </section>
      <section id="ax-catalog-typography" aria-labelledby="ax-type-specimen-title" className="ax-catalog__section">
        <h2 id="ax-type-specimen-title">Type specimen</h2>
        <p className="ax-catalog__display">Project delivery needs a clear line of truth.</p>
        <p className="ax-catalog__body">The body role carries navigation, forms, working notes, and service status at a readable operating density.</p>
        <p className="ax-catalog__mono">REV-08 · 1 234.50 m² · 2026-08-24 09:00 SAST</p>
      </section>
      <section id="ax-catalog-density" aria-labelledby="ax-density-title" className="ax-catalog__section">
        <h2 id="ax-density-title">Density</h2>
        <div className="ax-catalog__density-grid">
          <div data-density="comfortable"><strong>Comfortable</strong><button type="button">Review project record</button></div>
          <div data-density="compact"><strong>Compact</strong><button type="button">Review project record</button></div>
        </div>
      </section>
      <section id="ax-catalog-breakpoints" aria-labelledby="ax-breakpoints-title" className="ax-catalog__section">
        <h2 id="ax-breakpoints-title">Responsive shell measurements</h2>
        <dl className="ax-catalog__measurements"><div><dt>Desktop</dt><dd>Rail, navigator, workspace, inspector</dd></div><div><dt>Tablet</dt><dd>Rail with independent drawers</dd></div><div><dt>Mobile</dt><dd>Drawer-first shell and 12px content edge</dd></div></dl>
      </section>
      <section id="ax-catalog-statuses" aria-labelledby="ax-statuses-title" className="ax-catalog__section">
        <h2 id="ax-statuses-title">Status roles</h2>
        <div className="ax-catalog__statuses">{['Info', 'Success', 'Warning', 'Danger', 'Neutral'].map((label) => <span key={label} data-tone={label.toLowerCase()}>{label}</span>)}</div>
      </section>
      <section id="ax-catalog-data-visualisation" aria-labelledby="ax-data-title" className="ax-catalog__section">
        <h2 id="ax-data-title">Data visualisation</h2>
        <div className="ax-catalog__series" aria-label="Eight semantic data series">{Array.from({ length: 8 }, (_, index) => <i key={index} style={{ background: `var(--ax-data-${index + 1})` }} />)}</div>
      </section>
      <ActionSpecimens />
      <DataEntrySpecimens />
      <WorkflowSpecimens />
    </main>
  );
}
