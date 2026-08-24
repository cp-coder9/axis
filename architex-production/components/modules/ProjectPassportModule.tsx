'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useControlledToolTab } from '@/lib/use-controlled-tool-tab';
import { ProjectEntity, RoleKey, ToolDefinition } from '@/lib/types';
import { ALL_TOOLS } from '@/lib/data';
import { OrigamiIcon } from '@/lib/origami-icons';
import { architexApi, demoIdentity, ApiPassport } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

interface Props { activeProject: ProjectEntity; currentRole: RoleKey; activeTabKey?: string; isProjectMode?: boolean; onTabChange?: (key: string) => void }

const TABS = (ALL_TOOLS['project_passport'] as ToolDefinition).tabs;
const canEdit = ['architect','bep','town_planner','cpm','admin','platform_admin'];
const canPub = ['architect','cpm','admin','platform_admin'];

type PassportState = { version: number; status: 'published'|'draft'; projectType: string; briefSummary: string; siteDescription: string; statutoryRoute: string; constraints: string[]; professionals: string[]; approvals: string[] };

const SEED: PassportState = { version:3, status:'published', projectType:'Multi-unit residential', briefSummary:'A phased residential development requiring coordinated architectural, structural, fire, energy and municipal approval work.', siteDescription:'Faerie Glen, Pretoria — urban infill site.', statutoryRoute:'SPLUMA confirmation and building-plan submission to City of Tshwane', constraints:['Municipal servitude confirmation','Fire escape-width coordination','SANS 10400-XA fenestration review'], professionals:['Architect','Structural Engineer','Fire Engineer','Energy Professional','Quantity Surveyor'], approvals:['Client brief approval','Professional coordination sign-off','Municipal building-plan approval'] };

function fromApi(p: ApiPassport): PassportState {
  return {
    version: p.version,
    status: p.status,
    projectType: p.project_type,
    briefSummary: p.brief_summary,
    siteDescription: p.site_description,
    statutoryRoute: p.statutory_route,
    constraints: p.constraints,
    professionals: p.required_professionals,
    approvals: p.approval_requirements,
  };
}

