import { ProjectEntity, RoleKey, RoleProfile, StageKey, ToolDefinition, MeetingItem, MeetingOutcome, MeetingTranscriptSegment, MeetingMinuteItem, MeetingAgendaItem, FeedbackRecord } from './types';

export const INITIAL_PROJECT: ProjectEntity = {
  id: 'proj-faerie-glen',
  name: 'Faerie Glen Residential',
  code: 'FGR-2026',
  location: 'Pretoria, Gauteng',
  stage: 'Design',
  progress: 46,
  client: 'Evergreen Property Holdings',
  professional: 'Justin Kruger · PrArch',
  municipality: 'City of Tshwane',
  revision: 'P03',
  budget: 47500000
};

export const ALL_PROJECTS: ProjectEntity[] = [
  INITIAL_PROJECT,
  {
    id: 'proj-camps-bay',
    name: 'Camps Bay Residence',
    code: 'CBR-2026',
    location: 'Cape Town, Western Cape',
    stage: 'Procure',
    progress: 72,
    client: 'Atlantic Coastline Properties',
    professional: 'Sarah van der Merwe · PrArch',
    municipality: 'City of Cape Town',
    revision: 'C02',
    budget: 32800000
  },
  {
    id: 'proj-waterfall-office',
    name: 'Waterfall Business Park Tower B',
    code: 'WFP-2026',
    location: 'Midrand, Gauteng',
    stage: 'Build',
    progress: 58,
    client: 'Redefine Capital Fund',
    professional: 'Michael Patel · PrArch',
    municipality: 'City of Johannesburg',
    revision: 'P02',
    budget: 85000000
  },
  {
    id: 'proj-sandton-tower',
    name: 'Sandton Mixed-Use Complex',
    code: 'SMC-2026',
    location: 'Sandton, Johannesburg',
    stage: 'Comply',
    progress: 35,
    client: 'Greenfield Developments (Pty) Ltd',
    professional: 'Justin Kruger · PrArch',
    municipality: 'City of Johannesburg',
    revision: 'Rev B',
    budget: 140000000
  }
];

export const STAGES: StageKey[] = [
  'Brief',
  'Appoint',
  'Design',
  'Comply',
  'Procure',
  'Build',
  'Pay',
  'Close-out'
];

export const STAGE_COPY: Record<StageKey, string> = {
  Brief: 'Define opportunity, outcomes, constraints and initial scope.',
  Appoint: 'Build the team, agree fees, execute appointments and allocate responsibility.',
  Design: 'Coordinate design information, engineering analysis, specifications, quantities and technical reviews.',
  Comply: 'Resolve statutory, municipal, SANS and specialist compliance with traceable evidence.',
  Procure: 'Package scope, issue RFQs, compare offers and align awards with the programme.',
  Build: 'Coordinate site execution, safety, quality, engineering queries, inspections, instructions and progress.',
  Pay: 'Manage valuations, claims, invoices, approvals and payment governance.',
  'Close-out': 'Complete snags, handover records, certificates, final accounts and archive.'
};

export const ROLES: { key: RoleKey; label: string }[] = [
  { key: 'architect', label: 'Architect (PrArch)' },
  { key: 'client', label: 'Client / Property Owner' },
  { key: 'bep', label: 'Built Environment Professional' },
  { key: 'engineer', label: 'Consulting Engineer (PrEng)' },
  { key: 'quantity_surveyor', label: 'Quantity Surveyor (PrQS)' },
  { key: 'town_planner', label: 'Town Planner (PrPln)' },
  { key: 'land_surveyor', label: 'Land Surveyor' },
  { key: 'energy_professional', label: 'Energy Professional' },
  { key: 'fire_engineer', label: 'Fire Engineer' },
  { key: 'cpm', label: 'Construction Project Manager' },
  { key: 'contractor', label: 'Principal Contractor' },
  { key: 'subcontractor', label: 'Trade Subcontractor' },
  { key: 'supplier', label: 'Material Supplier' },
  { key: 'site_manager', label: 'Site Manager / Clerk of Works' },
  { key: 'health_safety', label: 'Health & Safety Officer (CHSO)' },
  { key: 'developer', label: 'Property Developer' },
  { key: 'freelancer', label: 'Specialist Freelancer' },
  { key: 'firm_admin', label: 'Practice Administrator' },
  { key: 'admin', label: 'Practice Operations Admin' },
  { key: 'platform_admin', label: 'Platform Super-Administrator' }
];

export const ROLE_PROFILES: Record<RoleKey, RoleProfile> = {
  client: {
    code: 'CL',
    label: 'Client',
    description: 'Decisions, progress, approvals and payments',
    focus: 'decisions, attendance, project progress and published records',
    tags: ['Health', 'Decisions', 'Payments'],
    meetingFocus: 'executive sign-offs, milestone budgets and decision gates'
  },
  architect: {
    code: 'AR',
    label: 'Architect',
    description: 'Design coordination, documentation, programme and compliance',
    focus: 'agendas, design coordination, minutes, actions and project record links',
    tags: ['Design lead', 'Coordination', 'Compliance'],
    meetingFocus: 'design lead sign-offs, municipal submissions, SpecForge and coordination'
  },
  bep: {
    code: 'BE',
    label: 'Built Environment Professional',
    description: 'Multidisciplinary technical coordination and delivery',
    focus: 'technical reviews, interdisciplinary interfaces and delivery packages',
    tags: ['Technical', 'Reviews', 'Approvals'],
    meetingFocus: 'technical coordination, package alignment and review submissions'
  },
  engineer: {
    code: 'EN',
    label: 'Engineer',
    description: 'Engineering deliverables, inspections, RFIs and sign-off',
    focus: 'technical agenda items, evidence, actions, RFIs and sign-off boundaries',
    tags: ['Technical', 'Inspections', 'RFIs'],
    meetingFocus: 'structural/civil ITPs, hold point releases and calculation reviews'
  },
  quantity_surveyor: {
    code: 'QS',
    label: 'Quantity Surveyor',
    description: 'Fees, quantities, procurement, valuations and cost control',
    focus: 'commercial meetings, valuations, recommendations and payment distinctions',
    tags: ['Commercial', 'BoQ', 'Valuations'],
    meetingFocus: 'BoM/BoQ pricing, payment certificates, cost deltas and claims'
  },
  town_planner: {
    code: 'TP',
    label: 'Town Planner',
    description: 'Land-use applications, conditions and authority workflows',
    focus: 'planning applications, authority meetings and public participation',
    tags: ['Planning', 'Authorities', 'Conditions'],
    meetingFocus: 'SPLUMA applications, municipal tribunals, objections and zoning checks'
  },
  land_surveyor: {
    code: 'LS',
    label: 'Land Surveyor',
    description: 'Survey records, site data and cadastral deliverables',
    focus: 'survey coordination, boundary meetings and site data reviews',
    tags: ['Survey', 'Site data', 'Records'],
    meetingFocus: 'cadastral surveys, boundary peg verification and contour datasets'
  },
  energy_professional: {
    code: 'EP',
    label: 'Energy Professional',
    description: 'Energy modelling, XA compliance and evidence',
    focus: 'energy compliance reviews and XA evidence discussions',
    tags: ['Energy', 'XA', 'Evidence'],
    meetingFocus: 'SANS 10400-XA prescriptive calculations, fenestration and hot water'
  },
  fire_engineer: {
    code: 'FE',
    label: 'Fire Engineer',
    description: 'Fire strategy, regulatory review and compliance',
    focus: 'fire strategy, regulatory review and compliance evidence',
    tags: ['Fire', 'Compliance', 'Sign-off'],
    meetingFocus: 'SANS 10400-T rational design, escape widths and hydrant plans'
  },
  cpm: {
    code: 'PM',
    label: 'Construction Project Manager',
    description: 'Programme, resources, risks and construction delivery',
    focus: 'programme, risk, action ownership and meeting governance',
    tags: ['Programme', 'Resources', 'Risk'],
    meetingFocus: 'programme progress, risk register tracking and action accountability'
  },
  contractor: {
    code: 'CO',
    label: 'Contractor',
    description: 'Site execution, RFIs, quality, safety and claims',
    focus: 'site progress, instructions, RFIs, safety, quality and claims',
    tags: ['Build', 'Site', 'Claims'],
    meetingFocus: 'site diary, procurement logistics, safety file and site instructions'
  },
  subcontractor: {
    code: 'SC',
    label: 'Subcontractor',
    description: 'Assigned packages, evidence, progress and close-out',
    focus: 'assigned package coordination and evidence submission',
    tags: ['Packages', 'Evidence', 'Progress'],
    meetingFocus: 'trade package compliance, inspection requests and QA tests'
  },
  supplier: {
    code: 'SU',
    label: 'Supplier',
    description: 'Product data, RFQs, orders and deliveries',
    focus: 'product clarifications, RFQs and delivery coordination',
    tags: ['Products', 'RFQ', 'Delivery'],
    meetingFocus: 'product catalog specs, delivery schedules and quotation returns'
  },
  site_manager: {
    code: 'SM',
    label: 'Site Manager',
    description: 'Daily execution, labour, safety and quality records',
    focus: 'daily coordination, site evidence, actions and attendance',
    tags: ['Site diary', 'Quality', 'Safety'],
    meetingFocus: 'daily workforce logs, toolbox talks and material intake'
  },
  health_safety: {
    code: 'HS',
    label: 'Health & Safety Officer',
    description: 'Safety file, permits, incidents and HIRA',
    focus: 'safety meetings, permits, HIRA and incident reviews',
    tags: ['Safety file', 'HIRA', 'Permits'],
    meetingFocus: 'Construction Regulations 2014, Permit-to-Work, HIRA matrix and incidents'
  },
  developer: {
    code: 'DV',
    label: 'Developer',
    description: 'Portfolio performance, budget, decisions and risk',
    focus: 'project decisions, budget and risk discussions',
    tags: ['Portfolio', 'Budget', 'Risk'],
    meetingFocus: 'feasibility milestones, municipal pacing and portfolio yield'
  },
  freelancer: {
    code: 'FR',
    label: 'Freelancer',
    description: 'Assigned tasks, time and deliverables',
    focus: 'assigned task coordination and deliverable reviews',
    tags: ['Tasks', 'Time', 'Deliverables'],
    meetingFocus: 'work package delivery, timesheet logging and drawing deliverables'
  },
  firm_admin: {
    code: 'FA',
    label: 'Firm Administrator',
    description: 'Practice resources, fees, time and profitability',
    focus: 'practice meetings, templates, policies and records',
    tags: ['Practice', 'Resources', 'Profit'],
    meetingFocus: 'resource capacity balancing, fee invoicing and profitability metrics'
  },
  admin: {
    code: 'AD',
    label: 'Administrator',
    description: 'Organisation access, audit and operations',
    focus: 'organisation access, audit and operations',
    tags: ['Admin', 'Access', 'Audit'],
    meetingFocus: 'user provisioning, tenant security and RBAC governance'
  },
  platform_admin: {
    code: 'PA',
    label: 'Platform Administrator',
    description: 'Platform moderation, security, tenant health and audit',
    focus: 'meeting governance, feedback, security and system health',
    tags: ['Platform', 'Security', 'Audit'],
    meetingFocus: 'global telemetry, AI feedback synthesis and system roadmap'
  }
};

