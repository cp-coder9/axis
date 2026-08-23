'use client';

import { useState } from 'react';
import { Button, Card, IconButton, PageHeader, StatusBadge, Surface } from '../ui';

export function ActionSpecimens() {
  const [count, setCount] = useState(0);
  return <section className="ax-catalog__section" aria-labelledby="ax-actions-title"><h2 id="ax-actions-title">Actions and surfaces</h2><PageHeader title="Project context" metadata="Green Point mixed-use · Revision 08" datum actions={<Button size="sm">Save record</Button>} /><p data-testid="action-count" className="ax-catalog__mono">{count}</p><div className="ax-catalog__actions"><Button>Primary action</Button><Button variant="secondary">Secondary action</Button><Button variant="quiet">Quiet action</Button><Button variant="danger">Danger action</Button><Button variant="ink">Ink action</Button><IconButton label="Open project context" icon="↗" onClick={() => setCount((current) => current + 1)} /><Button busy>Saving project record</Button></div><div className="ax-catalog__surfaces"><Surface level="flat">Flat surface</Surface><Surface level="raised">Raised surface</Surface><Card level="inset">Inset card</Card><Surface level="overlay">Overlay surface</Surface></div><div className="ax-catalog__statuses"><StatusBadge tone="info" label="Information available" /><StatusBadge tone="success" label="Saved" /><StatusBadge tone="warning" label="Engineering review required" /><StatusBadge tone="danger" label="Approval returned" /><StatusBadge tone="neutral" label="Draft" /><StatusBadge tone="exploration" label="God Mode exploration" /></div></section>;
}
