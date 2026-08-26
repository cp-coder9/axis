import type { StageKey } from '@/lib/types';

interface V8StageTimelineProps {
  stages: readonly StageKey[];
  activeStage: StageKey;
  onSelect(stage: StageKey): void;
}

export function V8StageTimeline({ stages, activeStage, onSelect }: V8StageTimelineProps) {
  return (
    <div className="v8-stages" role="group" aria-label="Project lifecycle stages">
      {stages.map((stage, index) => {
        const isActive = stage === activeStage;
        return (
          <button
            key={stage}
            type="button"
            data-v8-stage={stage}
            className={isActive ? 'v8-stage is-active' : 'v8-stage'}
            aria-current={isActive ? 'step' : undefined}
            onClick={() => onSelect(stage)}
            title={`Show ${stage} stage tools`}
          >
            <i aria-hidden="true">{index + 1}</i>
            <span>{stage}</span>
          </button>
        );
      })}
    </div>
  );
}