export const STAGE_TOOL_MAP: Record<StageKey, string[]> = {
  Brief: ['practice', 'project_passport', 'project_explorer', 'planning', 'fee_proposal', 'forms', 'meetings', 'wingman'],
  Appoint: ['practice', 'professional_directory', 'fee_proposal', 'forms', 'team_workspace', 'contract_admin', 'meetings', 'project_passport', 'wingman'],
  Design: ['practice', 'engineering_calc', 'specforge', 'xa', 'forms', 'bom', 'bim_ifc', 'documents_drawings', 'meetings', 'wingman'],
  Comply: ['planning', 'municipal', 'engineering_calc', 'xa', 'forms', 'eia_workspace', 'environmental_heritage', 'safety', 'meetings', 'wingman'],
  Procure: ['practice', 'bom', 'specforge', 'rfq_marketplace', 'supplier_catalog', 'contract_admin', 'meetings', 'wingman'],
  Build: ['practice', 'engineering_calc', 'safety', 'itp', 'site_instructions', 'ncr_manager', 'contractor_compliance', 'snag_manager', 'meetings', 'forms', 'wingman'],
  Pay: ['practice', 'payments_escrow', 'contract_admin', 'forms', 'meetings', 'feedback', 'wingman'],
  'Close-out': ['practice', 'snag_manager', 'documents_drawings', 'forms', 'project_passport', 'meetings', 'cpd_learning', 'feedback', 'wingman']
};

export const ROLE_TOOL_MAP: Record<RoleKey, string[]> = {
  client: ['meetings', 'practice', 'project_passport', 'inbox_action', 'approvals_queue', 'forms', 'documents_drawings', 'payments_escrow', 'planning', 'municipal', 'feedback', 'wingman'],
  architect: ['meetings', 'practice', 'project_passport', 'inbox_action', 'approvals_queue', 'documents_drawings', 'planning', 'municipal', 'xa', 'forms', 'specforge', 'bom', 'itp', 'safety', 'wingman'],
  bep: ['meetings', 'practice', 'engineering_calc', 'project_passport', 'inbox_action', 'approvals_queue', 'documents_drawings', 'planning', 'municipal', 'xa', 'forms', 'specforge', 'bom', 'itp', 'safety', 'wingman'],
  engineer: ['meetings', 'practice', 'engineering_calc', 'itp', 'site_instructions', 'ncr_manager', 'xa', 'specforge', 'documents_drawings', 'wingman'],
  quantity_surveyor: ['meetings', 'practice', 'bom', 'specforge', 'rfq_marketplace', 'supplier_catalog', 'payments_escrow', 'contract_admin', 'wingman'],
  town_planner: ['meetings', 'planning', 'municipal', 'forms', 'project_passport', 'environmental_heritage', 'wingman'],
  land_surveyor: ['meetings', 'survey_geomatics', 'project_passport', 'documents_drawings', 'planning', 'wingman'],
  energy_professional: ['meetings', 'engineering_calc', 'xa', 'compliance_hub', 'documents_drawings', 'project_passport', 'wingman'],
  fire_engineer: ['meetings', 'engineering_calc', 'safety', 'compliance_hub', 'documents_drawings', 'municipal', 'wingman'],
  cpm: ['meetings', 'practice', 'engineering_calc', 'project_passport', 'bom', 'safety', 'itp', 'site_instructions', 'ncr_manager', 'snag_manager', 'wingman'],
  contractor: ['meetings', 'practice', 'engineering_calc', 'bom', 'safety', 'itp', 'site_instructions', 'ncr_manager', 'contractor_compliance', 'snag_manager', 'forms', 'wingman'],
  subcontractor: ['meetings', 'practice', 'safety', 'itp', 'site_instructions', 'contractor_compliance', 'snag_manager', 'forms', 'wingman'],
  supplier: ['meetings', 'supplier_catalog', 'rfq_marketplace', 'specforge', 'bom', 'forms', 'documents_drawings', 'feedback', 'wingman'],
  site_manager: ['meetings', 'practice', 'engineering_calc', 'safety', 'itp', 'site_instructions', 'ncr_manager', 'snag_manager', 'forms', 'wingman'],
  health_safety: ['meetings', 'safety', 'practice', 'forms', 'documents_drawings', 'feedback', 'wingman'],
  developer: ['meetings', 'practice', 'project_passport', 'planning', 'municipal', 'bom', 'specforge', 'payments_escrow', 'feedback', 'wingman'],
  freelancer: ['meetings', 'practice', 'documents_drawings', 'forms', 'wingman'],
  firm_admin: ['meetings', 'practice', 'fee_proposal', 'payments_escrow', 'forms', 'feedback', 'wingman'],
  admin: ['meetings', 'practice', 'admin_review', 'project_passport', 'feedback', 'wingman'],
  platform_admin: [
    'practice', 'meetings', 'wingman', 'planning', 'municipal', 'xa', 'forms', 'specforge', 'bom', 'itp', 'safety', 'feedback',
    'engineering_calc',
    'project_passport', 'project_explorer', 'professional_directory', 'team_workspace', 'inbox_action', 'issues_rfis',
    'documents_drawings', 'fee_proposal', 'council_navigator', 'compliance_hub', 'municipal_tracker', 'environmental_heritage',
    'eia_workspace', 'refuse_calculator', 'survey_geomatics', 'nhbrc_enrolment', 'insurance_register', 'bim_ifc',
    'rfq_marketplace', 'supplier_catalog', 'market_insights', 'contract_admin', 'contractor_compliance', 'approvals_queue',
    'payments_escrow', 'dispute_resolution', 'site_instructions', 'ncr_manager', 'snag_manager', 'fm_bridge',
    'remote_desktop', 'cpd_learning', 'admin_review', 'iconography_registry'
  ]
};

