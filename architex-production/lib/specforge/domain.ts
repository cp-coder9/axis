import type {
  SpecForgeAggregate,
  SpecForgeItem,
  SpecForgeRoleContext,
} from '@/lib/specforge/types';

export type IssueBlockerCode =
  | 'SECTIONS_UNAPPROVED'
  | 'APPROVALS_PENDING'
  | 'BUDGET_REVIEW_PENDING'
  | 'STALE_SOURCE'
  | 'CRITICAL_DRAWING_FINDING';

const FULL_VIEW_ROLES = new Set([
  'architect', 'bep', 'quantity_surveyor', 'firm_admin', 'organisation_admin', 'admin', 'platform_admin',
]);
const ISSUED_STATUSES = new Set(['issued', 'rfq', 'quoted', 'po_raised', 'ordered', 'in_transit', 'delivered', 'installed', 'as_built']);
const ASSIGNED_ROLES = new Set(['engineer', 'energy_professional', 'fire_engineer', 'freelancer']);
const PACKAGE_ROLES = new Set(['subcontractor', 'supplier']);

export function visibleSpecItems(workspace: SpecForgeAggregate, context: SpecForgeRoleContext): SpecForgeItem[] {
  if (FULL_VIEW_ROLES.has(context.role)) return workspace.items;
  if (context.role === 'client' || context.role === 'developer') {
    return workspace.items.filter(item => item.clientDecision || ['approved', ...ISSUED_STATUSES].includes(item.status));
  }
  if (ASSIGNED_ROLES.has(context.role)) {
    return workspace.items.filter(item => [item.ownerRole, item.reviewerRole, item.approverRole].includes(context.role));
  }
  if (PACKAGE_ROLES.has(context.role)) {
    const packages = new Set(context.packageNames ?? []);
    return workspace.items.filter(item => packages.has(item.packageName) && ISSUED_STATUSES.has(item.status));
  }
  if (context.role === 'contractor' || context.role === 'site_manager' || context.role === 'cpm') {
    return workspace.items.filter(item => ISSUED_STATUSES.has(item.status));
  }
  return [];
}

export function summarizeSpecBudget(items: SpecForgeItem[]) {
  const allowance = items.reduce((sum, item) => sum + item.budgetAllowance, 0);
  const estimate = items.reduce((sum, item) => sum + item.estimatedCost, 0);
  return {
    allowance,
    estimate,
    delta: estimate - allowance,
    overBudgetItemIds: items.filter(item => item.estimatedCost > item.budgetAllowance).map(item => item.id),
    longLeadItemIds: items.filter(item => item.leadTimeDays >= 56).map(item => item.id),
    staleItemIds: items.filter(item => item.supersededBy !== null).map(item => item.id),
  };
}

export function validateIssueReadiness(workspace: SpecForgeAggregate): { ready: boolean; codes: IssueBlockerCode[] } {
  const codes = new Set<IssueBlockerCode>();
  if (workspace.sections.some(section => !['approved', 'issued'].includes(section.status))) codes.add('SECTIONS_UNAPPROVED');
  if (workspace.approvals.some(approval => approval.status === 'pending')) codes.add('APPROVALS_PENDING');
  if (!workspace.budgetReviewedAt) codes.add('BUDGET_REVIEW_PENDING');
  if (workspace.items.some(item => item.supersededBy !== null)) codes.add('STALE_SOURCE');
  if (workspace.drawingFindings.some(finding => finding.severity === 'critical' && finding.status !== 'resolved')) codes.add('CRITICAL_DRAWING_FINDING');
  return { ready: codes.size === 0, codes: [...codes] };
}

export function nextDraftRevision(revision: string): string {
  const match = /^P(\d+)$/i.exec(revision);
  if (!match) throw new Error('SpecForge revisions must be P-prefixed numbers.');
  const width = match[1].length;
  return `P${String(Number(match[1]) + 1).padStart(width, '0')}`;
}
