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
  { id: 'feedback', landmark: 'Feedback intelligence sections', firstTab: 'Overview Dashboard', role: 'architect', readAssertion: 'Feedback', interaction: { target: { kind: 'button', value: 'Feedback Clusters' }, observable: { kind: 'text', value: 'Drawing performance' } } },
  { id: 'project_passport', landmark: 'Project Passport sections', firstTab: 'Overview', role: 'architect', readAssertion: 'Project Passport', interaction: { target: { kind: 'button', value: 'Identity' }, observable: { kind: 'text', value: 'Project Identity' } } },
  { id: 'project_explorer', landmark: 'Project Explorer sections', firstTab: 'Universal Search', role: 'architect', readAssertion: 'Project Explorer', interaction: { target: { kind: 'button', value: 'Project Timeline' }, observable: { kind: 'text', value: 'Project Timeline' } } },
  { id: 'professional_directory', landmark: 'Professional directory sections', firstTab: 'Professional Directory', role: 'architect', readAssertion: 'Professional Directory', interaction: { target: { kind: 'button', value: 'Verification Status' }, observable: { kind: 'text', value: 'Council Verification' } } },
  { id: 'team_workspace', landmark: 'Team workspace sections', firstTab: 'RACI Matrix', role: 'architect', readAssertion: 'Team Workspace', interaction: { target: { kind: 'button', value: 'Availability' }, observable: { kind: 'text', value: 'Availability (next 14 days)' } } },
  { id: 'inbox_action', landmark: 'Action Centre sections', firstTab: 'My Actions', role: 'architect', readAssertion: 'Action Centre', interaction: { target: { kind: 'button', value: 'Decision Escalations' }, observable: { kind: 'text', value: 'Decision Escalations' } } },
  { id: 'issues_rfis', landmark: 'Issues and RFIs sections', firstTab: 'RFI Register', role: 'architect', readAssertion: 'Issues', interaction: { target: { kind: 'button', value: 'Response Workflow' }, observable: { kind: 'text', value: 'Response Workflow' } } },
  { id: 'approvals_queue', landmark: 'Approvals Queue sections', firstTab: 'Pending', role: 'architect', readAssertion: 'Approvals Queue', interaction: { target: { kind: 'button', value: 'Decision History' }, observable: { kind: 'text', value: 'Decision History' } } },
  { id: 'compliance_hub', landmark: 'Compliance Hub sections', firstTab: 'Compliance Dashboard', role: 'architect', readAssertion: 'Compliance Hub', interaction: { target: { kind: 'button', value: 'Gap Register' }, observable: { kind: 'text', value: 'GAP-001' } } },
  { id: 'environmental_heritage', landmark: 'Environmental and Heritage sections', firstTab: 'Overview', role: 'architect', readAssertion: 'Environmental', interaction: { target: { kind: 'button', value: 'Heritage Impact' }, observable: { kind: 'text', value: 'Heritage Impact — SAHRA' } } },
  { id: 'eia_workspace', landmark: 'EIA Workspace sections', firstTab: 'EIA Workspace', role: 'architect', readAssertion: 'EIA Workspace', interaction: { target: { kind: 'button', value: 'EMPr' }, observable: { kind: 'text', value: 'Environmental Management Programme' } } },
  { id: 'refuse_calculator', landmark: 'Refuse Area Calculator sections', firstTab: 'Refuse Area Calculator', role: 'architect', readAssertion: 'Refuse Area Calculator', interaction: { target: { kind: 'button', value: 'Results & Report' }, observable: { kind: 'text', value: 'Refuse storage compliance' } } },
  { id: 'nhbrc_enrolment', landmark: 'NHBRC Enrolment sections', firstTab: 'NHBRC Enrolment', role: 'architect', readAssertion: 'NHBRC', interaction: { target: { kind: 'button', value: 'Requirements' }, observable: { kind: 'text', value: 'Requirements' } } },
  { id: 'documents_drawings', landmark: 'Documents and Drawings sections', firstTab: 'Register', role: 'architect', readAssertion: 'Documents', interaction: { target: { kind: 'button', value: 'Transmittals' }, observable: { kind: 'text', value: 'Transmittal' } } },
  { id: 'survey_geomatics', landmark: 'Survey and Geomatics sections', firstTab: 'Survey Register', role: 'architect', readAssertion: 'Survey', interaction: { target: { kind: 'button', value: 'Boundaries & Pegs' }, observable: { kind: 'text', value: 'Boundary' } } },
  { id: 'bim_ifc', landmark: 'BIM and IFC sections', firstTab: 'Overview', role: 'architect', readAssertion: 'BIM', interaction: { target: { kind: 'button', value: 'Model Register' }, observable: { kind: 'text', value: 'Model Register' } } },
  { id: 'fee_proposal', landmark: 'Fee Proposal sections', firstTab: 'Fee Proposals', role: 'architect', readAssertion: 'Fee', interaction: { target: { kind: 'button', value: 'Acceptance' }, observable: { kind: 'text', value: 'Acceptance' } } },
  { id: 'insurance_register', landmark: 'Insurance Register sections', firstTab: 'Insurance Policies', role: 'architect', readAssertion: 'Insurance', interaction: { target: { kind: 'button', value: 'Statutory Requirements' }, observable: { kind: 'text', value: 'Statutory Requirements' } } },
  { id: 'rfq_marketplace', landmark: 'RFQ Marketplace sections', firstTab: 'RFQ Pipeline', role: 'architect', readAssertion: 'RFQ', interaction: { target: { kind: 'button', value: 'Quote Comparison' }, observable: { kind: 'text', value: 'Quote Comparison' } } },
  { id: 'supplier_catalog', landmark: 'Supplier Catalogue sections', firstTab: 'Supplier Catalogue', role: 'architect', readAssertion: 'Supplier', interaction: { target: { kind: 'button', value: 'Verification' }, observable: { kind: 'text', value: 'Verification' } } },
  { id: 'market_insights', landmark: 'Market Insights sections', firstTab: 'Market Insights', role: 'architect', readAssertion: 'Market', interaction: { target: { kind: 'button', value: 'Benchmarks' }, observable: { kind: 'text', value: 'Benchmarks' } } },
  { id: 'contract_admin', landmark: 'Contract Admin sections', firstTab: 'Contracts', role: 'architect', readAssertion: 'Contract', interaction: { target: { kind: 'button', value: 'Variation Orders' }, observable: { kind: 'text', value: 'Variation' } } },
  { id: 'payments_escrow', landmark: 'Payments Escrow sections', firstTab: 'Payment Workflow', role: 'architect', readAssertion: 'Payment', interaction: { target: { kind: 'button', value: 'Approval & Release' }, observable: { kind: 'text', value: 'Approval' } } },
  { id: 'dispute_resolution', landmark: 'Dispute Resolution sections', firstTab: 'Dispute Notices', role: 'architect', readAssertion: 'Dispute', interaction: { target: { kind: 'button', value: 'Adjudication' }, observable: { kind: 'text', value: 'Adjudication' } } },
];

export const CANONICAL_MODULE_COUNT = 47;
