import { OrigamiIcon } from '@/lib/origami-icons';
import type { ToolDefinition } from '@/lib/types';

interface V8DatumCardProps {
  tool: ToolDefinition;
  metric: readonly [string, string];
  orientation: 'above' | 'below';
  onOpen(id: string): void;
}

export function V8DatumCard({ tool, metric, orientation, onOpen }: V8DatumCardProps) {
  return (
    <button
      type="button"
      data-testid="v8-datum-card"
      data-tool-id={tool.id}
      className={`v8-datum-card is-${orientation}`}
      onClick={() => onOpen(tool.id)}
    >
      <span className="v8-datum-card-head">
        <i aria-hidden="true"><OrigamiIcon name={tool.icon} size={22} /></i>
        <strong>{tool.name}</strong>
      </span>
      <p>{tool.summary}</p>
      <span className="v8-datum-card-meta">
        <span>{metric[0]}</span>
        <span aria-hidden="true">›</span>
      </span>
      <span className="v8-datum-card-meta">
        <span>{metric[1]}</span>
        <i>{tool.status === 'live' ? 'Live' : 'Scaffold'}</i>
      </span>
    </button>
  );
}
