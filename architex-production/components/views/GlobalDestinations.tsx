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
  const destination = GLOBAL_DESTINATIONS[view];
  const isCommand = view === 'command';

  return (
    <section className="space-y-5" data-testid={`global-destination-${view}`}>
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: `${destination.tone}18`, color: destination.tone }}
        >
          <OrigamiIcon name={destination.icon} size={26} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#102033]">{content.heading}</h1>
          <p className="text-xs text-[#657287]">{content.subheading}</p>
        </div>
        {content.primaryAction && (
          <button
            onClick={() => onNavigate(content.primaryAction!.action)}
            className="ml-auto inline-flex items-center gap-2 px-4 py-2 text-white rounded-xl text-xs font-bold transition-colors"
            style={{ background: destination.tone }}
          >
            <OrigamiIcon name={content.primaryAction.icon} size={16} />
            {content.primaryAction.label}
          </button>
        )}
      </div>

      <div className={`grid grid-cols-1 gap-4 ${isCommand ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
        {content.cards.map((card) => (
          <button
            key={card.label}
            onClick={() => onNavigate(card.action)}
            className="group flex items-start gap-3 p-4 bg-white border border-[#102033]/10 rounded-2xl text-left shadow-sm hover:shadow-md hover:border-[#19B7B0]/30 transition-all"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${card.tone}15`, color: card.tone }}
            >
              <OrigamiIcon name={card.icon} size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm font-bold text-[#102033] group-hover:text-[#167E79]">
                {card.label}
                {card.badge && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#102033]/5 text-[#657287]">{card.badge}</span>}
              </div>
              <div className="text-xs text-[#657287] mt-0.5">{card.description}</div>
            </div>
          </button>
        ))}
      </div>

      {content.warning && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
          <strong>Note:</strong> {content.warning}
        </div>
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
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#DFF5F2] flex items-center justify-center text-[#167E79]">
          <OrigamiIcon name="settings" size={26} />
        </div>
        <div><h1 className="text-xl font-bold text-[#102033]">{content.heading}</h1><p className="text-xs text-[#657287]">{content.subheading}</p></div>
      </div>
      <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Settings sections">
        {tabs.map((item) => (
          <button
            key={item.id}
            id={`settings-tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            aria-controls={`settings-panel-${item.id}`}
            tabIndex={tab === item.id ? 0 : -1}
            onClick={() => setTab(item.id)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') selectAdjacentTab(1);
              if (event.key === 'ArrowLeft') selectAdjacentTab(-1);
            }}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-[11px] font-bold ${tab === item.id ? 'bg-[#167E79] text-white shadow-sm' : 'bg-white border border-[#102033]/10 text-[#657287]'}`}
          >
            <OrigamiIcon name={item.icon} size={14} />{item.label}
          </button>
        ))}
      </div>
      <div id={`settings-panel-${tab}`} role="tabpanel" aria-labelledby={`settings-tab-${tab}`} aria-label={activeTab.label}>
      {tab === 'users' ? <UserManagementSection currentRole={currentRole} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {sections[tab].map((section) => <div key={section.title} className="p-4 bg-white border border-[#102033]/10 rounded-2xl shadow-sm"><div className="font-bold text-[#102033] mb-1">{section.title}</div><div className="text-[#657287]">{section.detail}</div></div>)}
        </div>
      )}
      </div>
    </section>
  );
}
