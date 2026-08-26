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
  onClose: () => void;
}

export function SpecForgeSmartAdd({ section, revision, onConfirm, onClose }: Props) {
  const [query, setQuery] = useState('');
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

  return (
    <Surface level="overlay" className="specforge-smart-add" aria-label="Add specification">
      <div className="specforge-smart-add__head">
        <div><span className="specforge-kicker">Smart add</span><h2>Describe the product or requirement</h2><p>Start with plain language. SpecForge stores only what you confirm.</p></div>
        <Button type="button" variant="quiet" size="sm" onClick={onClose}>Close</Button>
      </div>
      <label className="specforge-search-label" htmlFor="specforge-smart-query">Describe a product or specification</label>
      <div className="specforge-search-row">
        <input id="specforge-smart-query" value={query} onChange={event => { setQuery(event.target.value); setReviewing(false); }} placeholder="e.g. 600 × 1200 warm limestone porcelain wall tile" autoFocus />
        <Button type="button" variant="ink" disabled={!query.trim()} onClick={() => setReviewing(true)}>Review draft</Button>
      </div>
      <div className="specforge-source-actions" aria-label="Specification sources">
        {['Paste supplier URL', 'Upload product image', 'Search practice library', 'Read project drawings'].map(label => <button key={label} type="button" disabled title="This governed source connector is configured in the intelligence slice.">{label}</button>)}
      </div>
      {reviewing && query.trim() && <div className="specforge-candidate" role="region" aria-label="Specification draft review"><div><span>Manual draft</span><strong>{query.trim()}</strong><small>Source: your current input · no AI or library claim</small></div><Button type="button" busy={saving} onClick={() => void confirm()}>Confirm & save</Button></div>}
      {message && <p className="specforge-inline-error" role="alert">{message}</p>}
    </Surface>
  );
}
