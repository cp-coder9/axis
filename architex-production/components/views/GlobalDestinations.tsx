'use client';

import React, { useState } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { RoleKey } from '@/lib/types';
import {
  GLOBAL_DESTINATION_CONTENT,
  GLOBAL_DESTINATIONS,
  type GlobalDestinationId,
  type NavigationEvent,
} from '@/lib/navigation';
import { UserManagementSection } from '@/components/views/UserManagementSection';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, Surface } from '@/components/ui/Surface';
import { StatusBadge } from '@/components/ui/StatusBadge';

type ContentDestinationId = keyof typeof GLOBAL_DESTINATION_CONTENT;

interface GlobalDestinationsProps {
  view: GlobalDestinationId;
  currentRole: RoleKey;
  onNavigate: (event: NavigationEvent) => void;
}

export const GlobalDestinations: React.FC<GlobalDestinationsProps> = ({ view, currentRole, onNavigate }) => {
  if (!(view in GLOBAL_DESTINATION_CONTENT)) return null;
  const contentView = view as ContentDestinationId;
  if (contentView === 'settings') return <SettingsView currentRole={currentRole} />;
  return <DestinationView view={contentView} onNavigate={onNavigate} />;
};

function DestinationView({
  view,
  onNavigate,
}: {
  view: Exclude<ContentDestinationId, 'settings'>;
  onNavigate: (event: NavigationEvent) => void;
}) {
  const content = GLOBAL_DESTINATION_CONTENT[view];
  const isCommand = view === 'command';

  return (
    <section className="space-y-5" data-testid={`global-destination-${view}`}>
      <PageHeader
        title={content.heading}
        metadata={content.subheading}
        origami={<OrigamiIcon name={GLOBAL_DESTINATIONS[view].icon} size={26} />}
        actions={content.primaryAction ? <Button size="sm" onClick={() => onNavigate(content.primaryAction!.action)}><OrigamiIcon name={content.primaryAction.icon} size={16} /> {content.primaryAction.label}</Button> : undefined}
      />

      <div className={`grid grid-cols-1 gap-4 ${isCommand ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
        {content.cards.map((card) => (
          <Button
            key={card.label}
            variant="secondary"
            onClick={() => onNavigate(card.action)}
            className="h-auto items-start gap-3 p-4 text-left"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--ax-radius-sm)] bg-[var(--ax-surface-2)] text-[var(--ax-action-primary)]">
              <OrigamiIcon name={card.icon} size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 font-bold">
                {card.label}
                {card.badge && <StatusBadge tone="neutral" label={card.badge} />}
              </div>
              <div className="mt-0.5 text-[var(--ax-text-muted)]">{card.description}</div>
            </div>
          </Button>
        ))}
      </div>

      {content.warning && (
        <Surface level="inset" className="text-[var(--ax-text)]">
          <strong>Note:</strong> {content.warning}
        </Surface>
      )}
    </section>
  );
}

type SettingsTab = 'users' | 'organisation' | 'security' | 'api' | 'retention';

function SettingsView({ currentRole }: { currentRole: RoleKey }) {
  const [tab, setTab] = useState<SettingsTab>('users');
  const content = GLOBAL_DESTINATION_CONTENT.settings;
  const tabIds: SettingsTab[] = ['users', 'organisation', 'security', 'api', 'retention'];
  const icons = ['team_workspace', 'projects', 'safety', 'integration', 'document'];
  const tabs = tabIds.map((id, index) => ({ id, label: content.tabs![index], icon: icons[index] }));
  const activeTab = tabs.find((item) => item.id === tab)!;
  const selectAdjacentTab = (offset: number) => {
    const currentIndex = tabIds.indexOf(tab);
    const nextTab = tabIds[(currentIndex + offset + tabIds.length) % tabIds.length];
    setTab(nextTab);
    requestAnimationFrame(() => document.getElementById(`settings-tab-${nextTab}`)?.focus());
  };
  const sections: Record<Exclude<SettingsTab, 'users'>, { title: string; detail: string }[]> = {
    organisation: [
      { title: 'Organisation Profile', detail: 'Your practice, branding, and contact information.' },
      { title: 'Team Settings', detail: 'Practice-wide defaults, notifications and collaboration preferences.' },
    ],
    security: [
      { title: 'Authentication', detail: 'JWT session policy, MFA status, and single sign-on configuration.' },
      { title: 'Role-Based Access Control', detail: '20 professional personas with field-level action gates.' },
      { title: 'Audit & Compliance', detail: 'Append-only audit trail, POPIA data handling, and SANS/NBR verification records.' },
    ],
    api: [
      { title: 'API Tokens', detail: 'Create and rotate service tokens for API integration.' },
      { title: 'Rate Limits', detail: 'Per-tenant request limits, async job quotas, and webhook configurations.' },
    ],
    retention: [
      { title: 'Document Retention', detail: 'Project document retention periods and archival schedules.' },
      { title: 'Export Controls', detail: 'Full-project exports, redaction policies, and data deletion requests.' },
    ],
  };

  return (
    <section className="space-y-5" data-testid="global-destination-settings">
      <PageHeader title={content.heading} metadata={content.subheading} origami={<OrigamiIcon name="settings" size={26} />} />
      <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Settings sections">
        {tabs.map((item) => (
          <Button
            key={item.id}
            id={`settings-tab-${item.id}`}
            type="button"
            variant={tab === item.id ? 'primary' : 'secondary'}
            size="sm"
            role="tab"
            aria-selected={tab === item.id}
            aria-controls={`settings-panel-${item.id}`}
            tabIndex={tab === item.id ? 0 : -1}
            onClick={() => setTab(item.id)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') selectAdjacentTab(1);
              if (event.key === 'ArrowLeft') selectAdjacentTab(-1);
            }}
            className="gap-1.5 whitespace-nowrap"
          >
            <OrigamiIcon name={item.icon} size={14} />{item.label}
          </Button>
        ))}
      </div>
      <div id={`settings-panel-${tab}`} role="tabpanel" aria-labelledby={`settings-tab-${tab}`} aria-label={activeTab.label}>
      {tab === 'users' ? <UserManagementSection currentRole={currentRole} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sections[tab].map((section) => <Card key={section.title} level="raised"><div className="mb-1 font-bold text-[var(--ax-text)]">{section.title}</div><div className="text-[var(--ax-text-muted)]">{section.detail}</div></Card>)}
        </div>
      )}
      </div>
    </section>
  );
}
