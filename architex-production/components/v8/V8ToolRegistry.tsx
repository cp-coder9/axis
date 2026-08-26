'use client';

import { OrigamiIcon } from '@/lib/origami-icons';
import type { ToolDefinition } from '@/lib/types';
import { ToolVersionBadge } from '@/components/ui/ToolVersionBadge';

type V8ToolRegistryProps = {
  tools: ToolDefinition[];
  onOpenTool: (toolId: string) => void;
  onOpenProjectOrientation: () => void;
};

const REFERENCE_GROUP_ORDER = [
  'Practice & Project Management', 'Intelligence & Improvement', 'Planning & Approvals',
  'Compliance & Environment', 'Design & Documentation', 'Commercial & Procurement',
  'Site Execution & Quality', 'Project & Collaboration', 'Platform Services',
  'Communication & Collaboration', 'Engineering & Technical',
] as const;

export function V8ToolRegistry({ tools, onOpenTool, onOpenProjectOrientation }: V8ToolRegistryProps) {
  const groups = new Map<string, ToolDefinition[]>();
  for (const tool of tools) groups.set(tool.group, [...(groups.get(tool.group) ?? []), tool]);
  const orderedGroups = [...groups].sort(([left], [right]) => {
    const leftIndex = REFERENCE_GROUP_ORDER.indexOf(left as typeof REFERENCE_GROUP_ORDER[number]);
    const rightIndex = REFERENCE_GROUP_ORDER.indexOf(right as typeof REFERENCE_GROUP_ORDER[number]);
    return (leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex) - (rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex);
  });

  return (
    <section className="v8-tool-registry" data-testid="v8-tool-registry">
      <header className="v8-registry-page-head" data-v8-registry-region="page-head">
        <span className="v8-registry-page-icon" aria-hidden="true"><OrigamiIcon name="tools" size={26} /></span>
        <div className="v8-registry-page-copy">
          <h1>Workspace Tool Registry</h1>
          <p>Every current and planned tool is represented. Live samples retain their original workflow; scaffolds define how the missing modules will mount into Datum OS.</p>
        </div>
        <button type="button" className="v8-registry-orientation" onClick={onOpenProjectOrientation}>Open project orientation</button>
      </header>

      <div className="v8-registry-notice" data-v8-registry-region="notice">
        <strong>One capability, two orientations.</strong> Standalone and project modes share the same implementation. Scope, data sources and output registration change; the tool does not duplicate.
      </div>

      <section className="v8-registry-catalogue" data-v8-registry-region="catalogue">
        <header className="v8-registry-intro">
          <h2>Complete workspace tool registry</h2>
          <p>Live modules and future integration scaffolds share one navigation, context and iconography contract.</p>
        </header>

        {orderedGroups.map(([group, groupTools]) => (
          <section key={group} className="v8-registry-group" data-v8-registry-group={group}>
            <h3>{group}<span>{groupTools.length} tools</span></h3>
            <div className="v8-registry-grid">
              {groupTools.map(tool => (
                <button
                  key={tool.id}
                  type="button"
                  className={`v8-registry-tool ${tool.status === 'scaffold' ? 'is-scaffold' : ''}`}
                  data-v8-registry-tool
                  data-tool-id={tool.id}
                  onClick={() => onOpenTool(tool.id)}
                >
                  <span className="v8-registry-tool-icon" aria-hidden="true"><OrigamiIcon name={tool.icon} size={23} /></span>
                  <span className="v8-registry-tool-copy">
                    <span className="v8-registry-tool-name"><b>{tool.name}</b><ToolVersionBadge version={tool.version} /></span>
                    <small>{tool.stage}</small>
                  </span>
                  <span className={`v8-registry-status ${tool.status === 'scaffold' ? 'is-scaffold' : ''}`}>
                    {tool.status === 'live' ? 'Live sample' : 'Scaffold'}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </section>
    </section>
  );
}