export const ALL_TOOLS: Record<string, ToolDefinition> = {
  // 12 FLAGSHIP LIVE MODULES
  meetings: {
    id: 'meetings',
    name: 'Architex Meetings',
    icon: 'meetings',
    tone: 'coral',
    group: 'Communication & Collaboration',
    stage: 'All stages',
    summary: 'Schedule, host and govern project or practice meetings with secure browser calls, agendas, recordings, cited AI minutes, human review and controlled workflow write-backs.',
    status: 'live',
    source: 'Architex Meetings Native Engine',
    tabs: [
      { key: 'my-day', label: 'My day', group: 'Meetings', icon: 'meeting_day' },
      { key: 'upcoming', label: 'Upcoming', group: 'Meetings', icon: 'calendar' },
      { key: 'invitations', label: 'Invitations', group: 'Meetings', icon: 'meeting_invite', badge: '2' },
      { key: 'recordings', label: 'Recordings & Minutes', group: 'Records', icon: 'meeting_recording' },
      { key: 'reviews', label: 'Draft reviews', group: 'Records', icon: 'meeting_review', badge: '3' },
      { key: 'templates', label: 'Templates', group: 'Configuration', icon: 'meeting_template' },
      { key: 'settings', label: 'Meeting settings', group: 'Configuration', icon: 'settings' }
    ]
  },
  practice: {
    id: 'practice',
    name: 'Practice Management — Command Centre',
    icon: 'practice_management',
    tone: 'cobalt',
    group: 'Practice & Project Management',
    stage: 'All stages',
    summary: 'Operational practice and project command centre covering progress, programme, actions, resources, cost, risk, AI advice, fee planning and project profitability.',
    status: 'live',
    source: 'Project Command Centre V2',
    tabs: [
      { key: 'dashboard', label: 'Dashboard', group: 'Command', icon: 'dashboard' },
      { key: 'actions', label: 'Action Centre', group: 'Command', icon: 'action_centre' },
      { key: 'notifications', label: 'Notifications', group: 'Command', icon: 'notification' },
      { key: 'programme', label: 'Programme (Gantt)', group: 'Planning', icon: 'programme' },
      { key: 'tasks', label: 'Tasks Board (Kanban)', group: 'Planning', icon: 'action' },
      { key: 'milestones', label: 'Milestones', group: 'Planning', icon: 'milestone' },
      { key: 'calendar', label: 'Calendar', group: 'Planning', icon: 'calendar' },
      { key: 'team', label: 'Team & Resources', group: 'Execution', icon: 'team_workspace' },
      { key: 'site_diary', label: 'Site Diary', group: 'Execution', icon: 'site_diary' },
      { key: 'rfis', label: 'RFIs & Instructions', group: 'Execution', icon: 'rfi' },
      { key: 'risks', label: 'Issues & Risks', group: 'Execution', icon: 'risk' },
      { key: 'quality', label: 'Quality & Snags', group: 'Execution', icon: 'itp' },
      { key: 'fees', label: 'Fee Planning', group: 'Practice Performance', icon: 'fee_proposal' },
      { key: 'timesheets', label: 'Timesheets & Expenses', group: 'Practice Performance', icon: 'timesheet' },
      { key: 'profitability', label: 'Project Profitability', group: 'Practice Performance', icon: 'profitability' },
      { key: 'forecast', label: 'Forecasting', group: 'Practice Performance', icon: 'forecast' },
      { key: 'budget', label: 'Budget & Cost', group: 'Commercial', icon: 'budget' }
    ]
  },
  wingman: {
    id: 'wingman',
    name: 'Wingman AI Workspace',
    icon: 'wingman',
    tone: 'lavender',
    group: 'Intelligence & Improvement',
    stage: 'All stages',
    summary: 'Project-aware AI conversations, provenance, drafting, and structured built-environment assistants.',
    status: 'live',
    source: 'Wingman AI Copilot',
    tabs: [
      { key: 'conversations', label: 'Conversations', group: 'Workspace', icon: 'inbox' },
      { key: 'byoai', label: 'Import BYOAI', group: 'Workspace', icon: 'attach' },
      { key: 'provenance', label: 'Provenance Audit', group: 'Workspace', icon: 'detail' },
      { key: 'draft_rfi', label: 'Draft RFI Tool', group: 'Capabilities', icon: 'rfi' },
      { key: 'status_summary', label: 'Status Summary', group: 'Capabilities', icon: 'trends' },
      { key: 'compliance_scan', label: 'Flag Compliance', group: 'Capabilities', icon: 'compliance_hub' }
    ]
  },
  planning: {
    id: 'planning',
    name: 'Town Planning Tracker',
    icon: 'planning',
    tone: 'cobalt',
    group: 'Planning & Approvals',
    stage: 'Brief / Comply',
    summary: 'Applications, statutory deadlines, public participation objections, tribunal hearings, reports and fees under SPLUMA.',
    status: 'live',
    source: 'Town Planning Tracker',
    tabs: [
      { key: 'dashboard', label: 'Dashboard', group: 'Navigation', icon: 'dashboard' },
      { key: 'applications', label: 'Applications', group: 'Navigation', icon: 'planning' },
      { key: 'deadlines', label: 'Deadlines & Timelines', group: 'Navigation', icon: 'programme' },
      { key: 'participation', label: 'Public Participation', group: 'Navigation', icon: 'team_workspace' },
      { key: 'conditions', label: 'Conditions Register', group: 'Navigation', icon: 'detail' },
      { key: 'hearings', label: 'Hearings & Appeals', group: 'Navigation', icon: 'workflow' },
      { key: 'municipalities', label: 'Municipality Profiles', group: 'Navigation', icon: 'municipal' },
      { key: 'payments', label: 'Payments & Fees', group: 'Navigation', icon: 'finance' }
    ]
  },
  municipal: {
    id: 'municipal',
    name: 'Municipal Approval Readiness',
    icon: 'municipal',
    tone: 'coral',
    group: 'Planning & Approvals',
    stage: 'Comply',
    summary: 'Pre-submission validation engine across 8 municipal departments, zoning parameters, and digital submission pack compilation.',
    status: 'live',
    source: 'Municipal Approval Workspace',
    tabs: [
      { key: 'overview', label: 'Readiness Overview', group: 'Workspace', icon: 'dashboard' },
      { key: 'landuse', label: 'Land Use & Zoning', group: 'Workspace', icon: 'planning' },
      { key: 'circulation', label: 'Department Circulation', group: 'Workspace', icon: 'workflow' },
      { key: 'pack', label: 'Submission Pack (10 Docs)', group: 'Workspace', icon: 'document' },
      { key: 'certificate', label: 'Municipal Certificate', group: 'Workspace', icon: 'detail' },
      { key: 'outcomes', label: 'Submission Outcomes', group: 'Workspace', icon: 'trends' }
    ]
  },
  xa: {
    id: 'xa',
    name: 'SANS 10400-XA Energy Compliance',
    icon: 'xa',
    tone: 'coral',
    group: 'Compliance & Environment',
    stage: 'Design / Comply',
    summary: 'Prescriptive calculation and verification engine for South African energy efficiency building regulations (SANS 10400-XA:2021).',
    status: 'live',
    source: 'SANS 10400-XA Tool',
    tabs: [
      { key: 'overview', label: 'Overview', group: 'Calculations', icon: 'dashboard' },
      { key: 'basics', label: 'Basics & Zones', group: 'Calculations', icon: 'detail' },
      { key: 'shading', label: 'Shading (Table 3)', group: 'Calculations', icon: 'trends' },
      { key: 'fenestration', label: 'Fenestration (5.3)', group: 'Calculations', icon: 'drawing' },
      { key: 'walls', label: 'External Walls (5.5)', group: 'Calculations', icon: 'specification' },
      { key: 'roof', label: 'Roof Assembly (5.6)', group: 'Calculations', icon: 'refuse_calculator' },
      { key: 'floors', label: 'Floor Insulation (5.4)', group: 'Calculations', icon: 'itp' },
      { key: 'hotwater', label: 'Hot Water (6.1)', group: 'Calculations', icon: 'safety' },
      { key: 'lighting', label: 'Lighting & LPD (6.2)', group: 'Calculations', icon: 'action' },
      { key: 'results', label: 'Compliance Report', group: 'Calculations', icon: 'document' }
    ]
  },
  forms: {
    id: 'forms',
    name: 'Integrated Form System',
    icon: 'forms',
    tone: 'core',
    group: 'Design & Documentation',
    stage: 'All stages',
    summary: 'Dynamic auto-filling form generator mapping project passport data into standardized statutory and contractual documents.',
    status: 'live',
    source: 'Integrated Form System',
    tabs: [
      { key: 'library', label: 'Template Library', group: 'Forms', icon: 'forms' },
      { key: 'editor', label: 'Smart Form Editor', group: 'Forms', icon: 'action' },
      { key: 'drafts', label: 'My Drafts', group: 'Forms', icon: 'document', badge: '3' },
      { key: 'export', label: 'Export Queue', group: 'Forms', icon: 'detail' },
      { key: 'audit', label: 'Audit Trail', group: 'Forms', icon: 'workflow' }
    ]
  },
  specforge: {
    id: 'specforge',
    name: 'SpecForge V2',
    icon: 'specification',
    tone: 'core',
    group: 'Design & Documentation',
    stage: 'Design / Procure',
    summary: 'Visual and clause-based architectural specification engine integrating product selections, budget allowances, and drawing references.',
    status: 'live',
    source: 'SpecForge V2 Engine',
    tabs: [
      { key: 'overview', label: 'Overview', group: 'Specification', icon: 'dashboard' },
      { key: 'pictorial', label: 'Pictorial Board', group: 'Specification', icon: 'drawing' },
      { key: 'sections', label: 'Trade Sections', group: 'Specification', icon: 'specification' },
      { key: 'products', label: 'Product Register', group: 'Specification', icon: 'supplier_catalog' },
      { key: 'docpreview', label: 'Document Preview', group: 'Specification', icon: 'document' },
      { key: 'approvals', label: 'Approval Register', group: 'Workflow', icon: 'approvals_queue' },
      { key: 'budget', label: 'Budget & Cost Risk', group: 'Workflow', icon: 'budget' },
      { key: 'bomboq', label: 'BoM / BoQ Link', group: 'Workflow', icon: 'bom' },
      { key: 'drawings', label: 'AI Drawing Scan', group: 'Intelligence', icon: 'drawing' },
      { key: 'issue', label: 'Issue & Distribute', group: 'Workflow', icon: 'workflow' }
    ]
  },
  bom: {
    id: 'bom',
    name: 'BoM / BoQ & Tender Builder',
    icon: 'bom',
    tone: 'amber',
    group: 'Commercial & Procurement',
    stage: 'Design / Procure / Build',
    summary: 'Quantities extraction and cost estimation workspace turning specifications and drawing take-offs into priced Bills of Quantities and tender packages.',
    status: 'live',
    source: 'BoM Builder',
    tabs: [
      { key: 'takeoff', label: 'Drawing Takeoff', group: 'Views', icon: 'drawing' },
      { key: 'bomlines', label: 'BoM Lines (47)', group: 'Views', icon: 'bom', badge: '47' },
      { key: 'flagged', label: 'Flagged Anomalies', group: 'Views', icon: 'risk', badge: '4' },
      { key: 'procurement', label: 'Procurement Pipeline', group: 'Views', icon: 'procurement' },
      { key: 'qs_review', label: 'QS Review Queue', group: 'Workflows', icon: 'itp' },
      { key: 'tender', label: 'Tender Generation', group: 'Workflows', icon: 'contract' },
      { key: 'export', label: 'Document Export', group: 'Workflows', icon: 'document' },
      { key: 'audit', label: 'Audit Trail', group: 'Integrations', icon: 'detail' }
    ]
  },
  itp: {
    id: 'itp',
    name: 'Inspection Test Plans (ITP)',
    icon: 'itp',
    tone: 'cobalt',
    group: 'Site Execution & Quality',
    stage: 'Build',
    summary: 'QA/QC execution workspace tracking mandatory inspections, hold points, and SANS 3001 material testing.',
    status: 'live',
    source: 'ITP Workspace',
    tabs: [
      { key: 'overview', label: 'Overview', group: 'Inspection', icon: 'dashboard' },
      { key: 'items', label: 'Inspection Items', group: 'Inspection', icon: 'itp' },
      { key: 'hold_points', label: 'Hold Points (Breaches)', group: 'Inspection', icon: 'risk', badge: '2' },
      { key: 'materials', label: 'Material Testing (SANS 3001)', group: 'Inspection', icon: 'refuse_calculator' },
      { key: 'lab_results', label: 'Lab Results', group: 'Inspection', icon: 'detail' },
      { key: 'ncr_link', label: 'NCR Linkage', group: 'Inspection', icon: 'ncr_manager' }
    ]
  },
  safety: {
    id: 'safety',
    name: 'Health & Safety Module',
    icon: 'safety',
    tone: 'coral',
    group: 'Site Execution & Quality',
    stage: 'Build',
    summary: 'Statutory construction safety compliance under South Africa’s Construction Regulations 2014 and OHS Act 85 of 1993.',
    status: 'live',
    source: 'H&S Module',
    tabs: [
      { key: 'overview', label: 'Overview', group: 'Safety', icon: 'dashboard' },
      { key: 'safety_file', label: 'Safety File (Reg 7)', group: 'Safety', icon: 'document', badge: '72%' },
      { key: 'permits', label: 'Permits to Work (PTW)', group: 'Safety', icon: 'safety', badge: '4' },
      { key: 'hira', label: 'HIRA Risk Matrix', group: 'Safety', icon: 'risk' },
      { key: 'incidents', label: 'Incident Register', group: 'Safety', icon: 'ncr_manager', badge: '1' },
      { key: 'inductions', label: 'Inductions & Talks', group: 'Safety', icon: 'team_workspace' },
      { key: 'plans', label: 'H&S Plans', group: 'Safety', icon: 'forms' },
      { key: 'fall_protection', label: 'Fall Protection (Reg 10)', group: 'Safety', icon: 'safety' }
    ]
  },
  feedback: {
    id: 'feedback',
    name: 'Feedback Intelligence & Product Roadmap',
    icon: 'feedback',
    tone: 'lavender',
    group: 'Intelligence & Improvement',
    stage: 'Platform-wide',
    summary: 'Platform-wide telemetry and user feedback intake engine clustering friction points, computing severity scores, and synthesizing AI feature briefs.',
    status: 'live',
    source: 'Feedback Intelligence',
    tabs: [
      { key: 'overview', label: 'Overview Dashboard', group: 'Feedback', icon: 'dashboard' },
      { key: 'clusters', label: 'Feedback Clusters', group: 'Feedback', icon: 'clusters' },
      { key: 'trends', label: '30-Day Trend Chart', group: 'Feedback', icon: 'trends' },
      { key: 'brief', label: 'AI Feature Briefs', group: 'Feedback', icon: 'advisor' },
      { key: 'roadmap', label: 'Roadmap Status Flow', group: 'Feedback', icon: 'workflow' }
    ]
  },
  engineering_calc: {
    id: 'engineering_calc',
    name: "Engineer's Calculation Hub",
    icon: 'engineering_hub',
    tone: 'cobalt',
    group: 'Engineering & Technical',
    stage: 'Design / Comply / Build',
    summary: 'Multi-discipline engineering calculation workspace covering structural, civil, mechanical/HVAC, fire, electrical and wet-services checks with derivations and SANS-referenced guidance.',
    status: 'live',
    source: "Engineers' Calculation Hub",
    tabs: [
      { key: 'steel', label: 'Steel Design', group: 'Structural', icon: 'eng_steel', kind: 'call', fn: 'showCalc', arg: 'steel-beam' },
      { key: 'concrete', label: 'Concrete Design', group: 'Structural', icon: 'eng_concrete', kind: 'call', fn: 'showCalc', arg: 'concrete-beam' },
      { key: 'timber', label: 'Timber Design', group: 'Structural', icon: 'eng_timber', kind: 'call', fn: 'showCalc', arg: 'timber-beam' },
      { key: 'geotechnical', label: 'Geotechnical', group: 'Structural', icon: 'eng_geo', kind: 'call', fn: 'showCalc', arg: 'geo-bearing' },
      { key: 'wind', label: 'Loading & Wind', group: 'Civil', icon: 'eng_wind', kind: 'call', fn: 'showCalc', arg: 'wind-load' },
      { key: 'stormwater', label: 'Stormwater & Drainage', group: 'Civil', icon: 'eng_storm', kind: 'call', fn: 'showCalc', arg: 'stormwater-rational' },
      { key: 'duct', label: 'Duct & Pipe Sizing', group: 'Mechanical / HVAC', icon: 'eng_duct', kind: 'call', fn: 'showCalc', arg: 'duct-sizing' },
      { key: 'heat', label: 'Heating & Cooling Loads', group: 'Mechanical / HVAC', icon: 'eng_heat', kind: 'call', fn: 'showCalc', arg: 'heat-gain' },
      { key: 'escape', label: 'Escape & Travel Distance', group: 'Fire Engineering', icon: 'eng_escape', kind: 'call', fn: 'showCalc', arg: 'travel-distance' },
      { key: 'fire_resistance', label: 'Fire Resistance Rating', group: 'Fire Engineering', icon: 'eng_fire', kind: 'call', fn: 'showCalc', arg: 'fire-resistance' },
      { key: 'hydrant', label: 'Fire Water / Hydrants', group: 'Fire Engineering', icon: 'eng_hydrant', kind: 'call', fn: 'showCalc', arg: 'fire-water' },
      { key: 'cable', label: 'Cable Sizing & Voltage Drop', group: 'Electrical', icon: 'eng_cable', kind: 'call', fn: 'showCalc', arg: 'cable-sizing' },
      { key: 'db', label: 'Max Demand & DB Sizing', group: 'Electrical', icon: 'eng_db', kind: 'call', fn: 'showCalc', arg: 'max-demand' },
      { key: 'water', label: 'Water Pipe Sizing', group: 'Wet Services', icon: 'eng_water', kind: 'call', fn: 'showCalc', arg: 'cold-water' },
      { key: 'drainage', label: 'Drainage & Fixture Units', group: 'Wet Services', icon: 'eng_drain', kind: 'call', fn: 'showCalc', arg: 'drainage-fu' },
      { key: 'hotwater', label: 'Hot Water System Sizing', group: 'Wet Services', icon: 'eng_hotwater', kind: 'call', fn: 'showCalc', arg: 'geyser-sizing' },
      { key: 'converter', label: 'Unit Converter & Reference', group: 'Utilities', icon: 'eng_units', kind: 'call', fn: 'showCalc', arg: 'unit-converter' }
    ]
  },

  // 34+ STRUCTURED SCAFFOLDED CAPABILITIES
  project_passport: {
    id: 'project_passport',
    name: 'Project Passport',
    icon: 'project_passport',
    tone: 'core',
    group: 'Project & Collaboration',
    stage: 'All stages',
    summary: 'Canonical project identity, health score, stakeholders, erf data, and master baseline metadata.',
    status: 'live',
    tabs: [
      { key: 'overview', label: 'Overview', group: 'Passport', icon: 'dashboard' },
      { key: 'identity', label: 'Identity', group: 'Passport', icon: 'detail' },
      { key: 'site', label: 'Site & ERF', group: 'Passport', icon: 'projects' },
      { key: 'stakeholders', label: 'Stakeholders', group: 'Passport', icon: 'team_workspace' },
      { key: 'health', label: 'Health', group: 'Passport', icon: 'trends' }
    ]
  },
  project_explorer: {
    id: 'project_explorer',
    name: 'Project Explorer',
    icon: 'project_explorer',
    tone: 'cobalt',
    group: 'Project & Collaboration',
    stage: 'All stages',
    summary: 'Universal search and relational graph across drawings, assets, contracts, and project records.',
    status: 'live',
    tabs: [
      { key: 'search', label: 'Universal Search', group: 'Explore', icon: 'project_explorer' },
      { key: 'graph', label: 'Relational Graph', group: 'Explore', icon: 'workflow' },
      { key: 'entities', label: 'Entity Registry', group: 'Explore', icon: 'detail' },
      { key: 'timeline', label: 'Project Timeline', group: 'Explore', icon: 'programme' }
    ]
  },
  professional_directory: {
    id: 'professional_directory',
    name: 'Professional Directory',
    icon: 'professional_directory',
    tone: 'coral',
    group: 'Project & Collaboration',
    stage: 'Appoint',
    summary: 'Statutory council verification (SACAP/ECSA/SACPCMP/SACQSP) and team appointments directory.',
    status: 'live',
    tabs: [
      { key: 'directory', label: 'Professional Directory', group: 'Directory', icon: 'professional_directory' },
      { key: 'verification', label: 'Verification Status', group: 'Directory', icon: 'approvals_queue' },
      { key: 'appointments', label: 'Team Appointments', group: 'Directory', icon: 'team_workspace' }
    ]
  },
  team_workspace: {
    id: 'team_workspace',
    name: 'Team Workspace',
    icon: 'team_workspace',
    tone: 'coral',
    group: 'Project & Collaboration',
    stage: 'All stages',
    summary: 'Project RACI matrix, team permissions, active participants, and resource availability.',
    status: 'live',
    tabs: [
      { key: 'raci', label: 'RACI Matrix', group: 'Team', icon: 'team_workspace' },
      { key: 'members', label: 'Active Members', group: 'Team', icon: 'professional_directory' },
      { key: 'availability', label: 'Availability', group: 'Team', icon: 'calendar' }
    ]
  },
  inbox_action: {
    id: 'inbox_action',
    name: 'Inbox / Action Centre',
    icon: 'action_centre',
    tone: 'coral',
    group: 'Project & Collaboration',
    stage: 'All stages',
    summary: 'Consolidated notification inbox, assigned tasks, decision escalations, and action approvals.',
    status: 'live',
    tabs: [
      { key: 'my_actions', label: 'My Actions', group: 'Inbox', icon: 'action' },
      { key: 'inbox', label: 'Notifications', group: 'Inbox', icon: 'notification', badge: '7' },
      { key: 'decisions', label: 'Decision Escalations', group: 'Inbox', icon: 'approvals_queue' },
      { key: 'all', label: 'All Tasks', group: 'Inbox', icon: 'detail' }
    ]
  },
  issues_rfis: {
    id: 'issues_rfis',
    name: 'Issues / RFIs',
    icon: 'issues_rfis',
    tone: 'coral',
    group: 'Project & Collaboration',
    stage: 'Design / Build',
    summary: 'Formal Request for Information (RFI) submission, review, response, and audit log.',
    status: 'live',
    tabs: [
      { key: 'rfis', label: 'RFI Register', group: 'RFIs', icon: 'rfi' },
      { key: 'issues', label: 'Issues', group: 'RFIs', icon: 'risk' },
      { key: 'responses', label: 'Response Workflow', group: 'RFIs', icon: 'workflow' },
      { key: 'audit', label: 'Audit Trail', group: 'RFIs', icon: 'detail' }
    ]
  },
  approvals_queue: {
    id: 'approvals_queue',
    name: 'Approvals Queue',
    icon: 'approvals_queue',
    tone: 'coral',
    group: 'Project & Collaboration',
    stage: 'All stages',
    summary: 'Multi-party sign-off gates with sequential approvals, digital stamps, and timeout escalations.',
    status: 'live',
    tabs: [
      { key: 'pending', label: 'Pending', group: 'Queue', icon: 'approvals_queue', badge: '2' },
      { key: 'submitted', label: 'Submitted', group: 'Queue', icon: 'document' },
      { key: 'history', label: 'Decision History', group: 'Queue', icon: 'detail' }
    ]
  },
  compliance_hub: {
    id: 'compliance_hub',
    name: 'Compliance Hub',
    icon: 'compliance_hub',
    tone: 'coral',
    group: 'Compliance & Environment',
    stage: 'Design / Comply',
    summary: 'Cross-standard statutory compliance aggregator across SANS 10400, NBR, and municipal by-laws.',
    status: 'live',
    tabs: [
      { key: 'dashboard', label: 'Compliance Dashboard', group: 'Compliance', icon: 'dashboard' },
      { key: 'standards', label: 'Standard Checklist', group: 'Compliance', icon: 'detail' },
      { key: 'gaps', label: 'Gap Register', group: 'Compliance', icon: 'risk' },
      { key: 'signoffs', label: 'Sign-off Register', group: 'Compliance', icon: 'approvals_queue' }
    ]
  },
  environmental_heritage: {
    id: 'environmental_heritage',
    name: 'Environmental & Heritage',
    icon: 'environmental_heritage',
    tone: 'coral',
    group: 'Compliance & Environment',
    stage: 'Brief / Comply',
    summary: 'NEMA environmental screening, Section 38 NHRA 60-year heritage permits, and SAHRA submissions.',
    status: 'live',
    tabs: [
      { key: 'overview', label: 'Overview', group: 'EIA', icon: 'dashboard' },
      { key: 'screening', label: 'Screening Report', group: 'EIA', icon: 'detail' },
      { key: 'assessments', label: 'Assessment Register', group: 'EIA', icon: 'workflow' },
      { key: 'heritage', label: 'Heritage Impact', group: 'EIA', icon: 'document' },
      { key: 'public', label: 'Public Participation', group: 'EIA', icon: 'team_workspace' }
    ]
  },
  eia_workspace: {
    id: 'eia_workspace',
    name: 'EIA Workspace',
    icon: 'eia_workspace',
    tone: 'coral',
    group: 'Compliance & Environment',
    stage: 'Brief / Comply',
    summary: 'Basic Assessment & Full Environmental Impact Assessment workflows with public participation.',
    status: 'live',
    tabs: [
      { key: 'eia', label: 'EIA Workspace', group: 'EIA', icon: 'eia_workspace' },
      { key: 'studies', label: 'Specialist Studies', group: 'EIA', icon: 'detail' },
      { key: 'empr', label: 'EMPr', group: 'EIA', icon: 'document' },
      { key: 'conditions', label: 'Conditions of Approval', group: 'EIA', icon: 'workflow' }
    ]
  },
  refuse_calculator: {
    id: 'refuse_calculator',
    name: 'Refuse Area Calculator',
    icon: 'refuse_calculator',
    tone: 'cobalt',
    group: 'Compliance & Environment',
    stage: 'Design / Comply',
    summary: 'Municipal waste volume, storage area requirements, bin allocations, and ventilation compliance.',
    status: 'live',
    tabs: [
      { key: 'refuse', label: 'Refuse Area Calculator', group: 'Calculator', icon: 'refuse_calculator' },
      { key: 'dimensions', label: 'Dimension Inputs', group: 'Calculator', icon: 'detail' },
      { key: 'results', label: 'Results & Report', group: 'Calculator', icon: 'document' }
    ]
  },
  nhbrc_enrolment: {
    id: 'nhbrc_enrolment',
    name: 'NHBRC Enrolment',
    icon: 'nhbrc_enrolment',
    tone: 'coral',
    group: 'Compliance & Environment',
    stage: 'Comply / Build',
    summary: 'Home builder registration, enrolment fee calculators, statutory stage inspections, and certificates.',
    status: 'live',
    tabs: [
      { key: 'enrolment', label: 'NHBRC Enrolment', group: 'Enrolment', icon: 'nhbrc_enrolment' },
      { key: 'requirements', label: 'Requirements', group: 'Enrolment', icon: 'detail' },
      { key: 'inspections', label: 'Inspections', group: 'Enrolment', icon: 'itp' },
      { key: 'warranty', label: 'Warranty Status', group: 'Enrolment', icon: 'document' }
    ]
  },
  documents_drawings: {
    id: 'documents_drawings',
    name: 'Documents & Drawings',
    icon: 'documents_drawings',
    tone: 'core',
    group: 'Design & Documentation',
    stage: 'All stages',
    summary: 'Revision-controlled drawing register, current-set controls, transmittals, and document markups.',
    status: 'live',
    tabs: [
      { key: 'register', label: 'Register', group: 'Workspace', icon: 'documents_drawings' },
      { key: 'current_set', label: 'Current Set', group: 'Workspace', icon: 'document', badge: '12' },
      { key: 'transmittals', label: 'Transmittals', group: 'Workspace', icon: 'meeting_share' },
      { key: 'markups', label: 'Markups & Reviews', group: 'Workspace', icon: 'drawing' }
    ]
  },
  survey_geomatics: {
    id: 'survey_geomatics',
    name: 'Survey & Geomatics',
    icon: 'survey_geomatics',
    tone: 'cobalt',
    group: 'Design & Documentation',
    stage: 'Brief / Design',
    summary: 'Cadastral pegging, contour data, GIS site boundaries, and surveyor general diagram integration.',
    status: 'live',
    tabs: [
      { key: 'survey', label: 'Survey Register', group: 'Survey', icon: 'survey_geomatics' },
      { key: 'boundaries', label: 'Boundaries & Pegs', group: 'Survey', icon: 'detail' },
      { key: 'contours', label: 'Contour Data', group: 'Survey', icon: 'trends' },
      { key: 'deliverables', label: 'Deliverables', group: 'Survey', icon: 'document' }
    ]
  },
  bim_ifc: {
    id: 'bim_ifc',
    name: 'BIM / IFC Extraction',
    icon: 'bim_ifc',
    tone: 'cobalt',
    group: 'Design & Documentation',
    stage: 'Design / Procure',
    summary: 'IFC model geometry parser, element schedule extraction, and quantity takeoff synchronisation.',
    status: 'live',
    tabs: [
      { key: 'overview', label: 'Overview', group: 'BIM', icon: 'dashboard' },
      { key: 'models', label: 'Model Register', group: 'BIM', icon: 'bim_ifc' },
      { key: 'extraction', label: 'IFC Extraction', group: 'BIM', icon: 'drawing' },
      { key: 'mapping', label: 'Property Mapping', group: 'BIM', icon: 'detail' },
      { key: 'audit', label: 'Extraction Audit', group: 'BIM', icon: 'workflow' }
    ]
  },
  fee_proposal: {
    id: 'fee_proposal',
    name: 'Fee Proposal Builder',
    icon: 'fee_proposal',
    tone: 'amber',
    group: 'Commercial & Procurement',
    stage: 'Appoint',
    summary: 'SACAP/tariff-based professional fee agreements, work-stage allocations, and client contracts.',
    status: 'live',
    tabs: [
      { key: 'proposals', label: 'Fee Proposals', group: 'Fees', icon: 'fee_proposal' },
      { key: 'phases', label: 'Phases & Stages', group: 'Fees', icon: 'workflow' },
      { key: 'acceptance', label: 'Acceptance', group: 'Fees', icon: 'approvals_queue' },
      { key: 'invoicing', label: 'Invoicing Link', group: 'Fees', icon: 'finance' }
    ]
  },
  insurance_register: {
    id: 'insurance_register',
    name: 'Insurance Register',
    icon: 'insurance_register',
    tone: 'coral',
    group: 'Commercial & Procurement',
    stage: 'Appoint / Build',
    summary: 'Public liability, Contractors All Risks (CAR), and Professional Indemnity (PI) insurance tracking.',
    status: 'live',
    tabs: [
      { key: 'policies', label: 'Insurance Policies', group: 'Insurance', icon: 'insurance_register' },
      { key: 'requirements', label: 'Statutory Requirements', group: 'Insurance', icon: 'detail' },
      { key: 'renewals', label: 'Renewals & Claims', group: 'Insurance', icon: 'workflow' }
    ]
  },
  rfq_marketplace: {
    id: 'rfq_marketplace',
    name: 'RFQ Marketplace',
    icon: 'rfq_marketplace',
    tone: 'amber',
    group: 'Commercial & Procurement',
    stage: 'Procure',
    summary: 'Digital package bidding, RFQ distribution to suppliers, quotes comparison matrix, and awards.',
    status: 'live',
    tabs: [
      { key: 'rfqs', label: 'RFQ Pipeline', group: 'Procure', icon: 'rfq_marketplace' },
      { key: 'packages', label: 'Work Packages', group: 'Procure', icon: 'document' },
      { key: 'quotes', label: 'Quote Comparison', group: 'Procure', icon: 'detail' },
      { key: 'awards', label: 'Awards & Orders', group: 'Procure', icon: 'workflow' }
    ]
  },
  supplier_catalog: {
    id: 'supplier_catalog',
    name: 'Supplier Catalogue',
    icon: 'supplier_catalog',
    tone: 'amber',
    group: 'Commercial & Procurement',
    stage: 'Design / Procure',
    summary: 'Master product catalogue, technical data sheets, local pricing, and specification links.',
    status: 'live',
    tabs: [
      { key: 'catalogue', label: 'Supplier Catalogue', group: 'Suppliers', icon: 'supplier_catalog' },
      { key: 'products', label: 'Products & Data', group: 'Suppliers', icon: 'detail' },
      { key: 'verification', label: 'Verification', group: 'Suppliers', icon: 'approvals_queue' },
      { key: 'orders', label: 'Order Tracking', group: 'Suppliers', icon: 'workflow' }
    ]
  },
  market_insights: {
    id: 'market_insights',
    name: 'Market Insights',
    icon: 'market_insights',
    tone: 'cobalt',
    group: 'Commercial & Procurement',
    stage: 'All stages',
    summary: 'Construction cost index (BER / Stats SA), inflation trends, unit rate benchmarks, and forecasts.',
    status: 'live',
    tabs: [
      { key: 'market', label: 'Market Insights', group: 'Insights', icon: 'market_insights' },
      { key: 'benchmarks', label: 'Benchmarks', group: 'Insights', icon: 'detail' },
      { key: 'cost', label: 'Cost Indices', group: 'Insights', icon: 'budget' },
      { key: 'forecast', label: 'Forecasts', group: 'Insights', icon: 'trends' }
    ]
  },
  contract_admin: {
    id: 'contract_admin',
    name: 'Contract Administration',
    icon: 'contract_admin',
    tone: 'coral',
    group: 'Commercial & Procurement',
    stage: 'Build / Pay',
    summary: 'JBCC / NEC payment certificates, variation orders, claims, and Extension of Time (EoT) records.',
    status: 'live',
    tabs: [
      { key: 'contracts', label: 'Contracts', group: 'Contracts', icon: 'contract_admin' },
      { key: 'certificates', label: 'Payment Certificates', group: 'Contracts', icon: 'finance' },
      { key: 'variations', label: 'Variation Orders', group: 'Contracts', icon: 'workflow' },
      { key: 'claims', label: 'Claims & EoT', group: 'Contracts', icon: 'risk' }
    ]
  },
  payments_escrow: {
    id: 'payments_escrow',
    name: 'Payments & Escrow (Workflow Only)',
    icon: 'payments_escrow',
    tone: 'amber',
    group: 'Commercial & Procurement',
    stage: 'Pay',
    summary: 'Invoice, milestone, approval, retention and release-status workflow only. Fund holding and true escrow are disabled pending legal review and a licensed partner.',
    status: 'live',
    tabs: [
      { key: 'payments', label: 'Payment Workflow', group: 'Payments', icon: 'payments_escrow' },
      { key: 'milestones', label: 'Milestones', group: 'Payments', icon: 'workflow' },
      { key: 'approvals', label: 'Approval & Release', group: 'Payments', icon: 'approvals_queue' },
      { key: 'audit', label: 'Payment Audit', group: 'Payments', icon: 'detail' }
    ]
  },
  dispute_resolution: {
    id: 'dispute_resolution',
    name: 'Dispute Resolution',
    icon: 'dispute_resolution',
    tone: 'coral',
    group: 'Commercial & Procurement',
    stage: 'Build / Pay',
    summary: 'Contractual dispute notices, adjudication, mediation records, and claims timelines.',
    status: 'live',
    tabs: [
      { key: 'notices', label: 'Dispute Notices', group: 'Disputes', icon: 'dispute_resolution' },
      { key: 'adjudication', label: 'Adjudication', group: 'Disputes', icon: 'workflow' },
      { key: 'mediation', label: 'Mediation', group: 'Disputes', icon: 'team_workspace' },
      { key: 'timeline', label: 'Claims Timeline', group: 'Disputes', icon: 'programme' }
    ]
  },
  contractor_compliance: {
    id: 'contractor_compliance',
    name: 'Contractor Compliance',
    icon: 'contractor_compliance',
    tone: 'coral',
    group: 'Site Execution & Quality',
    stage: 'Build',
    summary: 'COIDA letters of good standing, tax clearance, CIDB gradings, and subcontractor verification.',
    status: 'live',
    tabs: [
      { key: 'compliance', label: 'Compliance Pack', group: 'Compliance', icon: 'contractor_compliance' },
      { key: 'documents', label: 'Document Register', group: 'Compliance', icon: 'document' },
      { key: 'expiry', label: 'Expiry Watch', group: 'Compliance', icon: 'risk' }
    ]
  },
  site_instructions: {
    id: 'site_instructions',
    name: 'Site Instructions',
    icon: 'site_instructions',
    tone: 'coral',
    group: 'Site Execution & Quality',
    stage: 'Build',
    summary: 'Formal architect/engineer site instructions, contractor acknowledgement, and cost implications log.',
    status: 'live',
    tabs: [
      { key: 'instructions', label: 'Site Instructions', group: 'Execution', icon: 'rfi' },
      { key: 'acknowledgements', label: 'Acknowledgements', group: 'Execution', icon: 'detail' },
      { key: 'cost', label: 'Cost Implications', group: 'Execution', icon: 'budget' },
      { key: 'audit', label: 'Audit Trail', group: 'Execution', icon: 'workflow' }
    ]
  },
  ncr_manager: {
    id: 'ncr_manager',
    name: 'NCR Manager',
    icon: 'ncr_manager',
    tone: 'coral',
    group: 'Site Execution & Quality',
    stage: 'Build',
    summary: 'Non-Conformance Reports (NCR), defect rectification notices, root cause analysis, and closure tracking.',
    status: 'live',
    tabs: [
      { key: 'register', label: 'NCR Register', group: 'Quality', icon: 'risk' },
      { key: 'rectification', label: 'Rectification', group: 'Quality', icon: 'workflow' },
      { key: 'linkage', label: 'ITP & Hold Linkage', group: 'Quality', icon: 'itp' },
      { key: 'closeout', label: 'Close-out', group: 'Quality', icon: 'detail' }
    ]
  },
  snag_manager: {
    id: 'snag_manager',
    name: 'Snag Manager',
    icon: 'snag_manager',
    tone: 'amber',
    group: 'Site Execution & Quality',
    stage: 'Build / Close-out',
    summary: 'Site defect punch-list, photo evidence, trade assignments, reinspections, and client sign-off.',
    status: 'live',
    tabs: [
      { key: 'register', label: 'Snag Register', group: 'Snags', icon: 'itp' },
      { key: 'zones', label: 'Zones & Walkthroughs', group: 'Snags', icon: 'projects' },
      { key: 'closeout', label: 'Close-out Progress', group: 'Snags', icon: 'detail' },
      { key: 'handover', label: 'Handover', group: 'Snags', icon: 'document' }
    ]
  },
  fm_bridge: {
    id: 'fm_bridge',
    name: 'FM Bridge',
    icon: 'fm_bridge',
    tone: 'cobalt',
    group: 'Site Execution & Quality',
    stage: 'Close-out',
    summary: 'COBie and asset register export, O&M manuals handover, and facilities management bridge.',
    status: 'live',
    tabs: [
      { key: 'handover', label: 'Handover Pack', group: 'Handover', icon: 'fm_bridge' },
      { key: 'assets', label: 'Asset Register', group: 'Handover', icon: 'detail' },
      { key: 'warranties', label: 'Warranties & Manuals', group: 'Handover', icon: 'document' },
      { key: 'defects', label: 'Defects Period', group: 'Handover', icon: 'snag_manager' }
    ]
  },
  council_navigator: {
    id: 'council_navigator',
    name: 'Council Drawing Navigator',
    icon: 'council_navigator',
    tone: 'cobalt',
    group: 'Planning & Approvals',
    stage: 'Comply',
    summary: 'Municipal review markups, departmental comment coordination, and revision comparison viewer.',
    status: 'live',
    tabs: [
      { key: 'applications', label: 'Council Applications', group: 'Council', icon: 'council_navigator' },
      { key: 'checklist', label: 'Submission Checklist', group: 'Council', icon: 'detail' },
      { key: 'status', label: 'Application Status', group: 'Council', icon: 'workflow' },
      { key: 'refs', label: 'Council References', group: 'Council', icon: 'document' }
    ]
  },
  municipal_tracker: {
    id: 'municipal_tracker',
    name: 'Municipal Tracker',
    icon: 'municipal_tracker',
    tone: 'cobalt',
    group: 'Planning & Approvals',
    stage: 'Comply',
    summary: 'Departmental circulation tracking, SLA monitoring, and authority milestone alerts.',
    status: 'live',
    tabs: [
      { key: 'tracker', label: 'Municipal Tracker', group: 'Tracker', icon: 'municipal_tracker' },
      { key: 'timeline', label: 'Timeline', group: 'Tracker', icon: 'programme' },
      { key: 'alerts', label: 'Alerts & Blocks', group: 'Tracker', icon: 'risk' }
    ]
  },
  remote_desktop: {
    id: 'remote_desktop',
    name: 'Remote Desktop',
    icon: 'remote_desktop',
    tone: 'cobalt',
    group: 'Platform Services',
    stage: 'All stages',
    summary: 'Web-streamed CAD/BIM workstation sessions, file handoff, and hosted engineering cloud instances.',
    status: 'live',
    tabs: [
      { key: 'sessions', label: 'Sessions', group: 'Remote', icon: 'remote_desktop' },
      { key: 'hosts', label: 'Host Machines', group: 'Remote', icon: 'detail' },
      { key: 'security', label: 'Security & Access', group: 'Remote', icon: 'risk' },
      { key: 'audit', label: 'Session Audit', group: 'Remote', icon: 'workflow' }
    ]
  },
  cpd_learning: {
    id: 'cpd_learning',
    name: 'CPD & Learning',
    icon: 'cpd_learning',
    tone: 'amber',
    group: 'Platform Services',
    stage: 'Platform-wide',
    summary: 'Voluntary & Category 1 CPD credit tracking, accredited courses, and statutory validation records.',
    status: 'live',
    tabs: [
      { key: 'courses', label: 'CPD Courses', group: 'CPD', icon: 'cpd_learning' },
      { key: 'sacap', label: 'SACAP Requirements', group: 'CPD', icon: 'detail' },
      { key: 'history', label: 'Learning History', group: 'CPD', icon: 'detail' },
      { key: 'resources', label: 'Reference Library', group: 'CPD', icon: 'document' }
    ]
  },
  admin_review: {
    id: 'admin_review',
    name: 'Admin Review',
    icon: 'admin_review',
    tone: 'coral',
    group: 'Platform Services',
    stage: 'Platform-wide',
    summary: 'Platform moderation, tenant audit trails, security policy enforcement, and role provisioning.',
    status: 'live',
    tabs: [
      { key: 'review', label: 'Admin Review', group: 'Admin', icon: 'admin_review' },
      { key: 'actions', label: 'Platform Actions', group: 'Admin', icon: 'action' },
      { key: 'logs', label: 'System Logs', group: 'Admin', icon: 'detail' },
      { key: 'tenants', label: 'Tenant Health', group: 'Admin', icon: 'workflow' }
    ]
  },
  iconography_registry: {
    id: 'iconography_registry',
    name: 'Iconography Registry',
    icon: 'iconography_registry',
    tone: 'core',
    group: 'Platform Services',
    stage: 'Platform-wide',
    summary: 'Design system icon dictionary, SVG token manager, and brand origami guidelines.',
    status: 'live',
    tabs: [
      { key: 'registry', label: 'Icon Registry', group: 'Registry', icon: 'iconography_registry' },
      { key: 'tones', label: 'Tone System', group: 'Registry', icon: 'detail' },
      { key: 'usage', label: 'Usage Rules', group: 'Registry', icon: 'workflow' }
    ]
  }
};

