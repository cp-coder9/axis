import { Surface } from '@/components/ui/Surface';
import { summarizeSpecBudget } from '@/lib/specforge/domain';
import type { SpecForgeAggregate } from '@/lib/specforge/types';

const money = (value: number) => `R ${value.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`;

export function SpecForgeOverview({ workspace, onOpenTab }: { workspace: SpecForgeAggregate; onOpenTab: (tab: string) => void }) {
  const budget = summarizeSpecBudget(workspace.items);
  const approved = workspace.items.filter(item => ['approved','issued','rfq','ordered','delivered','installed','as_built'].includes(item.status)).length;
  const openFindings = workspace.drawingFindings.filter(finding => finding.status !== 'resolved').length;
  const pendingApprovals = workspace.approvals.filter(approval => approval.status === 'pending').length;
  return (
    <div data-tool-tab="overview" className="specforge-overview">
      <div className="specforge-metrics">
        <Surface level="raised"><span>Estimate</span><strong>{money(budget.estimate)}</strong><small>{money(budget.delta)} against allowance</small></Surface>
        <Surface level="raised"><span>Approved products</span><strong>{approved} / {workspace.items.length}</strong><small>{workspace.items.length - approved} records still controlled</small></Surface>
        <Surface level="raised"><span>Long-lead items</span><strong>{budget.longLeadItemIds.length}</strong><small>56 days or longer</small></Surface>
        <Surface level="raised"><span>Drawing findings</span><strong>{openFindings}</strong><small>{pendingApprovals} approval decisions pending</small></Surface>
      </div>
      <div className="specforge-overview-grid">
        <Surface level="raised" className="specforge-panel">
          <div className="specforge-panel__head"><div><span className="specforge-kicker">Section readiness</span><h2>Professional coordination</h2></div><button type="button" onClick={() => onOpenTab('sections')}>Open sections</button></div>
          <div className="specforge-section-list">{workspace.sections.map(section => { const count = workspace.items.filter(item => item.sectionId === section.id).length; return <div key={section.id}><span className={`specforge-status specforge-status--${section.status}`}>{section.status.replace('_',' ')}</span><div><strong>{section.code} · {section.title}</strong><small>{section.discipline} · {count} linked records</small></div><b>{section.ownerRole.replaceAll('_',' ')}</b></div>; })}{workspace.sections.length === 0 && <p>No sections have been created.</p>}</div>
        </Surface>
        <Surface level="inset" className="specforge-next-gate">
          <span className="specforge-kicker">Next issue gate</span><h2>{workspace.revision} · {workspace.issueStatus}</h2>
          <p>Issue readiness is calculated from persisted section states, approvals, budget review, source revisions and drawing findings.</p>
          <ul><li>{pendingApprovals} pending approvals</li><li>{budget.staleItemIds.length} stale source records</li><li>{openFindings} open drawing findings</li></ul>
          <button type="button" onClick={() => onOpenTab('issue')}>Review issue controls</button>
        </Surface>
      </div>
      <Surface level="raised" className="specforge-panel">
        <div className="specforge-panel__head"><div><span className="specforge-kicker">Current register</span><h2>Recently coordinated specifications</h2></div><button type="button" onClick={() => onOpenTab('products')}>View register</button></div>
        <div className="specforge-recent-items">{workspace.items.slice(0, 4).map(item => <article key={item.id}><div className="specforge-material-swatch" data-finish={item.finish ? 'specified' : 'unset'} /><div><span>{item.code}</span><strong>{item.title}</strong><small>{item.room} · {item.packageName}</small></div><b>{money(item.estimatedCost)}</b></article>)}</div>
      </Surface>
    </div>
  );
}
