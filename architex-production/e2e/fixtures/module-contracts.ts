export type ModuleInteraction = {
  target: { kind: 'button' | 'testId'; value: string };
  observable: { kind: 'text' | 'role'; value: string };
};

export type ModuleContract = {
  id: string;
  landmark: string;
  firstTab: string;
  role: 'architect';
  readAssertion: string;
  interaction: ModuleInteraction;
};

// Phase 8 Task 2, Batch A. These are deliberate workflow assertions, not
// shell-open checks. The release gate below remains fail-closed until all 47
// canonical module contracts have comparable evidence.
export const MODULE_CONTRACTS: readonly ModuleContract[] = [
  { id: 'meetings', landmark: 'Meetings sections', firstTab: 'My day', role: 'architect', readAssertion: 'Meeting', interaction: { target: { kind: 'testId', value: 'meetings-schedule' }, observable: { kind: 'text', value: '1. Context' } } },
  { id: 'practice', landmark: 'Practice sections', firstTab: 'Dashboard', role: 'architect', readAssertion: 'Command', interaction: { target: { kind: 'button', value: 'Action Centre' }, observable: { kind: 'text', value: 'Action Centre' } } },
  { id: 'wingman', landmark: 'Wingman sections', firstTab: 'Conversations', role: 'architect', readAssertion: 'Wingman', interaction: { target: { kind: 'button', value: 'Import BYOAI' }, observable: { kind: 'text', value: 'Active inference route' } } },
  { id: 'engineering_calc', landmark: 'Calculation inputs', firstTab: 'Steel Design', role: 'architect', readAssertion: "Engineer's Calculation Hub", interaction: { target: { kind: 'button', value: 'Calculate' }, observable: { kind: 'role', value: 'alert' } } },
  { id: 'planning', landmark: 'Town Planning sections', firstTab: 'Dashboard', role: 'architect', readAssertion: 'Planning', interaction: { target: { kind: 'button', value: 'Applications' }, observable: { kind: 'text', value: 'Active SPLUMA Land Use Filings' } } },
  { id: 'municipal', landmark: 'Municipal submission sections', firstTab: 'Readiness Overview', role: 'architect', readAssertion: 'Municipal', interaction: { target: { kind: 'button', value: 'Land Use & Zoning' }, observable: { kind: 'text', value: 'Land Use & Zoning Parameters' } } },
  { id: 'xa', landmark: 'XA calculation sections', firstTab: 'Overview', role: 'architect', readAssertion: 'SANS 10400-XA', interaction: { target: { kind: 'button', value: 'Basics & Zones' }, observable: { kind: 'text', value: 'Building basics and climate zone' } } },
  { id: 'forms', landmark: 'Form system sections', firstTab: 'Template Library', role: 'architect', readAssertion: 'Integrated Form', interaction: { target: { kind: 'button', value: 'My Drafts' }, observable: { kind: 'text', value: 'FRM-001' } } },
  { id: 'specforge', landmark: 'SpecForge workflow', firstTab: 'Overview', role: 'architect', readAssertion: 'SpecForge', interaction: { target: { kind: 'button', value: 'Trade Sections' }, observable: { kind: 'text', value: 'Performance, workmanship and product clauses' } } },
  { id: 'bom', landmark: 'Bill of quantities sections', firstTab: 'Drawing Takeoff', role: 'architect', readAssertion: 'BoM', interaction: { target: { kind: 'button', value: 'BoM Lines' }, observable: { kind: 'text', value: 'Trade Quantities & Measured Line Items' } } },
  { id: 'itp', landmark: 'Inspection test plan sections', firstTab: 'Overview', role: 'architect', readAssertion: 'Inspection', interaction: { target: { kind: 'button', value: 'Inspection Items' }, observable: { kind: 'text', value: 'ITP-001' } } },
  { id: 'safety', landmark: 'Safety compliance sections', firstTab: 'Overview', role: 'architect', readAssertion: 'Safety', interaction: { target: { kind: 'button', value: 'Permits to Work' }, observable: { kind: 'text', value: 'Active Permits to Work' } } },
];

export const CANONICAL_MODULE_COUNT = 47;
