'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Surface } from '@/components/ui/Surface';
import type { CreateSpecForgeItemInput } from '@/lib/specforge/api';
import type { SpecForgeSection } from '@/lib/specforge/types';

interface Props {
  section: SpecForgeSection | null;
  revision: string;
  onConfirm: (item: CreateSpecForgeItemInput) => Promise<unknown>;
  onRequestDrawingScan: (drawingRevisionId: string) => Promise<unknown>;
  onClose: () => void;
}

type SourceMethod = 'manual' | 'supplier_url' | 'image' | 'practice_library' | 'drawing';

const integrationMessages: Partial<Record<SourceMethod, string>> = {
  supplier_url: 'Supplier catalogue integration is required. No supplier result has been created.',
  image: 'Product image intelligence integration is required. No image result has been created.',
  practice_library: 'Practice library integration is required. No library result has been created.',
};

export function SpecForgeSmartAdd({ section, revision, onConfirm, onRequestDrawingScan, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [sourceMethod, setSourceMethod] = useState<SourceMethod>('manual');
  const [drawingRevision, setDrawingRevision] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const confirm = async () => {
    if (!section) { setMessage('Create a specification section before adding an item.'); return; }
    setSaving(true); setMessage(null);
    try {
      await onConfirm({
        sectionId: section.id,
        code: `SPEC-${Date.now().toString(36).toUpperCase()}`,
        title: query.trim(), room: 'Project-wide', packageName: section.title, description: query.trim(),
        imageUrl: null, supplier: null, model: null, finish: null, dimensions: null,
        budgetAllowance: 0, estimatedCost: 0, leadTimeDays: 0, clientDecision: false,
        ownerRole: section.ownerRole, reviewerRole: section.reviewerRole, approverRole: 'architect',
        status: 'draft', sourceRevision: revision, supersededBy: null,
      });
      onClose();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'The draft could not be saved.'); }
    finally { setSaving(false); }
  };

  const selectSource = (method: SourceMethod) => {
    setSourceMethod(method);
    setReviewing(false);
    setMessage(integrationMessages[method] ?? null);
  };

  const requestDrawingScan = async () => {
    if (!drawingRevision.trim()) { setMessage('Enter a drawing revision before requesting a scan.'); return; }
    setSaving(true); setMessage(null);
    try {
      await onRequestDrawingScan(drawingRevision.trim());
      setMessage(`Drawing scan queued for ${drawingRevision.trim()}. Source: project drawing revision.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'The drawing scan could not be requested.'); }
    finally { setSaving(false); }
  };

  return (
    <Surface level="overlay" className="specforge-smart-add" aria-label="Add specification">
      <div className="specforge-smart-add__head">
        <div><span className="specforge-kicker">Smart add</span><h2>Describe the product or requirement</h2><p>Start with plain language. SpecForge stores only what you confirm.</p></div>
        <Button type="button" variant="quiet" size="sm" onClick={onClose}>Close</Button>
      </div>
      <label className="specforge-search-label" htmlFor="specforge-smart-query">Describe a product or specification</label>
      <div className="specforge-search-row">
        <input id="specforge-smart-query" value={query} onChange={event => { setQuery(event.target.value); setReviewing(false); setSourceMethod('manual'); setMessage(null); }} placeholder="e.g. 600 × 1200 warm limestone porcelain wall tile" autoFocus />
        <Button type="button" variant="ink" disabled={!query.trim()} onClick={() => { setSourceMethod('manual'); setReviewing(true); setMessage(null); }}>Review draft</Button>
      </div>
      <div className="specforge-source-actions" aria-label="Specification sources">
        <button type="button" onClick={() => selectSource('supplier_url')}>Paste supplier URL</button>
        <button type="button" onClick={() => selectSource('image')}>Upload product image</button>
        <button type="button" onClick={() => selectSource('practice_library')}>Search practice library</button>
        <button type="button" onClick={() => selectSource('drawing')}>Read project drawings</button>
      </div>
      {sourceMethod === 'drawing' && <div className="specforge-drawing-source"><label htmlFor="specforge-drawing-revision">Drawing revision</label><div className="specforge-search-row"><input id="specforge-drawing-revision" value={drawingRevision} onChange={event => setDrawingRevision(event.target.value)} placeholder="e.g. drawing-revision-p07" /><Button type="button" busy={saving} disabled={!drawingRevision.trim()} onClick={() => void requestDrawingScan()}>Request drawing scan</Button></div><small>Source: persisted project drawing revision · candidates require human review.</small></div>}
      {reviewing && query.trim() && <div className="specforge-candidate" role="region" aria-label="Specification draft review"><div><span>Manual draft</span><strong>{query.trim()}</strong><small>Source: your current input · no AI or library claim</small></div><Button type="button" busy={saving} onClick={() => void confirm()}>Confirm & save</Button></div>}
      {message && <p className="specforge-inline-error" role={sourceMethod === 'manual' ? 'alert' : 'status'}>{message}</p>}
    </Surface>
  );
}