export const INITIAL_MEETING_DATA = {
  lifecycle: ['Draft', 'Scheduled', 'Lobby open', 'Live', 'Processing', 'Review required', 'Published'],
  meetings: [
    {
      id: 'M-1042',
      time: '09:00',
      title: 'Design coordination — Faerie Glen',
      type: 'Design coordination',
      stage: 'Design' as StageKey,
      chair: 'Justin Kruger',
      status: 'Live in 12 min',
      attendees: 4,
      actions: 3
    },
    {
      id: 'M-1043',
      time: '14:30',
      title: 'Site progress meeting — Riverside Offices',
      type: 'Site / progress',
      stage: 'Build' as StageKey,
      chair: 'Site Manager',
      status: 'Scheduled',
      attendees: 8,
      actions: 8
    },
    {
      id: 'M-1044',
      time: '16:00',
      title: 'Commercial review — Waterfall Offices',
      type: 'Contract / commercial',
      stage: 'Pay' as StageKey,
      chair: 'Quantity Surveyor',
      status: 'Scheduled',
      attendees: 6,
      actions: 4
    }
  ],
  upcoming: [
    { date: '23 Jul · 09:00', title: 'Consultant coordination', project: 'Faerie Glen Residential', stage: 'Design' as StageKey, status: 'Scheduled' },
    { date: '24 Jul · 11:30', title: 'Municipal readiness review', project: 'Faerie Glen Residential', stage: 'Comply' as StageKey, status: 'Review required' },
    { date: '25 Jul · 08:00', title: 'Site progress meeting', project: 'Riverside Offices', stage: 'Build' as StageKey, status: 'Scheduled' },
    { date: '28 Jul · 15:00', title: 'Tender clarification', project: 'Camps Bay Residence', stage: 'Procure' as StageKey, status: 'Invitation pending' }
  ],
  invitations: [
    { title: 'Fire strategy review', organiser: 'N. Mokoena · Fire Engineer', when: '24 Jul · 10:00 SAST', scope: 'Faerie Glen · fire package only', status: 'Respond' },
    { title: 'Contractor mobilisation workshop', organiser: 'L. Dlamini · CPM', when: '29 Jul · 13:00 SAST', scope: 'Riverside Offices · Build stage', status: 'Tentative' }
  ],
  recordings: [
    { title: 'Municipal readiness review', date: '18 Jul 2026', state: 'AI draft · Review required', retention: '86 days remaining' },
    { title: 'Design coordination 07', date: '11 Jul 2026', state: 'Issued minutes', retention: '79 days remaining' },
    { title: 'Client brief workshop', date: '02 Jul 2026', state: 'Issued minutes', retention: '70 days remaining' }
  ],
  agenda: [
    { title: 'Previous actions review', owner: 'Chair', minutes: 5 },
    { title: 'Fire-plan review & escape width (A-204)', owner: 'Fire Engineer', minutes: 15 },
    { title: 'Municipal submission readiness checklist', owner: 'Architect', minutes: 10 },
    { title: 'Next actions, owners and deadlines', owner: 'Chair', minutes: 5 }
  ] as MeetingAgendaItem[],
  outcomes: [
    { id: 'out-1', type: 'Decision' as const, title: 'Fire-plan review precedes municipal pack issue.', owner: 'Chair', due: 'Before submission', destination: 'Project Record' as const, state: 'pending' as const, source: '12:04, 12:31' },
    { id: 'out-2', type: 'Action' as const, title: 'Issue marked-up fire escape width review.', owner: 'Fire Engineer', due: 'Thu 23 Jul', destination: 'Action Centre' as const, state: 'pending' as const, source: '12:31' },
    { id: 'out-3', type: 'Action' as const, title: 'Prepare municipal checklist update.', owner: 'Architect', due: 'Fri 24 Jul', destination: 'Action Centre' as const, state: 'pending' as const, source: '18:10' },
    { id: 'out-4', type: 'Risk proposal' as const, title: 'Submission date may slip if the fire review is delayed.', owner: 'Project Manager', due: 'Review today', destination: 'Risk Register' as const, state: 'pending' as const, source: '12:04' }
  ] as MeetingOutcome[],
  minutes: [
    { type: 'Discussion' as const, text: 'The team reviewed the fire-plan escape-width issue against drawing A-204 Rev P03.', source: '08:22–12:03' },
    { type: 'Decision candidate' as const, text: 'The municipal pack will not be issued until the marked-up fire review is received and checked.', source: '12:04, 12:31' },
    { type: 'Action candidate' as const, text: 'The Fire Engineer will issue the marked-up review by Thursday. The Architect will update the municipal checklist thereafter.', source: '12:31, 18:10' }
  ] as MeetingMinuteItem[],
  transcript: [
    { time: '08:22', speaker: 'Architect', text: 'The main agenda item is the escape width shown on A-204 revision P03.', confidence: '98%' },
    { time: '12:04', speaker: 'Architect', text: 'The fire plan remains the blocker. We need the revised escape width before municipal submission.', confidence: '97%' },
    { time: '12:31', speaker: 'Fire Engineer', text: 'I will issue the marked-up review by Thursday, but this is technical input, not a formal municipal sign-off.', confidence: '96%' },
    { time: '18:10', speaker: 'Client', text: 'Please proceed with the municipal checklist once that fire review is checked.', confidence: '94%' }
  ] as MeetingTranscriptSegment[]
};

