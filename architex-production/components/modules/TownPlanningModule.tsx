'use client';

import React from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { ProjectEntity, RoleKey, ToolDefinition } from '@/lib/types';
import { ALL_TOOLS } from '@/lib/data';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';

interface TownPlanningModuleProps {
  activeProject: ProjectEntity;
  currentRole: RoleKey;
  activeTabKey?: string;
  isProjectMode?: boolean;
  onNavigateTool?: (toolId: string) => void;
  onOpenWingman?: () => void;
  onTabChange?: (key: string) => void;
}

const TABS = (ALL_TOOLS['planning'] as ToolDefinition).tabs;

export const TownPlanningModule: React.FC<TownPlanningModuleProps> = ({
  activeProject,
  currentRole,
  activeTabKey,
  onTabChange,
}) => {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [applications, setApplications] = React.useState([
    {
      id: 'SPLUMA-2026-088',
      type: 'Rezoning (Residential 1 to Residential 3)',
      erf: 'Erf 412 Faerie Glen Ext 1',
      municipality: 'City of Tshwane Metropolitan Municipality',
      status: 'Public Notice Window Open',
      deadline: '14 Aug 2026',
      objections: 2,
      progress: 60,
    },
    {
      id: 'CONS-2026-014',
      type: 'Removal of Restrictive Title Conditions',
      erf: 'Erf 412 Faerie Glen Ext 1',
      municipality: 'City of Tshwane',
      status: 'Council Technical Evaluation',
      deadline: '28 Aug 2026',
      objections: 0,
      progress: 80,
    },
  ]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#19B7B0]/10 border border-[#19B7B0]/30 flex items-center justify-center text-[#167E79]">
            <OrigamiIcon name="planning" size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#102033] tracking-tight">Town Planning & SPLUMA Manager</h1>
            <p className="text-[13px] text-[#657287]">
              Land use applications, statutory public notices, municipal planning tribunal hearings, and title deed restriction removals.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap bg-white p-1 rounded-2xl border border-[#102033]/15 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.key}
              aria-pressed={tab === t.key}
              onClick={() => setTab(t.key || '')}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all whitespace-nowrap ${
                tab === t.key ? 'bg-[#19B7B0] text-white shadow-sm' : 'text-[#657287] hover:text-[#102033]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Tab */}
      {tab === 'dashboard' && (
        <div data-tool-tab="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#102033]/10 rounded-2xl p-5 shadow-sm">
              <div className="text-xs text-[#657287] font-bold uppercase tracking-wider">Active Applications</div>
              <div className="text-3xl font-bold text-[#102033] mt-2">{applications.length}</div>
              <div className="text-[11px] text-[#167E79] mt-1">2 in progress</div>
            </div>
            <div className="bg-white border border-[#102033]/10 rounded-2xl p-5 shadow-sm">
              <div className="text-xs text-[#657287] font-bold uppercase tracking-wider">Next Deadline</div>
              <div className="text-lg font-bold text-[#102033] mt-2">14 Aug 2026</div>
              <div className="text-[11px] text-[#657287] mt-1">Provincial Gazette Publication</div>
            </div>
            <div className="bg-white border border-[#102033]/10 rounded-2xl p-5 shadow-sm">
              <div className="text-xs text-[#657287] font-bold uppercase tracking-wider">Open Objections</div>
              <div className="text-3xl font-bold text-[#102033] mt-2">2</div>
              <div className="text-[11px] text-amber-600 mt-1">Requires response</div>
            </div>
            <div className="bg-white border border-[#102033]/10 rounded-2xl p-5 shadow-sm">
              <div className="text-xs text-[#657287] font-bold uppercase tracking-wider">Upcoming Hearings</div>
              <div className="text-3xl font-bold text-[#102033] mt-2">1</div>
              <div className="text-[11px] text-[#657287] mt-1">MPT scheduled pending</div>
            </div>
          </div>

          <div className="bg-white border border-[#102033]/10 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#102033] mb-3">Recent Activity</h3>
            <div className="divide-y text-xs">
              <div className="py-2 flex justify-between">
                <span className="text-[#102033]">Application SPLUMA-2026-088 — Public Notice Window Opened</span>
                <span className="text-[#657287]">Today</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-[#102033]">Objection received from Erf 413 Owner</span>
                <span className="text-[#657287]">18 Jul 2026</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-[#102033]">Application CONS-2026-014 — Council Technical Evaluation started</span>
                <span className="text-[#657287]">15 Jul 2026</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-[#102033]">On-site Notice Board Inspection Period commenced</span>
                <span className="text-[#657287]">14 Jul 2026</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Applications Tab */}
      {tab === 'applications' && (
        <div data-tool-tab="applications" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white border border-[#102033]/10 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-[#102033]">Active SPLUMA Land Use Filings</h2>
              <button className="px-3 py-1.5 bg-[#19B7B0] text-white rounded-xl text-xs font-bold shadow-sm">
                + New Application
              </button>
            </div>

            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="p-4 border rounded-2xl bg-gray-50/50 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-[#167E79]">{app.id}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px]">
                      {app.status}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-[#102033]">{app.type}</div>
                  <div className="text-[#657287]">
                    {app.erf} · {app.municipality} · Objections: {app.objections}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t text-[11px]">
                    <span className="font-bold text-[#102033]">Statutory Window Closes: {app.deadline}</span>
                    <span className="text-[#167E79] font-bold">Progress: {app.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="bg-white border rounded-2xl p-5 shadow-sm space-y-3 h-fit text-xs">
            <h3 className="font-bold uppercase tracking-wider text-[#96a0ad]">Planning Intelligence</h3>
            <div className="space-y-2 text-[#526074]">
              <div><strong>Zoning Scheme:</strong> Tshwane Town Planning Scheme 2008 (Revised 2014)</div>
              <div><strong>Coverage Allowed:</strong> 50% max (Proposed: 42%)</div>
              <div><strong>F.A.R. Allowed:</strong> 0.8 (Proposed: 0.65)</div>
              <div><strong>Height Limit:</strong> 2 storeys (Compliant)</div>
              <div><strong>Building Line:</strong> Street: 5.0m, Sides: 2.0m</div>
            </div>
          </aside>
        </div>
      )}

      {/* Deadlines Tab */}
      {tab === 'deadlines' && (
        <div data-tool-tab="deadlines" className="bg-white border rounded-2xl p-5 shadow-sm space-y-3 text-xs">
          <h3 className="font-bold text-sm text-[#102033]">Upcoming Statutory Deadlines</h3>
          <div className="divide-y">
            {[
              { title: 'Provincial Gazette Publication (Afrikaans & English)', date: '30 Jul 2026', status: 'Notice Placed' },
              { title: 'On-site Notice Board Inspection Period Closes', date: '14 Aug 2026', status: 'Active 28-day window' },
              { title: 'Registered Post Notices to Adjoining Owners', date: 'Done', status: 'Proof of Postage on File' },
            ].map((d, idx) => (
              <div key={idx} className="py-2.5 flex justify-between items-center">
                <div>
                  <div className="font-bold text-[#102033]">{d.title}</div>
                  <div className="text-[#657287]">Date: {d.date}</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold text-[10.5px]">
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Participation Tab */}
      {tab === 'participation' && (
        <div data-tool-tab="participation" className="bg-white border rounded-2xl p-5 shadow-sm space-y-3 text-xs">
          <h3 className="font-bold text-sm text-[#102033]">Registered Public Objections (2 Received)</h3>
          <div className="space-y-2">
            {[
              { sender: 'Erf 413 Owner (Adjoining)', issue: 'Traffic congestion on boundary street & privacy overlooking pool', date: '18 Jul 2026', responseStatus: 'Response Drafted by Planner' },
              { sender: 'Faerie Glen Residents Association', issue: 'Clarification on stormwater attenuation capacity', date: '21 Jul 2026', responseStatus: 'Pending Civil Engineer report' },
            ].map((obj, idx) => (
              <div key={idx} className="p-3 border rounded-xl bg-gray-50 space-y-1">
                <div className="flex justify-between font-bold text-[#102033]">
                  <span>{obj.sender}</span>
                  <span className="text-[#167E79]">{obj.date}</span>
                </div>
                <div className="text-[#526074]">{obj.issue}</div>
                <div className="text-[11px] text-purple-700 font-semibold pt-1">Status: {obj.responseStatus}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conditions Tab */}
      {tab === 'conditions' && (
        <div data-tool-tab="conditions" className="bg-white border border-[#102033]/10 rounded-2xl p-5 shadow-sm space-y-3 text-xs">
          <h3 className="font-bold text-sm text-[#102033]">Conditions Register</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-[#657287] font-bold uppercase tracking-wider text-[10.5px]">
                  <th className="py-2 pr-4">Condition</th>
                  <th className="py-2 pr-4">Source</th>
                  <th className="py-2 pr-4">Compliance</th>
                  <th className="py-2 pr-4">Responsible</th>
                  <th className="py-2">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-2.5 pr-4 font-bold text-[#102033]">Stormwater attenuation plan approval</td>
                  <td className="py-2.5 pr-4 text-[#657287]">Title Deed Condition 12(b)</td>
                  <td className="py-2.5 pr-4"><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold text-[10.5px]">In Progress</span></td>
                  <td className="py-2.5 pr-4 text-[#657287]">Civil Engineer</td>
                  <td className="py-2.5 text-[#657287]">30 Sep 2026</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-bold text-[#102033]">Street widening servitude registration</td>
                  <td className="py-2.5 pr-4 text-[#657287]">Rezoning Approval</td>
                  <td className="py-2.5 pr-4"><span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold text-[10.5px]">Compliant</span></td>
                  <td className="py-2.5 pr-4 text-[#657287]">Land Surveyor</td>
                  <td className="py-2.5 text-[#657287]">Completed</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-bold text-[#102033]">Water connection upgrade (DN150)</td>
                  <td className="py-2.5 pr-4 text-[#657287]">Municipal Servitude</td>
                  <td className="py-2.5 pr-4"><span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10.5px]">Not Started</span></td>
                  <td className="py-2.5 pr-4 text-[#657287]">Contractor</td>
                  <td className="py-2.5 text-[#657287]">31 Dec 2026</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hearings Tab */}
      {tab === 'hearings' && (
        <div data-tool-tab="hearings" className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#102033]">Hearing pack readiness</h3>
              <p className="mt-1 text-xs text-[#657287]">MPT evidence, notices and professional reports for SPLUMA-2026-088.</p>
            </div>
            <button className="rounded-xl bg-[#19B7B0] px-4 py-2 text-xs font-bold text-white">Compile tribunal bundle</button>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              { item: 'Planner motivation and land-use memorandum', owner: 'L. Molefe · PrPln', status: 'Approved' },
              { item: 'Consolidated objection response schedule', owner: 'Town Planning Team', status: '1 response pending' },
              { item: 'Traffic and stormwater expert evidence', owner: 'Civil Engineer', status: 'Signed' },
            ].map((record) => (
              <article key={record.item} className="rounded-2xl border bg-white p-4 text-xs shadow-sm">
                <div className="font-bold text-[#102033]">{record.item}</div>
                <div className="mt-2 text-[#657287]">Responsible: {record.owner}</div>
                <div className="mt-3 inline-flex rounded-full bg-[#19B7B0]/10 px-2.5 py-1 text-[10px] font-bold text-[#167E79]">{record.status}</div>
              </article>
            ))}
          </div>
          <div className="rounded-2xl border bg-white p-5 text-xs shadow-sm">
            <div className="flex items-center justify-between"><span className="font-bold text-[#102033]">Provisional tribunal date</span><span className="font-mono text-[#167E79]">22 Sep 2026 · 09:00</span></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full w-[86%] rounded-full bg-[#19B7B0]" /></div>
            <p className="mt-2 text-[#657287]">6 of 7 mandatory bundle sections verified. Adjoining-owner response remains due.</p>
          </div>
        </div>
      )}

      {/* Municipalities Tab */}
      {tab === 'municipalities' && (
        <div data-tool-tab="municipalities" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            { name: 'City of Tshwane Metropolitan Municipality', portal: 'e-Tshwane Portal', turnaround: '90–120 days', apps: 2 },
            { name: 'Ekurhuleni Metropolitan Municipality', portal: 'e-Ekurhuleni Portal', turnaround: '60–90 days', apps: 0 },
            { name: 'City of Johannesburg Metropolitan Municipality', portal: 'JDA Online', turnaround: '120–180 days', apps: 0 },
            { name: 'Mogale City Local Municipality', portal: 'Mogale e-Services', turnaround: '60–90 days', apps: 0 },
          ].map((m, idx) => (
            <div key={idx} className="bg-white border border-[#102033]/10 rounded-2xl p-5 shadow-sm space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <OrigamiIcon name="municipal" size={20} />
                <h3 className="font-bold text-sm text-[#102033]">{m.name}</h3>
              </div>
              <div className="text-[#657287]"><strong>Portal:</strong> {m.portal}</div>
              <div className="text-[#657287]"><strong>Typical Turnaround:</strong> {m.turnaround}</div>
              <div className="text-[#657287]"><strong>Active Applications:</strong> {m.apps}</div>
            </div>
          ))}
        </div>
      )}

      {/* Payments Tab */}
      {tab === 'payments' && (
        <div data-tool-tab="payments" className="bg-white border border-[#102033]/10 rounded-2xl p-5 shadow-sm space-y-3 text-xs">
          <h3 className="font-bold text-sm text-[#102033]">Payments & Fees Schedule</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-[#657287] font-bold uppercase tracking-wider text-[10.5px]">
                  <th className="py-2 pr-4">Description</th>
                  <th className="py-2 pr-4">Amount (ZAR)</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-2.5 pr-4 font-bold text-[#102033]">SPLUMA Application Fee — Rezoning</td>
                  <td className="py-2.5 pr-4 text-[#657287]">R 8,500.00</td>
                  <td className="py-2.5 pr-4"><span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold text-[10.5px]">PAID</span></td>
                  <td className="py-2.5 text-[#657287]">12 Jun 2026</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-bold text-[#102033]">Municipal Advertisement Charge</td>
                  <td className="py-2.5 pr-4 text-[#657287]">R 3,200.00</td>
                  <td className="py-2.5 pr-4"><span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold text-[10.5px]">PAID</span></td>
                  <td className="py-2.5 text-[#657287]">20 Jun 2026</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-bold text-[#102033]">Title Deed Restriction Removal Fee</td>
                  <td className="py-2.5 pr-4 text-[#657287]">R 5,750.00</td>
                  <td className="py-2.5 pr-4"><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold text-[10.5px]">PENDING</span></td>
                  <td className="py-2.5 text-[#657287]">15 Aug 2026</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-bold text-[#102033]">MPT Hearing Fee</td>
                  <td className="py-2.5 pr-4 text-[#657287]">R 12,000.00</td>
                  <td className="py-2.5 pr-4"><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold text-[10.5px]">PENDING</span></td>
                  <td className="py-2.5 text-[#657287]">TBD</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
