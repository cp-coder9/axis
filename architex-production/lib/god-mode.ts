import { ALL_TOOLS, ROLE_PROFILES, STAGES, STAGE_TOOL_MAP } from '@/lib/data';
import type { RoleKey, StageKey } from '@/lib/types';

/** God Mode is a compiled release option; only the literal string enables it. */
export function godModeAvailable(value = process.env.NEXT_PUBLIC_GOD_MODE_ENABLED): boolean {
  return value === 'true';
}

export type GodHandoff = { id: string; stage: StageKey; sourceToolId: string; destinationToolId: string; sourceRole: RoleKey; destinationRole: RoleKey; artifact: string; decisionGate: string; projection: 'authorized-live-record' | 'safe-demonstration-projection' };

export const GOD_MODE_HANDOFFS: readonly GodHandoff[] = [
  { id:'brief-project-record', stage:'Brief', sourceToolId:'project_explorer', destinationToolId:'project_passport', sourceRole:'architect', destinationRole:'client', artifact:'Project brief', decisionGate:'Client brief confirmation', projection:'safe-demonstration-projection' },
  { id:'appoint-team-raci', stage:'Appoint', sourceToolId:'professional_directory', destinationToolId:'team_workspace', sourceRole:'architect', destinationRole:'client', artifact:'Professional appointment', decisionGate:'Appointment acceptance', projection:'safe-demonstration-projection' },
  { id:'design-engineering-drawings', stage:'Design', sourceToolId:'engineering_calc', destinationToolId:'documents_drawings', sourceRole:'engineer', destinationRole:'architect', artifact:'Calculation schedule', decisionGate:'Coordinated issue', projection:'safe-demonstration-projection' },
  { id:'comply-xa-municipal', stage:'Comply', sourceToolId:'xa', destinationToolId:'municipal', sourceRole:'architect', destinationRole:'town_planner', artifact:'XA submission', decisionGate:'Authority submission', projection:'safe-demonstration-projection' },
  { id:'procure-bom-rfq', stage:'Procure', sourceToolId:'bom', destinationToolId:'rfq_marketplace', sourceRole:'quantity_surveyor', destinationRole:'contractor', artifact:'Tender schedule', decisionGate:'Tender issue', projection:'safe-demonstration-projection' },
  { id:'build-itp-ncr', stage:'Build', sourceToolId:'itp', destinationToolId:'ncr_manager', sourceRole:'contractor', destinationRole:'architect', artifact:'Inspection evidence', decisionGate:'Quality hold point', projection:'safe-demonstration-projection' },
  { id:'pay-contract-payment', stage:'Pay', sourceToolId:'contract_admin', destinationToolId:'payments_escrow', sourceRole:'quantity_surveyor', destinationRole:'client', artifact:'Payment certificate', decisionGate:'Workflow approval', projection:'safe-demonstration-projection' },
  { id:'closeout-snag-documents', stage:'Close-out', sourceToolId:'snag_manager', destinationToolId:'documents_drawings', sourceRole:'contractor', destinationRole:'architect', artifact:'Close-out evidence', decisionGate:'Practical completion sign-off', projection:'safe-demonstration-projection' },
];

export function stageExplorationToolIds(stage: StageKey): string[] { return [...new Set(STAGE_TOOL_MAP[stage])]; }
export function handoffsForStage(stage: StageKey, lens?: RoleKey): GodHandoff[] { const rows = GOD_MODE_HANDOFFS.filter((handoff) => handoff.stage === stage); return lens ? [...rows].sort((a,b) => Number(b.sourceRole === lens || b.destinationRole === lens) - Number(a.sourceRole === lens || a.destinationRole === lens)) : rows; }
export function validateGodModeDomain(): string[] { const ids = new Set<string>(); const errors: string[] = []; for (const h of GOD_MODE_HANDOFFS) { if (ids.has(h.id)) errors.push(`duplicate:${h.id}`); ids.add(h.id); if (!STAGES.includes(h.stage) || !ROLE_PROFILES[h.sourceRole] || !ROLE_PROFILES[h.destinationRole] || !ALL_TOOLS[h.sourceToolId] || !ALL_TOOLS[h.destinationToolId] || !STAGE_TOOL_MAP[h.stage].includes(h.sourceToolId) || !STAGE_TOOL_MAP[h.stage].includes(h.destinationToolId)) errors.push(`invalid:${h.id}`); } return errors; }
