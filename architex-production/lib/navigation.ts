import { OrientationMode, ToolDefinition, ToolTabConfig } from '@/lib/types';

export interface GlobalDestination {
  id: string;
  label: string;
  icon: string;
  tone: string;
  meta?: string;
  mode: OrientationMode;
  view: 'datum' | 'registry' | 'tool' | 'global' | 'god';
  defaultToolId?: string | null;
}

export const GLOBAL_DESTINATIONS: Record<string, GlobalDestination> = {
  command: { id: 'command', label: 'OS Command Centre', icon: 'dashboard', tone: '#19B7B0', mode: 'project', view: 'global' },
  projects: { id: 'projects', label: 'Project Space', icon: 'projects', tone: '#19B7B0', mode: 'project', view: 'datum' },
  tools: { id: 'tools', label: 'Workspace Tools', icon: 'tools', tone: '#8B5CF6', mode: 'standalone', view: 'registry' },
  inbox: { id: 'inbox', label: 'Inbox & Collaboration', icon: 'inbox', tone: '#FF6B6B', mode: 'standalone', view: 'global' },
  documents: { id: 'documents', label: 'Documents', icon: 'document', tone: '#19B7B0', mode: 'project', view: 'global' },
  finance: { id: 'finance', label: 'Finance & Payments', icon: 'finance', tone: '#FFB020', mode: 'project', view: 'global' },
  knowledge: { id: 'knowledge', label: 'Knowledge & CPD', icon: 'knowledge', tone: '#2563EB', mode: 'project', view: 'global' },
  feedback: { id: 'feedback', label: 'Feedback Intelligence', icon: 'feedback', tone: '#8B5CF6', mode: 'standalone', view: 'tool', defaultToolId: 'feedback' },
  settings: { id: 'settings', label: 'Settings', icon: 'settings', tone: '#19B7B0', mode: 'project', view: 'global' },
};

export function firstTabKey(tool?: ToolDefinition | null): string {
  return tool?.tabs?.[0]?.key || tool?.tabs?.[0]?.label || '0';
}

export function resolveToolTabKey(tool: ToolDefinition | null, tabKey: string): string {
  if (!tool) return '0';
  const match = tool.tabs.find((t) => (t.key || t.label) === tabKey);
  return match ? tabKey : firstTabKey(tool);
}

export function groupTabsByGroup(tabs: ToolTabConfig[]): { group: string; tabs: { tab: ToolTabConfig; index: number }[] }[] {
  const grouped: Record<string, { tab: ToolTabConfig; index: number }[]> = {};
  tabs.forEach((tab, idx) => {
    const g = tab.group || 'General';
    (grouped[g] ??= []).push({ tab, index: idx });
  });
  return Object.entries(grouped).map(([group, items]) => ({ group, tabs: items }));
}
