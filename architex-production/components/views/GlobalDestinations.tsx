'use client';

import React, { useState } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { UserManagementSection } from '@/components/views/UserManagementSection';

interface GlobalDestinationsProps {
  view: string;
  mode: 'project' | 'standalone';
  activeProject: ProjectEntity;
  currentRole: RoleKey;
  onOpenTool: (toolId: string, opts?: { mode?: 'project' | 'standalone'; global?: string }) => void;
  /** Navigate to another global destination (rail item) without opening a tool. */
  onSelectGlobal?: (globalId: string) => void;
}

export const GlobalDestinations: React.FC<GlobalDestinationsProps> = ({
  view,
  mode,
  activeProject,
  currentRole,
  onOpenTool,
  onSelectGlobal,
}) => {
  switch (view) {
    case 'command':
      return <CommandCentreView onOpenTool={onOpenTool} onSelectGlobal={onSelectGlobal} />;
    case 'inbox':
      return <CollabHubView onOpenTool={onOpenTool} />;
    case 'documents':
      return <DocumentsView onOpenTool={onOpenTool} />;
    case 'finance':
      return <FinanceView onOpenTool={onOpenTool} />;
    case 'knowledge':
      return <KnowledgeView onOpenTool={onOpenTool} />;
    case 'settings':
      return <SettingsView currentRole={currentRole} />;
    default:
      return null;
  }
};

/* ── OS Command Centre ── */
function CommandCentreView({ onOpenTool, onSelectGlobal }: { onOpenTool: GlobalDestinationsProps['onOpenTool']; onSelectGlobal?: GlobalDestinationsProps['onSelectGlobal'] }) {
  const cards = [
    { id: 'projects', label: 'Datum Project Space', icon: 'projects', desc: 'Stage-driven single line of truth for the active project.', tone: '#19B7B0' },
    { id: 'practice', label: 'Practice & Command Centre', icon: 'practice_management', desc: 'Progress, programme, actions, resources, cost, risk.', tone: '#2563EB' },
    { id: 'tools', label: 'Workspace Tool Registry', icon: 'tools', desc: 'All workspace tools across 8 lifecycle stages.', tone: '#8B5CF6' },
    { id: 'feedback', label: 'Feedback Intelligence', icon: 'feedback', desc: 'Track friction points, feature requests, and platform roadmap.', tone: '#FF6B6B' },
  ];
  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#DFF5F2] flex items-center justify-center text-[#167E79]">
          <OrigamiIcon name="dashboard" size={26} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#102033]">Architex OS Command Centre</h1>
          <p className="text-xs text-[#657287]">Platform-wide navigation, project datum, and workspace tools.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => {
              // Datum Project Space / Workspace Tool Registry are global
              // destinations (rail items), not tools — route them via the
              // navigation contract instead of opening a tool.
              if (card.id === 'projects' && onSelectGlobal) onSelectGlobal('projects');
              else if (card.id === 'tools' && onSelectGlobal) onSelectGlobal('tools');
              else onOpenTool(card.id, { mode: card.id === 'feedback' ? 'standalone' : 'project' });
            }}
            className="group flex items-start gap-3 p-4 bg-white border border-[#102033]/10 rounded-2xl text-left shadow-sm hover:shadow-md hover:border-[#19B7B0]/30 transition-all"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${card.tone}15`, color: card.tone }}>
              <OrigamiIcon name={card.icon} size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-[#102033] group-hover:text-[#167E79] transition-colors">{card.label}</div>
              <div className="text-xs text-[#657287] mt-0.5">{card.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ── Collaboration Hub ── */
function CollabHubView({ onOpenTool }: { onOpenTool: GlobalDestinationsProps['onOpenTool'] }) {
  const cards = [
    { id: 'meetings', label: 'Architex Meetings', icon: 'meetings', desc: 'Schedule, host and govern project meetings. 3 upcoming meetings.', tone: '#FF6B6B', badge: '3' },
    { id: 'inbox_action', label: 'Messages & Action Centre', icon: 'inbox', desc: '7 unread messages, RFI responses, and drawing sign-off requests.', tone: '#FF6B6B', badge: '7' },
    { id: 'approvals_queue', label: 'Approvals Queue', icon: 'approvals_queue', desc: '2 pending multi-party sign-off gates awaiting your decision.', tone: '#FFB020', badge: '2' },
  ];
  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
          <OrigamiIcon name="inbox" size={26} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#102033]">Inbox & Collaboration</h1>
          <p className="text-xs text-[#657287]">Meetings, messages, action approvals and collaboration tools.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onOpenTool(card.id, { mode: 'standalone', global: 'inbox' })}
            className="group p-4 bg-white border border-[#102033]/10 rounded-2xl text-left shadow-sm hover:shadow-md hover:border-[#19B7B0]/30 transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${card.tone}15`, color: card.tone }}>
                <OrigamiIcon name={card.icon} size={22} />
              </div>
              <div className="text-sm font-bold text-[#102033] group-hover:text-[#167E79]">{card.label}</div>
              {card.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 ml-auto">{card.badge}</span>
              )}
            </div>
            <div className="text-xs text-[#657287]">{card.desc}</div>
          </button>
        ))}
      </div>
      <button
        onClick={() => onOpenTool('meetings', { mode: 'standalone', global: 'inbox' })}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B6B] text-white rounded-xl text-xs font-bold hover:bg-[#d95747] transition-colors"
      >
        <OrigamiIcon name="meeting_invite" size={16} />
        Schedule a meeting
      </button>
    </section>
  );
}

