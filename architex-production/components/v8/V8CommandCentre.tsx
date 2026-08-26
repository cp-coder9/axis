'use client';

import { OrigamiIcon } from '@/lib/origami-icons';
import { GLOBAL_DESTINATION_CONTENT, type NavigationEvent } from '@/lib/navigation';

type V8CommandCentreProps = {
  activeProjectName: string;
  toolCount: number;
  onNavigate: (event: NavigationEvent) => void;
};

export function V8CommandCentre({ activeProjectName, toolCount, onNavigate }: V8CommandCentreProps) {
  const content = GLOBAL_DESTINATION_CONTENT.command;
  const descriptions = [
    `Enter ${activeProjectName} and work through the project’s single line of truth.`,
    'Open the full supplied operational command centre as a separate tool.',
    `Browse ${toolCount} live and scaffolded capabilities.`,
    'Review the product feedback loop and roadmap pipeline.',
  ];

  return (
    <section className="v8-command-centre" data-testid="global-destination-command">
      <header className="v8-command-head" data-v8-command-region="page-head">
        <span className="v8-command-page-icon" aria-hidden="true"><OrigamiIcon name="dashboard" size={28} /></span>
        <div className="v8-command-copy">
          <h1>{content.heading}</h1>
          <p>{content.subheading}</p>
        </div>
      </header>

      <div className="v8-command-grid" data-v8-command-region="cards">
        {content.cards.map((card, index) => (
          <button
            key={card.label}
            type="button"
            className="v8-command-card"
            data-v8-command-card
            onClick={() => onNavigate(card.action)}
          >
            <span className="v8-command-card-head">
              <span className="v8-command-card-icon" aria-hidden="true"><OrigamiIcon name={card.icon} size={26} /></span>
              <h3>{card.label}</h3>
            </span>
            <span className="v8-command-card-copy">{descriptions[index]}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
