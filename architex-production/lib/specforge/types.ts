import type { RoleKey, StageKey } from '@/lib/types';

export type SpecForgeItemStatus =
  | 'draft'
  | 'needs_decision'
  | 'approved'
  | 'issued'
  | 'rfq'
  | 'quoted'
  | 'po_raised'
  | 'ordered'
  | 'in_transit'
  | 'delivered'
  | 'installed'
  | 'as_built'
  | 'superseded';

export type SpecForgeSectionStatus = 'draft' | 'needs_review' | 'approved' | 'issued';
export type SpecForgeApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type SpecForgeFindingSeverity = 'low' | 'medium' | 'high' | 'critical';
export type SpecForgeFindingStatus = 'open' | 'reviewed' | 'resolved';
export type SpecForgeIssueStatus = 'draft' | 'issued' | 'superseded';
export type SpecForgeCommandStatus = 'queued' | 'running' | 'completed' | 'failed' | 'integration_required';
export type SpecForgeJobStatus = 'pending' | 'processing' | 'done' | 'failed' | 'integration_required';

export interface SpecForgeRoleContext {
  role: RoleKey;
  userId: string;
  packageNames?: string[];
}

export interface SpecForgeSection {
  id: string;
  code: string;
  title: string;
  discipline: string;
  ownerRole: RoleKey;
  reviewerRole: RoleKey | null;
  status: SpecForgeSectionStatus;
  lockVersion: number;
}

export interface SpecForgeItem {
  id: string;
  sectionId: string;
  code: string;
  title: string;
  room: string;
  packageName: string;
  description: string;
  imageUrl: string | null;
  supplier: string | null;
  model: string | null;
  finish: string | null;
  dimensions: string | null;
  budgetAllowance: number;
  estimatedCost: number;
  leadTimeDays: number;
  clientDecision: boolean;
  ownerRole: RoleKey;
  reviewerRole: RoleKey | null;
  approverRole: RoleKey | null;
  status: SpecForgeItemStatus;
  sourceRevision: string;
  supersededBy: string | null;
  lockVersion: number;
}

export interface SpecForgeApproval {
  id: string;
  itemId: string;
  approvalType: string;
  requestedRole: RoleKey;
  requestedUserId: string | null;
  status: SpecForgeApprovalStatus;
  decisionNote: string | null;
  dueAt: string | null;
}

export interface SpecForgeResponsibilityConfirmation {
  id: string;
  revision: string;
  professionalRole: RoleKey;
  statementText: string;
  confirmedBy: string;
  confirmedAt: string;
}

export interface SpecForgeDrawingFinding {
  id: string;
  itemId: string | null;
  drawingRevisionId: string;
  severity: SpecForgeFindingSeverity;
  finding: string;
  status: SpecForgeFindingStatus;
}

export interface SpecForgeIssue {
  id: string;
  revision: string;
  title: string;
  audience: string;
  status: SpecForgeIssueStatus;
  snapshotHash: string;
  issuedAt: string | null;
}

export interface SpecForgeCommand {
  id: string;
  commandType: string;
  status: SpecForgeCommandStatus;
  lastError: string | null;
}

export interface SpecForgeDownstreamJob {
  id: string;
  jobType: string;
  status: SpecForgeJobStatus;
  lastError: string | null;
}

export interface SpecForgeIssueResult {
  issue: SpecForgeIssue;
  downstream: SpecForgeDownstreamJob[];
  idempotent: boolean;
}

export type SpecForgeProcurementTarget = 'quoted' | 'po_raised' | 'ordered' | 'in_transit' | 'delivered' | 'installed';
export interface SpecForgeProcurementTransition {
  id: string;
  itemId: string;
  fromStatus: SpecForgeItemStatus;
  toStatus: SpecForgeProcurementTarget;
  sourceLockVersion: number;
  connectorStatus: 'completed' | 'failed' | 'integration_required';
  connectorError: string | null;
}
export interface SpecForgeProcurementResult {
  item: SpecForgeItem;
  transition: SpecForgeProcurementTransition;
  idempotent: boolean;
}

export interface SpecForgeCandidate {
  id: string;
  sourceType: 'project_memory' | 'practice_library' | 'platform_library' | 'supplier' | 'ai' | 'drawing';
  title: string;
  payload: Partial<SpecForgeItem>;
  sourceLabel: string;
  confidence: number | null;
  acceptedAt: string | null;
}

export interface SpecForgeAggregate {
  id: string;
  organizationId: string;
  projectId: string;
  projectName: string;
  profile: string;
  stage: StageKey;
  revision: string;
  issueStatus: SpecForgeIssueStatus;
  lockVersion: number;
  budgetReviewedAt: string | null;
  sections: SpecForgeSection[];
  items: SpecForgeItem[];
  approvals: SpecForgeApproval[];
  responsibilityConfirmations: SpecForgeResponsibilityConfirmation[];
  drawingFindings: SpecForgeDrawingFinding[];
  issues: SpecForgeIssue[];
  commands: SpecForgeCommand[];
}
