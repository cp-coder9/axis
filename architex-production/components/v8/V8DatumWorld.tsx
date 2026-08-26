'use client';

import { useState } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import type { StageKey, ToolDefinition } from '@/lib/types';
import { V8DatumCard } from '@/components/v8/V8DatumCard';

const rowPosition = (index: number, count: number) => `${count < 2 ? 45 : 7 + (index * 86) / (count - 1)}%`;
const fallbackMetric = ['Project connected', 'Integration ready'] as const;

interface V8DatumWorldProps {
  tools: readonly ToolDefinition[];
  metrics: Record<string, readonly [string, string]>;
  stage: StageKey;
  roleLabel: string;
  godMode: boolean;
  onOpenTool(id: string): void;
}

export function V8DatumWorld({ tools, metrics, stage, roleLabel, godMode, onOpenTool }: V8DatumWorldProps) {
  const [zoom, setZoom] = useState(1);
  const topCount = Math.ceil(tools.length / 2);
  const positions = tools.map((_, index) => {
    const above = index < topCount;
    const rowIndex = above ? index : index - topCount;
    const rowCount = above ? topCount : tools.length - topCount;
    return { orientation: above ? 'above' as const : 'below' as const, left: rowPosition(rowIndex, rowCount) };
  });

  return (
    <section data-v8-datum-region="datum-viewport" className="v8-datum-viewport">
      <div className="v8-datum-world" style={{ minWidth: `${godMode ? 1450 : 1120}px`, transform: `scale(${zoom})` }}>
        <div className="v8-datum-line" aria-hidden="true" />
        <div className="v8-datum-origin">
          <img src="/logo.png" alt="Architex bird" />
        </div>
        <div className="v8-datum-label">DATUM<span>single line of truth</span></div>
        <div className="v8-datum-stage-badge">
          <b>{stage} · {godMode ? 'God Mode' : roleLabel}</b>
          {tools.length} {godMode ? 'stage-relevant' : 'role-relevant'} workspaces are active here.
        </div>
        {positions.map((position, index) => (
          <i key={`node-${tools[index].id}`} className="v8-datum-node" style={{ left: position.left }} aria-hidden="true" />
        ))}
        {tools.map((tool, index) => {
          const { orientation, left } = positions[index];
          return (
            <div
              key={tool.id}
              className={`v8-datum-slot is-${orientation}`}
              style={{ left }}
            >
              <V8DatumCard
                tool={tool}
                metric={metrics[tool.id] ?? fallbackMetric}
                orientation={orientation}
                onOpen={onOpenTool}
              />
            </div>
          );
        })}
      </div>
      <div className="v8-datum-controls" aria-label="Datum canvas controls">
        <button type="button" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(.65, value - .1))}>−</button>
        <input
          aria-label="Datum canvas zoom"
          type="range"
          min=".65"
          max="1.35"
          step=".05"
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
        />
        <output aria-live="polite">{Math.round(zoom * 100)}%</output>
        <button type="button" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(1.35, value + .1))}>+</button>
        <button type="button" aria-label="Fit datum to view" onClick={() => setZoom(1)}>
          <OrigamiIcon name="expand" size={17} />
        </button>
      </div>
    </section>
  );
}
