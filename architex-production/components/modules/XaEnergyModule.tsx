'use client';

import React, { useState } from 'react';
import { ALL_TOOLS } from '@/lib/data';
import { OrigamiIcon } from '@/lib/origami-icons';
import { ProjectEntity, RoleKey, ToolDefinition } from '@/lib/types';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

interface XaEnergyModuleProps {
  activeProject: ProjectEntity;
  currentRole: RoleKey;
  activeTabKey?: string;
  isProjectMode?: boolean;
  onNavigateTool?: (toolId: string) => void;
  onOpenWingman?: () => void;
  onTabChange?: (key: string) => void;
}

const TABS = (ALL_TOOLS['xa'] as ToolDefinition).tabs;
const FALLBACK_TAB = TABS[0]?.key || 'overview';

type StatusTone = 'pass' | 'fail' | 'review';

function StatusBadge({ tone, children }: { tone: StatusTone; children: React.ReactNode }) {
  const tones = {
    pass: 'bg-green-100 text-green-700',
    fail: 'bg-red-100 text-red-700',
    review: 'bg-amber-100 text-amber-700',
  };
  return <span className={`px-2.5 py-1 rounded-full font-bold text-[10.5px] ${tones[tone]}`}>{children}</span>;
}

function MetricCard({ label, value, note, tone = 'neutral' }: { label: string; value: string; note: string; tone?: 'neutral' | StatusTone }) {
  const valueTone = tone === 'pass' ? 'text-green-700' : tone === 'fail' ? 'text-red-700' : tone === 'review' ? 'text-amber-700' : 'text-[#102033]';
  return (
    <div className="bg-white border border-[#102033]/10 rounded-2xl p-4 shadow-sm">
      <div className="text-[10px] text-[#657287] font-bold uppercase tracking-wider">{label}</div>
      <div className={`text-2xl font-extrabold mt-1.5 ${valueTone}`}>{value}</div>
      <div className="text-[11px] text-[#657287] mt-1">{note}</div>
    </div>
  );
}

function NumberField({ label, value, onChange, step = 1, min = 0, suffix }: { label: string; value: number; onChange: (value: number) => void; step?: number; min?: number; suffix?: string }) {
  return (
    <label className="block">
      <span className="block text-[11px] text-[#657287] font-semibold mb-1">{label}</span>
      <div className="relative">
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value) || 0)}
          className="w-full p-2.5 pr-16 bg-white border border-[#102033]/15 rounded-xl font-bold text-[#102033] focus:outline-none focus:ring-2 focus:ring-[#19B7B0]/30"
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#96a0ad]">{suffix}</span>}
      </div>
    </label>
  );
}

