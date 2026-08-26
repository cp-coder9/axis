import { Button } from '@/components/ui/Button';
import { OrigamiIcon } from '@/lib/origami-icons';

export interface V8PageAction {
  id: string;
  label: string;
  icon: string;
  onClick(): void;
  primary?: boolean;
}

interface V8PageHeadProps {
  title: string;
  description: string;
  actions: readonly V8PageAction[];
}

export function V8PageHead({ title, description, actions }: V8PageHeadProps) {
  return (
    <header data-v8-datum-region="page-head" className="v8-datum-page-head">
      <div className="v8-datum-page-title">
        <span className="v8-datum-page-icon" aria-hidden="true">
          <OrigamiIcon name="projects" size={28} />
        </span>
        <span className="v8-datum-page-copy">
          <h1>{title}</h1>
          <p>{description}</p>
        </span>
      </div>
      <div className="v8-datum-page-actions" aria-label="Project actions">
        {actions.map((action) => (
          <Button
            key={action.id}
            type="button"
            size="sm"
            variant={action.primary ? 'primary' : 'quiet'}
            data-v8-datum-action={action.id}
            onClick={action.onClick}
          >
            <OrigamiIcon name={action.icon} size={16} />
            {action.label}
          </Button>
        ))}
      </div>
    </header>
  );
}
