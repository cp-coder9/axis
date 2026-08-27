import rawReference from '@/generated/godmode-reference.json';

import type { ToolDefinition, ToolTabConfig, ToolTone, ToolVersion } from '@/lib/types';

export type ReferenceToolStatus = 'live' | 'scaffold';
export type ReferenceTabKind = 'top' | 'scroll' | 'call' | 'hs' | 'scaffold' | 'native';

export interface ReferenceTab {
  readonly key?: string;
  readonly label: string;
  readonly group?: string;
  readonly icon?: string;
  readonly kind?: ReferenceTabKind;
  readonly badge?: string;
  readonly text?: string;
  readonly fn?: string;
  readonly arg?: string;
}

export interface ReferenceTool {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly tone: ToolTone;
  readonly group: string;
  readonly stage: string;
  readonly summary: string;
  readonly status: ReferenceToolStatus;
  readonly source: string;
  readonly tabs: readonly ReferenceTab[];
}

interface GodModeReference {
  readonly schemaVersion: 1;
  readonly sourcePath: string;
  readonly sourceSha256: string;
  readonly tools: Readonly<Record<string, ReferenceTool>>;
  readonly stageToolMap: Readonly<Record<string, readonly string[]>>;
  readonly roleToolMap: Readonly<Record<string, readonly string[]>>;
  readonly unresolvedMapToolIds: readonly string[];
}

const TOOL_TONES = new Set<ToolTone>(['core', 'teal', 'cobalt', 'lavender', 'coral', 'amber']);
const TAB_KINDS = new Set<ReferenceTabKind>(['top', 'scroll', 'call', 'hs', 'scaffold', 'native']);
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string');

function assertString(value: unknown, path: string): asserts value is string {
  if (typeof value !== 'string') throw new Error(`Invalid God Mode reference string at ${path}`);
}

function validateReference(value: unknown): asserts value is GodModeReference {
  if (!isRecord(value) || value.schemaVersion !== 1 || !isRecord(value.tools)) {
    throw new Error('Invalid God Mode reference root');
  }
  assertString(value.sourcePath, 'sourcePath');
  assertString(value.sourceSha256, 'sourceSha256');
  if (Object.keys(value.tools).length !== 47) throw new Error('God Mode reference must contain 47 tools');

  for (const [id, toolValue] of Object.entries(value.tools)) {
    if (!isRecord(toolValue)) throw new Error(`Invalid God Mode reference tool ${id}`);
    for (const field of ['id', 'name', 'icon', 'tone', 'group', 'stage', 'summary', 'status', 'source']) {
      assertString(toolValue[field], `tools.${id}.${field}`);
    }
    if (toolValue.id !== id) throw new Error(`God Mode reference tool id mismatch for ${id}`);
    if (!TOOL_TONES.has(toolValue.tone as ToolTone)) throw new Error(`Invalid tool tone for ${id}`);
    if (toolValue.status !== 'live' && toolValue.status !== 'scaffold') throw new Error(`Invalid tool status for ${id}`);
    if (!Array.isArray(toolValue.tabs)) throw new Error(`Invalid tool tabs for ${id}`);
    for (const [index, tabValue] of toolValue.tabs.entries()) {
      if (!isRecord(tabValue)) throw new Error(`Invalid tab at tools.${id}.tabs.${index}`);
      assertString(tabValue.label, `tools.${id}.tabs.${index}.label`);
      for (const field of ['key', 'group', 'icon', 'kind', 'badge', 'text', 'fn', 'arg']) {
        if (tabValue[field] !== undefined) assertString(tabValue[field], `tools.${id}.tabs.${index}.${field}`);
      }
      if (tabValue.kind !== undefined && !TAB_KINDS.has(tabValue.kind as ReferenceTabKind)) {
        throw new Error(`Invalid tab kind at tools.${id}.tabs.${index}`);
      }
    }
  }

  for (const mapName of ['stageToolMap', 'roleToolMap'] as const) {
    const map = value[mapName];
    if (!isRecord(map) || !Object.values(map).every(isStringArray)) throw new Error(`Invalid ${mapName}`);
  }
  if (!isStringArray(value.unresolvedMapToolIds)) throw new Error('Invalid unresolvedMapToolIds');
}

const referenceCandidate: unknown = rawReference;
validateReference(referenceCandidate);

export const GODMODE_REFERENCE: GodModeReference = referenceCandidate;
export const REFERENCE_TOOLS = GODMODE_REFERENCE.tools;
export const REFERENCE_STAGE_TOOL_MAP = GODMODE_REFERENCE.stageToolMap;
export const REFERENCE_ROLE_TOOL_MAP = GODMODE_REFERENCE.roleToolMap;

const tabSlug = (label: string) => label
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '');

function runtimeTabs(tool: ReferenceTool): ToolTabConfig[] {
  const tabs = tool.tabs.map((tab) => ({ ...tab, key: tab.arg || tabSlug(tab.label) }));
  const keys = tabs.map((tab) => tab.key);
  if (new Set(keys).size !== keys.length) throw new Error(`Duplicate reference tab identity for ${tool.id}`);
  return tabs;
}

export function createReferenceToolDefinitions(
  versions: Readonly<Record<string, ToolVersion>>,
): Record<string, ToolDefinition> {
  return Object.fromEntries(Object.entries(REFERENCE_TOOLS).map(([id, tool]) => [id, {
    ...tool,
    tabs: runtimeTabs(tool),
    version: versions[id] ?? '1.0',
  }]));
}
