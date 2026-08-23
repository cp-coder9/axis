'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { ProjectEntity, RoleKey, MeetingOutcome, MeetingItem, ToolDefinition } from '@/lib/types';
import { ALL_TOOLS, INITIAL_MEETING_DATA, ROLE_PROFILES } from '@/lib/data';
import { architexApi, demoIdentity, ApiMeetingOutcome } from '@/lib/api';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';

const MEETING_ID = 'mtg-design-001';
const TABS = (ALL_TOOLS['meetings'] as ToolDefinition).tabs;
type MeetingScreen = 'home' | 'schedule' | 'prejoin' | 'room' | 'review' | 'issued';

const DEST_LABEL: Record<string, MeetingOutcome['destination']> = {
  project_record: 'Project Record',
  action_centre: 'Action Centre',
  risk_register: 'Risk Register',
};

const CHAIR_PUBLISHER_ROLES = ['architect', 'cpm', 'admin', 'platform_admin'];

function fromApiOutcome(o: ApiMeetingOutcome): MeetingOutcome {
  const destination = DEST_LABEL[o.destination ?? ''] ?? 'Project Record';
  return {
    id: o.id,
    type: destination === 'Action Centre' ? 'Action' : 'Decision',
    title: o.title,
    owner: o.reviewed_by ? 'Chair' : 'Chair',
    due: '—',
    destination,
    state: o.status,
    source: 'Live transcript',
  };
}

interface MeetingsModuleProps {
  activeProject: ProjectEntity;
  currentRole: RoleKey;
  activeTabKey?: string;
  onTabChange?: (key: string) => void;
  onAttachProject?: () => void;
  isProjectMode: boolean;
}

