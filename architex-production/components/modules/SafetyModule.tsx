'use client';

import React from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { ALL_TOOLS } from '@/lib/data';
import { ProjectEntity, RoleKey, ToolDefinition } from '@/lib/types';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

interface SafetyModuleProps {
  activeProject: ProjectEntity;
  currentRole: RoleKey;
  activeTabKey?: string;
  onTabChange?: (key: string) => void;
}

const TABS = (ALL_TOOLS['safety'] as ToolDefinition).tabs;

const statusTone: Record<string, string> = {
  Compliant: 'bg-green-100 text-green-700',
  Current: 'bg-green-100 text-green-700',
  Active: 'bg-green-100 text-green-700',
  Closed: 'bg-green-100 text-green-700',
  Approved: 'bg-green-100 text-green-700',
  Review: 'bg-amber-100 text-amber-700',
  Due: 'bg-amber-100 text-amber-700',
  Open: 'bg-rose-100 text-rose-700',
};

export const SafetyModule: React.FC<SafetyModuleProps> = ({
  activeProject,
  activeTabKey,
  onTabChange,
}) => {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || 'overview', onTabChange);

  return (
    <div className="space-y-4">
      <PageHeader
        title="OHS Safety File & Construction Regs"
        origami={<OrigamiIcon name="safety" size={26} />}
        metadata={<p>Construction Regulations 2014, OHS Act 85 of 1993, SACPCMP client-agent compliance and live site controls for {activeProject.name}.</p>}
        actions={<nav className="flex max-w-full overflow-x-auto" aria-label="Safety compliance sections">
          {TABS.map((item) => (
            <Button
              key={item.key}
              type="button"
              variant={tab === item.key ? 'ink' : 'quiet'}
              size="sm"
              aria-pressed={tab === item.key}
              onClick={() => setTab(item.key || '')}
              className="shrink-0"
            >
              {item.icon && <OrigamiIcon name={item.icon} size={13} />}
              {item.label}
              {item.badge && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${tab === item.key ? 'bg-[#102033] text-white' : 'bg-[#102033]/5 text-[#102033]'}`}>
                  {item.badge}
                </span>
              )}
            </Button>
          ))}
        </nav>}
      />

      {tab === 'overview' && (
        <section data-tool-tab="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ['142', 'Incident-free days', 'Since 03 Apr 2026'],
              ['94%', 'Audit readiness', '46 of 49 controls current'],
              ['28', 'People on site', 'All inducted for today'],
              ['4', 'Live permits', 'Next expiry at 14:30'],
            ].map(([value, label, detail]) => (
              <div key={label} className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="text-2xl font-bold text-[#102033]">{value}</div>
                <div className="mt-1 text-xs font-bold text-[#526074]">{label}</div>
                <div className="mt-1 text-[11px] text-[#657287]">{detail}</div>
              </div>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-3 rounded-2xl border bg-white p-5 text-xs shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#102033]">Today&apos;s site control board</h3>
                  <p className="text-[#657287]">Live hold points requiring supervisor awareness before work proceeds.</p>
                </div>
                <span className="rounded-full bg-[#19B7B0]/10 px-3 py-1 font-bold text-[#135f5a]">23 Aug 2026</span>
              </div>
              {[
                ['07:15', 'Toolbox talk', 'Excavation edge protection', 'Complete'],
                ['10:00', 'Hold-point inspection', 'North boundary trench shoring', 'Due'],
                ['13:30', 'Lifting briefing', 'Roof truss mobile-crane lift', 'Due'],
              ].map(([time, control, scope, status]) => (
                <div key={control} className="grid grid-cols-[52px_1fr_auto] items-center gap-3 rounded-xl border bg-[#F7F9FB] p-3">
                  <span className="font-mono font-bold text-[#167E79]">{time}</span>
                  <div><div className="font-bold text-[#102033]">{control}</div><div className="text-[#657287]">{scope}</div></div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${status === 'Complete' ? statusTone.Closed : statusTone.Due}`}>{status}</span>
                </div>
              ))}
            </div>
            <aside className="h-fit space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-xs">
              <h3 className="font-bold text-[#102033]">Priority interventions</h3>
              <div className="border-l-2 border-amber-400 pl-3"><strong>FPP-06 review</strong><p className="mt-0.5 text-[#657287]">Scaffold extension changes the west-elevation rescue route.</p></div>
              <div className="border-l-2 border-amber-400 pl-3"><strong>Medical certificate</strong><p className="mt-0.5 text-[#657287]">One working-at-heights clearance expires in 3 days.</p></div>
            </aside>
          </div>
        </section>
      )}

      {tab === 'safety_file' && (
        <section data-tool-tab="safety_file" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-4 rounded-2xl border bg-white p-5 text-xs shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div><h3 className="text-sm font-bold text-[#102033]">Digital Health & Safety File (Regulation 7)</h3><p className="text-[#657287]">Principal contractor audit readiness: 94%</p></div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">Audit Pass</span>
            </div>
            <div className="divide-y">
              {[
                ['CR 8.1 Principal Contractor Legal Appointment Letter', 'Signed & on file'],
                ['CR 8.7 Full-time Construction Supervisor Appointment', 'Signed & on file'],
                ['CR 8.8 Construction H&S Officer (SACPCMP CHSO)', 'PrCHSO 1092 registered'],
                ['Letter of Good Standing (COIDA / FEM)', 'Valid until 30 Apr 2027'],
                ['Project-Specific Health & Safety Plan (CR 7.1)', 'Approved by client agent'],
                ['Fall Protection Plan (CR 10)', 'Approved for heights above 2.0 m'],
                ['First Aider & Fire Fighter Certificates', 'Level 2 first aid current'],
              ].map(([title, detail]) => (
                <div key={title} className="flex items-center justify-between gap-3 py-2.5">
                  <div><div className="font-bold text-[#102033]">{title}</div><div className="text-[#657287]">{detail}</div></div>
                  <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-[10.5px] font-bold text-green-700">Compliant</span>
                </div>
              ))}
            </div>
          </div>
          <aside className="h-fit space-y-3 rounded-2xl border bg-white p-5 text-xs shadow-sm">
            <h4 className="font-bold uppercase tracking-wider text-[#96a0ad]">File governance</h4>
            <div className="space-y-2 text-[#526074]"><div><strong>File owner:</strong> Principal Contractor</div><div><strong>Last client-agent audit:</strong> 19 Aug 2026</div><div><strong>Next formal audit:</strong> 02 Sep 2026</div><div><strong>Controlled records:</strong> 49</div><div><strong>Outstanding evidence:</strong> 3</div></div>
          </aside>
        </section>
      )}

      {tab === 'permits' && (
        <section data-tool-tab="permits" className="space-y-3 rounded-2xl border bg-white p-5 text-xs shadow-sm">
          <div className="flex items-center justify-between">
            <div><h3 className="text-sm font-bold text-[#102033]">Active Permits to Work</h3><p className="text-[#657287]">Isolation, competency and close-out controls for high-risk construction activities.</p></div>
            <button className="rounded-xl bg-[#19B7B0] px-3 py-1.5 font-bold text-white">+ Issue permit</button>
          </div>
          {[
            ['PTW-042', 'Hot work', 'Arc welding at structural column B2', 'Fire watch / 2 extinguishers', '14:30'],
            ['PTW-043', 'Deep excavation', 'North boundary trench, 1.8 m deep', 'Shoring inspected / access ladder', '16:30'],
            ['PTW-044', 'Electrical isolation', 'DB-2 feeder termination', 'LOTO-17 applied / proved dead', '13:00'],
            ['PTW-045', 'Mobile lifting', 'Roof truss lift to grid C4', 'Lift plan LP-08 / exclusion zone', '17:00'],
          ].map(([id, type, scope, control, expiry]) => (
            <div key={id} className="grid gap-3 rounded-xl border bg-[#F7F9FB] p-3.5 md:grid-cols-[90px_1fr_1fr_auto] md:items-center">
              <div><div className="font-mono font-bold text-[#167E79]">{id}</div><div className="text-[10px] text-[#657287]">Active</div></div>
              <div><div className="font-bold text-[#102033]">{type}</div><div className="text-[#657287]">{scope}</div></div>
              <div><div className="font-bold text-[#526074]">Critical control</div><div className="text-[#657287]">{control}</div></div>
              <span className="rounded-full bg-green-100 px-2.5 py-1 font-bold text-green-700">Expires {expiry}</span>
            </div>
          ))}
        </section>
      )}

      {tab === 'hira' && (
        <section data-tool-tab="hira" className="space-y-4 rounded-2xl border bg-white p-5 text-xs shadow-sm">
          <div><h3 className="text-sm font-bold text-[#102033]">HIRA Risk Matrix</h3><p className="text-[#657287]">Baseline and task-specific assessments ranked after engineering and administrative controls.</p></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b text-[10px] uppercase tracking-wider text-[#96a0ad]"><tr><th className="pb-2">Activity / hazard</th><th className="pb-2">Initial</th><th className="pb-2">Mandatory control</th><th className="pb-2">Residual</th><th className="pb-2">Owner</th><th className="pb-2">Review</th></tr></thead>
              <tbody className="divide-y text-[#526074]">
                {[
                  ['Trenching / collapse', '20 Critical', 'Engineered shoring, spoil setback, daily inspection', '8 Medium', 'Excavation supervisor', 'Daily'],
                  ['Roof work / fall from edge', '25 Critical', 'Guardrails, lifeline and double lanyard', '5 Low', 'Fall protection supervisor', 'Per shift'],
                  ['Silica dust / cutting masonry', '16 High', 'Wet cutting, H-class extraction and P2 RPE', '6 Medium', 'Site manager', 'Weekly'],
                  ['Mobile crane / suspended load', '20 Critical', 'Approved lift plan and barricaded exclusion zone', '5 Low', 'Lifting supervisor', 'Each lift'],
                ].map(([hazard, initial, control, residual, owner, review]) => (
                  <tr key={hazard}><td className="py-3 font-bold text-[#102033]">{hazard}</td><td className="py-3 font-bold text-rose-700">{initial}</td><td className="py-3 pr-4">{control}</td><td className="py-3 font-bold text-amber-700">{residual}</td><td className="py-3">{owner}</td><td className="py-3">{review}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'incidents' && (
        <section data-tool-tab="incidents" className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3 rounded-2xl border bg-white p-5 text-xs shadow-sm lg:col-span-2">
            <div><h3 className="text-sm font-bold text-[#102033]">Incident & Near-Miss Register</h3><p className="text-[#657287]">OHS Act section 24 classification, investigation and corrective-action traceability.</p></div>
            {[
              ['INC-006', 'Near miss', 'Loose brick fell inside exclusion zone; no person exposed', 'Open', 'Root-cause review due today'],
              ['INC-005', 'First aid', 'Minor hand abrasion while stripping formwork', 'Closed', 'Glove standard and briefing updated'],
              ['INC-004', 'Property damage', 'Telehandler contacted temporary fence panel', 'Closed', 'Banksman route revised'],
            ].map(([id, kind, description, status, action]) => (
              <div key={id} className="grid gap-3 rounded-xl border p-3.5 md:grid-cols-[80px_1fr_auto] md:items-center">
                <div><div className="font-mono font-bold text-[#167E79]">{id}</div><div className="text-[#657287]">{kind}</div></div>
                <div><div className="font-bold text-[#102033]">{description}</div><div className="mt-0.5 text-[#657287]">{action}</div></div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusTone[status]}`}>{status}</span>
              </div>
            ))}
          </div>
          <aside className="h-fit space-y-3 rounded-2xl border bg-white p-5 text-xs shadow-sm">
            <h4 className="font-bold text-[#102033]">Statutory position</h4>
            <div className="rounded-xl bg-green-50 p-3"><div className="font-bold text-green-800">0 reportable incidents</div><p className="mt-1 text-green-700">No section 24 notification or disabling injury recorded on this project.</p></div>
            <div className="text-[#526074]"><strong>LTIFR:</strong> 0.00</div><div className="text-[#526074]"><strong>Open corrective actions:</strong> 1</div>
          </aside>
        </section>
      )}

      {tab === 'inductions' && (
        <section data-tool-tab="inductions" className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ['28 / 28', 'Workers inducted'], ['6 / 6', 'Visitors briefed'], ['100%', 'Today attendance'], ['07:15', 'Last toolbox talk'],
            ].map(([value, label]) => <div key={label} className="rounded-2xl border bg-white p-4 shadow-sm"><div className="text-xl font-bold text-[#102033]">{value}</div><div className="mt-1 text-xs text-[#657287]">{label}</div></div>)}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3 rounded-2xl border bg-white p-5 text-xs shadow-sm">
              <div><h3 className="text-sm font-bold text-[#102033]">Competency & induction exceptions</h3><p className="text-[#657287]">Access is blocked when project induction or role competency lapses.</p></div>
              {[
                ['Thabo Molefe', 'Scaffold erector refresher', 'Due', '26 Aug 2026'],
                ['Lerato Ndlovu', 'Working at heights medical', 'Due', '29 Aug 2026'],
                ['Sipho Dlamini', 'Mobile plant operator certificate', 'Current', '14 Feb 2027'],
              ].map(([person, course, status, date]) => <div key={person} className="flex items-center justify-between gap-3 rounded-xl border p-3"><div><div className="font-bold text-[#102033]">{person}</div><div className="text-[#657287]">{course} · {date}</div></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusTone[status]}`}>{status}</span></div>)}
            </div>
            <div className="space-y-3 rounded-2xl border bg-white p-5 text-xs shadow-sm">
              <h3 className="text-sm font-bold text-[#102033]">Recent toolbox talks</h3>
              {[
                ['23 Aug', 'Excavation edge protection', '28 attendees', 'S. Mokoena'],
                ['22 Aug', 'Housekeeping and access routes', '31 attendees', 'P. Jacobs'],
                ['21 Aug', 'Hot-work fire watch', '12 attendees', 'S. Mokoena'],
              ].map(([date, topic, attendance, leader]) => <div key={topic} className="grid grid-cols-[55px_1fr_auto] gap-3 border-b pb-3"><span className="font-mono text-[#167E79]">{date}</span><div><div className="font-bold text-[#102033]">{topic}</div><div className="text-[#657287]">Led by {leader}</div></div><span className="text-[#526074]">{attendance}</span></div>)}
            </div>
          </div>
        </section>
      )}

      {tab === 'plans' && (
        <section data-tool-tab="plans" className="space-y-4 rounded-2xl border bg-white p-5 text-xs shadow-sm">
          <div><h3 className="text-sm font-bold text-[#102033]">Project Health & Safety Plans</h3><p className="text-[#657287]">Controlled plans aligned to the client specification, construction sequence and approved method statements.</p></div>
          {[
            ['HSP-001', 'Principal Contractor H&S Plan', 'Rev 06', 'Approved', 'J. van Wyk, PrCHSA', '18 Aug 2026'],
            ['ERP-002', 'Emergency Preparedness & Evacuation Plan', 'Rev 03', 'Approved', 'S. Mokoena, CHSO', '12 Aug 2026'],
            ['TMP-004', 'Construction Traffic Management Plan', 'Rev 02', 'Review', 'Site logistics team', '24 Aug 2026'],
            ['DMP-003', 'Demolition & Temporary Works Plan', 'Rev 01', 'Approved', 'Temporary works designer', '05 Aug 2026'],
          ].map(([id, title, revision, status, owner, date]) => (
            <div key={id} className="grid gap-3 rounded-xl border bg-[#F7F9FB] p-3.5 md:grid-cols-[80px_1fr_80px_auto] md:items-center">
              <span className="font-mono font-bold text-[#167E79]">{id}</span>
              <div><div className="font-bold text-[#102033]">{title}</div><div className="text-[#657287]">Owner: {owner} · issued {date}</div></div>
              <span className="font-bold text-[#526074]">{revision}</span>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusTone[status]}`}>{status}</span>
            </div>
          ))}
        </section>
      )}

      {tab === 'fall_protection' && (
        <section data-tool-tab="fall_protection" className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 rounded-2xl border bg-white p-5 text-xs shadow-sm lg:col-span-2">
            <div><h3 className="text-sm font-bold text-[#102033]">Fall Protection Plan · Regulation 10</h3><p className="text-[#657287]">Work-at-height controls, equipment inspections and rescue readiness by active workface.</p></div>
            {[
              ['West elevation scaffold', 'Guardrails + tagged access scaffold', 'SCF-018', 'Current', '23 Aug 07:05'],
              ['Roof truss installation', 'Horizontal lifeline + twin lanyard', 'WAH-031', 'Current', '23 Aug 06:50'],
              ['Lift shaft opening L2', 'Fixed barrier + lockable gate', 'EDGE-014', 'Review', '22 Aug 15:40'],
            ].map(([area, system, register, status, inspected]) => (
              <div key={area} className="grid gap-3 rounded-xl border p-3.5 md:grid-cols-[1fr_1fr_90px_auto] md:items-center">
                <div><div className="font-bold text-[#102033]">{area}</div><div className="text-[#657287]">Inspected {inspected}</div></div>
                <div><div className="font-bold text-[#526074]">Protection system</div><div className="text-[#657287]">{system}</div></div>
                <span className="font-mono text-[#167E79]">{register}</span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusTone[status]}`}>{status}</span>
              </div>
            ))}
          </div>
          <aside className="h-fit space-y-3 rounded-2xl border border-[#19B7B0]/30 bg-[#19B7B0]/5 p-5 text-xs">
            <h4 className="font-bold text-[#102033]">Rescue readiness</h4>
            <div className="text-[#526074]"><strong>Rescue team:</strong> 4 competent persons on site</div><div className="text-[#526074]"><strong>Rescue kit:</strong> Sealed, inspected 23 Aug</div><div className="text-[#526074]"><strong>Drill:</strong> 8 min 42 sec on 16 Aug</div><div className="text-[#526074]"><strong>Anchor certification:</strong> Valid to 30 Jan 2027</div>
            <div className="rounded-xl bg-white p-3 font-bold text-[#167E79]">Next rescue drill: 30 Aug 2026</div>
          </aside>
        </section>
      )}
    </div>
  );
};
