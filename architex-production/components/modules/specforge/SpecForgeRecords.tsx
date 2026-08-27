import { useState } from 'react';

import { SpecForgeIssue } from '@/components/modules/specforge/SpecForgeIssue';
import { Button } from '@/components/ui/Button';
import { Surface } from '@/components/ui/Surface';
import type { CreateSpecForgeSectionInput } from '@/lib/specforge/api';
import { summarizeSpecBudget } from '@/lib/specforge/domain';
import type { SpecForgeAggregate, SpecForgeDownstreamJob, SpecForgeIssueResult, SpecForgeItem, SpecForgeProcurementTarget } from '@/lib/specforge/types';
import type { RoleKey } from '@/lib/types';

const money = (value: number) => `R ${value.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`;
const status = (value: string) => <span className={`specforge-status specforge-status--${value}`}>{value.replaceAll('_',' ')}</span>;
const cssImage = (url: string) => `url("${url.replaceAll('\\', '%5C').replaceAll('"', '%22')}")`;

interface Props {
  tab: string;
  workspace: SpecForgeAggregate;
  role: RoleKey;
  canEdit: boolean;
  canIssue: boolean;
  onCreateSection: (input: CreateSpecForgeSectionInput) => Promise<unknown>;
  onDuplicate: (itemId: string) => Promise<unknown>;
  onTransitionProcurement: (itemId: string, targetStatus: SpecForgeProcurementTarget, expectedVersion: number) => Promise<unknown>;
  onDecide: (approvalId: string, decision: 'approved' | 'rejected') => Promise<unknown>;
  onConfirmResponsibility: () => Promise<unknown>;
  onValidateIssue: () => Promise<{ ready: boolean; codes: string[] }>;
  onIssue: (input: { title: string; audience: string }) => Promise<SpecForgeIssueResult>;
  onListJobs: (issueId: string) => Promise<SpecForgeDownstreamJob[]>;
  onDrawingScan: (drawingRevisionId: string) => Promise<unknown>;
}

