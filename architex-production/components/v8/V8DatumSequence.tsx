import { OrigamiIcon } from '@/lib/origami-icons';
import type { ToolDefinition } from '@/lib/types';

const fallbackMetric = ['Project connected', 'Integration ready'] as const;

interface V8DatumSequenceProps {
  tools: readonly ToolDefinition[];
  metrics: Record<string, readonly [string, string]>;
  onOpenTool(id: string): void;
}

export function V8DatumSequence({ tools, metrics, onOpenTool }: V8DatumSequenceProps) {
  return (
    <section className="v8-datum-sequence" aria-label="Datum-connected tools">
      {tools.map((tool, index) => (
        <button
          key={tool.id}
          type="button"
          data-testid="v8-datum-sequence-item"
          data-tool-id={tool.id}
          onClick={() => onOpenTool(tool.id)}
        >
          <OrigamiIcon name={tool.icon} size={20} />
          <span>
            <b>{index + 1}. {tool.name}</b>
            <small>{(metrics[tool.id] ?? fallbackMetric)[0]}</small>
          </span>
          <i>{tool.status === 'live' ? 'Live' : 'Scaffold'}</i>
        </button>
      ))}
    </section>
  );
}