export const INITIAL_PRACTICE_DATA = {
  programme: [
    ['Brief & appointment', 4, 100, 'Architect'],
    ['Concept & developed design', 10, 82, 'Design team'],
    ['Technical documentation & SpecForge', 9, 54, 'Architect'],
    ['Municipal approval readiness', 12, 35, 'Town planner'],
    ['Procurement & tender packages', 8, 20, 'QS'],
    ['Construction execution & ITP', 36, 18, 'Contractor'],
    ['Close-out & final accounts', 6, 0, 'Project manager']
  ] as [string, number, number, string][],
  tasks: [
    ['Confirm façade granite sample', 'To do', 'Architect', '23 Jul', 'High'],
    ['Issue structural RFI 018 for Level 3 grid', 'In progress', 'Engineer', 'Today', 'Critical'],
    ['Review aluminium window quotation delta', 'Review', 'QS', '25 Jul', 'Medium'],
    ['Sign municipal TC1 & POA forms', 'Done', 'Client', '18 Jul', 'High'],
    ['Update joinery & door hardware schedule', 'To do', 'Architect', '26 Jul', 'Medium']
  ] as [string, string, string, string, string][],
  milestones: [
    ['Technical documentation issue (P03)', '04 Aug 2026', false],
    ['Municipal digital pack submission', '14 Aug 2026', false],
    ['Contractor tender issue (JBCC)', '11 Sep 2026', false],
    ['Site handover & contractor mobilisation', '05 Oct 2026', false]
  ] as [string, string, boolean][],
  resources: [
    ['Justin Kruger', 'Lead Architect', 85],
    ['M. Patel', 'Project Architect', 72],
    ['L. Dlamini', 'Senior Technologist', 96],
    ['S. Naidoo', 'Structural Engineer', 54],
    ['T. Mokoena', 'Quantity Surveyor', 38]
  ] as [string, string, number][],
  times: [
    ['Justin Kruger', 7.5, 'Design', 5625],
    ['M. Patel', 8.0, 'Design', 4400],
    ['L. Dlamini', 6.5, 'Documentation', 2600]
  ] as [string, number, string, number][],
  fee: {
    construction: 47500000,
    percent: 7.5,
    planned: 2450000,
    invoiced: 1425000,
    expenses: 185000
  }
};

