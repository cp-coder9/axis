'use client';

import { useState } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import type { StageKey, ToolDefinition } from '@/lib/types';
import { V8DatumCard } from '@/components/v8/V8DatumCard';

const position = (index: number, count: number) => `${12 + ((index + 1) * 82) / (count + 1)}%`;
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

  return (
    <section data-v8-datum-region="datum-viewport" className="v8-datum-viewport">
      <div className="v8-datum-world" style={{ transform: `scale(${zoom})` }}>
        <div className="v8-datum-line" aria-hidden="true" />
        <div className="v8-datum-origin">
          <img src="/logo.png" alt="Architex bird" />
        </div>
        <div className="v8-datum-label">DATUM<span>single line of truth</span></div>
        <div className="v8-datum-stage-badge">
          <b>{stage} · {godMode ? 'God Mode' : roleLabel}</b>
          {tools.length} {godMode ? 'stage-relevant' : 'role-relevant'} workspaces are active here.
        </div>
        {tools.map((tool, index) => {
          const orientation = index % 2 === 0 ? 'above' : 'below';
          return (
            <div
              key={tool.id}
              className={`v8-datum-slot is-${orientation}`}
              style={{ left: position(index, tools.length) }}
            >
              <V8DatumCard
                tool={tool}
                metric={metrics[tool.id] ?? fallbackMetric}
                orientation={orientation}
                onOpen={onOpenTool}
              />
              <i className="v8-datum-node" aria-hidden="true" />
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
