// @vitest-environment jsdom

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { V8CommandCentre } from '@/components/v8/V8CommandCentre';

afterEach(cleanup);

describe('V8 OS Command Centre', () => {
  it('matches the supplied four-card landing hierarchy and exact copy', () => {
    const { container } = render(
      <V8CommandCentre activeProjectName="Faerie Glen Residential" toolCount={47} onNavigate={vi.fn()} />,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Architex OS Command Centre' })).toBeTruthy();
    expect(screen.getByText(/global landing point for work across projects, tools, actions and feedback/i)).toBeTruthy();

    const cards = container.querySelectorAll('[data-v8-command-card]');
    expect(cards).toHaveLength(4);
    expect(Array.from(cards, card => within(card as HTMLElement).getByRole('heading', { level: 3 }).textContent)).toEqual([
      'Open datum project space',
      'Practice / Project Command Centre',
      'Workspace tool registry',
      'Feedback intelligence',
    ]);
    expect(screen.getByText("Enter Faerie Glen Residential and work through the project’s single line of truth.")).toBeTruthy();
    expect(screen.getByText('Browse 47 live and scaffolded capabilities.')).toBeTruthy();
  });

  it('dispatches the canonical navigation event for every card', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<V8CommandCentre activeProjectName="Faerie Glen Residential" toolCount={47} onNavigate={onNavigate} />);

    for (const name of [
      'Open datum project space',
      'Practice / Project Command Centre',
      'Workspace tool registry',
      'Feedback intelligence',
    ]) {
      await user.click(screen.getByRole('button', { name: new RegExp(name, 'i') }));
    }

    expect(onNavigate.mock.calls.map(([event]) => event)).toEqual([
      { type: 'select-global', id: 'projects' },
      { type: 'open-tool', toolId: 'practice', mode: 'project', origin: 'command' },
      { type: 'select-global', id: 'tools' },
      { type: 'open-tool', toolId: 'feedback', mode: 'standalone', origin: 'command' },
    ]);
  });
});