/* ── Documents ── */
function DocumentsView({ onOpenTool }: { onOpenTool: GlobalDestinationsProps['onOpenTool'] }) {
  const docs = [
    { title: 'Architectural Set A-101 to A-210', rev: 'Rev P03', size: '24.5 MB' },
    { title: 'Structural Footing Schedule S-201 to S-204', rev: 'Rev B', size: '14.2 MB' },
    { title: 'SANS 10400-XA Prescriptive Report', rev: 'Final', size: '3.1 MB' },
  ];
  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#DFF5F2] flex items-center justify-center text-[#167E79]">
          <OrigamiIcon name="document" size={26} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#102033]">Documents & Drawings</h1>
          <p className="text-xs text-[#657287]">128 drawings, statutory certificates, and specifications on file.</p>
        </div>
        <button
          onClick={() => onOpenTool('documents_drawings', { mode: 'project' })}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-[#19B7B0] text-white rounded-xl text-xs font-bold hover:bg-[#167E79] transition-colors"
        >
          <OrigamiIcon name="document" size={16} />
          Open Documents & Drawings
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {docs.map((doc, idx) => (
          <div key={idx} className="p-3.5 border border-[#102033]/10 rounded-xl bg-white space-y-1 shadow-sm">
            <div className="font-bold text-[#102033]">{doc.title}</div>
            <div className="text-[#657287]">{doc.rev} · {doc.size}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Finance & Payments ── */
function FinanceView({ onOpenTool }: { onOpenTool: GlobalDestinationsProps['onOpenTool'] }) {
  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
          <OrigamiIcon name="finance" size={26} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#102033]">Finance & Payments</h1>
          <p className="text-xs text-[#657287]">Invoices, valuations, retention, and escrow workflow.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <button
          onClick={() => onOpenTool('payments_escrow', { mode: 'project' })}
          className="p-4 bg-white border border-[#102033]/10 rounded-2xl text-left shadow-sm hover:shadow-md hover:border-[#FFB020]/30 transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <OrigamiIcon name="payments_escrow" size={20} />
            </div>
            <div className="font-bold text-[#102033]">Payments & Escrow</div>
          </div>
          <div className="text-[#657287]">Invoice, milestone, approval, retention and release-status workflow. Fund holding is disabled pending legal review.</div>
        </button>
        <button
          onClick={() => onOpenTool('contract_admin', { mode: 'project' })}
          className="p-4 bg-white border border-[#102033]/10 rounded-2xl text-left shadow-sm hover:shadow-md hover:border-[#FFB020]/30 transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <OrigamiIcon name="contract_admin" size={20} />
            </div>
            <div className="font-bold text-[#102033]">Contract Admin</div>
          </div>
          <div className="text-[#657287]">JBCC/NEC payment certificates, variation orders, claims, and EoT records.</div>
        </button>
        <button
          onClick={() => onOpenTool('fee_proposal', { mode: 'project' })}
          className="p-4 bg-white border border-[#102033]/10 rounded-2xl text-left shadow-sm hover:shadow-md hover:border-[#FFB020]/30 transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <OrigamiIcon name="fee_proposal" size={20} />
            </div>
            <div className="font-bold text-[#102033]">Fee Proposal Builder</div>
          </div>
          <div className="text-[#657287]">SACAP/tariff-based professional fee agreements and work-stage allocations.</div>
        </button>
      </div>
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
        <strong>Note:</strong> Fund holding and true escrow are disabled pending legal review and a licensed partner. All payment records shown are workflow-only.
      </div>
    </section>
  );
}

/* ── Knowledge & CPD ── */
function KnowledgeView({ onOpenTool }: { onOpenTool: GlobalDestinationsProps['onOpenTool'] }) {
  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700">
          <OrigamiIcon name="knowledge" size={26} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#102033]">Knowledge & CPD</h1>
          <p className="text-xs text-[#657287]">Standards library, learning tracks, and CPD credit management.</p>
        </div>
        <button
          onClick={() => onOpenTool('cpd_learning', { mode: 'standalone' })}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1d4ed8] transition-colors"
        >
          <OrigamiIcon name="cpd_learning" size={16} />
          Open CPD & Learning
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 border border-[#102033]/10 rounded-xl bg-white shadow-sm">
          <div className="font-bold text-[#102033] mb-1">SANS Standards Library</div>
          <div className="text-[#657287]">SANS 10400 Parts A–XA, SANS 10160, SANS 10162, SANS 3001, NBR references.</div>
        </div>
        <div className="p-3.5 border border-[#102033]/10 rounded-xl bg-white shadow-sm">
          <div className="font-bold text-[#102033] mb-1">CPD Credit Tracker</div>
          <div className="text-[#657287]">Voluntary & Category 1 CPD credits, accredited courses, and statutory validation records.</div>
        </div>
        <div className="p-3.5 border border-[#102033]/10 rounded-xl bg-white shadow-sm">
          <div className="font-bold text-[#102033] mb-1">Learning Tracks</div>
          <div className="text-[#657287]">Structured learning paths for built-environment professionals and platform onboarding.</div>
        </div>
      </div>
    </section>
  );
}

/* ── Settings ── */
function SettingsView({ currentRole }: { currentRole: RoleKey }) {
  const [tab, setTab] = useState<'users' | 'organisation' | 'security' | 'api' | 'retention'>('users');
  const tabs: { id: typeof tab; label: string; icon: string }[] = [
    { id: 'users', label: 'User Management', icon: 'team_workspace' },
    { id: 'organisation', label: 'Organisation', icon: 'projects' },
    { id: 'security', label: 'Security & RBAC', icon: 'safety' },
    { id: 'api', label: 'API Access', icon: 'integration' },
    { id: 'retention', label: 'Data Retention', icon: 'document' },
  ];
  const sections: Record<typeof tab, { title: string; detail: string }[]> = {
    users: [],
    organisation: [
      { title: 'Organisation Profile', detail: 'Your practice, branding, and contact information.' },
      { title: 'Team Settings', detail: 'Practice-wide defaults, notifications and collaboration preferences.' },
    ],
    security: [
      { title: 'Authentication', detail: 'JWT session policy, MFA status, and single sign-on (SSO) configuration.' },
      { title: 'Role-Based Access Control', detail: '20 professional personas with field-level action gates (canEdit, canApprove, canSign).' },
      { title: 'Audit & Compliance', detail: 'Append-only audit trail, POPIA data handling, and SANS/NBR verification records.' },
    ],
    api: [
      { title: 'API Tokens', detail: 'Create and rotate service tokens for API integration (Bearer JWT, 15-minute access).' },
      { title: 'Rate Limits', detail: 'Per-tenant request limits, async job queue quotas, and webhook configurations.' },
    ],
    retention: [
      { title: 'Document Retention', detail: 'Project document retention periods and archival schedules.' },
      { title: 'Export Controls', detail: 'Full-project exports, redaction policies, and data deletion requests.' },
    ],
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#DFF5F2] flex items-center justify-center text-[#167E79]">
          <OrigamiIcon name="settings" size={26} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#102033]">Settings</h1>
          <p className="text-xs text-[#657287]">Platform configuration, user access, security, and organisation management.</p>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-[11px] font-bold transition-all ${
              tab === t.id ? 'bg-[#167E79] text-white shadow-sm' : 'bg-white border border-[#102033]/10 text-[#657287] hover:text-[#102033]'
            }`}
          >
            <OrigamiIcon name={t.icon} size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' ? (
        <UserManagementSection currentRole={currentRole} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {sections[tab].map((s, i) => (
            <div key={i} className="p-4 bg-white border border-[#102033]/10 rounded-2xl shadow-sm">
              <div className="font-bold text-[#102033] mb-1">{s.title}</div>
              <div className="text-[#657287]">{s.detail}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}