export function SpecForgeRecords({ tab, workspace, role, canEdit, canIssue, onCreateSection, onDuplicate, onTransitionProcurement, onDecide, onConfirmResponsibility, onValidateIssue, onIssue, onListJobs, onDrawingScan }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [drawingRevision, setDrawingRevision] = useState('');
  const [query, setQuery] = useState('');
  const [room, setRoom] = useState('');
  const [packageName, setPackageName] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [sectionFormOpen, setSectionFormOpen] = useState(false);
  const [sectionSaving, setSectionSaving] = useState(false);
  const [procurementBusy, setProcurementBusy] = useState<string | null>(null);
  const [procurementMessage, setProcurementMessage] = useState<string | null>(null);
  const [responsibilityBusy, setResponsibilityBusy] = useState(false);
  const budget = summarizeSpecBudget(workspace.items);
  const rooms = [...new Set(workspace.items.map(item => item.room))].sort();
  const packages = [...new Set(workspace.items.map(item => item.packageName))].sort();
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredItems = workspace.items.filter(item => {
    const searchable = [item.code, item.title, item.description, item.room, item.packageName, item.supplier, item.model, item.finish].filter(Boolean).join(' ').toLocaleLowerCase();
    return (!normalizedQuery || searchable.includes(normalizedQuery)) && (!room || item.room === room) && (!packageName || item.packageName === packageName);
  });
  const selectedItem = workspace.items.find(item => item.id === selectedItemId) ?? null;
  const filters = <div className="specforge-record-filters"><label><span>Search specifications</span><input type="search" aria-label="Search specifications" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search code, product, supplier or finish" /></label><label><span>Room</span><select aria-label="Filter by room" value={room} onChange={event => setRoom(event.target.value)}><option value="">All rooms</option>{rooms.map(value => <option key={value}>{value}</option>)}</select></label><label><span>Package</span><select aria-label="Filter by package" value={packageName} onChange={event => setPackageName(event.target.value)}><option value="">All packages</option>{packages.map(value => <option key={value}>{value}</option>)}</select></label></div>;
  const detail = selectedItem && <ItemDetail item={selectedItem} canEdit={canEdit} onDuplicate={onDuplicate} onClose={() => setSelectedItemId(null)} />;

  if (tab === 'pictorial') return <section data-tool-tab={tab} className="specforge-record-view">{filters}<div className="specforge-pictorial">{filteredItems.map(item => <Surface as="article" level="raised" key={item.id}><button type="button" className="specforge-product-card" aria-label={`Open ${item.title} details`} onClick={() => setSelectedItemId(item.id)}><div className="specforge-product-image">{item.imageUrl ? <div className="specforge-product-photo" role="img" aria-label={item.title} style={{ backgroundImage: cssImage(item.imageUrl) }} /> : <div><span>{item.finish ?? 'Product image pending'}</span><small>{item.dimensions ?? item.packageName}</small></div>}</div><div className="specforge-product-copy"><div><code>{item.code}</code>{status(item.status)}</div><h2>{item.title}</h2><p>{item.supplier ?? 'Supplier not assigned'} · {item.model ?? 'performance basis'}</p><small>{item.room} · {item.sourceRevision}</small></div></button></Surface>)}{filteredItems.length === 0 && <Empty title="No matching specifications" detail="Change the search or project filters." />}</div>{detail}</section>;

  if (tab === 'sections') {
    const createSection = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      setSectionSaving(true);
      try {
        await onCreateSection({ code: String(data.get('code') ?? '').trim(), title: String(data.get('title') ?? '').trim(), discipline: String(data.get('discipline') ?? '').trim() || 'general', ownerRole: role, reviewerRole: 'bep', status: 'draft', standardSource: null, sourceRevision: workspace.revision });
        setSectionFormOpen(false);
      } finally { setSectionSaving(false); }
    };
    return <section data-tool-tab={tab} className="specforge-section-view"><div className="specforge-panel__head"><div><span className="specforge-kicker">Controlled structure</span><h2>Sections</h2></div>{canEdit && <Button type="button" onClick={() => setSectionFormOpen(true)}>Add section</Button>}</div><div className="specforge-sections">{workspace.sections.map(section => <details className="ax-surface ax-surface--raised" key={section.id} open><summary><div><code>{section.code}</code><h3>{section.title}</h3><small>{section.discipline} · owner {section.ownerRole.replaceAll('_',' ')}</small></div><div>{status(section.status)}<span>{workspace.items.filter(item => item.sectionId === section.id).length}</span></div></summary><div className="specforge-section-items">{workspace.items.filter(item => item.sectionId === section.id).map(item => <button type="button" key={item.id} onClick={() => setSelectedItemId(item.id)}><code>{item.code}</code><span>{item.title}</span>{status(item.status)}</button>)}</div></details>)}</div>{selectedItem && <ItemDetail item={selectedItem} canEdit={canEdit} onDuplicate={onDuplicate} onClose={() => setSelectedItemId(null)} />}{sectionFormOpen && <div className="specforge-detail-backdrop" role="presentation"><Surface as="section" level="raised" className="specforge-section-form" role="dialog" aria-modal="true" aria-labelledby="specforge-section-form-title"><header><h2 id="specforge-section-form-title">Add new section</h2><Button type="button" variant="quiet" size="sm" aria-label="Close section form" onClick={() => setSectionFormOpen(false)}>Close</Button></header><form onSubmit={event => void createSection(event)}><label>Section code<input name="code" aria-label="Section code" placeholder="e.g. 14" required /></label><label>Section title<input name="title" aria-label="Section title" placeholder="e.g. Sanitaryware" required /></label><label>Section discipline<input name="discipline" aria-label="Section discipline" placeholder="e.g. Plumbing" /></label><div><Button type="submit" busy={sectionSaving}>Create section</Button><Button type="button" variant="secondary" onClick={() => setSectionFormOpen(false)}>Cancel</Button></div></form></Surface></div>}</section>;
  }

  if (tab === 'products') return <section data-tool-tab={tab} className="specforge-record-view">{filters}<Surface level="raised" className="specforge-table-panel"><div className="specforge-panel__head"><div><span className="specforge-kicker">Controlled records</span><h2>Product register</h2></div><span>{filteredItems.length} visible records</span></div><div className="specforge-table-scroll"><table><thead><tr><th>Reference</th><th>Specification</th><th>Package / room</th><th>Allowance</th><th>Estimate</th><th>Lead</th><th>Status</th><th /></tr></thead><tbody>{filteredItems.map(item => <tr key={item.id}><td><code>{item.code}</code></td><td><button type="button" className="specforge-product-link" onClick={() => setSelectedItemId(item.id)}><strong>{item.title}</strong><small>{item.supplier ?? 'Supplier open'} · {item.finish ?? 'Finish open'}</small></button></td><td>{item.packageName}<small>{item.room}</small></td><td>{money(item.budgetAllowance)}</td><td>{money(item.estimatedCost)}</td><td>{item.leadTimeDays}d</td><td>{status(item.status)}</td><td>{canEdit && <button type="button" onClick={() => void onDuplicate(item.id)}>Duplicate</button>}</td></tr>)}</tbody></table>{filteredItems.length === 0 && <Empty title="No matching specifications" detail="Change the search or project filters." />}</div></Surface>{detail}</section>;

  if (tab === 'docpreview') return <div data-tool-tab={tab} className="specforge-document-layout"><Surface as="article" level="raised" className="specforge-document"><header><code>{workspace.projectId} · {workspace.revision}</code><h2>Project Works Specification</h2><p>{workspace.projectName} · {workspace.profile}</p></header>{workspace.sections.map(section => <section key={section.id}><span>Section {section.code}</span><h3>{section.title}</h3>{workspace.items.filter(item => item.sectionId === section.id).map(item => <div key={item.id}><h4>{item.code} · {item.title}</h4><p>{item.description}</p><small>Source {item.sourceRevision} · {item.packageName}</small></div>)}</section>)}</Surface><Surface level="inset" className="specforge-document-controls"><span className="specforge-kicker">Live preview</span><h3>Generated from persisted records</h3><p>This preview contains the records visible to your authenticated project role. Issue creates an immutable snapshot.</p><dl><div><dt>Revision</dt><dd>{workspace.revision}</dd></div><div><dt>Sections</dt><dd>{workspace.sections.length}</dd></div><div><dt>Items</dt><dd>{workspace.items.length}</dd></div></dl></Surface></div>;

  if (tab === 'approvals') {
    const confirmation = workspace.responsibilityConfirmations.find(item => item.revision === workspace.revision);
    const confirm = async () => { setResponsibilityBusy(true); try { await onConfirmResponsibility(); } finally { setResponsibilityBusy(false); } };
    return <section data-tool-tab={tab} className="specforge-approval-view"><div className="specforge-approval-grid">{workspace.approvals.map(approval => <Surface as="article" level="raised" key={approval.id}><div><code>{approval.approvalType}</code>{status(approval.status)}</div><h2>{workspace.items.find(item => item.id === approval.itemId)?.title ?? 'Scoped specification decision'}</h2><p>Requested from {approval.requestedRole.replaceAll('_',' ')}{approval.dueAt ? ` · due ${approval.dueAt}` : ''}</p>{approval.status === 'pending' && (role === approval.requestedRole || role === 'platform_admin') && <footer><Button size="sm" onClick={() => void onDecide(approval.id, 'approved')}>Approve</Button><Button size="sm" variant="danger" onClick={() => void onDecide(approval.id, 'rejected')}>Reject</Button></footer>}</Surface>)}{workspace.approvals.length === 0 && <Empty title="No approval requests" detail="Approval decisions will appear here after an authorized professional requests them." />}</div>{['architect','bep','platform_admin'].includes(role) && <Surface level="inset" className="specforge-responsibility"><div><span className="specforge-kicker">Professional responsibility</span><h2>{confirmation ? `Confirmed for ${workspace.revision}` : `Confirmation required for ${workspace.revision}`}</h2><p>{confirmation?.statementText ?? 'I confirm this specification was prepared with reasonable care and skill.'}</p></div>{confirmation ? status('completed') : <Button type="button" busy={responsibilityBusy} aria-label="Confirm and sign professional responsibility" onClick={() => void confirm()}>Confirm &amp; sign</Button>}</Surface>}</section>;
  }

  if (tab === 'budget') return <div data-tool-tab={tab} className="specforge-budget"><div className="specforge-metrics"><Surface level="raised"><span>Allowance</span><strong>{money(budget.allowance)}</strong></Surface><Surface level="raised"><span>Estimate</span><strong>{money(budget.estimate)}</strong></Surface><Surface level="raised"><span>Variance</span><strong>{money(budget.delta)}</strong></Surface><Surface level="raised"><span>Cost risks</span><strong>{budget.overBudgetItemIds.length}</strong></Surface></div><Surface level="raised" className="specforge-table-panel"><div className="specforge-panel__head"><div><span className="specforge-kicker">QS review</span><h2>Allowance variance</h2></div><span>{workspace.budgetReviewedAt ? `Reviewed ${workspace.budgetReviewedAt}` : 'Review pending'}</span></div>{workspace.items.map(item => <div className="specforge-cost-row" key={item.id}><div><code>{item.code}</code><strong>{item.title}</strong></div><span>{money(item.budgetAllowance)}</span><span>{money(item.estimatedCost)}</span><b className={item.estimatedCost > item.budgetAllowance ? 'is-risk' : ''}>{money(item.estimatedCost - item.budgetAllowance)}</b></div>)}</Surface></div>;

  if (tab === 'bomboq') return <Surface data-tool-tab={tab} level="raised" className="specforge-table-panel"><div className="specforge-panel__head"><div><span className="specforge-kicker">Single source of truth</span><h2>BoM / BoQ linkage</h2></div><span>Specification-derived lines</span></div>{workspace.items.map(item => <div className="specforge-bom-row" key={item.id}><code>{item.code}</code><div><strong>{item.title}</strong><small>{item.packageName}</small></div><span>{money(item.estimatedCost)}</span><span>{item.status === 'issued' ? 'Ready for procurement' : 'Controlled draft'}</span></div>)}</Surface>;

  if (tab === 'planning') {
    const columns = [
      { label: 'New', items: workspace.items.filter(item => !['approved', 'issued', 'rfq', 'quoted', 'po_raised', 'ordered', 'in_transit', 'delivered', 'installed', 'as_built'].includes(item.status)) },
      { label: 'In Progress', items: workspace.items.filter(item => item.status === 'approved') },
      { label: 'Done', items: workspace.items.filter(item => ['issued', 'rfq', 'quoted', 'po_raised', 'ordered', 'in_transit', 'delivered', 'installed', 'as_built'].includes(item.status)) },
    ];
    return <section data-tool-tab={tab} className="specforge-workflow-view"><div className="specforge-panel__head"><div><span className="specforge-kicker">Specification-derived work</span><h2>Specification planning</h2></div><span>{workspace.items.length} work packages</span></div><div className="specforge-kanban">{columns.map(column => <Surface level="raised" key={column.label} className="specforge-kanban-column"><header><strong>{column.label}</strong><span>{column.items.length}</span></header>{column.items.map(item => <article key={item.id}><strong>Procure: {item.title}</strong><small>{item.leadTimeDays > 60 ? 'High' : 'Normal'} priority · {item.ownerRole.replaceAll('_', ' ')}</small><code>{item.code} · {item.sourceRevision}</code></article>)}{column.items.length === 0 && <p>No persisted items</p>}</Surface>)}</div></section>;
  }

  if (tab === 'procurement') {
    const stages = ['RFQ Pending', 'Quoted', 'PO Raised', 'Ordered', 'In Transit', 'Delivered', 'Installed'] as const;
    const actions: Partial<Record<typeof stages[number], { label: string; target: SpecForgeProcurementTarget }>> = {
      'RFQ Pending': { label: 'Send RFQ', target: 'quoted' }, Quoted: { label: 'Accept quote', target: 'po_raised' }, 'PO Raised': { label: 'Place order', target: 'ordered' }, Ordered: { label: 'Mark shipped', target: 'in_transit' }, 'In Transit': { label: 'Mark received', target: 'delivered' }, Delivered: { label: 'Mark installed', target: 'installed' },
    };
    const stageItems = (stage: typeof stages[number]) => workspace.items.filter(item => {
      if (stage === 'RFQ Pending') return ['approved', 'issued', 'rfq'].includes(item.status);
      if (stage === 'Quoted') return item.status === 'quoted';
      if (stage === 'PO Raised') return item.status === 'po_raised';
      if (stage === 'Ordered') return item.status === 'ordered';
      if (stage === 'In Transit') return item.status === 'in_transit';
      if (stage === 'Delivered') return item.status === 'delivered';
      if (stage === 'Installed') return ['installed', 'as_built'].includes(item.status);
      return false;
    });
    const transition = async (item: SpecForgeItem, action: { label: string; target: SpecForgeProcurementTarget }) => { setProcurementBusy(item.id); setProcurementMessage(null); try { await onTransitionProcurement(item.id, action.target, item.lockVersion); setProcurementMessage('Transition saved. Procurement connector: integration required.'); } catch (error) { setProcurementMessage(error instanceof Error ? error.message : 'Procurement transition failed.'); } finally { setProcurementBusy(null); } };
    return <section data-tool-tab={tab} className="specforge-workflow-view"><div className="specforge-panel__head"><div><span className="specforge-kicker">Audited pipeline projection</span><h2>Procurement pipeline</h2></div><span>Server-authoritative transitions</span></div>{procurementMessage && <p className="specforge-procurement-message" role="status">{procurementMessage}</p>}<div className="specforge-procurement-board">{stages.map(stage => { const items = stageItems(stage); const action = actions[stage]; return <Surface level="raised" key={stage} className="specforge-procurement-column"><header><strong>{stage}</strong><span>{items.length}</span></header>{items.map(item => <article key={item.id}><strong>{item.title}</strong><code>{item.code}</code><small>{item.leadTimeDays}d lead · {item.status}</small>{canEdit && action && <Button type="button" size="sm" busy={procurementBusy === item.id} aria-label={`${action.label} for ${item.title}`} onClick={() => void transition(item, action)}>{action.label}</Button>}</article>)}{items.length === 0 && <p>No persisted items</p>}</Surface>; })}</div></section>;
  }

  if (tab === 'drawings') return <div data-tool-tab={tab} className="specforge-drawing-layout"><Surface level="raised" className="specforge-panel"><div className="specforge-panel__head"><div><span className="specforge-kicker">Drawing intelligence</span><h2>Coordination findings</h2></div><span>{workspace.drawingFindings.length} findings</span></div>{workspace.drawingFindings.map(finding => <article className="specforge-finding" key={finding.id}>{status(finding.severity)}<div><strong>{finding.drawingRevisionId}</strong><p>{finding.finding}</p><small>{finding.status} · {finding.itemId ? 'linked item' : 'workspace finding'}</small></div></article>)}{workspace.drawingFindings.length === 0 && <p className="specforge-empty-copy">No drawing findings have been persisted.</p>}</Surface><Surface level="inset" className="specforge-scan-card"><span className="specforge-kicker">Request governed scan</span><h2>Analyse a drawing revision</h2><p>The request creates a queued job. Results remain candidates until professional review.</p><label>Drawing revision ID<input value={drawingRevision} onChange={event => setDrawingRevision(event.target.value)} /></label><Button disabled={!drawingRevision.trim()} onClick={() => void onDrawingScan(drawingRevision.trim()).then(() => setMessage('Drawing scan queued.')).catch(error => setMessage(error instanceof Error ? error.message : 'Scan unavailable.'))}>Request scan</Button>{message && <small role="status">{message}</small>}</Surface></div>;

  if (tab === 'issue') return <SpecForgeIssue workspace={workspace} canIssue={canIssue} onValidate={onValidateIssue} onIssue={onIssue} onListJobs={onListJobs} />;

  if (tab === 'closeout') {
    const approved = workspace.items.filter(item => ['approved', 'issued', 'rfq', 'quoted', 'po_raised', 'ordered', 'in_transit', 'delivered', 'installed', 'as_built'].includes(item.status)).length;
    const stale = workspace.items.filter(item => item.supersededBy !== null).length;
    const budgetWithin = budget.delta <= 0;
    const percentage = workspace.items.length === 0 ? 0 : Math.round((approved / workspace.items.length) * 100);
    const ready = approved === workspace.items.length && budgetWithin && stale === 0 && workspace.approvals.every(approval => approval.status !== 'pending');
    return <section data-tool-tab={tab} className="specforge-workflow-view"><div className="specforge-panel__head"><div><span className="specforge-kicker">Deterministic controls</span><h2>Closeout readiness</h2></div>{status(ready ? 'completed' : 'needs_review')}</div><div className="specforge-closeout-grid"><Surface level="raised"><span>Approved items</span><strong>{percentage}%</strong><small>{approved} of {workspace.items.length}</small></Surface><Surface level="raised"><span>Budget</span><strong>{budgetWithin ? 'Within' : 'Over'}</strong><small>{money(budget.delta)}</small></Surface><Surface level="raised"><span>No stale sources</span><strong>{stale === 0 ? 'Yes' : 'No'}</strong><small>{stale} superseded links</small></Surface></div><Surface level="inset" className="specforge-closeout-result"><h3>{ready ? 'Ready for issue' : 'Not ready'}</h3><p>{ready ? 'All persisted SpecForge closeout controls are complete.' : 'Resolve outstanding approvals, budget variance, or stale sources before closeout.'}</p></Surface></section>;
  }

  if (tab === 'integration') {
    const pendingDecisions = workspace.approvals.filter(approval => approval.status === 'pending').length;
    const cards = [
      { title: 'Project Passport', state: workspace.issueStatus, detail: `${pendingDecisions} open decisions` },
      { title: 'AI Agent Recommendations', state: 'integration_required', detail: 'No recommendation provider is configured.' },
      { title: 'Messaging Centre', state: 'integration_required', detail: 'No messaging connector is configured.' },
      { title: 'Payment & Escrow', state: 'integration_required', detail: `${money(budget.estimate)} specification estimate` },
      { title: 'Procurement Pipeline', state: 'integration_required', detail: `${workspace.items.filter(item => item.status === 'approved').length} items ready for RFQ` },
      { title: 'Programme / Gantt', state: 'integration_required', detail: `${workspace.items.length} specification work packages` },
      { title: 'BoM / BoQ', state: 'integration_required', detail: `${workspace.items.length} specification-derived lines` },
      { title: 'Drawing Intelligence', state: workspace.drawingFindings.length > 0 ? 'needs_review' : 'integration_required', detail: `${workspace.drawingFindings.length} persisted findings` },
      { title: 'Audit Trail', state: 'completed', detail: `${workspace.commands.length} persisted SpecForge commands` },
    ];
    return <section data-tool-tab={tab} className="specforge-workflow-view"><div className="specforge-panel__head"><div><span className="specforge-kicker">Actual connector state</span><h2>Connected services</h2></div><span>No simulated success</span></div><div className="specforge-integration-grid">{cards.map(card => <Surface as="article" level="raised" key={card.title}><header><h3>{card.title}</h3>{status(card.state)}</header><p>{card.detail}</p>{card.state === 'integration_required' && <small>Integration required</small>}</Surface>)}</div></section>;
  }

  return <Empty title="Workspace view unavailable" detail="Choose a SpecForge workflow tab." />;
}

