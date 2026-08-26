// @vitest-environment jsdom

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

describe('V8 Project Datum identity', () => {
  it('matches the reference page-head hierarchy and action order', async () => {
    const user = userEvent.setup();
    const onOpenTool = vi.fn();
    const onOpenFeedback = vi.fn();

    const { container } = render(
      <DatumCanvas
        project={project}
        currentRole="architect"
        onSelectStage={vi.fn()}
        onOpenTool={onOpenTool}
        onOpenWingman={vi.fn()}
        onOpenFeedback={onOpenFeedback}
      />,
    );

    const pageHead = container.querySelector<HTMLElement>('[data-v8-datum-region="page-head"]');
    expect(pageHead).not.toBeNull();
    expect(within(pageHead!).getByRole('heading', { level: 1, name: project.name })).toBeTruthy();

    const actions = within(pageHead!).getAllByRole('button');
    expect(actions.map((button) => button.textContent?.trim())).toEqual([
      'Plan project',
      'Engineering',
      'Meetings',
      'Give feedback',
    ]);

    await user.click(within(pageHead!).getByRole('button', { name: 'Engineering' }));
    await user.click(within(pageHead!).getByRole('button', { name: 'Meetings' }));
    await user.click(within(pageHead!).getByRole('button', { name: 'Give feedback' }));

    expect(onOpenTool).toHaveBeenNthCalledWith(1, 'engineering_calc');
    expect(onOpenTool).toHaveBeenNthCalledWith(2, 'meetings');
    expect(onOpenFeedback).toHaveBeenCalledOnce();

    expect(screen.getByText('Architect experience')).toBeTruthy();
    expect(screen.getByText(/project navigation is filtered to the role while shared collaboration tools remain visible/i)).toBeTruthy();
  });

  it('keeps the selected role as the lens in God Mode', () => {
    render(
      <DatumCanvas
        project={project}
        currentRole="architect"
        presentationStage="Comply"
        onSelectStage={vi.fn()}
        onOpenTool={vi.fn()}
        onOpenWingman={vi.fn()}
        onOpenFeedback={vi.fn()}
      />,
    );

    expect(screen.getByText('God Mode with Architect lens')).toBeTruthy();
    expect(screen.getByText(/selected role remains a learning lens/i)).toBeTruthy();
  });
});
