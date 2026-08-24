'use client';

import React, { useState } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey } from '@/lib/types';
import { OrigamiIcon } from '@/lib/origami-icons';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = [
  { key:'market', label:'Market Insights', group:'Insights', icon:'market_insights' },
  { key:'benchmarks', label:'Benchmarks', group:'Insights', icon:'detail' },
  { key:'cost', label:'Cost Indices', group:'Insights', icon:'budget' },
  { key:'forecast', label:'Forecasts', group:'Insights', icon:'trends' },
];

export function MarketInsightsModule({ activeProject, currentRole, activeTabKey = 'market', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);

  return <section className="space-y-4" aria-label="Market Insights">
    <PageHeader title="Market Insights" origami={<OrigamiIcon name="market_insights" size={26} />} metadata={<><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#135f5a]">Sector intelligence</p><p>{activeProject.code} · building cost, tender and material trends</p></>} actions={<nav className="flex max-w-full gap-2 overflow-x-auto" aria-label="Market Insights sections">{TABS.map(t => <Button key={t.key} type="button" variant={tab === t.key ? 'ink' : 'quiet'} size="sm" aria-pressed={tab === t.key} onClick={() => setTab(t.key || '')} className="shrink-0">{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</Button>)}</nav>} />

    {tab === 'market' && <div className="grid gap-4 lg:grid-cols-3">{[['Residential construction cost index','Gauteng · Q2 2026','+6.2% YoY','up'],['Tender price index','Building sector','+4.8% YoY','up'],['Cement demand','National','-1.1% YoY','down'],['Steel (rebar) price','Y12 high-tensile','R 24,800/t · +3.4%','up'],['Labour cost index','Skilled trades','+5.5% YoY','up'],['Municipal approval times','Tshwane average','68 days · +6 days','up']].map(([title,meta,val,dir]) => <div key={title} className="rounded-2xl border bg-white p-5 shadow-sm"><h3 className="text-sm font-bold">{title}</h3><p className="mt-1 text-xs text-[#657287]">{meta}</p><p className={`mt-2 text-lg font-bold ${dir === 'up' ? 'text-[#a13a2e]' : 'text-green-700'}`}>{val}</p></div>)}</div>}

    {tab === 'benchmarks' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">Project Benchmarks</h2><div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase text-[#657287]"><tr>{['Metric','This project','Market median','Variance'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{[['Cost / m² (GFA)','R 11,400','R 10,800','+5.6%'],['Build duration / level','14 weeks','16 weeks','-12.5%'],['Waste factor','4.2%','7.0%','-2.8pts'],['Consultant fees','8.9%','9.5%','-0.6pts']].map(([m,proj,med,variance]) => <tr key={m} className="hover:bg-[#f8fbfb]"><td className="px-4 py-3 font-semibold">{m}</td><td className="px-4 py-3 font-bold">{proj}</td><td className="px-4 py-3">{med}</td><td className="px-4 py-3">{variance}</td></tr>)}</tbody></table></div></div>}

    {tab === 'cost' && <div className="grid gap-4 lg:grid-cols-3">{[['Cement (50kg)','R 142','+2.0%'],['Ready-mix 30 MPa','R 1,420/m³','+3.1%'],['Rebar Y12','R 24,800/t','+3.4%'],['Clay brick','R 8.40/unit','+1.2%'],['Timber (roof)','R 4,150/m³','-0.8%'],['Aluminium windows','R 3,850/m²','+4.5%']].map(([mat,price,trend]) => <div key={mat} className="rounded-2xl border bg-white p-5 shadow-sm"><h3 className="text-sm font-bold">{mat}</h3><p className="mt-1 text-lg font-bold">{price}</p><p className="text-[10px] text-[#d95747]">{trend} QoQ</p></div>)}</div>}

    {tab === 'forecast' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3"><h2 className="text-base font-bold">12-Month Forecast</h2><div className="flex h-40 items-end gap-1.5">{['4.8','5.1','4.9','5.4','5.2','5.8','5.6','6.0','5.9','6.3','6.1','6.5'].map((v, i) => <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-[#19B7B0] to-[#58C8BC]" style={{height:`${parseFloat(v) / 7 * 100}%`}} title={`${v}%`} />)}</div><p className="text-xs text-[#657287]">Construction input cost inflation (CPI-based), forecast +6.5% over 12 months. Steel and energy are the key drivers.</p></div>}
  </section>;
}
