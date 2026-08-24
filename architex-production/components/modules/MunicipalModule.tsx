'use client';

import React, { useState } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { ProjectEntity, RoleKey, ToolDefinition } from '@/lib/types';
import { ALL_TOOLS } from '@/lib/data';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

interface MunicipalModuleProps {
  activeProject: ProjectEntity;
  currentRole: RoleKey;
  activeTabKey?: string;
  onTabChange?: (key: string) => void;
}

const TABS = (ALL_TOOLS['municipal'] as ToolDefinition).tabs;

export const MunicipalModule: React.FC<MunicipalModuleProps> = ({
  activeProject,
  activeTabKey,
  onTabChange,
}) => {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [departments, setDepartments] = useState([
    { name: 'Building Control & Plan Examiner', status: 'Ready (100%)', flag: 'pass', doc: 'Architectural drawings A-101 to A-210' },
    { name: 'Emergency Services (Fire Safety)', status: 'Hold Point (60%)', flag: 'hold', doc: 'Escape width mark-up pending' },
    { name: 'Roads & Stormwater Attenuation', status: 'Ready (100%)', flag: 'pass', doc: 'Civil stormwater attenuation report approved' },
    { name: 'Water & Sanitation (Sewer Connection)', status: 'Ready (100%)', flag: 'pass', doc: 'Municipal connection fee paid' },
    { name: 'Electricity Department', status: 'Ready (100%)', flag: 'pass', doc: '80kVA supply allocation confirmed' },
    { name: 'Environmental Management', status: 'Ready (100%)', flag: 'pass', doc: 'No NEMA EIA trigger' },
    { name: 'Heritage Resources Authority', status: 'Under Review (75%)', flag: 'review', doc: 'Section 38 screening permit submitted' },
    { name: 'City Health (Ventilation & Waste)', status: 'Ready (100%)', flag: 'pass', doc: 'Refuse storage area compliant' },
  ]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader
        title="Municipal Submission Manager"
        origami={<OrigamiIcon name="municipal" size={26} />}
        metadata={<p>Track 8 statutory municipal departments, compile submission packs, and eliminate council plan examiner rejections.</p>}
        actions={<nav className="flex max-w-full overflow-x-auto" aria-label="Municipal submission sections">
          {TABS.map((t) => (
            <Button
              key={t.key}
              type="button"
              variant={tab === t.key ? 'ink' : 'quiet'}
              size="sm"
              aria-pressed={tab === t.key}
              onClick={() => setTab(t.key || '')}
              className="shrink-0"
            >
              {t.label}
            </Button>
          ))}
        </nav>}
      />

      {/* Tab: Readiness Overview */}
      {tab === 'overview' && (
        <div data-tool-tab="overview" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-[#102033]">Municipal Clearance Matrix (City of Tshwane)</h3>
                <p className="text-xs text-[#657287]">Overall council readiness score: 82%</p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-xs">
                1 Active Blocker
              </span>
            </div>

            <div className="space-y-2.5">
              {departments.map((dept, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 border rounded-xl flex items-center justify-between text-xs transition-colors ${
                    dept.flag === 'hold' ? 'bg-red-50/70 border-red-200' : 'bg-gray-50/50 border-gray-200'
                  }`}
                >
                  <div>
                    <div className="font-bold text-[#102033]">{dept.name}</div>
                    <div className="text-[#657287] mt-0.5">{dept.doc}</div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                      dept.flag === 'pass'
                        ? 'bg-green-100 text-green-700'
                        : dept.flag === 'hold'
                        ? 'bg-red-100 text-red-700 font-extrabold'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {dept.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <aside className="bg-white border rounded-2xl p-5 shadow-sm space-y-3 h-fit text-xs">
            <h4 className="font-bold uppercase tracking-wider text-[var(--ax-text-muted)]">Filing Passport</h4>
            <div className="space-y-2 text-[#526074]">
              <div><strong>Municipality:</strong> City of Tshwane</div>
              <div><strong>Filing System:</strong> e-Tshwane Building Plans Portal</div>
              <div><strong>SACAP Reg Architect:</strong> Justin Kruger (PrArch 21490)</div>
              <div><strong>Application Category:</strong> Class A1 / H4 Mixed-Use</div>
              <div><strong>Estimated Scrutiny Period:</strong> 30 calendar days</div>
            </div>
          </aside>
        </div>
      )}

      {/* Tab: Land Use & Zoning */}
      {tab === 'landuse' && (
        <div data-tool-tab="landuse" className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-[#102033]">Land Use & Zoning Parameters</h3>
              <p className="text-xs text-[#657287]">ERF 1239 Faerie Glen · Zoning: Special Residential / Mixed-Use (H4)</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold text-xs">Zoning Compliant</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-left text-[10px] uppercase tracking-wider text-[#96a0ad]">
                  <th className="py-2.5 pr-4 font-bold">Parameter</th>
                  <th className="py-2.5 pr-4 font-bold">Current Zoning</th>
                  <th className="py-2.5 pr-4 font-bold">Proposed Development</th>
                  <th className="py-2.5 font-bold">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { param: 'Zoning Category', current: 'H4 — Special Residential', proposed: 'Mixed-Use (A1 / H4)', status: 'PASS' },
                  { param: 'Permitted Uses', current: 'Dwelling houses, special buildings', proposed: 'Residential + retail + office', status: 'PASS' },
                  { param: 'Floor Area Ratio (FAR)', current: '0.45', proposed: '0.42', status: 'PASS' },
                  { param: 'Site Coverage', current: '40% max', proposed: '36%', status: 'PASS' },
                  { param: 'Building Height', current: '2 storeys / 9.5 m', proposed: '3 storeys / 11 m', status: 'REVIEW' },
                  { param: 'Parking Requirement', current: '2 bays per unit', proposed: '1.8 bays per unit', status: 'REVIEW' },
                  { param: 'Building Lines', current: 'Front 7.5 m · Side 3 m', proposed: 'Front 7.5 m · Side 3 m', status: 'PASS' },
                  { param: 'Stormwater Detention', current: 'Nil (scheme dependent)', proposed: 'Attenuation to 1-in-5yr', status: 'PASS' },
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 pr-4 font-bold text-[#102033]">{row.param}</td>
                    <td className="py-2.5 pr-4 text-[#657287]">{row.current}</td>
                    <td className="py-2.5 pr-4 text-[#526074]">{row.proposed}</td>
                    <td className="py-2.5">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        row.status === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {row.status === 'PASS' ? 'PASS' : 'REVIEW'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 border rounded-xl bg-amber-50/60 border-amber-200 text-xs text-[#526074]">
            <strong className="text-[#102033]">Planning note:</strong> Height and parking exceed the underlying H4 rights. A departure / consent use application is required before building plan approval — flagged for the town planner.
          </div>
        </div>
      )}

      {/* Tab: Department Circulation */}
      {tab === 'circulation' && (
        <div data-tool-tab="circulation" className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-[#102033]">Department Circulation Status</h3>
              <p className="text-xs text-[#657287]">8 statutory municipal departments · concurrent circulation</p>
            </div>
            <span className="px-3 py-1 bg-[#19B7B0]/10 text-[#167E79] rounded-full font-bold text-xs">6 Ready · 1 Hold · 1 Review</span>
          </div>

          <div className="space-y-2.5">
            {departments.map((dept, idx) => (
              <div
                key={idx}
                className={`p-3.5 border rounded-xl text-xs ${
                  dept.flag === 'hold' ? 'bg-red-50/70 border-red-200' : dept.flag === 'review' ? 'bg-amber-50/70 border-amber-200' : 'bg-gray-50/50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-bold text-[#102033]">{dept.name}</div>
                  <span
                    className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                      dept.flag === 'pass'
                        ? 'bg-green-100 text-green-700'
                        : dept.flag === 'hold'
                        ? 'bg-red-100 text-red-700 font-extrabold'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {dept.status}
                  </span>
                </div>
                <div className="text-[#657287] mt-1.5">
                  <span className="font-bold text-[#526074]">Docs submitted:</span> {dept.doc}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 border rounded-xl bg-[#19B7B0]/5 border-[#19B7B0]/20 text-xs text-[#526074]">
            <strong className="text-[#102033]">Workflow note:</strong> Emergency Services (Fire Safety) is the current hold point — the escape-width mark-up on A-204 must be issued by the fire engineer before the pack is submitted to council.
          </div>
        </div>
      )}

      {/* Tab: Submission Pack */}
      {tab === 'pack' && (
        <div data-tool-tab="pack" className="bg-white border rounded-2xl p-5 shadow-sm space-y-4 text-xs">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#102033]">Digital Submission Pack Assembler</h3>
            <button className="px-4 py-2 bg-[#19B7B0] text-white font-bold rounded-xl shadow-sm">
              Compile & Validate Combined PDF
            </button>
          </div>
          <div className="divide-y space-y-1">
            {[
              { doc: 'SANS 10400 Form 1 & Form 2 (Signed)', size: '1.2 MB', ready: true },
              { doc: 'Architectural Drawings A-101 to A-210 (PDF/A)', size: '18.4 MB', ready: true },
              { doc: 'SANS 10400-XA Energy Calculation Certificate', size: '2.8 MB', ready: true },
              { doc: 'Fire Rational Design Report (Form 2 by Fire Eng)', size: '4.1 MB', ready: false },
              { doc: 'Zoning Certificate & SG Diagram', size: '850 KB', ready: true },
              { doc: 'Title Deed & Power of Attorney from Owner', size: '3.4 MB', ready: true },
            ].map((p, idx) => (
              <div key={idx} className="pt-2 flex justify-between items-center">
                <div className="font-bold text-[#102033]">
                  {p.doc} <span className="font-normal text-[#657287]">({p.size})</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10.5px] ${p.ready ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {p.ready ? 'Ready' : 'Pending Sign-Off'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Municipal Certificate */}
      {tab === 'certificate' && (
        <div data-tool-tab="certificate" className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#102033]">Certificate & occupancy gate</h3>
              <p className="mt-1 text-xs text-[#657287]">Section 7 approval through occupation-certificate close-out.</p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">2 prerequisites open</span>
          </div>
          <div className="overflow-x-auto rounded-2xl border bg-white p-5 shadow-sm">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead><tr className="border-b text-[10px] uppercase tracking-wider text-[#96a0ad]"><th className="py-2">Control</th><th>Authority record</th><th>Owner</th><th>Status</th></tr></thead>
              <tbody className="divide-y">
                {[
                  ['NBR Section 7 plan approval', 'COT/BP/26/00418', 'Building Control', 'Recorded'],
                  ['Section 14 completion notice', 'Form 4 · Rev 02', 'Principal Agent', 'Draft'],
                  ['Fire clearance certificate', 'FIRE/26/1187', 'Fire Engineer', 'Awaiting inspection'],
                  ['Occupation certificate', 'OC application not issued', 'Municipality', 'Blocked'],
                ].map(([control, record, owner, status]) => (
                  <tr key={control}><td className="py-3 pr-4 font-bold text-[#102033]">{control}</td><td className="pr-4 font-mono text-[#526074]">{record}</td><td className="pr-4 text-[#657287]">{owner}</td><td><span className="rounded-full bg-[#102033]/5 px-2 py-1 text-[10px] font-bold text-[#526074]">{status}</span></td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="rounded-xl bg-[#102033] px-4 py-2 text-xs font-bold text-white">Request outstanding clearances</button>
        </div>
      )}

      {/* Tab: Submission Outcomes */}
      {tab === 'outcomes' && (
        <div data-tool-tab="outcomes" className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-[#102033]">Submission Outcomes Timeline</h3>
              <p className="text-xs text-[#657287]">Track record of municipal submissions and authority decisions</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold text-xs">2 of 3 Approved</span>
          </div>

          <div className="space-y-3">
            {[
              { date: '12 Jun 2026', ref: 'COT/BP/26/00418', name: 'Building Plan Submission — Rev C (Phase 1)', outcome: 'Approved', note: 'Granted with no conditions. 30-day scrutiny period completed in 22 days.' },
              { date: '28 Mar 2026', ref: 'COT/LU/26/00097', name: 'Land-Use Consent — Height Departure', outcome: 'Conditional', note: 'Approved subject to tree-removal permit and 2 m side boundary setback on the east.' },
              { date: '17 Nov 2025', ref: 'COT/BP/25/00711', name: 'Building Plan Submission — Rev A (Basement)', outcome: 'Rejected', note: 'Rejected: wet-services layout conflicts with municipal sewer connection point. Resubmitted and approved.' },
            ].map((s, idx) => (
              <div key={idx} className="p-4 border rounded-xl flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="shrink-0 w-20 text-left sm:text-center">
                  <div className="text-[10px] uppercase tracking-wider text-[#96a0ad] font-bold">{s.date}</div>
                  <div className="text-[10px] font-mono text-[#657287] mt-0.5">{s.ref}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#102033] text-xs">{s.name}</div>
                  <div className="text-xs text-[#526074] mt-1">{s.note}</div>
                </div>
                <span
                  className={`shrink-0 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                    s.outcome === 'Approved'
                      ? 'bg-green-100 text-green-700'
                      : s.outcome === 'Conditional'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {s.outcome}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3.5 border rounded-xl bg-[#19B7B0]/5 border-[#19B7B0]/20 text-xs text-[#526074]">
            <strong className="text-[#102033]">Conditions register:</strong> 1 active condition on the land-use consent — side boundary setback to be reflected on the Site Development Plan before the next submission.
          </div>
        </div>
      )}
    </div>
  );
};