export const MeetingsModule: React.FC<MeetingsModuleProps> = ({
  activeProject,
  currentRole,
  activeTabKey,
  onTabChange,
  isProjectMode,
}) => {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || 'my-day', onTabChange);
  const [screenState, setScreenState] = useState<{ value: MeetingScreen; tabKey: string }>({
    value: 'home',
    tabKey: tab,
  });
  if (screenState.tabKey !== tab) {
    setScreenState({ value: 'home', tabKey: tab });
  }
  const screen = screenState.value;
  const setScreen = useCallback(
    (value: MeetingScreen) => setScreenState({ value, tabKey: tab }),
    [tab],
  );
  const [wizardStep, setWizardStep] = useState(0);
  const [roomPanel, setRoomPanel] = useState<'agenda' | 'people' | 'chat' | 'context'>('agenda');
  const [selectedMinuteIdx, setSelectedMinuteIdx] = useState(0);
  const [outcomes, setOutcomes] = useState<MeetingOutcome[]>(INITIAL_MEETING_DATA.outcomes);
  const [meetings, setMeetings] = useState<MeetingItem[]>(INITIAL_MEETING_DATA.meetings);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [recordingOn, setRecordingOn] = useState(false);
  const [transcriptOn, setTranscriptOn] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(false);
  const [informedConsent, setInformedConsent] = useState(false);
  const [publishedRevision, setPublishedRevision] = useState<string | null>(null);
  const [auditEntries, setAuditEntries] = useState<string[]>(['Meeting scheduled · system record created']);
  const [toast, setToast] = useState<string | null>(null);
  const [meetingSource, setMeetingSource] = useState<'api' | 'seed'>('seed');
  const [busyOutcome, setBusyOutcome] = useState<string | null>(null);
  const [invitationResponses, setInvitationResponses] = useState<Record<string, 'Accepted' | 'Declined'>>({});
  const [meetingPreferences, setMeetingPreferences] = useState({
    lobby: true,
    transcript: true,
    reminders: true,
    retention: '90 days',
  });
  const identity = demoIdentity(currentRole);

  const profile = ROLE_PROFILES[currentRole] || ROLE_PROFILES.architect;

  // Load the live meeting (outcomes + publish state) from the API so the
  // governed write-back flow operates on the canonical record (PRD §6.5).
  useEffect(() => {
    let cancelled = false;
    architexApi.meetings.get(MEETING_ID, identity)
      .then((meeting) => {
        if (cancelled) return;
        setOutcomes(meeting.outcomes.map(fromApiOutcome));
        setPublishedRevision(meeting.published_revision);
        setMeetingSource('api');
      })
      .catch(() => { if (!cancelled) setMeetingSource('seed'); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleOutcomeState = useCallback(async (idx: number, newState: 'accepted' | 'rejected') => {
    const target = outcomes[idx];
    if (!target) return;
    if (meetingSource !== 'api') {
      const updated = [...outcomes];
      updated[idx] = { ...updated[idx], state: newState };
      setOutcomes(updated);
      setAuditEntries((entries) => [`${updated[idx].type} ${newState} by ${profile.label}`, ...entries]);
      return;
    }
    setBusyOutcome(target.id);
    try {
      const decided = await architexApi.meetings.decideOutcome(MEETING_ID, target.id, newState === 'accepted' ? 'accept' : 'reject', identity);
      setOutcomes((list) => list.map((o) => (o.id === target.id ? fromApiOutcome(decided) : o)));
      setAuditEntries((entries) => [`${decided.title} ${newState} by ${profile.label} (server-recorded)`, ...entries]);
    } catch (e) {
      showToast(e instanceof Error ? e.message.replace(/^Architex API \d+: /, '') : 'Decision failed');
    } finally {
      setBusyOutcome(null);
    }
  }, [outcomes, meetingSource, profile.label, identity, showToast]);

  const handlePublish = useCallback(async () => {
    if (!CHAIR_PUBLISHER_ROLES.includes(currentRole)) {
      showToast('Only the meeting chair or an authorised organiser can publish minutes.');
      return;
    }
    if (publishedRevision) {
      setScreen('issued');
      showToast(`Minutes already published as ${publishedRevision}; duplicate write-back prevented.`);
      return;
    }
    const pending = outcomes.filter((o) => o.state === 'pending').length;
    if (pending > 0) {
      showToast(`${pending} proposed outcomes still require an Accept or Reject decision.`);
      return;
    }
    if (meetingSource !== 'api') {
      const revision = 'M01';
      const accepted = outcomes.filter((o) => o.state === 'accepted');
      setPublishedRevision(revision);
      setAuditEntries((entries) => [`Minutes ${revision} published by ${profile.label} · ${accepted.length} accepted write-backs queued with idempotency keys`, ...entries]);
      setScreen('issued');
      showToast('Meeting minutes officially issued · Action Centre tasks registered');
      return;
    }
    try {
      const result = await architexApi.meetings.publish(MEETING_ID, identity);
      const revision = result.meeting.published_revision ?? 'M01';
      setPublishedRevision(revision);
      setOutcomes(result.meeting.outcomes.map(fromApiOutcome));
      setAuditEntries((entries) => [`Minutes ${revision} published by ${profile.label} · ${result.write_backs ?? 0} write-backs executed (idempotent)`, ...entries]);
      setScreen('issued');
      showToast(result.idempotent ? 'Minutes already issued — idempotent publish, no duplicate write-backs.' : 'Meeting minutes officially issued · Action Centre tasks registered');
    } catch (e) {
      showToast(e instanceof Error ? e.message.replace(/^Architex API \d+: /, '') : 'Publish failed');
    }
  }, [currentRole, publishedRevision, outcomes, meetingSource, profile.label, identity, setScreen, showToast]);

  const activePipelineStep =
    screen === 'schedule'
      ? 'Draft'
      : screen === 'prejoin'
      ? 'Lobby open'
      : screen === 'room'
      ? 'Live'
      : screen === 'review'
      ? 'Review required'
      : screen === 'issued'
      ? 'Published'
      : 'Scheduled';

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-[#102033]/10 bg-white p-3 shadow-sm xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DFF5F2] text-[#167E79]">
            <OrigamiIcon name="meetings" size={22} />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-[#102033]">Architex Meetings</h1>
            <p className="text-[11px] text-[#657287]">{activeProject.code} · governed calls, records and decisions</p>
          </div>
        </div>
        <nav className="flex overflow-x-auto rounded-xl bg-[#F4F7F8] p-1" aria-label="Meetings sections">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={tab === item.key}
              onClick={() => {
                setTab(item.key || 'my-day');
                setScreen('home');
              }}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-bold transition-all ${
                tab === item.key
                  ? 'bg-[#102033] text-white shadow-sm'
                  : 'text-[#657287] hover:bg-white hover:text-[#102033]'
              }`}
            >
              <OrigamiIcon name={item.icon || 'meetings'} size={14} />
              {item.label}
              {item.badge && (
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${tab === item.key ? 'bg-white/15' : 'bg-[#E6ECEF]'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* 7-Stage Lifecycle Pipeline */}
      <div className="bg-white border border-[#102033]/10 rounded-2xl p-3 shadow-sm overflow-x-auto">
        <div className="grid grid-cols-7 min-w-[700px] relative">
          {INITIAL_MEETING_DATA.lifecycle.map((step, idx) => {
            const stepIdx = INITIAL_MEETING_DATA.lifecycle.indexOf(activePipelineStep);
            const isDone = idx < stepIdx;
            const isCurrent = idx === stepIdx;

            return (
              <div key={step} className="flex flex-col items-center text-center relative group">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold z-10 transition-all ${
                    isCurrent
                      ? 'bg-[#19B7B0] text-white shadow-md ring-4 ring-[#19B7B0]/15'
                      : isDone
                      ? 'bg-[#BFE9E2] text-[#167E79]'
                      : 'bg-gray-100 text-[#96a0ad]'
                  }`}
                >
                  {isDone ? '✓' : idx + 1}
                </div>
                <span
                  className={`text-[11px] mt-1 truncate ${
                    isCurrent ? 'font-bold text-[#102033]' : isDone ? 'text-[#167E79]' : 'text-[#96a0ad]'
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-4 text-xs md:grid-cols-[1.2fr_.8fr]">
        <div>
          <p className="font-bold text-violet-950">Reference-module governance</p>
          <p className="mt-1 leading-5 text-violet-900">Consent gates recording and transcription. AI produces cited candidates only. Every outcome needs an explicit human decision, publication is revisioned, and duplicate write-back is blocked.</p>
        </div>
        <div className="rounded-xl border border-violet-200 bg-white/80 p-3">
          <p className="text-[10px] font-bold uppercase text-violet-700">Audit preview</p>
          <ul className="mt-2 space-y-1 text-[10px] text-[#526074]">{auditEntries.slice(0, 3).map((entry) => <li key={entry}>• {entry}</li>)}</ul>
        </div>
      </div>

      {/* Screen Router */}
      {screen === 'home' && tab === 'my-day' && (
        <div data-tool-tab="my-day" className="space-y-4">
          {/* Default My Day / Upcoming Hub */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <section className="lg:col-span-2 bg-white border border-[#102033]/10 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[17px] font-bold text-[#102033]">Today&apos;s Meeting Schedule</h2>
                  <p className="text-[12px] text-[#657287]">Governed coordination rooms with automated transcript ingestion.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    data-testid="meetings-meet-now"
                    onClick={() => setScreen('prejoin')}
                    className="px-3 py-1.5 bg-white border border-[#102033]/15 hover:bg-gray-50 text-[#102033] rounded-xl text-[12px] font-bold shadow-sm"
                  >
                    Meet Now
                  </button>
                  <button
                    data-testid="meetings-schedule"
                    onClick={() => {
                      setWizardStep(0);
                      setScreen('schedule');
                    }}
                    className="px-3.5 py-1.5 bg-[#19B7B0] hover:bg-[#167E79] text-white rounded-xl text-[12px] font-bold shadow-sm"
                  >
                    + Schedule
                  </button>
                </div>
              </div>

              <div className="divide-y divide-[#102033]/5 space-y-2">
                {meetings.map((m, idx) => (
                  <div
                    key={m.id}
                    onClick={() => setScreen(idx === 0 ? 'prejoin' : 'schedule')}
                    className="pt-2 flex items-center justify-between hover:bg-[#DFF5F2]/40 p-2.5 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-center font-mono font-bold text-[#167E79] text-sm bg-[#DFF5F2] px-2 py-1 rounded-lg">
                        {m.time}
                      </div>
                      <div>
                        <div className="text-[13.5px] font-bold text-[#102033]">{m.title}</div>
                        <div className="text-[11.5px] text-[#657287]">
                          {m.type} · Stage: {m.stage} · {m.attendees} participants · Chair: {m.chair}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        idx === 0 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Actions & Pending Minutes Review Card */}
            <div className="space-y-4">
              <section className="bg-white border-l-4 border-l-[#8B5CF6] border-y border-r border-[#102033]/10 rounded-2xl p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    Review Required
                  </span>
                  <span className="text-[11px] text-[#657287]">3 outcomes</span>
                </div>
                <h3 className="text-[14px] font-bold text-[#102033]">Municipal Readiness Review</h3>
                <p className="text-[12px] text-[#657287] leading-snug">
                  AI drafted minutes from yesterday&apos;s call. 1 fire escape decision and 2 tasks awaiting Chair approval.
                </p>
                <button
                  onClick={() => setScreen('review')}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-[12px] transition-colors shadow-sm"
                >
                  Open Minutes Review Canvas
                </button>
              </section>

              <section className="bg-white border border-[#102033]/10 rounded-2xl p-4 shadow-sm space-y-2">
                <h3 className="text-[13px] font-bold text-[#102033]">Pre-configured Meeting Templates</h3>
                <div className="grid grid-cols-2 gap-2 text-[11.5px]">
                  {[
                    'Client Brief',
                    'Design Coordination',
                    'Statutory Review',
                    'Tender Clarification',
                    'Site Progress',
                    'Commercial Valuation',
                  ].map((tpl) => (
                    <button
                      key={tpl}
                      onClick={() => {
                        setWizardStep(1);
                        setScreen('schedule');
                        showToast(`${tpl} template applied.`);
                      }}
                      className="p-2 rounded-xl border border-[#102033]/10 text-left hover:bg-[#DFF5F2] hover:text-[#167E79] font-medium transition-colors"
                    >
                      {tpl}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {screen === 'home' && tab === 'upcoming' && (
        <div data-tool-tab="upcoming" className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-[#102033]/10 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#167E79]">Forward schedule</p>
              <h2 className="text-lg font-bold text-[#102033]">Upcoming meetings</h2>
              <p className="text-xs text-[#657287]">Coordinate agendas, pre-reads and attendance before each governed room opens.</p>
            </div>
            <button
              type="button"
              onClick={() => { setWizardStep(0); setScreen('schedule'); }}
              className="rounded-xl bg-[#19B7B0] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#167E79]"
            >
              + Schedule meeting
            </button>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <section className="overflow-hidden rounded-2xl border border-[#102033]/10 bg-white shadow-sm">
              <div className="grid grid-cols-[80px_1fr_auto] gap-3 border-b border-[#102033]/10 bg-[#F8FAFA] px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-[#657287]">
                <span>Time</span><span>Meeting and readiness</span><span>Status</span>
              </div>
              {meetings.map((meeting, idx) => (
                <button
                  type="button"
                  key={meeting.id}
                  onClick={() => setScreen(idx === 0 ? 'prejoin' : 'schedule')}
                  className="grid w-full grid-cols-[80px_1fr_auto] gap-3 border-b border-[#102033]/5 px-5 py-4 text-left last:border-0 hover:bg-[#DFF5F2]/30"
                >
                  <span className="font-mono text-xs font-bold text-[#167E79]">{idx === 0 ? 'Today' : idx === 1 ? 'Thu' : 'Mon'}<br />{meeting.time}</span>
                  <span>
                    <strong className="block text-[13px] text-[#102033]">{meeting.title}</strong>
                    <span className="text-[11px] text-[#657287]">{meeting.type} · {meeting.attendees} attendees · {meeting.stage}</span>
                    <span className="mt-1 block text-[10px] text-[#96a0ad]">Agenda {idx === 0 ? 'approved' : 'draft'} · Pre-read {idx === 2 ? 'due' : 'distributed'}</span>
                  </span>
                  <span className={`h-fit rounded-full px-2.5 py-1 text-[10px] font-bold ${idx === 0 ? 'bg-red-100 text-red-700' : 'bg-[#DFF5F2] text-[#167E79]'}`}>{meeting.status}</span>
                </button>
              ))}
            </section>
            <aside className="h-fit rounded-2xl border border-[#102033]/10 bg-white p-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#96a0ad]">Readiness check</h3>
              <div className="mt-3 space-y-3 text-xs text-[#526074]">
                <div className="rounded-xl bg-green-50 p-3"><strong className="text-green-800">2 rooms ready</strong><p className="mt-1 text-[11px]">Agenda, chair and consent policy confirmed.</p></div>
                <div className="rounded-xl bg-amber-50 p-3"><strong className="text-amber-800">1 pre-read outstanding</strong><p className="mt-1 text-[11px]">Structural mark-up required before Monday.</p></div>
                <div className="rounded-xl border p-3"><strong className="text-[#102033]">SAST working hours</strong><p className="mt-1 text-[11px]">All invitations display local and UTC time.</p></div>
              </div>
            </aside>
          </div>
        </div>
      )}

      {screen === 'home' && tab === 'invitations' && (
        <div data-tool-tab="invitations" className="space-y-4">
          <div className="rounded-2xl border border-[#102033]/10 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#167E79]">Attendance desk</p>
            <h2 className="text-lg font-bold text-[#102033]">Meeting invitations</h2>
            <p className="text-xs text-[#657287]">Respond to invitations and review project scope, chair and recording policy before joining.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {[
              { id: 'INV-204', title: 'Fire Strategy Decision Workshop', owner: 'N. Mokoena', when: 'Tomorrow · 10:30 SAST', note: 'Decision required: escape width rational design', policy: 'Recording with informed consent' },
              { id: 'INV-211', title: 'Client Design Gateway', owner: 'L. Smith', when: '28 Aug · 14:00 SAST', note: 'Approve Stage 3 presentation and cost plan', policy: 'Minutes only · no recording' },
            ].map((invite) => {
              const response = invitationResponses[invite.id];
              return (
                <article key={invite.id} className="rounded-2xl border border-[#102033]/10 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div><span className="text-[10px] font-bold text-[#167E79]">{invite.id}</span><h3 className="mt-1 text-[15px] font-bold text-[#102033]">{invite.title}</h3></div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${response === 'Accepted' ? 'bg-green-100 text-green-700' : response === 'Declined' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{response || 'Response due'}</span>
                  </div>
                  <dl className="mt-4 grid grid-cols-[74px_1fr] gap-y-2 text-xs text-[#526074]"><dt className="font-bold text-[#96a0ad]">When</dt><dd>{invite.when}</dd><dt className="font-bold text-[#96a0ad]">Chair</dt><dd>{invite.owner}</dd><dt className="font-bold text-[#96a0ad]">Purpose</dt><dd>{invite.note}</dd><dt className="font-bold text-[#96a0ad]">Policy</dt><dd>{invite.policy}</dd></dl>
                  <div className="mt-4 flex gap-2 border-t border-[#102033]/10 pt-4">
                    <button type="button" onClick={() => setInvitationResponses((current) => ({ ...current, [invite.id]: 'Accepted' }))} className="flex-1 rounded-xl bg-[#19B7B0] py-2 text-xs font-bold text-white hover:bg-[#167E79]">Accept</button>
                    <button type="button" onClick={() => setInvitationResponses((current) => ({ ...current, [invite.id]: 'Declined' }))} className="flex-1 rounded-xl border border-[#102033]/15 py-2 text-xs font-bold text-[#657287] hover:bg-gray-50">Decline</button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {screen === 'home' && tab === 'recordings' && (
        <div data-tool-tab="recordings" className="space-y-4">
          <div className="rounded-2xl border border-[#102033]/10 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#167E79]">Governed records</p>
            <h2 className="text-lg font-bold text-[#102033]">Recordings &amp; Minutes</h2>
            <p className="text-xs text-[#657287]">Published minutes, consent-scoped media and transcript evidence retained against the project record.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
            <section className="space-y-3">
              {[
                { id: 'M-1042', title: 'Municipal Readiness Review', date: '21 Aug 2026', duration: '48:12', revision: publishedRevision || 'M01', status: 'Published', retention: '87 days remaining' },
                { id: 'M-1038', title: 'Fire Strategy Coordination', date: '18 Aug 2026', duration: '36:44', revision: 'M02', status: 'Published', retention: '84 days remaining' },
                { id: 'M-1031', title: 'Client Brief Confirmation', date: '12 Aug 2026', duration: '52:09', revision: 'M01', status: 'Archived', retention: '78 days remaining' },
              ].map((record, idx) => (
                <article key={record.id} className="grid gap-4 rounded-2xl border border-[#102033]/10 bg-white p-4 shadow-sm sm:grid-cols-[64px_1fr_auto] sm:items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#102033] text-white"><OrigamiIcon name="meeting_recording" size={25} /></div>
                  <div><div className="flex items-center gap-2"><span className="font-mono text-[10px] font-bold text-[#167E79]">{record.id}</span><span className="rounded-full bg-green-50 px-2 py-0.5 text-[9px] font-bold text-green-700">{record.status}</span></div><h3 className="mt-1 text-sm font-bold text-[#102033]">{record.title}</h3><p className="mt-1 text-[11px] text-[#657287]">{record.date} · {record.duration} · Minutes {record.revision} · {record.retention}</p></div>
                  <button type="button" onClick={() => idx === 0 ? setScreen('issued') : showToast(`${record.title} record opened.`)} className="rounded-xl border border-[#102033]/15 px-3 py-2 text-xs font-bold text-[#102033] hover:bg-[#DFF5F2]">Open record</button>
                </article>
              ))}
            </section>
            <aside className="h-fit rounded-2xl border border-violet-200 bg-violet-50 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-violet-800">Evidence controls</h3>
              <ul className="mt-3 space-y-2 text-[11px] leading-5 text-violet-950"><li>• Playback requires project membership.</li><li>• Transcript citations retain speaker and timestamp.</li><li>• Downloads carry revision and audit identifiers.</li><li>• Audio expires independently of issued minutes.</li></ul>
            </aside>
          </div>
        </div>
      )}

      {screen === 'home' && tab === 'reviews' && (
        <div data-tool-tab="reviews" className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-[#102033]/10 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-purple-700">Human decision gate</p><h2 className="text-lg font-bold text-[#102033]">Draft reviews</h2><p className="text-xs text-[#657287]">Resolve cited minute candidates and proposed write-backs before controlled publication.</p></div>
            <div className="rounded-xl bg-purple-50 px-4 py-2 text-center"><strong className="block text-xl text-purple-800">3</strong><span className="text-[10px] font-bold uppercase text-purple-600">outcomes pending</span></div>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
            <section className="rounded-2xl border border-[#102033]/10 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3"><div><span className="rounded-full bg-purple-100 px-2 py-1 text-[10px] font-bold text-purple-700">Chair review required</span><h3 className="mt-3 text-base font-bold text-[#102033]">Municipal Readiness Review</h3><p className="mt-1 text-xs text-[#657287]">Drafted yesterday · 48 minute transcript · 14 cited minute paragraphs</p></div><span className="font-mono text-[10px] text-[#96a0ad]">M-1042</span></div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">{outcomes.map((outcome) => <div key={outcome.id} className="rounded-xl border bg-[#F8FAFA] p-3"><span className="text-[9px] font-bold uppercase text-purple-700">{outcome.type}</span><p className="mt-1 line-clamp-2 text-[11px] font-semibold text-[#102033]">{outcome.title}</p><span className="mt-2 block text-[10px] capitalize text-amber-700">{outcome.state}</span></div>)}</div>
              <button type="button" onClick={() => setScreen('review')} className="mt-4 w-full rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-purple-700">Open governed review canvas</button>
            </section>
            <aside className="h-fit rounded-2xl border border-[#102033]/10 bg-white p-4 shadow-sm"><h3 className="text-xs font-bold uppercase tracking-wider text-[#96a0ad]">Publication checklist</h3><div className="mt-3 space-y-2 text-[11px] text-[#526074]"><div className="rounded-lg bg-green-50 p-2 text-green-800">✓ Transcript processing complete</div><div className="rounded-lg bg-green-50 p-2 text-green-800">✓ Speaker citations linked</div><div className="rounded-lg bg-amber-50 p-2 text-amber-800">○ 3 outcome decisions required</div><div className="rounded-lg bg-gray-50 p-2">○ Chair publication signature</div></div></aside>
          </div>
        </div>
      )}

      {screen === 'home' && tab === 'templates' && (
        <div data-tool-tab="templates" className="space-y-4">
          <div className="rounded-2xl border border-[#102033]/10 bg-white p-5 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#167E79]">Reusable governance</p><h2 className="text-lg font-bold text-[#102033]">Templates</h2><p className="text-xs text-[#657287]">Start with a discipline-specific agenda, attendee roles, consent policy and minute structure.</p></div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              ['Client Brief', 'Brief', '6 sections', 'Requirements, sign-off and information gaps'],
              ['Design Coordination', 'Design', '8 sections', 'Models, interfaces, decisions and actions'],
              ['Statutory Review', 'Comply', '7 sections', 'Authority comments, evidence and submissions'],
              ['Tender Clarification', 'Procure', '5 sections', 'Queries, addenda and commercial exclusions'],
              ['Site Progress', 'Build', '9 sections', 'Programme, quality, safety and instructions'],
              ['Commercial Valuation', 'Pay', '6 sections', 'Progress, variations and certification'],
            ].map(([name, stage, sections, description]) => (
              <article key={name} className="rounded-2xl border border-[#102033]/10 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DFF5F2] text-[#167E79]"><OrigamiIcon name="meeting_template" size={21} /></div><span className="rounded-full bg-gray-100 px-2 py-1 text-[9px] font-bold text-[#657287]">{stage}</span></div><h3 className="mt-4 text-sm font-bold text-[#102033]">{name}</h3><p className="mt-1 min-h-8 text-[11px] leading-4 text-[#657287]">{description}</p><div className="mt-3 text-[10px] font-bold text-[#96a0ad]">{sections} · Consent policy included</div><button type="button" onClick={() => { setWizardStep(1); setScreen('schedule'); showToast(`${name} template applied.`); }} className="mt-4 w-full rounded-xl border border-[#19B7B0]/40 py-2 text-xs font-bold text-[#167E79] hover:bg-[#DFF5F2]">Use template</button></article>
            ))}
          </div>
        </div>
      )}

      {screen === 'home' && tab === 'settings' && (
        <div data-tool-tab="settings" className="space-y-4">
          <div className="rounded-2xl border border-[#102033]/10 bg-white p-5 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#167E79]">Room defaults</p><h2 className="text-lg font-bold text-[#102033]">Meeting settings</h2><p className="text-xs text-[#657287]">Practice defaults for secure entry, assistive capture, notifications and retention.</p></div>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-[#102033]/10 bg-white p-5 shadow-sm"><h3 className="text-sm font-bold text-[#102033]">Room &amp; intelligence</h3><div className="mt-4 divide-y divide-[#102033]/10">
              {[
                ['lobby', 'Require pre-join lobby', 'Verify devices and informed consent before room entry.'],
                ['transcript', 'Draft cited AI transcript', 'Generate candidates only; human review remains mandatory.'],
                ['reminders', 'Send readiness reminders', 'Notify chairs about missing agendas and pre-reads.'],
              ].map(([key, label, description]) => {
                const settingKey = key as 'lobby' | 'transcript' | 'reminders';
                return <label key={key} className="flex cursor-pointer items-center justify-between gap-4 py-4"><span><strong className="block text-xs text-[#102033]">{label}</strong><span className="mt-1 block text-[11px] text-[#657287]">{description}</span></span><input type="checkbox" checked={meetingPreferences[settingKey]} onChange={(event) => setMeetingPreferences((current) => ({ ...current, [settingKey]: event.target.checked }))} className="h-4 w-4 accent-[#19B7B0]" /></label>;
              })}
            </div></section>
            <section className="rounded-2xl border border-[#102033]/10 bg-white p-5 shadow-sm"><h3 className="text-sm font-bold text-[#102033]">Records &amp; compliance</h3><label className="mt-4 block text-[11px] font-bold uppercase tracking-wider text-[#657287]">Recording retention<select value={meetingPreferences.retention} onChange={(event) => setMeetingPreferences((current) => ({ ...current, retention: event.target.value }))} className="mt-2 w-full rounded-xl border border-[#102033]/15 bg-white p-2.5 text-xs font-normal normal-case text-[#102033]"><option>30 days</option><option>90 days</option><option>180 days</option></select></label><div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-5 text-amber-900"><strong>Governance lock:</strong> Recording and transcription cannot start until the participant consent gate is satisfied. Issued minutes remain revisioned even after source audio expires.</div><button type="button" onClick={() => showToast('Meeting defaults saved for this practice.')} className="mt-4 w-full rounded-xl bg-[#102033] py-2.5 text-xs font-bold text-white hover:bg-[#167E79]">Save meeting defaults</button></section>
          </div>
        </div>
      )}

      {/* 5-Step Scheduling Wizard */}
      {screen === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white border border-[#102033]/10 rounded-2xl p-5 shadow-sm space-y-4">
            {/* Step Indicators */}
            <div className="grid grid-cols-5 gap-1.5 pb-3 border-b border-[#102033]/10">
              {['1. Context', '2. Agenda', '3. People', '4. Time', '5. Policy'].map((label, idx) => (
                <button
                  key={label}
                  onClick={() => setWizardStep(idx)}
                  className={`py-1.5 rounded-lg text-[11px] font-bold text-center transition-all ${
                    wizardStep === idx
                      ? 'bg-[#19B7B0] text-white shadow-sm'
                      : idx < wizardStep
                      ? 'bg-[#DFF5F2] text-[#167E79]'
                      : 'bg-gray-50 text-[#96a0ad]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Step 1: Context */}
            {wizardStep === 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#102033]">Step 1: Project Context & Scope</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#657287] uppercase mb-1">Project</label>
                    <input
                      type="text"
                      value={activeProject.name}
                      readOnly
                      className="w-full p-2 bg-gray-50 border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#657287] uppercase mb-1">Work Stage</label>
                    <input
                      type="text"
                      value={activeProject.stage}
                      readOnly
                      className="w-full p-2 bg-gray-50 border rounded-lg text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-[#657287] uppercase mb-1">Meeting Title</label>
                    <input
                      type="text"
                      defaultValue={`Design Coordination — ${activeProject.name}`}
                      className="w-full p-2 border rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-[#657287] uppercase mb-1">Linked Drawings & Records</label>
                    <input
                      type="text"
                      defaultValue="A-204 Rev P03 · Fire Escape Width Review Blocker"
                      className="w-full p-2 border rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Agenda */}
            {wizardStep === 1 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-[#102033]">Step 2: Time-Boxed Agenda</h3>
                  <button
                    type="button"
                    onClick={() => showToast('New agenda section added.')}
                    className="text-xs text-[#167E79] font-bold"
                  >
                    + Add Agenda Item
                  </button>
                </div>
                <div className="space-y-2">
                  {INITIAL_MEETING_DATA.agenda.map((ag, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 border rounded-xl">
                      <span className="w-5 h-5 rounded-full bg-[#19B7B0]/15 text-[#167E79] text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        defaultValue={ag.title}
                        className="flex-1 bg-white border p-1.5 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        defaultValue={ag.owner}
                        className="w-28 bg-white border p-1.5 rounded-lg text-xs"
                      />
                      <span className="text-xs text-[#657287] whitespace-nowrap">{ag.minutes} min</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: People */}
            {wizardStep === 2 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#102033]">Step 3: Role-Segregated Attendees</h3>
                <div className="space-y-2 text-xs">
                  {[
                    { name: 'Justin Kruger', role: 'Chair (Lead Architect)', code: 'JK', status: 'Host' },
                    { name: 'N. Mokoena', role: 'Fire Consulting Engineer', code: 'NM', status: 'Invited' },
                    { name: 'L. Smith', role: 'Client Representative', code: 'LS', status: 'Invited' },
                    { name: 'M. Patel', role: 'Minute-taker', code: 'MP', status: 'Invited' },
                  ].map((att, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 border rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#102033] text-white font-bold flex items-center justify-center">
                          {att.code}
                        </div>
                        <div>
                          <div className="font-bold text-[#102033]">{att.name}</div>
                          <div className="text-[#657287]">{att.role}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#19B7B0]/10 text-[#167E79] font-bold">
                        {att.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Time */}
            {wizardStep === 3 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#102033]">Step 4: SAST / UTC Timezone Coordinator</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-[#657287] uppercase mb-1">Date</label>
                    <input type="date" defaultValue="2026-07-24" className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#657287] uppercase mb-1">Start Time (SAST)</label>
                    <input type="time" defaultValue="09:00" className="w-full p-2 border rounded-lg" />
                  </div>
                  <div className="col-span-2 p-3 bg-[#DFF5F2] rounded-xl text-[#167E79] space-y-1">
                    <strong>Timezone Harmonization:</strong>
                    <div>09:00 SAST (Johannesburg) · 08:00 BST (London) · 07:00 UTC. No critical conflicts detected.</div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Policy & Governance */}
            {wizardStep === 4 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#102033]">Step 5: Consent, Retention & AI Governance</h3>
                <div className="space-y-2.5 text-xs text-[#526074]">
                  <label className="flex items-center gap-2 p-2.5 bg-gray-50 border rounded-xl">
                    <input type="checkbox" defaultChecked className="accent-[#19B7B0] w-4 h-4" />
                    <span>Mandatory informed consent required before recording begins</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 bg-gray-50 border rounded-xl">
                    <input type="checkbox" defaultChecked className="accent-[#19B7B0] w-4 h-4" />
                    <span>Enable AI real-time transcription and minute candidate generation</span>
                  </label>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 leading-relaxed">
                    <strong>POPIA & Professional Secrecy Notice:</strong>
                    <p className="mt-1">
                      Privileged conversations will remain draft. No minutes are written back to the project audit trail until the Chair reviews and issues them.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Wizard Navigation Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-[#102033]/10">
              <button
                onClick={() => setScreen('home')}
                className="px-4 py-2 text-xs font-bold text-[#657287] hover:text-[#102033]"
              >
                Cancel
              </button>
              <div className="flex gap-2">
                {wizardStep > 0 && (
                  <button
                    onClick={() => setWizardStep((prev) => prev - 1)}
                    className="px-4 py-2 border rounded-xl text-xs font-bold text-[#102033] hover:bg-gray-50"
                  >
                    Back
                  </button>
                )}
                {wizardStep < 4 ? (
                  <button
                    onClick={() => setWizardStep((prev) => prev + 1)}
                    className="px-4 py-2 bg-[#19B7B0] hover:bg-[#167E79] text-white rounded-xl text-xs font-bold"
                  >
                    Next Step ›
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setScreen('home');
                      showToast('Meeting scheduled · Calendar invites & pre-reads distributed.');
                    }}
                    className="px-5 py-2 bg-gradient-to-r from-[#19B7B0] to-[#167E79] text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    Finalise & Issue Invitations
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Summary Card */}
          <aside className="bg-white border border-[#102033]/10 rounded-2xl p-4 shadow-sm space-y-3 h-fit">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#96a0ad]">Meeting Passport</h3>
            <div className="text-xs space-y-2 text-[#526074]">
              <div><strong>Project:</strong> {activeProject.name}</div>
              <div><strong>Stage:</strong> {activeProject.stage}</div>
              <div><strong>Chair:</strong> {profile.label}</div>
              <div><strong>Security:</strong> Scoped Guest Protection</div>
              <div><strong>Retention:</strong> 90 Days Auto-Archive</div>
            </div>
          </aside>
        </div>
      )}

      {/* Pre-Join Lobby & Hardware Check */}
      {screen === 'prejoin' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-[#0b1a29] text-white rounded-3xl p-6 relative flex flex-col items-center justify-center min-h-[420px] shadow-2xl">
            <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full">
              ● Network Latency: 28 ms (Optimal)
            </span>
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#19B7B0] to-[#167E79] flex items-center justify-center text-3xl font-bold mb-3 shadow-lg">
              JK
            </div>
            <div className="text-base font-bold">Justin Kruger</div>
            <div className="text-xs text-white/60 mt-1">Lead Architect · Chair Preview</div>

            {/* Floating Camera / Mic Toggle on Video Preview */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setMicOn(!micOn)}
                className={`p-3 rounded-full ${micOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 text-white'}`}
              >
                {micOn ? '🎤 Mic On' : '🔇 Muted'}
              </button>
              <button
                onClick={() => setCamOn(!camOn)}
                className={`p-3 rounded-full ${camOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 text-white'}`}
              >
                {camOn ? '📹 Camera On' : '🚫 Video Off'}
              </button>
            </div>
          </div>

          <aside className="bg-white border border-[#102033]/10 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h2 className="text-base font-bold text-[#102033]">Pre-Join Verification</h2>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[#657287] font-bold mb-1">Microphone</label>
                  <select className="w-full p-2 border rounded-lg bg-white">
                    <option>Default External Headset (USB)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#657287] font-bold mb-1">Camera</label>
                  <select className="w-full p-2 border rounded-lg bg-white">
                    <option>FaceTime HD Camera (1080p)</option>
                  </select>
                </div>
              </div>

              {/* Informed Consent Gate */}
              <label className="flex items-start gap-2 p-3 bg-[#DFF5F2]/50 border border-[#19B7B0]/20 rounded-xl text-xs text-[#167E79] cursor-pointer">
                <input
                  type="checkbox"
                  checked={informedConsent}
                  onChange={(e) => setInformedConsent(e.target.checked)}
                  className="mt-0.5 accent-[#19B7B0]"
                />
                <span>I acknowledge informed consent for meeting recording, AI transcript analysis, and statutory audit logging.</span>
              </label>
            </div>

            <button
              disabled={!informedConsent}
              onClick={() => {
                setRecordingOn(true);
                setTranscriptOn(true);
                setAuditEntries((entries) => [`Informed consent acknowledged · recording and AI transcription activated by ${profile.label}`, ...entries]);
                setScreen('room');
              }}
              className="w-full py-3 bg-[#19B7B0] hover:bg-[#167E79] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all shadow-md"
            >
              Enter Live Coordination Room ›
            </button>
          </aside>
        </div>
      )}

      {/* Live Meeting Room Workspace */}
      {screen === 'room' && (
        <div className="bg-[#071523] text-white rounded-3xl p-4 shadow-2xl flex flex-col h-[650px] relative overflow-hidden">
          {/* Top Banner with Active Recording & Transcription Status */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
            <div className="flex items-center gap-2.5 font-bold">
              <span className="text-[#19B7B0]">● LIVE:</span>
              <span>Design Coordination — {activeProject.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {recordingOn && (
                <span className="px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 text-[11px] font-bold flex items-center gap-1.5 animate-pulse">
                  ● REC ON
                </span>
              )}
              {transcriptOn && (
                <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[11px] font-bold">
                  ✦ AI Transcription Active
                </span>
              )}
              <span className="font-mono text-white/70">00:38:12</span>
            </div>
          </div>

          {/* Central Workspace: Drawing Presentation & Live Markup + Side Panel */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-3 py-3 overflow-hidden">
            <div className="lg:col-span-3 bg-white text-[#102033] rounded-2xl p-4 relative flex flex-col justify-between overflow-hidden shadow-inner">
              <div className="flex justify-between items-center text-xs font-bold text-[#657287] border-b pb-2">
                <span>Shared Presentation: Drawing A-204 Ground-Floor Layout (Rev P03)</span>
                <span className="text-[#167E79]">2 Annotations Live</span>
              </div>

              {/* Simulated Drawing Plane with Vector Markup */}
              <div className="flex-1 my-2 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl relative flex items-center justify-center">
                <div className="text-slate-400 font-mono text-center">
                  [Vector CAD / BIM Viewport: A-204 Floor Plan]
                  <div className="text-xs text-slate-500 mt-1">Grid lines 1 to 12 · Escape route 1.2m vs 1.5m required</div>
                </div>

                {/* Live Redline Annotation Ring */}
                <div className="absolute left-[38%] top-[34%] w-48 h-24 border-2 border-red-500 rounded-full bg-red-500/10 flex items-center justify-center text-red-700 font-bold text-xs">
                  Confirm 1.5m escape width
                </div>
              </div>

              {/* Bottom Speaker Strip */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t">
                {[
                  { name: 'Justin Kruger (Chair)', status: 'Speaking...', active: true },
                  { name: 'N. Mokoena (Fire Eng)', status: 'Muted', active: false },
                  { name: 'L. Smith (Client)', status: 'Active', active: false },
                  { name: 'Wingman AI Copilot', status: 'Listening & Transcribing', active: true },
                ].map((spk, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl text-center text-xs ${
                      spk.active ? 'bg-[#DFF5F2] text-[#167E79] border border-[#19B7B0]' : 'bg-gray-100 text-[#657287]'
                    }`}
                  >
                    <div className="font-bold truncate">{spk.name}</div>
                    <div className="text-[10px]">{spk.status}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Room Panel (Agenda, Chat, Context) */}
            <aside className="bg-[#0f2438] border border-white/10 rounded-2xl p-3 flex flex-col justify-between text-xs">
              <div className="space-y-2">
                <div className="flex bg-white/10 p-1 rounded-xl">
                  {(['agenda', 'chat', 'context'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setRoomPanel(p)}
                      className={`flex-1 py-1 rounded-lg font-bold capitalize ${
                        roomPanel === p ? 'bg-[#19B7B0] text-white' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {roomPanel === 'agenda' && (
                  <div className="space-y-1.5 overflow-y-auto max-h-[400px]">
                    {INITIAL_MEETING_DATA.agenda.map((ag, idx) => (
                      <div key={idx} className="p-2 bg-white/5 border border-white/5 rounded-xl space-y-0.5">
                        <div className="font-bold text-white/90">
                          {idx + 1}. {ag.title}
                        </div>
                        <div className="text-white/50 text-[10px]">
                          {ag.owner} · {ag.minutes} min
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {roomPanel === 'context' && (
                  <div className="p-2 bg-white/5 rounded-xl space-y-1.5 text-[11px] text-white/80">
                    <div><strong>Project:</strong> {activeProject.name}</div>
                    <div><strong>Stage:</strong> {activeProject.stage}</div>
                    <div><strong>Blocker:</strong> Fire Escape Rational Design</div>
                    <div className="text-purple-300">✦ AI Minute Candidate: Fire plan to precede submission pack.</div>
                  </div>
                )}

                {roomPanel === 'chat' && (
                  <div className="p-2 text-white/60 text-center italic">No in-meeting chat messages yet.</div>
                )}
              </div>

              <button
                onClick={() => showToast('Timestamped decision candidate marked.')}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs"
              >
                ✦ Capture Decision Candidate
              </button>
            </aside>
          </div>

          {/* Bottom Floating WebRTC Call Controls */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                micOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-600'
              }`}
            >
              🎤
            </button>
            <button
              onClick={() => setCamOn(!camOn)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                camOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-600'
              }`}
            >
              📹
            </button>
            <button
              onClick={() => setCaptionsOn(!captionsOn)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                captionsOn ? 'bg-[#19B7B0] text-white' : 'bg-white/10 text-white/60'
              }`}
            >
              CC
            </button>
            <button
              onClick={() => {
                setRecordingOn(!recordingOn);
                setAuditEntries((entries) => [`Recording ${recordingOn ? 'stopped' : 'started'} by ${profile.label}`, ...entries]);
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                recordingOn ? 'bg-red-600 text-white animate-pulse' : 'bg-white/10 text-white/60'
              }`}
              title="Toggle recording"
            >
              ●REC
            </button>
            <button
              onClick={() => {
                setTranscriptOn(!transcriptOn);
                setAuditEntries((entries) => [`AI transcription ${transcriptOn ? 'stopped' : 'started'} by ${profile.label}`, ...entries]);
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                transcriptOn ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/60'
              }`}
              title="Toggle AI transcription"
            >
              ✦AI
            </button>
            <button
              onClick={() => {
                setRecordingOn(false);
                setTranscriptOn(false);
                setAuditEntries((entries) => [`Call ended by ${profile.label} · recording stopped · minute drafting queued as background job`, ...entries]);
                setScreen('review');
              }}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-xs shadow-lg transition-colors"
            >
              End Call & Open Minutes Review
            </button>
          </div>
        </div>
      )}

      {/* 3-Column Minutes Review Canvas */}
      {screen === 'review' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white border border-[#102033]/10 p-4 rounded-2xl shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                  AI Draft Review
                </span>
                <h2 className="text-base font-bold text-[#102033]">Municipal Readiness Review Minutes</h2>
              </div>
              <p className="text-xs text-[#657287] mt-0.5">
                Review transcript citations, edit minutes text, and accept/reject action write-backs before publication.
              </p>
            </div>

            <button
              data-testid="meetings-publish"
              onClick={() => void handlePublish()}
              className="px-5 py-2.5 bg-gradient-to-r from-[#19B7B0] to-[#167E79] text-white font-bold text-xs rounded-xl shadow-md hover:opacity-95"
            >
              Publish Minutes & Execute Write-Backs ›
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[500px]">
            {/* Column 1: Timestamped Transcript */}
            <section className="bg-white border border-[#102033]/10 rounded-2xl p-4 shadow-sm flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#96a0ad] mb-2">
                1. Timestamped Speaker Transcript
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2 text-xs">
                {INITIAL_MEETING_DATA.transcript.map((tr, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedMinuteIdx(Math.min(idx, 2))}
                    className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                      selectedMinuteIdx === Math.min(idx, 2)
                        ? 'border-[#19B7B0] bg-[#DFF5F2]/40'
                        : 'border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between text-[10.5px] text-[#167E79] font-bold">
                      <span>{tr.speaker} ({tr.time})</span>
                      <span className="text-[#96a0ad]">Confidence: {tr.confidence}</span>
                    </div>
                    <p className="text-[#102033] mt-1 leading-relaxed">{tr.text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Column 2: Editable Minutes Editor */}
            <section className="bg-white border border-[#102033]/10 rounded-2xl p-4 shadow-sm flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#96a0ad] mb-2">
                2. Governed Minutes Editor
              </h3>
              <div className="flex-1 overflow-y-auto space-y-3 text-xs">
                {INITIAL_MEETING_DATA.minutes.map((min, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedMinuteIdx(idx)}
                    className={`p-3 rounded-xl border space-y-1.5 ${
                      selectedMinuteIdx === idx ? 'border-purple-300 bg-purple-50/40 ring-1 ring-purple-200' : 'border-gray-200'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">{min.type}</span>
                    <textarea
                      defaultValue={min.text}
                      rows={3}
                      className="w-full bg-transparent border-none p-0 text-xs text-[#102033] focus:outline-none resize-none leading-relaxed"
                    />
                    <div className="text-[10px] text-[#96a0ad]">Cited Audio Offset: {min.source}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Column 3: Outcomes Review (Accept / Reject Gates) */}
            <section className="bg-white border border-[#102033]/10 rounded-2xl p-4 shadow-sm flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#96a0ad] mb-2">
                3. Outcomes Review & Action Gates
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2.5 text-xs">
                {outcomes.map((out, idx) => (
                  <div key={out.id} className="p-3 border rounded-xl bg-gray-50 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#102033]">{out.type}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          out.state === 'accepted'
                            ? 'bg-green-100 text-green-700'
                            : out.state === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {out.state}
                      </span>
                    </div>

                    <div className="font-semibold text-[#102033]">{out.title}</div>
                    <div className="text-[11px] text-[#657287]">
                      Owner: {out.owner} · Due: {out.due} · Dest: {out.destination}
                    </div>

                    {/* Accept / Reject Buttons */}
                    <div className="flex gap-2 pt-1">
                      <button
                        data-testid={`outcome-accept-${out.id}`}
                        disabled={busyOutcome === out.id || out.state !== 'pending'}
                        onClick={() => void handleOutcomeState(idx, 'accepted')}
                        className={`flex-1 py-1 rounded-lg font-bold text-xs disabled:opacity-40 ${
                          out.state === 'accepted'
                            ? 'bg-[#19B7B0] text-white shadow-sm'
                            : 'bg-white border text-[#167E79] hover:bg-[#DFF5F2]'
                        }`}
                      >
                        {busyOutcome === out.id ? '…' : 'Accept Output'}
                      </button>
                      <button
                        data-testid={`outcome-reject-${out.id}`}
                        disabled={busyOutcome === out.id || out.state !== 'pending'}
                        onClick={() => void handleOutcomeState(idx, 'rejected')}
                        className={`flex-1 py-1 rounded-lg font-bold text-xs disabled:opacity-40 ${
                          out.state === 'rejected'
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-white border text-red-600 hover:bg-red-50'
                        }`}
                      >
                        {busyOutcome === out.id ? '…' : 'Reject'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Issued Minutes Revision 01 View */}
      {screen === 'issued' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <article className="lg:col-span-2 bg-white border border-[#102033]/10 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-bold text-xs">
                ✓ Issued Minutes · Revision 01
              </span>
              <span className="font-mono text-xs text-[#657287]">Audit: AUD-M-1042-R01</span>
            </div>

            <h1 className="text-xl font-bold text-[#102033]">Municipal Readiness Review Minutes</h1>
            <div className="text-xs text-[#657287]">
              {activeProject.name} · Stage: {activeProject.stage} · Published: Today by Justin Kruger (Chair)
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-[#526074]">
              <div>
                <strong className="text-[#102033]">1. Attendance:</strong> Justin Kruger (Lead Architect), N. Mokoena (Fire Engineer), L. Smith (Client Representative), M. Patel (Minute-taker).
              </div>
              {outcomes.filter((o) => o.state === 'accepted').map((out) => (
                <div key={out.id}>
                  <strong className="text-[#102033]">Confirmed {out.type}:</strong> {out.title} · Owner {out.owner} · Due {out.due} · Destination {out.destination}.
                </div>
              ))}
              {outcomes.filter((o) => o.state === 'rejected').map((out) => (
                <div key={out.id}>
                  <strong className="text-[#102033]">Rejected {out.type}:</strong> {out.title} — no write-back created.
                </div>
              ))}
              <div>
                <strong className="text-[#102033]">Action Centre Tasks Generated ({outcomes.filter((o) => o.state === 'accepted').length}):</strong>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  {outcomes.filter((o) => o.state === 'accepted').map((out) => (
                    <li key={out.id}>{out.title} (Owner: {out.owner} · Due: {out.due}).</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>

          <aside className="bg-white border border-[#102033]/10 rounded-2xl p-5 shadow-sm space-y-3 h-fit">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#96a0ad]">Write-Back Summary</h3>
            <div className="space-y-2 text-xs text-[#526074]">
              <div className="text-green-700">✓ Issued Minutes PDF added to Project Passport</div>
              <div className="text-green-700">✓ {outcomes.filter((o) => o.state === 'accepted').length} accepted write-backs executed (idempotency keyed)</div>
              <div className="text-gray-500">○ {outcomes.filter((o) => o.state === 'rejected').length} rejected outcomes — no write-back created</div>
              <div className="text-gray-500">○ Retention: 90 Days Audio Stream</div>
            </div>
            <button
              onClick={() => setScreen('home')}
              className="w-full py-2.5 bg-[#102033] hover:bg-[#167E79] text-white font-bold rounded-xl text-xs"
            >
              Return to Meetings Hub
            </button>
          </aside>
        </div>
      )}

      {/* Global Toast */}
      {toast && (
        <div className="fixed right-6 bottom-24 bg-[#102033] text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  );
};
