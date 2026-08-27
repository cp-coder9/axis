import { describe, expect, it } from 'vitest';

import {
  nextDraftRevision,
  summarizeSpecBudget,
  validateIssueReadiness,
  visibleSpecItems,
} from '@/lib/specforge/domain';
import type { SpecForgeAggregate, SpecForgeItem } from '@/lib/specforge/types';

const items: SpecForgeItem[] = [
  {
    id: 'client-decision', sectionId: 'section-1', code: 'FIN-001', title: 'Client tile', room: 'Lobby',
    packageName: 'Tiling', description: 'Client-facing selection', imageUrl: null, supplier: 'Tile Co', model: 'T1',
    finish: 'Limestone', dimensions: '600x1200', budgetAllowance: 40_000, estimatedCost: 48_000,
    leadTimeDays: 28, clientDecision: true, ownerRole: 'architect', reviewerRole: 'client', approverRole: 'client',
    status: 'draft', sourceRevision: 'P06', supersededBy: null, lockVersion: 1,
  },
  {
    id: 'issued-item', sectionId: 'section-1', code: 'FIN-002', title: 'Issued floor tile', room: 'Lobby',
    packageName: 'Tiling', description: 'Issued selection', imageUrl: null, supplier: 'Tile Co', model: 'T2',
    finish: 'Graphite', dimensions: '600x600', budgetAllowance: 30_000, estimatedCost: 34_000,
    leadTimeDays: 60, clientDecision: false, ownerRole: 'architect', reviewerRole: 'quantity_surveyor', approverRole: 'architect',
    status: 'issued', sourceRevision: 'P06', supersededBy: null, lockVersion: 2,
  },
  {
    id: 'private-draft', sectionId: 'section-2', code: 'ROO-001', title: 'Roof membrane', room: 'Roof',
    packageName: 'Roofing', description: 'Technical draft', imageUrl: null, supplier: 'Roof Co', model: 'R1',
    finish: 'Charcoal', dimensions: '4mm', budgetAllowance: 30_000, estimatedCost: 30_000,
    leadTimeDays: 21, clientDecision: false, ownerRole: 'engineer', reviewerRole: 'architect', approverRole: 'architect',
    status: 'draft', sourceRevision: 'P06', supersededBy: null, lockVersion: 1,
  },
];

function aggregate(overrides: Partial<SpecForgeAggregate> = {}): SpecForgeAggregate {
  return {
    id: 'workspace-1', organizationId: 'org-1', projectId: 'project-1', projectName: 'Faerie Glen Residential',
    profile: 'Residential architectural', stage: 'Design', revision: 'P06', issueStatus: 'draft', lockVersion: 1,
    budgetReviewedAt: '2026-08-26T10:00:00Z',
    sections: [{ id: 'section-1', code: '12', title: 'Finishes', discipline: 'Architecture', ownerRole: 'architect', reviewerRole: 'bep', status: 'approved', lockVersion: 1 }],
    items,
    approvals: [{ id: 'approval-1', itemId: 'client-decision', approvalType: 'client_decision', requestedRole: 'client', requestedUserId: null, status: 'approved', decisionNote: null, dueAt: null }],
    drawingFindings: [{ id: 'finding-1', itemId: 'issued-item', drawingRevisionId: 'drawing-1', severity: 'medium', finding: 'Coordinate finish extent', status: 'open' }],
    responsibilityConfirmations: [{ id: 'responsibility-1', revision: 'P06', professionalRole: 'architect', statementText: 'Confirmed', confirmedBy: 'architect-1', confirmedAt: '2026-08-27T10:00:00Z' }], issues: [], commands: [],
    ...overrides,
  };
}

describe('SpecForge domain', () => {
  it('limits client and supplier visibility to their record scopes', () => {
    expect(visibleSpecItems(aggregate(), { role: 'client', userId: 'client-1' }).map(item => item.id)).toEqual(['client-decision', 'issued-item']);
    expect(visibleSpecItems(aggregate(), { role: 'supplier', userId: 'supplier-1', packageNames: ['Tiling'] }).map(item => item.id)).toEqual(['issued-item']);
  });

  it('summarizes allowances, estimates and delivery risks', () => {
    expect(summarizeSpecBudget(items)).toEqual({
      allowance: 100_000,
      estimate: 112_000,
      delta: 12_000,
      overBudgetItemIds: ['client-decision', 'issued-item'],
      longLeadItemIds: ['issued-item'],
      staleItemIds: [],
    });
  });

  it('returns deterministic blockers for an unsafe issue', () => {
    const result = validateIssueReadiness(aggregate({
      budgetReviewedAt: null,
      approvals: [{ id: 'approval-2', itemId: 'client-decision', approvalType: 'client_decision', requestedRole: 'client', requestedUserId: null, status: 'pending', decisionNote: null, dueAt: null }],
      drawingFindings: [{ id: 'finding-2', itemId: 'issued-item', drawingRevisionId: 'drawing-2', severity: 'critical', finding: 'Clause conflicts with drawing', status: 'open' }],
    }));
    expect(result).toEqual({ ready: false, codes: ['APPROVALS_PENDING', 'BUDGET_REVIEW_PENDING', 'CRITICAL_DRAWING_FINDING'] });
  });

  it('advances a P-prefixed issue revision by one', () => {
    expect(nextDraftRevision('P06')).toBe('P07');
    expect(() => nextDraftRevision('draft')).toThrow(/P-prefixed/i);
  });
});
