import { useState } from 'react';

import { SpecForgeIssue } from '@/components/modules/specforge/SpecForgeIssue';
import { Button } from '@/components/ui/Button';
import { Surface } from '@/components/ui/Surface';
import { summarizeSpecBudget } from '@/lib/specforge/domain';
import type { SpecForgeAggregate, SpecForgeDownstreamJob, SpecForgeIssueResult } from '@/lib/specforge/types';
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
  onDuplicate: (itemId: string) => Promise<unknown>;
  onDecide: (approvalId: string, decision: 'approved' | 'rejected') => Promise<unknown>;
  onValidateIssue: () => Promise<{ ready: boolean; codes: string[] }>;
  onIssue: (input: { title: string; audience: string }) => Promise<SpecForgeIssueResult>;
  onListJobs: (issueId: string) => Promise<SpecForgeDownstreamJob[]>;
  onDrawingScan: (drawingRevisionId: string) => Promise<unknown>;
}

export function SpecForgeRecords({ tab, workspace, role, canEdit, canIssue, onDuplicate, onDecide, onValidateIssue, onIssue, onListJobs, onDrawingScan }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [drawingRevision, setDrawingRevision] = useState('');
  const budget = summarizeSpecBudget(workspace.items);

  if (tab === 'pictorial') return <div data-tool-tab={tab} className="specforge-pictorial">{workspace.items.map(item => <Surface as="article" level="raised" key={item.id}><div className="specforge-product-image">{item.imageUrl ? <div className="specforge-product-photo" role="img" aria-label={item.title} style={{ backgroundImage: cssImage(item.imageUrl) }} /> : <div><span>{item.finish ?? 'Product image pending'}</span><small>{item.dimensions ?? item.packageName}</small></div>}</div><div className="specforge-product-copy"><div><code>{item.code}</code>{status(item.status)}</div><h2>{item.title}</h2><p>{item.supplier ?? 'Supplier not assigned'} · {item.model ?? 'performance basis'}</p><small>{item.room} · {item.sourceRevision}</small></div></Surface>)}</div>;

  if (tab === 'sections') return <div data-tool-tab={tab} className="specforge-sections">{workspace.sections.map(section => <Surface as="article" level="raised" key={section.id}><header><div><code>{section.code}</code><h2>{section.title}</h2></div>{status(section.status)}</header><p>{section.discipline} · owner {section.ownerRole.replaceAll('_',' ')}</p><div>{workspace.items.filter(item => item.sectionId === section.id).map(item => <span key={item.id}>{item.code} · {item.title}</span>)}</div></Surface>)}</div>;

  if (tab === 'products') return <Surface data-tool-tab={tab} level="raised" className="specforge-table-panel"><div className="specforge-panel__head"><div><span className="specforge-kicker">Controlled records</span><h2>Product register</h2></div><span>{workspace.items.length} visible records</span></div><div className="specforge-table-scroll"><table><thead><tr><th>Reference</th><th>Specification</th><th>Package / room</th><th>Allowance</th><th>Estimate</th><th>Lead</th><th>Status</th><th /></tr></thead><tbody>{workspace.items.map(item => <tr key={item.id}><td><code>{item.code}</code></td><td><strong>{item.title}</strong><small>{item.supplier ?? 'Supplier open'} · {item.finish ?? 'Finish open'}</small></td><td>{item.packageName}<small>{item.room}</small></td><td>{money(item.budgetAllowance)}</td><td>{money(item.estimatedCost)}</td><td>{item.leadTimeDays}d</td><td>{status(item.status)}</td><td>{canEdit && <button type="button" onClick={() => void onDuplicate(item.id)}>Duplicate</button>}</td></tr>)}</tbody></table></div></Surface>;

  if (tab === 'docpreview') return <div data-tool-tab={tab} className="specforge-document-layout"><Surface as="article" level="raised" className="specforge-document"><header><code>{workspace.projectId} · {workspace.revision}</code><h2>Project Works Specification</h2><p>{workspace.projectName} · {workspace.profile}</p></header>{workspace.sections.map(section => <section key={section.id}><span>Section {section.code}</span><h3>{section.title}</h3>{workspace.items.filter(item => item.sectionId === section.id).map(item => <div key={item.id}><h4>{item.code} · {item.title}</h4><p>{item.description}</p><small>Source {item.sourceRevision} · {item.packageName}</small></div>)}</section>)}</Surface><Surface level="inset" className="specforge-document-controls"><span className="specforge-kicker">Live preview</span><h3>Generated from persisted records</h3><p>This preview contains the records visible to your authenticated project role. Issue creates an immutable snapshot.</p><dl><div><dt>Revision</dt><dd>{workspace.revision}</dd></div><div><dt>Sections</dt><dd>{workspace.sections.length}</dd></div><div><dt>Items</dt><dd>{workspace.items.length}</dd></div></dl></Surface></div>;

  if (tab === 'approvals') return <div data-tool-tab={tab} className="specforge-approval-grid">{workspace.approvals.map(approval => <Surface as="article" level="raised" key={approval.id}><div><code>{approval.approvalType}</code>{status(approval.status)}</div><h2>{workspace.items.find(item => item.id === approval.itemId)?.title ?? 'Scoped specification decision'}</h2><p>Requested from {approval.requestedRole.replaceAll('_',' ')}{approval.dueAt ? ` · due ${approval.dueAt}` : ''}</p>{approval.status === 'pending' && (role === approval.requestedRole || role === 'platform_admin') && <footer><Button size="sm" onClick={() => void onDecide(approval.id, 'approved')}>Approve</Button><Button size="sm" variant="danger" onClick={() => void onDecide(approval.id, 'rejected')}>Reject</Button></footer>}</Surface>)}{workspace.approvals.length === 0 && <Empty title="No approval requests" detail="Approval decisions will appear here after an authorized professional requests them." />}</div>;

  if (tab === 'budget') return <div data-tool-tab={tab} className="specforge-budget"><div className="specforge-metrics"><Surface level="raised"><span>Allowance</span><strong>{money(budget.allowance)}</strong></Surface><Surface level="raised"><span>Estimate</span><strong>{money(budget.estimate)}</strong></Surface><Surface level="raised"><span>Variance</span><strong>{money(budget.delta)}</strong></Surface><Surface level="raised"><span>Cost risks</span><strong>{budget.overBudgetItemIds.length}</strong></Surface></div><Surface level="raised" className="specforge-table-panel"><div className="specforge-panel__head"><div><span className="specforge-kicker">QS review</span><h2>Allowance variance</h2></div><span>{workspace.budgetReviewedAt ? `Reviewed ${workspace.budgetReviewedAt}` : 'Review pending'}</span></div>{workspace.items.map(item => <div className="specforge-cost-row" key={item.id}><div><code>{item.code}</code><strong>{item.title}</strong></div><span>{money(item.budgetAllowance)}</span><span>{money(item.estimatedCost)}</span><b className={item.estimatedCost > item.budgetAllowance ? 'is-risk' : ''}>{money(item.estimatedCost - item.budgetAllowance)}</b></div>)}</Surface></div>;

  if (tab === 'bomboq') return <Surface data-tool-tab={tab} level="raised" className="specforge-table-panel"><div className="specforge-panel__head"><div><span className="specforge-kicker">Single source of truth</span><h2>BoM / BoQ linkage</h2></div><span>Specification-derived lines</span></div>{workspace.items.map(item => <div className="specforge-bom-row" key={item.id}><code>{item.code}</code><div><strong>{item.title}</strong><small>{item.packageName}</small></div><span>{money(item.estimatedCost)}</span><span>{item.status === 'issued' ? 'Ready for procurement' : 'Controlled draft'}</span></div>)}</Surface>;

  if (tab === 'planning') {
    const columns = [
      { label: 'New', items: workspace.items.filter(item => !['approved', 'issued', 'rfq', 'ordered', 'delivered', 'installed', 'as_built'].includes(item.status)) },
      { label: 'In Progress', items: workspace.items.filter(item => item.status === 'approved') },
      { label: 'Done', items: workspace.items.filter(item => ['issued', 'rfq', 'ordered', 'delivered', 'installed', 'as_built'].includes(item.status)) },
    ];
    return <section data-tool-tab={tab} className="specforge-workflow-view"><div className="specforge-panel__head"><div><span className="specforge-kicker">Specification-derived work</span><h2>Specification planning</h2></div><span>{workspace.items.length} work packages</span></div><div className="specforge-kanban">{columns.map(column => <Surface level="raised" key={column.label} className="specforge-kanban-column"><header><strong>{column.label}</strong><span>{column.items.length}</span></header>{column.items.map(item => <article key={item.id}><strong>Procure: {item.title}</strong><small>{item.leadTimeDays > 60 ? 'High' : 'Normal'} priority · {item.ownerRole.replaceAll('_', ' ')}</small><code>{item.code} · {item.sourceRevision}</code></article>)}{column.items.length === 0 && <p>No persisted items</p>}</Surface>)}</div></section>;
  }

  if (tab === 'procurement') {
    const stages = ['RFQ Pending', 'Quoted', 'PO Raised', 'Ordered', 'In Transit', 'Delivered', 'Installed'] as const;
    const stageItems = (stage: typeof stages[number]) => workspace.items.filter(item => {
      if (stage === 'RFQ Pending') return ['approved', 'issued', 'rfq'].includes(item.status);
      if (stage === 'Ordered') return item.status === 'ordered';
      if (stage === 'Delivered') return item.status === 'delivered';
      if (stage === 'Installed') return ['installed', 'as_built'].includes(item.status);
      return false;
    });
    return <section data-tool-tab={tab} className="specforge-workflow-view"><div className="specforge-panel__head"><div><span className="specforge-kicker">Audited pipeline projection</span><h2>Procurement pipeline</h2></div><span>Transitions require the procurement API</span></div><div className="specforge-procurement-board">{stages.map(stage => { const items = stageItems(stage); return <Surface level="raised" key={stage} className="specforge-procurement-column"><header><strong>{stage}</strong><span>{items.length}</span></header>{items.map(item => <article key={item.id}><strong>{item.title}</strong><code>{item.code}</code><small>{item.leadTimeDays}d lead · {item.status}</small></article>)}{items.length === 0 && <p>{['Quoted', 'PO Raised', 'In Transit'].includes(stage) ? 'Integration required' : 'No persisted items'}</p>}</Surface>; })}</div></section>;
  }

  if (tab === 'drawings') return <div data-tool-tab={tab} className="specforge-drawing-layout"><Surface level="raised" className="specforge-panel"><div className="specforge-panel__head"><div><span className="specforge-kicker">Drawing intelligence</span><h2>Coordination findings</h2></div><span>{workspace.drawingFindings.length} findings</span></div>{workspace.drawingFindings.map(finding => <article className="specforge-finding" key={finding.id}>{status(finding.severity)}<div><strong>{finding.drawingRevisionId}</strong><p>{finding.finding}</p><small>{finding.status} · {finding.itemId ? 'linked item' : 'workspace finding'}</small></div></article>)}{workspace.drawingFindings.length === 0 && <p className="specforge-empty-copy">No drawing findings have been persisted.</p>}</Surface><Surface level="inset" className="specforge-scan-card"><span className="specforge-kicker">Request governed scan</span><h2>Analyse a drawing revision</h2><p>The request creates a queued job. Results remain candidates until professional review.</p><label>Drawing revision ID<input value={drawingRevision} onChange={event => setDrawingRevision(event.target.value)} /></label><Button disabled={!drawingRevision.trim()} onClick={() => void onDrawingScan(drawingRevision.trim()).then(() => setMessage('Drawing scan queued.')).catch(error => setMessage(error instanceof Error ? error.message : 'Scan unavailable.'))}>Request scan</Button>{message && <small role="status">{message}</small>}</Surface></div>;

  if (tab === 'issue') return <SpecForgeIssue workspace={workspace} canIssue={canIssue} onValidate={onValidateIssue} onIssue={onIssue} onListJobs={onListJobs} />;

  if (tab === 'closeout') {
    const approved = workspace.items.filter(item => ['approved', 'issued', 'rfq', 'ordered', 'delivered', 'installed', 'as_built'].includes(item.status)).length;
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
