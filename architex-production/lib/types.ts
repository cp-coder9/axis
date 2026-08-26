export type RoleKey =
  | 'architect'
  | 'client'
  | 'bep'
  | 'engineer'
  | 'quantity_surveyor'
  | 'town_planner'
  | 'land_surveyor'
  | 'energy_professional'
  | 'fire_engineer'
  | 'cpm'
  | 'contractor'
  | 'subcontractor'
  | 'supplier'
  | 'site_manager'
  | 'health_safety'
  | 'developer'
  | 'freelancer'
  | 'firm_admin'
  | 'organisation_admin'
  | 'admin'
  | 'platform_admin';

export type StageKey =
  | 'Brief'
  | 'Appoint'
  | 'Design'
  | 'Comply'
  | 'Procure'
  | 'Build'
  | 'Pay'
  | 'Close-out';

export type OrientationMode = 'project' | 'standalone';

export type ToolTone = 'core' | 'teal' | 'cobalt' | 'lavender' | 'coral' | 'amber';
export type ToolVersion = `${number}.${number}`;

export interface ToolTabConfig {
  key?: string;
  label: string;
  group?: string;
  icon?: string;
  kind?: string;
  badge?: string;
  text?: string;
  fn?: string;
  arg?: string;
}

export interface ToolDefinition {
  id: string;
  version: ToolVersion;
  name: string;
  icon: string;
  tone: ToolTone;
  group: string;
  stage: string;
  summary: string;
  status: 'live' | 'scaffold';
  source?: string;
  tabs: ToolTabConfig[];
}

export interface RoleProfile {
  code: string;
  label: string;
  description: string;
  focus: string;
  tags: string[];
  meetingFocus: string;
}

export interface ProjectEntity {
  id: string;
  name: string;
  location: string;
  stage: StageKey;
  progress: number;
  client: string;
  professional: string;
  municipality: string;
  revision: string;
  budget: number;
  code: string;
}

export interface FeedbackRecord {
  id: string;
  title: string;
  category: 'Bug' | 'Feature request' | 'Usability' | 'Praise';
  status: 'Received' | 'Reviewing' | 'Planned' | 'Shipped' | 'Declined';
  date: string;
  context: string;
  description?: string;
  severityScore?: number;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'frustrated';
}

export interface MeetingOutcome {
  id: string;
  type: 'Decision' | 'Action' | 'Risk proposal' | 'Instruction draft';
  title: string;
  owner: string;
  due: string;
  destination: 'Action Centre' | 'Project Record' | 'Risk Register' | 'Site Instruction';
  state: 'pending' | 'accepted' | 'rejected';
  source: string;
}

export interface MeetingTranscriptSegment {
  time: string;
  speaker: string;
  text: string;
  confidence: string;
}

export interface MeetingMinuteItem {
  type: 'Discussion' | 'Decision candidate' | 'Action candidate';
  text: string;
  source: string;
}

export interface MeetingAgendaItem {
  title: string;
  owner: string;
  minutes: number;
}

export interface MeetingItem {
  id: string;
  time: string;
  title: string;
  type: string;
  stage: StageKey;
  chair: string;
  status: string;
  attendees: number;
  actions: number;
  date?: string;
  project?: string;
  scope?: string;
  retention?: string;
}

export type EngineeringCalcStatus = 'saved' | 'under_review' | 'approved';
export type { EngineeringCalculationPayloadV1, Quantity, CalculationResultDto, StandardReferenceDto } from './calculations/types';