function Panel({ title, description, status, children }: { title: string; description: string; status?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-[#102033]/10 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-[#102033]">{title}</h2>
          <p className="text-[12px] text-[#657287] mt-1">{description}</p>
        </div>
        {status}
      </div>
      {children}
    </section>
  );
}

export const XaEnergyModule: React.FC<XaEnergyModuleProps> = ({
  activeProject,
  activeTabKey,
  onTabChange,
}) => {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, FALLBACK_TAB, onTabChange);
  const [climateZone, setClimateZone] = useState('Zone 2: Temperate interior (Pretoria / Johannesburg)');
  const [buildingClass, setBuildingClass] = useState('H4: Dwelling house');
  const [complianceRoute, setComplianceRoute] = useState('Prescriptive route');
  const [floorArea, setFloorArea] = useState(320);
  const [glazingArea, setGlazingArea] = useState(48.5);
  const [shgcValue, setShgcValue] = useState(0.48);
  const [uValue, setUValue] = useState(4.2);
  const [overhangDepth, setOverhangDepth] = useState(0.75);
  const [windowHeight, setWindowHeight] = useState(1.5);
  const [wallRValue, setWallRValue] = useState(0.45);
  const [wallArea, setWallArea] = useState(410);
  const [roofRValue, setRoofRValue] = useState(3.85);
  const [roofArea, setRoofArea] = useState(350);
  const [floorRValue, setFloorRValue] = useState(1.1);
  const [exposedFloorArea, setExposedFloorArea] = useState(42);
  const [hotWaterType, setHotWaterType] = useState<'Solar Thermal' | 'Heat Pump' | 'Electric Resistance'>('Solar Thermal');
  const [hotWaterDemand, setHotWaterDemand] = useState(240);
  const [nonResistanceShare, setNonResistanceShare] = useState(65);
  const [lightingWatts, setLightingWatts] = useState(1280);
  const [lightingArea, setLightingArea] = useState(320);

  const fenestrationRatio = floorArea > 0 ? (glazingArea / floorArea) * 100 : 0;
  const projectionFactor = windowHeight > 0 ? overhangDepth / windowHeight : 0;
  const lightingPowerDensity = lightingArea > 0 ? lightingWatts / lightingArea : 0;
  const isShadingPass = projectionFactor >= 0.5;
  const isFenestrationPass = fenestrationRatio <= 20 && shgcValue <= 0.5 && uValue <= 5.7;
  const isWallPass = wallRValue >= 0.35;
  const isRoofPass = roofRValue >= 3.7;
  const isFloorPass = exposedFloorArea === 0 || floorRValue >= 1;
  const isHotWaterPass = hotWaterType !== 'Electric Resistance' && nonResistanceShare >= 50;
  const isLightingPass = lightingPowerDensity <= 5;
  const checks = [isShadingPass, isFenestrationPass, isWallPass, isRoofPass, isFloorPass, isHotWaterPass, isLightingPass];
  const passedChecks = checks.filter(Boolean).length;
  const isOverallPass = passedChecks === checks.length;

  const tabLabel = TABS.find((item) => item.key === tab)?.label || 'Overview';

  return (
    <div className="space-y-4">
      <PageHeader
        title="SANS 10400-XA Energy Compliance"
        origami={<OrigamiIcon name="xa" size={26} />}
        metadata={<p>{activeProject.name} · SANS 10400-XA:2021 prescriptive assessment</p>}
        actions={<nav className="flex max-w-full overflow-x-auto" aria-label="XA calculation sections">
          {TABS.map((item) => (
            <Button
              key={item.key}
              type="button"
              variant={tab === item.key ? 'ink' : 'quiet'}
              size="sm"
              aria-pressed={tab === item.key}
              onClick={() => setTab(item.key || FALLBACK_TAB)}
              aria-current={tab === item.key ? 'page' : undefined}
              className="shrink-0"
            >
              {item.label}
            </Button>
          ))}
        </nav>}
      />

      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#102033]/10 bg-[#f7f9fb] px-3 py-2 text-[11px]">
        <span className="font-bold text-[#526074]">Active calculation: {tabLabel}</span>
        <StatusBadge tone={isOverallPass ? 'pass' : 'fail'}>{isOverallPass ? 'XA assessment passes' : `${7 - passedChecks} action${7 - passedChecks === 1 ? '' : 's'} required`}</StatusBadge>
      </div>

      {tab === 'overview' && (
        <div data-tool-tab="overview" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard label="Compliance checks" value={`${passedChecks}/7`} note="Prescriptive workstreams passing" tone={isOverallPass ? 'pass' : 'review'} />
            <MetricCard label="Fenestration" value={`${fenestrationRatio.toFixed(1)}%`} note="Glazing to net floor area; target ≤ 20%" tone={isFenestrationPass ? 'pass' : 'fail'} />
            <MetricCard label="Envelope" value={`${roofRValue.toFixed(2)} R`} note="Roof total system resistance" tone={isRoofPass ? 'pass' : 'fail'} />
            <MetricCard label="Lighting" value={`${lightingPowerDensity.toFixed(1)} W/m²`} note="Installed lighting power density" tone={isLightingPass ? 'pass' : 'fail'} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Panel title="Assessment map" description="Live status across each SANS 10400-XA workstream.">
              <div className="space-y-2">
                {[
                  ['Shading geometry', isShadingPass, `${projectionFactor.toFixed(2)} projection factor`],
                  ['Fenestration', isFenestrationPass, `${fenestrationRatio.toFixed(1)}% glazed area`],
                  ['External walls', isWallPass, `R-${wallRValue.toFixed(2)} assembly`],
                  ['Roof assembly', isRoofPass, `R-${roofRValue.toFixed(2)} assembly`],
                  ['Exposed floors', isFloorPass, `${exposedFloorArea} m² assessed`],
                  ['Hot water', isHotWaterPass, `${nonResistanceShare}% non-resistance contribution`],
                  ['Lighting', isLightingPass, `${lightingPowerDensity.toFixed(1)} W/m² LPD`],
                ].map(([label, pass, detail]) => (
                  <div key={String(label)} className="flex items-center justify-between gap-3 border-b border-[#102033]/5 pb-2 last:border-0 last:pb-0">
                    <div><div className="text-xs font-bold text-[#102033]">{label}</div><div className="text-[10px] text-[#657287]">{detail}</div></div>
                    <StatusBadge tone={pass ? 'pass' : 'fail'}>{pass ? 'Pass' : 'Action'}</StatusBadge>
                  </div>
                ))}
              </div>
            </Panel>
            <div className="lg:col-span-2">
              <Panel title="Project energy brief" description="The governing project inputs and selected compliance route.">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-[#f7f9fb] p-3"><span className="block text-[var(--ax-text-muted)] font-bold uppercase text-[10px]">Building classification</span><strong className="text-[#102033]">{buildingClass}</strong></div>
                  <div className="rounded-xl bg-[#f7f9fb] p-3"><span className="block text-[var(--ax-text-muted)] font-bold uppercase text-[10px]">Compliance route</span><strong className="text-[#102033]">{complianceRoute}</strong></div>
                  <div className="rounded-xl bg-[#f7f9fb] p-3 sm:col-span-2"><span className="block text-[var(--ax-text-muted)] font-bold uppercase text-[10px]">Climate zone</span><strong className="text-[#102033]">{climateZone}</strong></div>
                </div>
                <p className="text-[11px] text-[#657287]">Complete each calculation panel before issuing the compliance report. Values shown here update immediately from their source panels.</p>
              </Panel>
            </div>
          </div>
        </div>
      )}

      {tab === 'basics' && (
        <div data-tool-tab="basics" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Panel title="Building basics and climate zone" description="Establish the regulatory context before testing envelope and services provisions.">
              <div className="space-y-3">
                <label className="block"><span className="block text-[11px] text-[#657287] font-semibold mb-1">SANS 10400-XA climate zone</span><select value={climateZone} onChange={(event) => setClimateZone(event.target.value)} className="w-full p-2.5 bg-white border border-[#102033]/15 rounded-xl font-bold text-xs text-[#102033]"><option>Zone 1: Cold interior (Bloemfontein / high altitude)</option><option>Zone 2: Temperate interior (Pretoria / Johannesburg)</option><option>Zone 3: Hot interior (Polokwane / Kimberley)</option><option>Zone 4: Temperate coastal (Cape Town / George)</option><option>Zone 5: Sub-tropical coastal (Durban / Richards Bay)</option><option>Zone 6: Arid interior (Upington)</option></select></label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block"><span className="block text-[11px] text-[#657287] font-semibold mb-1">Occupancy classification</span><select value={buildingClass} onChange={(event) => setBuildingClass(event.target.value)} className="w-full p-2.5 bg-white border border-[#102033]/15 rounded-xl font-bold text-xs text-[#102033]"><option>H4: Dwelling house</option><option>H3: Domestic residence</option><option>G1: Offices</option><option>F1: Large shop</option></select></label>
                  <label className="block"><span className="block text-[11px] text-[#657287] font-semibold mb-1">Compliance route</span><select value={complianceRoute} onChange={(event) => setComplianceRoute(event.target.value)} className="w-full p-2.5 bg-white border border-[#102033]/15 rounded-xl font-bold text-xs text-[#102033]"><option>Prescriptive route</option><option>Reference building route</option><option>Energy modelling route</option></select></label>
                </div>
                <NumberField label="Net conditioned floor area" value={floorArea} onChange={setFloorArea} suffix="m²" />
              </div>
            </Panel>
          </div>
          <Panel title="Basis of assessment" description="Record the assumptions carried into every calculation.">
            <div className="space-y-3 text-[11px] text-[#526074]">
              <div className="p-3 rounded-xl bg-[#19B7B0]/5 border border-[#19B7B0]/20"><strong className="block text-[#167E79] mb-1">Edition</strong>SANS 10400-XA:2021 with SANS 204 envelope inputs.</div>
              <div className="p-3 rounded-xl bg-[#f7f9fb]"><strong className="block text-[#102033] mb-1">Measurement basis</strong>Areas are net conditioned building areas; thermal values represent complete assemblies.</div>
              <div className="p-3 rounded-xl bg-[#f7f9fb]"><strong className="block text-[#102033] mb-1">Professional review</strong>Final classification and route must be confirmed by the appointed competent person.</div>
            </div>
          </Panel>
        </div>
      )}

      {tab === 'shading' && (
        <div data-tool-tab="shading" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2"><Panel title="Shading geometry · Table 3" description="Evaluate the fixed horizontal projection protecting the principal glazed elevation." status={<StatusBadge tone={isShadingPass ? 'pass' : 'fail'}>{isShadingPass ? 'Effective shading' : 'Increase projection'}</StatusBadge>}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><NumberField label="Horizontal overhang depth" value={overhangDepth} onChange={setOverhangDepth} step={0.05} suffix="m" /><NumberField label="Protected window height" value={windowHeight} onChange={setWindowHeight} step={0.05} suffix="m" /></div>
            <div className="rounded-xl bg-[#f7f9fb] p-4"><div className="flex items-end justify-between"><div><span className="text-[10px] uppercase font-bold tracking-wider text-[#657287]">Projection factor P/H</span><div className="text-3xl font-extrabold text-[#102033]">{projectionFactor.toFixed(2)}</div></div><span className="text-[11px] text-[#657287]">Project criterion ≥ 0.50</span></div><div className="mt-3 h-2 rounded-full bg-[#102033]/10 overflow-hidden"><div className={`h-full ${isShadingPass ? 'bg-[#19B7B0]' : 'bg-red-500'}`} style={{ width: `${Math.min(projectionFactor / 0.75, 1) * 100}%` }} /></div></div>
          </Panel></div>
          <Panel title="Orientation response" description="Design implications for the selected fixed projection."><div className="space-y-2 text-[11px] text-[#526074]"><div className="p-3 bg-[#f7f9fb] rounded-xl"><strong className="block text-[#102033]">North</strong>Horizontal overhangs control high summer sun while admitting lower winter sun.</div><div className="p-3 bg-[#f7f9fb] rounded-xl"><strong className="block text-[#102033]">East and west</strong>Low-angle solar exposure generally needs fins, screens, or lower-SHGC glazing.</div><div className="p-3 bg-[#f7f9fb] rounded-xl"><strong className="block text-[#102033]">Evidence</strong>Dimension the projection and window height on elevations and schedules.</div></div></Panel>
        </div>
      )}

      {tab === 'fenestration' && (
        <div data-tool-tab="fenestration" className="space-y-4">
          <Panel title="Fenestration · Clause 5.3" description="Test aggregate glazed area and the thermal/solar performance of the scheduled glazing system." status={<StatusBadge tone={isFenestrationPass ? 'pass' : 'fail'}>{isFenestrationPass ? 'Prescriptive check passes' : 'Revise fenestration'}</StatusBadge>}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><NumberField label="Total glazing area" value={glazingArea} onChange={setGlazingArea} step={0.5} suffix="m²" /><NumberField label="Net floor area" value={floorArea} onChange={setFloorArea} suffix="m²" /><NumberField label="System SHGC" value={shgcValue} onChange={setShgcValue} step={0.01} /><NumberField label="System U-value" value={uValue} onChange={setUValue} step={0.1} suffix="W/m²K" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><MetricCard label="Glazing ratio" value={`${fenestrationRatio.toFixed(1)}%`} note="Maximum project criterion 20%" tone={fenestrationRatio <= 20 ? 'pass' : 'fail'} /><MetricCard label="Solar heat gain" value={shgcValue.toFixed(2)} note="Maximum project criterion 0.50" tone={shgcValue <= 0.5 ? 'pass' : 'fail'} /><MetricCard label="Thermal transmittance" value={uValue.toFixed(1)} note="Maximum project criterion 5.7 W/m²K" tone={uValue <= 5.7 ? 'pass' : 'fail'} /></div>
          </Panel>
          <div className="p-4 rounded-2xl border border-[#19B7B0]/20 bg-[#19B7B0]/5 text-[11px] text-[#526074]"><strong className="text-[#167E79]">Specification record:</strong> use whole-window U-value and SHGC, including frame and glass. Values must correspond with the fenestration schedule and supplier certification.</div>
        </div>
      )}

      {tab === 'walls' && (
        <div data-tool-tab="walls" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2"><Panel title="External walls · Clause 5.5" description="Assess the complete external wall build-up, including insulation and internal/external finishes." status={<StatusBadge tone={isWallPass ? 'pass' : 'fail'}>{isWallPass ? 'Assembly passes' : 'Insulation required'}</StatusBadge>}><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><NumberField label="Gross external wall area" value={wallArea} onChange={setWallArea} suffix="m²" /><NumberField label="Total assembly R-value" value={wallRValue} onChange={setWallRValue} step={0.05} suffix="m²K/W" /></div><div className="p-3 rounded-xl bg-[#f7f9fb] text-[11px] text-[#526074]">Current specification: cavity masonry wall with reflective foil and plaster finishes. Enter the calculated total R-value for the complete assembly, not the insulation product alone.</div></Panel></div>
          <Panel title="Wall schedule" description="Thermal continuity items for construction documentation."><div className="space-y-2 text-[11px] text-[#526074]"><div className="flex justify-between border-b pb-2"><span>Opaque wall target</span><strong>R ≥ 0.35</strong></div><div className="flex justify-between border-b pb-2"><span>Calculated wall area</span><strong>{wallArea} m²</strong></div><div className="flex justify-between border-b pb-2"><span>Junction treatment</span><strong>Continuous</strong></div><div className="flex justify-between"><span>Evidence status</span><strong className="text-amber-700">Detail review</strong></div></div></Panel>
        </div>
      )}

      {tab === 'roof' && (
        <div data-tool-tab="roof" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2"><Panel title="Roof and ceiling assembly · Clause 5.6" description="Calculate total thermal resistance through the roof/ceiling system over conditioned space." status={<StatusBadge tone={isRoofPass ? 'pass' : 'fail'}>{isRoofPass ? 'R-value passes' : 'Below R-3.70'}</StatusBadge>}><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><NumberField label="Insulated roof area" value={roofArea} onChange={setRoofArea} suffix="m²" /><NumberField label="Total system R-value" value={roofRValue} onChange={setRoofRValue} step={0.05} suffix="m²K/W" /></div><div className="rounded-xl border border-[#102033]/10 overflow-hidden text-[11px]"><div className="grid grid-cols-2 bg-[#f7f9fb] px-3 py-2 font-bold text-[#657287]"><span>Assembly layer</span><span>Design intent</span></div><div className="grid grid-cols-2 px-3 py-2 border-t"><span>Roof covering + air space</span><span>Ventilated cavity</span></div><div className="grid grid-cols-2 px-3 py-2 border-t"><span>Bulk insulation</span><span>135 mm mineral fibre</span></div><div className="grid grid-cols-2 px-3 py-2 border-t"><span>Ceiling and surfaces</span><span>Included in total R</span></div></div></Panel></div>
          <MetricCard label="Roof heat-loss index" value={`${(roofArea / Math.max(roofRValue, 0.01)).toFixed(0)} W/K`} note="Area divided by total R-value; comparative design indicator" tone={isRoofPass ? 'pass' : 'fail'} />
        </div>
      )}

      {tab === 'floors' && (
        <div data-tool-tab="floors" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2"><Panel title="Floor insulation · Clause 5.4" description="Assess floors exposed to external air or unconditioned space separately from slab-on-ground construction." status={<StatusBadge tone={isFloorPass ? 'pass' : 'fail'}>{isFloorPass ? 'Exposed floor passes' : 'Increase floor R-value'}</StatusBadge>}><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><NumberField label="Exposed floor area" value={exposedFloorArea} onChange={setExposedFloorArea} suffix="m²" /><NumberField label="Floor assembly R-value" value={floorRValue} onChange={setFloorRValue} step={0.05} suffix="m²K/W" /></div><div className="p-3 rounded-xl bg-[#f7f9fb] text-[11px] text-[#526074]">The remaining {(Math.max(floorArea - exposedFloorArea, 0)).toFixed(0)} m² is treated as slab-on-ground. Coordinate slab-edge insulation with waterproofing, thresholds, and termite barriers where the climate-zone solution requires it.</div></Panel></div>
          <Panel title="Floor boundary" description="Current heat-flow boundary summary."><div className="space-y-3"><MetricCard label="Exposed share" value={`${(floorArea > 0 ? exposedFloorArea / floorArea * 100 : 0).toFixed(1)}%`} note="Of net conditioned floor area" /><div className="text-[11px] text-[#526074]">Project criterion for exposed floors: total assembly R-value ≥ 1.00 m²K/W.</div></div></Panel>
        </div>
      )}

      {tab === 'hotwater' && (
        <div data-tool-tab="hotwater" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2"><Panel title="Hot-water energy · Clause 6.1" description="Demonstrate that at least half of annual hot-water demand is supplied without electrical resistance heating." status={<StatusBadge tone={isHotWaterPass ? 'pass' : 'fail'}>{isHotWaterPass ? 'Contribution passes' : 'Alternative supply required'}</StatusBadge>}><label className="block"><span className="block text-[11px] text-[#657287] font-semibold mb-1">Primary water-heating system</span><select value={hotWaterType} onChange={(event) => setHotWaterType(event.target.value as typeof hotWaterType)} className="w-full p-2.5 bg-white border border-[#102033]/15 rounded-xl font-bold text-xs text-[#102033]"><option value="Solar Thermal">Solar thermal with electric backup</option><option value="Heat Pump">Heat pump, COP &gt; 3.0</option><option value="Electric Resistance">Electric resistance storage heater</option></select></label><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><NumberField label="Design hot-water demand" value={hotWaterDemand} onChange={setHotWaterDemand} suffix="L/day" /><NumberField label="Non-resistance energy contribution" value={nonResistanceShare} onChange={(value) => setNonResistanceShare(Math.min(value, 100))} suffix="%" /></div><div className="h-3 rounded-full bg-[#102033]/10 overflow-hidden"><div className={`h-full ${isHotWaterPass ? 'bg-[#19B7B0]' : 'bg-red-500'}`} style={{ width: `${Math.min(nonResistanceShare, 100)}%` }} /></div></Panel></div>
          <Panel title="System basis" description="Sizing and evidence carried to the report."><div className="space-y-2 text-[11px] text-[#526074]"><div className="flex justify-between border-b pb-2"><span>System</span><strong>{hotWaterType}</strong></div><div className="flex justify-between border-b pb-2"><span>Daily demand</span><strong>{hotWaterDemand} L</strong></div><div className="flex justify-between border-b pb-2"><span>Alternative share</span><strong>{nonResistanceShare}%</strong></div><p>Attach supplier performance data, storage losses, pipe insulation, controls, and the annual contribution calculation.</p></div></Panel>
        </div>
      )}

      {tab === 'lighting' && (
        <div data-tool-tab="lighting" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2"><Panel title="Lighting power density · Clause 6.2" description="Calculate installed interior lighting load over the assessed conditioned area." status={<StatusBadge tone={isLightingPass ? 'pass' : 'fail'}>{isLightingPass ? 'LPD passes' : 'Reduce connected load'}</StatusBadge>}><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><NumberField label="Installed lighting load" value={lightingWatts} onChange={setLightingWatts} suffix="W" /><NumberField label="Assessed lighting area" value={lightingArea} onChange={setLightingArea} suffix="m²" /></div><div className="rounded-xl bg-[#102033] text-white p-4"><span className="text-[10px] uppercase tracking-wider font-bold text-white/60">Calculated lighting power density</span><div className="flex items-end gap-2 mt-1"><strong className="text-4xl">{lightingPowerDensity.toFixed(2)}</strong><span className="pb-1 text-white/70">W/m²</span></div><div className="mt-3 h-2 bg-white/15 rounded-full overflow-hidden"><div className={`h-full ${isLightingPass ? 'bg-[#19B7B0]' : 'bg-red-400'}`} style={{ width: `${Math.min(lightingPowerDensity / 8, 1) * 100}%` }} /></div></div></Panel></div>
          <Panel title="Controls schedule" description="Control provisions supporting the connected-load calculation."><div className="space-y-2 text-[11px] text-[#526074]"><div className="p-3 rounded-xl bg-green-50 text-green-800"><strong className="block">Daylit perimeter</strong>Separate switching zones documented.</div><div className="p-3 rounded-xl bg-green-50 text-green-800"><strong className="block">Intermittent spaces</strong>Occupancy sensors to stores and ablutions.</div><div className="p-3 rounded-xl bg-[#f7f9fb]"><strong className="block text-[#102033]">Luminaire schedule</strong>Driver wattage included in installed load.</div></div></Panel>
        </div>
      )}

      {tab === 'results' && (
        <div data-tool-tab="results" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2"><Panel title="SANS 10400-XA compliance report" description="Consolidated prescriptive results for design review and competent-person sign-off." status={<StatusBadge tone={isOverallPass ? 'pass' : 'fail'}>{isOverallPass ? 'Ready for review' : 'Not ready to issue'}</StatusBadge>}><div className="rounded-xl border border-[#102033]/10 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-[11px]"><thead className="bg-[#f7f9fb] text-[#657287] uppercase tracking-wider"><tr><th className="p-3">Workstream</th><th className="p-3">Calculated value</th><th className="p-3">Criterion</th><th className="p-3">Result</th></tr></thead><tbody className="text-[#526074]">{[
            ['Shading', projectionFactor.toFixed(2), 'P/H ≥ 0.50', isShadingPass],
            ['Fenestration', `${fenestrationRatio.toFixed(1)}%; SHGC ${shgcValue.toFixed(2)}`, '≤ 20%; SHGC ≤ 0.50', isFenestrationPass],
            ['External walls', `R-${wallRValue.toFixed(2)}`, 'R ≥ 0.35', isWallPass],
            ['Roof assembly', `R-${roofRValue.toFixed(2)}`, 'R ≥ 3.70', isRoofPass],
            ['Exposed floors', `R-${floorRValue.toFixed(2)}`, 'R ≥ 1.00', isFloorPass],
            ['Hot water', `${nonResistanceShare}% alternative`, '≥ 50%', isHotWaterPass],
            ['Lighting', `${lightingPowerDensity.toFixed(2)} W/m²`, '≤ 5.00 W/m²', isLightingPass],
          ].map(([name, value, criterion, pass]) => <tr key={String(name)} className="border-t border-[#102033]/10"><td className="p-3 font-bold text-[#102033]">{name}</td><td className="p-3">{value}</td><td className="p-3">{criterion}</td><td className="p-3"><StatusBadge tone={pass ? 'pass' : 'fail'}>{pass ? 'Pass' : 'Fail'}</StatusBadge></td></tr>)}</tbody></table></div></Panel></div>
          <aside className="bg-white border border-[#102033]/10 rounded-2xl p-5 shadow-sm space-y-4 h-fit text-xs"><div><h3 className="font-bold uppercase tracking-wider text-[#96a0ad]">XA calculation passport</h3><div className="text-lg font-bold text-[#102033] mt-1">{activeProject.name}</div></div><div className="space-y-2 text-[#526074]"><div className="flex justify-between gap-3"><span>Classification</span><strong className="text-right">{buildingClass.split(':')[0]}</strong></div><div className="flex justify-between gap-3"><span>Climate zone</span><strong className="text-right">{climateZone.split(':')[0]}</strong></div><div className="flex justify-between gap-3"><span>Floor area</span><strong>{floorArea} m²</strong></div><div className="flex justify-between gap-3"><span>Checks passed</span><strong>{passedChecks} of 7</strong></div></div><div className={`rounded-xl p-3 text-[11px] ${isOverallPass ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>{isOverallPass ? 'All modelled prescriptive criteria pass. Competent-person review and supporting evidence remain required.' : 'Resolve failed workstreams before generating the issue-ready compliance record.'}</div><button type="button" disabled={!isOverallPass} className="w-full py-2.5 bg-[#19B7B0] hover:bg-[#167E79] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-sm transition-all">Export XA compliance report</button></aside>
        </div>
      )}
    </div>
  );
};
