import {
  REFERENCE_ROLE_TOOL_MAP,
  REFERENCE_STAGE_TOOL_MAP,
  REFERENCE_TOOLS,
} from './godmode-reference';

export const REFERENCE_COMMON_TOOL_IDS = ['meetings', 'wingman', 'project_passport', 'forms'] as const;

export interface ReferenceNavigationContext {
  readonly stage: string;
  readonly presentationRole: string;
  readonly godMode: boolean;
}

const knownToolIds = (ids: readonly string[]) => ids.filter((id) => Boolean(REFERENCE_TOOLS[id]));

export function referencePresentationRole(role: string): string {
  if (REFERENCE_ROLE_TOOL_MAP[role]) return role;
  if (role === 'organisation_admin') return 'admin';
  throw new Error(`Unknown reference presentation role: ${role}`);
}

export function referenceRoleToolIds(presentationRole: string): string[] {
  const roleIds = REFERENCE_ROLE_TOOL_MAP[presentationRole];
  if (!roleIds) throw new Error(`Unknown reference presentation role: ${presentationRole}`);
  return [...new Set(knownToolIds(roleIds))];
}

export function referenceToolIdsForContext({
  stage,
  presentationRole,
  godMode,
}: ReferenceNavigationContext): string[] {
  const stageIds = REFERENCE_STAGE_TOOL_MAP[stage];
  if (!stageIds) throw new Error(`Unknown reference stage: ${stage}`);
  const roleIds = REFERENCE_ROLE_TOOL_MAP[presentationRole];
  if (!roleIds) throw new Error(`Unknown reference presentation role: ${presentationRole}`);

  const stageTools = knownToolIds(stageIds);
  if (godMode) return [...new Set(stageTools)];

  const allowed = new Set(roleIds);
  const common = new Set<string>(REFERENCE_COMMON_TOOL_IDS);
  return [...new Set(stageTools.filter((id) => allowed.has(id) || common.has(id)))];
}