function Empty({ title, detail }: { title: string; detail: string }) { return <Surface level="inset" className="specforge-empty"><h2>{title}</h2><p>{detail}</p></Surface>; }

function ItemDetail({ item, canEdit, onDuplicate, onClose }: { item: SpecForgeItem; canEdit: boolean; onDuplicate: (itemId: string) => Promise<unknown>; onClose: () => void }) {
  return <div className="specforge-detail-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><Surface as="section" level="raised" className="specforge-item-detail" role="dialog" aria-modal="true" aria-labelledby="specforge-item-detail-title"><header><div><code>{item.code}</code><h2 id="specforge-item-detail-title">{item.title}</h2></div><Button type="button" variant="quiet" size="sm" aria-label="Close item details" onClick={onClose}>Close</Button></header>{item.imageUrl ? <div className="specforge-detail-image" role="img" aria-label={item.title} style={{ backgroundImage: cssImage(item.imageUrl) }} /> : <div className="specforge-detail-image specforge-detail-image--empty"><span>Product image pending</span><small>Integration required</small></div>}<p className="specforge-detail-description">{item.description}</p><dl><div><dt>Room</dt><dd>{item.room}</dd></div><div><dt>Package</dt><dd>{item.packageName}</dd></div><div><dt>Supplier</dt><dd>{item.supplier ?? 'Unassigned'}</dd></div><div><dt>Model</dt><dd>{item.model ?? 'Open'}</dd></div><div><dt>Finish</dt><dd>{item.finish ?? 'Open'}</dd></div><div><dt>Dimensions</dt><dd>{item.dimensions ?? 'Open'}</dd></div><div><dt>Budget</dt><dd>{money(item.budgetAllowance)}</dd></div><div><dt>Estimate</dt><dd>{money(item.estimatedCost)}</dd></div><div><dt>Lead time</dt><dd>{item.leadTimeDays} days</dd></div><div><dt>Status</dt><dd>{status(item.status)}</dd></div><div><dt>Source revision</dt><dd>{item.sourceRevision}</dd></div><div><dt>Owner</dt><dd>{item.ownerRole.replaceAll('_', ' ')}</dd></div></dl>{canEdit && <footer><Button type="button" onClick={() => void onDuplicate(item.id)}>Duplicate as draft</Button></footer>}</Surface></div>;
}
