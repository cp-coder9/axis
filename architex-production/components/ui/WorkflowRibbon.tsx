export type WorkflowStep = { id: string; label: string; state: 'complete' | 'current' | 'upcoming' | 'blocked' };
export type WorkflowRibbonProps = { label: string; steps: readonly WorkflowStep[] };
export function WorkflowRibbon({ label, steps }: WorkflowRibbonProps) { return <ol className="ax-workflow-ribbon" aria-label={label}>{steps.map((step) => <li key={step.id} data-state={step.state}>{step.label}</li>)}</ol>; }
