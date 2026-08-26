// @vitest-environment jsdom

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { DatumCanvas } from '@/components/views/DatumCanvas';
import type { ProjectEntity } from '@/lib/types';

const project: ProjectEntity = {
  id: 'project-1',
  name: 'Harbour House',
  location: 'Cape Town',
  stage: 'Design',
  progress: 42,
  client: 'Datum Developments',
  professional: 'Architex Studio',
  municipality: 'City of Cape Town',
  revision: 'P03',
  budget: 12_000_000,
  code: 'HH-001',
};

afterEach(cleanup);

describe('V8 spatial Datum world', () => {
  it('uses one ordered tool collection for the world and mobile sequence', () => {
    const onOpenTool = vi.fn();
    render(
      <DatumCanvas
        project={project}
        currentRole="architect"
        onSelectStage={vi.fn()}
        onOpenTool={onOpenTool}
        onOpenWingman={vi.fn()}
        onOpenFeedback={vi.fn()}
      />,
    );

    const cards = screen.queryAllByTestId('v8-datum-card');
    const sequenceItems = screen.queryAllByTestId('v8-datum-sequence-item');
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.map((node) => node.getAttribute('data-tool-id'))).toEqual(
      sequenceItems.map((node) => node.getAttribute('data-tool-id')),
    );

    fireEvent.click(cards[0]);
    expect(onOpenTool).toHaveBeenCalledWith(cards[0].getAttribute('data-tool-id'));
  });

  it('exposes bounded zoom and fit controls', () => {
    const { container } = render(
      <DatumCanvas
        project={project}
        currentRole="architect"
        onSelectStage={vi.fn()}
        onOpenTool={vi.fn()}
        onOpenWingman={vi.fn()}
        onOpenFeedback={vi.fn()}
      />,
    );

    const world = container.querySelector<HTMLElement>('.v8-datum-world');
    expect(world).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(world!.style.transform).toBe('scale(1.1)');
    fireEvent.click(screen.getByRole('button', { name: 'Fit datum to view' }));
    expect(world!.style.transform).toBe('scale(1)');
  });
});