export function ProjectPassportModule({ activeProject, currentRole, activeTabKey = 'overview', onTabChange }: Props) {
  const [tab, setTab] = useControlledToolTab(activeTabKey, TABS, TABS[0]?.key || '0', onTabChange);
  const [passport, setPassport] = useState<PassportState>(SEED);
  const [source, setSource] = useState<'api'|'seed'>('seed');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const identity = demoIdentity(currentRole);

  // Load the canonical passport from the API (PRD §2.1: no silent divergent copies)
  useEffect(() => {
    let cancelled = false;
    architexApi.passport.get(activeProject.id, identity)
      .then((p) => { if (!cancelled) { setPassport(fromApi(p)); setSource('api'); } })
      .catch(() => { if (!cancelled) setSource('seed'); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProject.id]);

  const handleEdit = useCallback(async () => {
    if (source !== 'api') { setPassport(p => ({...p, status:'draft'})); return; }
    setBusy(true); setError(null);
    try {
      const updated = await architexApi.passport.draft(activeProject.id, { brief_summary: passport.briefSummary }, identity);
      setPassport(fromApi(updated));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to open draft');
    } finally { setBusy(false); }
  }, [source, activeProject.id, passport.briefSummary, identity]);

  const handlePublish = useCallback(async () => {
    if (source !== 'api') { setPassport(p => ({...p, status:'published', version:p.version+1})); return; }
    setBusy(true); setError(null);
    try {
      const updated = await architexApi.passport.publish(activeProject.id, identity);
      setPassport(fromApi(updated));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to publish');
    } finally { setBusy(false); }
  }, [source, activeProject.id, identity]);

  const inDraft = passport.status === 'draft';

  return <section className="space-y-4" aria-label="Project Passport">
    <>
      <PageHeader
        title="Project Passport"
        origami={<OrigamiIcon name="project_passport" size={26} />}
        metadata={<><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[var(--ax-text-muted)]">{activeProject.name} · v{passport.version}{source === 'api' ? ' · live' : ' · offline seed'}</p><p>Canonical project record for shared professional, statutory, and delivery context.</p></>}
        actions={<div className="flex max-w-full items-center gap-2"><>{inDraft ? <Button data-testid="passport-publish" type="button" variant="ink" size="sm" disabled={busy || !canPub.includes(currentRole)} onClick={handlePublish}>{busy ? 'Publishing…' : `Publish v${passport.version + 1}`}</Button> : <Button data-testid="passport-edit" type="button" variant="secondary" size="sm" disabled={busy || !canEdit.includes(currentRole)} onClick={handleEdit}>{busy ? 'Opening…' : 'Edit passport'}</Button>}</><nav className="flex max-w-full overflow-x-auto" aria-label="Project Passport sections">{TABS.map(t => <Button key={t.key} type="button" variant={tab === t.key ? 'ink' : 'quiet'} size="sm" aria-pressed={tab === t.key} onClick={() => setTab(t.key || 'overview')} className="shrink-0">{t.icon && <OrigamiIcon name={t.icon} size={14} />}{t.label}</Button>)}</nav></div>}
      />
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900"><strong>API error.</strong> {error}</div>}
      {inDraft ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950"><strong>Draft mode.</strong> Changes are not visible to project tools until published. {canPub.includes(currentRole) ? 'You can publish' : 'An authorised professional must publish'}.</div> : <div className="rounded-xl border border-[#19B7B0]/20 bg-[#DFF5F2] p-3 text-xs"><strong>Published v{passport.version}.</strong> This is the canonical project record shared by all connected modules.</div>}
    </>

    {tab === 'overview' && <div className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
      <article className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm">
        <div><p className="text-[10px] font-bold uppercase text-[#657287]">Technical brief</p><h2 className="mt-1 text-base font-bold">{passport.projectType}</h2><p className="mt-2 text-sm leading-6 text-[#526074]">{passport.briefSummary}</p></div>
        <div className="grid gap-3 md:grid-cols-2">{[['Project code',activeProject.code],['Stage',activeProject.stage],['Municipality',activeProject.municipality],['Lead',activeProject.professional],['Site',activeProject.location],['Revision',activeProject.revision]].map(([l,v]) => <div key={l} className="rounded-xl bg-[#f5faf9] p-3"><div className="text-[10px] uppercase text-[#657287]">{l}</div><div className="mt-1 text-xs font-bold">{v}</div></div>)}</div>
        <div><p className="text-[10px] font-bold uppercase text-[#657287]">Statutory route</p><p className="mt-1 text-sm font-semibold">{passport.statutoryRoute}</p></div>
      </article>
      <aside className="space-y-4">{[['Constraints',passport.constraints,'coral'],['Required professionals',passport.professionals,'cobalt'],['Approval requirements',passport.approvals,'amber']].map(([title,items,tone]) => <div key={title as string} className="rounded-2xl border bg-white p-4 shadow-sm"><h3 className="text-sm font-bold">{title as string}</h3><ul className="mt-3 space-y-2">{(items as string[]).map(item => <li key={item} className="flex gap-2 text-xs"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${tone === 'coral' ? 'bg-[#FF6B6B]' : tone === 'cobalt' ? 'bg-[#2563EB]' : 'bg-[#FFB020]'}`} />{item}</li>)}</ul></div>)}</aside>
    </div>}

    {tab === 'identity' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4"><h2 className="text-base font-bold">Project Identity</h2><div className="grid gap-4 md:grid-cols-2">{[['Name',activeProject.name],['Code',activeProject.code],['Location',activeProject.location],['Client',activeProject.client],['Lead professional',activeProject.professional],['Municipality',activeProject.municipality],['Revision',activeProject.revision],['Budget',`R ${(activeProject.budget/1e6).toFixed(1)}M`]].map(([l,v]) => <div key={l} className="rounded-xl bg-[#f5faf9] p-3"><div className="text-[10px] uppercase text-[#657287]">{l}</div><div className="mt-1 text-sm font-bold">{v}</div></div>)}</div></div>}

    {tab === 'site' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4"><h2 className="text-base font-bold">Site & ERF Details</h2><div className="grid gap-4 md:grid-cols-3">{[['ERF Number','1820'],['Township','Faerie Glen Ext 4'],['SG Diagram','SG-2024-0456'],['Zoning','Residential 3'],['Site Area','2,850 m²'],['Coverage','52%'],['FAR','0.8'],['Dwelling Units','24'],['Parking','32 bays']].map(([l,v]) => <div key={l} className="rounded-xl bg-[#f5faf9] p-3"><div className="text-[10px] uppercase text-[#657287]">{l}</div><div className="mt-1 text-sm font-bold">{v}</div></div>)}</div></div>}

    {tab === 'stakeholders' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4"><h2 className="text-base font-bold">Stakeholders</h2><div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-xs"><thead className="bg-[#f5faf9] text-[10px] uppercase"><tr>{['Name','Role','Contact','Status'].map(h => <th key={h} className="px-4 py-3 text-[#657287]">{h}</th>)}</tr></thead><tbody className="divide-y">{[['Justin Kruger','Architect','justin@architex.demo','Active'],['N. Mokoena','Fire Engineer','nmokoena@demo','Active'],['L. Smith','Client','lsmith@demo','Active'],['D. Pieterse','QS','dpieterse@demo','Invited']].map(([n,r,c,s]) => <tr key={n} className="hover:bg-[#f8fbfb]"><td className="px-4 py-3 font-semibold">{n}</td><td className="px-4 py-3">{r}</td><td className="px-4 py-3 text-[#657287]">{c}</td><td className="px-4 py-3"><span className="rounded-full bg-[#DFF5F2] px-2 py-1 text-[10px] font-bold text-[#167E79]">{s}</span></td></tr>)}</tbody></table></div></div>}

    {tab === 'health' && <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-4"><h2 className="text-base font-bold">Project Health</h2><div className="grid gap-3 md:grid-cols-4">{[['Overall','78%','bg-green-500'],['Budget','92%','bg-[#19B7B0]'],['Schedule','65%','bg-amber-500'],['Quality','88%','bg-[#19B7B0]']].map(([l,v,c]) => <div key={l} className="rounded-xl bg-[#f5faf9] p-4"><div className="text-[10px] uppercase text-[#657287]">{l}</div><div className="mt-1 text-2xl font-bold">{v}</div><div className="mt-2 h-2 w-full rounded-full bg-gray-200"><div className={`h-2 rounded-full ${c}`} style={{width:v}} /></div></div>)}</div><div className="rounded-xl border border-[#19B7B0]/20 bg-[#DFF5F2] p-4 text-xs"><strong>AI-extracted insight:</strong> Schedule variance risk flagged — fire escape markup on A-204 is blocking municipal submission. Critical path impact: 6 working days.</div></div>}
  </section>;
}
