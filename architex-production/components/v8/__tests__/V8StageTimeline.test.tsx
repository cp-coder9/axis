// @vitest-environment jsdom

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DatumCanvas } from '@/components/views/DatumCanvas';
import { STAGES } from '@/lib/data';
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

describe('V8 Project Datum stage timeline', () => {
  it('renders eight ordered stages and delegates stage selection', async () => {
    const user = userEvent.setup();
    const onSelectStage = vi.fn();
    const { container } = render(
      <DatumCanvas
        project={project}
        currentRole="architect"
        onSelectStage={onSelectStage}
        onOpenTool={vi.fn()}
        onOpenWingman={vi.fn()}
        onOpenFeedback={vi.fn()}
      />,
    );

    const hero = container.querySelector<HTMLElement>('[data-v8-datum-region="project-hero"]');
    expect(hero).not.toBeNull();

    const stageGroup = within(hero!).getByRole('group', { name: 'Project lifecycle stages' });
    const buttons = within(stageGroup).getAllByRole('button');
    expect(buttons.map((button) => button.textContent?.trim())).toEqual(
      STAGES.map((stage, index) => `${index + 1}${stage}`),
    );

    const activeStage = within(stageGroup).getByRole('button', { name: 'Design' });
    expect(activeStage.getAttribute('aria-current')).toBe('step');

    await user.click(within(stageGroup).getByRole('button', { name: 'Comply' }));
    expect(onSelectStage).toHaveBeenCalledWith('Comply');
  });
});
