import { STAGES, STAGE_COPY } from '@/lib/data';
import type { ProjectEntity, StageKey } from '@/lib/types';
import { V8StageTimeline } from '@/components/v8/V8StageTimeline';

interface V8ProjectHeroProps {
  project: ProjectEntity;
  activeStage: StageKey;
  onSelectStage(stage: StageKey): void;
}

export function V8ProjectHero({ project, activeStage, onSelectStage }: V8ProjectHeroProps) {
  return (
    <section data-v8-datum-region="project-hero" className="v8-project-hero">
      <div className="v8-project-top">
        <span>
          <h2>{project.name}</h2>
          <p>{project.location} · {project.client} · {project.professional}</p>
        </span>
        <span className="v8-project-status">● In progress · {project.progress}%</span>
      </div>
      <V8StageTimeline stages={STAGES} activeStage={activeStage} onSelect={onSelectStage} />
      <div className="v8-stage-help">
        <b>{activeStage} stage:</b> {STAGE_COPY[activeStage]}
      </div>
    </section>
  );
}
