import type { RoleKey } from '@/lib/types';

export type SpecForgeCapability = 'view' | 'author' | 'create_workspace' | 'issue' | 'review_budget' | 'drawing_request';

const CAPABILITIES: Record<SpecForgeCapability, ReadonlySet<RoleKey>> = {
  view: new Set(['architect','bep','engineer','energy_professional','fire_engineer','quantity_surveyor','client','developer','contractor','subcontractor','supplier','site_manager','organisation_admin','admin','platform_admin']),
  author: new Set(['architect','bep','engineer','energy_professional','fire_engineer','contractor','subcontractor','supplier','platform_admin']),
  create_workspace: new Set(['architect','bep','organisation_admin','admin','platform_admin']),
  issue: new Set(['architect','bep','platform_admin']),
  review_budget: new Set(['architect','bep','quantity_surveyor','platform_admin']),
  drawing_request: new Set(['architect','bep','engineer','energy_professional','fire_engineer','platform_admin']),
};

export const canUseSpecForge = (role: RoleKey, capability: SpecForgeCapability): boolean =>
  CAPABILITIES[capability].has(role);

export const specForgeCapabilitySnapshot = (): Record<SpecForgeCapability, RoleKey[]> =>
  Object.fromEntries(Object.entries(CAPABILITIES).map(([key, roles]) => [key, [...roles].sort()])) as Record<SpecForgeCapability, RoleKey[]>;