export const INITIAL_FEEDBACK_RECORDS: FeedbackRecord[] = [
  {
    id: 'fb-1',
    title: 'Mobile responsive layout breaks on project dashboard',
    category: 'Bug',
    status: 'Reviewing',
    date: '12 days ago',
    context: 'Faerie Glen Residential · Compliance Hub · Project Dashboard',
    severityScore: 9,
    sentiment: 'frustrated',
    description: 'When viewing the datum canvas on an iPad or phone, horizontal scrollbars appear and stage nodes clip.'
  },
  {
    id: 'fb-2',
    title: 'Export BoQ to Excel — request for direct XLSX download',
    category: 'Feature request',
    status: 'Planned',
    date: '22 days ago',
    context: 'Camps Bay Residence · BoM Builder · Tender Generation',
    severityScore: 8,
    sentiment: 'neutral',
    description: 'Quantity surveyors need direct Excel workbook exports with active formula links.'
  },
  {
    id: 'fb-3',
    title: 'SANS 10400-XA calculator unclear error messages',
    category: 'Usability',
    status: 'Received',
    date: '8 days ago',
    context: 'Faerie Glen Residential · SANS 10400-XA Energy · Fenestration',
    severityScore: 7,
    sentiment: 'negative',
    description: 'The solar SHGC failure should explain what glazing U-value or shading projection solves it.'
  },
  {
    id: 'fb-4',
    title: 'Add bulk invite for project team members',
    category: 'Feature request',
    status: 'Planned',
    date: '18 days ago',
    context: 'Portfolio / unassigned · Team Workspace',
    severityScore: 6,
    sentiment: 'neutral',
    description: 'Allow importing CSV or address book for 10+ multidisciplinary consultants simultaneously.'
  },
  {
    id: 'fb-5',
    title: 'Drawing upload speed is excellent — great improvement',
    category: 'Praise',
    status: 'Shipped',
    date: '5 days ago',
    context: 'Waterfall Business Park · Documents & Drawings',
    severityScore: 2,
    sentiment: 'positive',
    description: 'The AI vector extraction speed on 20MB plan sets is 3x faster than last revision.'
  }
];
