import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Surface } from '@/components/ui/Surface';
import { validateIssueReadiness } from '@/lib/specforge/domain';
import type { SpecForgeAggregate, SpecForgeDownstreamJob, SpecForgeIssueResult } from '@/lib/specforge/types';

interface Props {
  workspace: SpecForgeAggregate;
  canIssue: boolean;
  onValidate: () => Promise<{ ready: boolean; codes: string[] }>;
  onIssue: (input: { title: string; audience: string }) => Promise<SpecForgeIssueResult>;
  onListJobs: (issueId: string) => Promise<SpecForgeDownstreamJob[]>;
}

const jobLabels: Record<string, string> = {
  'specforge.action-centre': 'Action centre',
  'specforge.messaging': 'Messaging',
  'specforge.programme': 'Programme',
  'specforge.bom-sync': 'BoM sync',
  'specforge.rfq': 'RFQ',
  'specforge.document': 'Document generation',
  'specforge.escrow': 'Escrow',
};

const jobStatus = (job: SpecForgeDownstreamJob) => {
  if (job.status === 'pending') return 'Queued';
  if (job.status === 'processing') return 'Processing';
  if (job.status === 'done') return 'Completed';
  if (job.status === 'integration_required') return 'Integration required';
  return 'Failed';
};

export function SpecForgeIssue({ workspace, canIssue, onValidate, onIssue, onListJobs }: Props) {
  const readiness = validateIssueReadiness(workspace);
  const [message, setMessage] = useState<string | null>(null);
  const [jobs, setJobs] = useState<SpecForgeDownstreamJob[]>([]);
  const [busy, setBusy] = useState(false);
  const [issuedId, setIssuedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const issue = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const serverReadiness = await onValidate();
      if (!serverReadiness.ready) {
        setMessage(`Issue blocked: ${serverReadiness.codes.join(', ')}`);
        return;
      }
      const result = await onIssue({ title: `Specification issue ${workspace.revision}`, audience: 'Project team' });
      setJobs(result.downstream);
      setIssuedId(result.issue.id);
      setMessage(`Issue ${result.issue.revision} created. Downstream work is shown with its actual queue state.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Issue failed.');
    } finally {
      setBusy(false);
    }
  };

  const refreshJobs = async () => {
    if (!issuedId) return;
    setRefreshing(true);
    try {
      setJobs(await onListJobs(issuedId));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Downstream statuses could not be refreshed.');
    } finally {
      setRefreshing(false);
    }
  };

  return <div data-tool-tab="issue" className="specforge-issue-layout">
    <Surface level="raised" className="specforge-panel">
      <div className="specforge-panel__head"><div><span className="specforge-kicker">Immutable issue history</span><h2>Issue register</h2></div><span>{workspace.issues.length} issues</span></div>
      {workspace.issues.map(item => <article className="specforge-issue-row" key={item.id}><div><code>{item.revision}</code><strong>{item.title}</strong><small>{item.audience} · {item.issuedAt ?? 'draft'}</small></div><span className={`specforge-status specforge-status--${item.status}`}>{item.status}</span></article>)}
      {workspace.issues.length === 0 && <p className="specforge-empty-copy">No issue has been created for this workspace.</p>}
      {jobs.length > 0 && <section className="specforge-handoffs" aria-label="Downstream job status"><div className="specforge-panel__head"><div><span className="specforge-kicker">Real downstream state</span><h3>Issue handoffs</h3></div><div className="specforge-handoff-actions"><span>{jobs.length} jobs</span><Button size="sm" variant="quiet" disabled={refreshing} onClick={() => void refreshJobs()}>{refreshing ? 'Refreshing…' : 'Refresh statuses'}</Button></div></div>{jobs.map(job => <article key={job.id}><div><strong>{jobLabels[job.jobType] ?? job.jobType}</strong>{job.lastError && <small>{job.lastError}</small>}</div><span className={`specforge-status specforge-status--${job.status}`}>{jobStatus(job)}</span></article>)}</section>}
    </Surface>
    <Surface level="inset" className="specforge-issue-gate">
      <span className="specforge-kicker">Issue gate · {workspace.revision}</span>
      <h2>{readiness.ready ? 'Ready for server validation' : 'Controls require attention'}</h2>
      <p>The server revalidates every gate inside the issue transaction.</p>
      <ul>{readiness.codes.map(code => <li key={code}>{code.replaceAll('_',' ').toLowerCase()}</li>)}{readiness.ready && <li>Local readiness checks complete</li>}</ul>
      {canIssue && <Button disabled={busy} onClick={() => void issue()}>{busy ? 'Issuing…' : `Validate and issue ${workspace.revision}`}</Button>}
      {message && <small role="status">{message}</small>}
    </Surface>
  </div>;
}
