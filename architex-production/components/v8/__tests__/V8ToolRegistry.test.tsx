// @vitest-environment jsdom

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ALL_TOOLS } from '@/lib/data';
import { V8ToolRegistry } from '@/components/v8/V8ToolRegistry';

afterEach(cleanup);

const tools = Object.values(ALL_TOOLS);
const referenceGroupOrder = [
  'Practice & Project Management', 'Intelligence & Improvement', 'Planning & Approvals',
  'Compliance & Environment', 'Design & Documentation', 'Commercial & Procurement',
  'Site Execution & Quality', 'Project & Collaboration', 'Platform Services',
  'Communication & Collaboration', 'Engineering & Technical',
];

describe('V8 Workspace Tool Registry', () => {
  it('renders the supplied grouped compact catalogue from all 47 canonical tools', () => {
    const { container } = render(
      <V8ToolRegistry tools={tools} onOpenTool={vi.fn()} onOpenProjectOrientation={vi.fn()} />,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Workspace Tool Registry' })).toBeTruthy();
    expect(screen.getByText('Every current and planned tool is represented. Live samples retain their original workflow; scaffolds define how the missing modules will mount into Datum OS.')).toBeTruthy();
    expect(screen.getByText(/One capability, two orientations/i)).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'Complete workspace tool registry' })).toBeTruthy();
    expect(container.querySelectorAll('[data-v8-registry-tool]')).toHaveLength(47);

    const groups = new Map<string, number>();
    for (const tool of tools) groups.set(tool.group, (groups.get(tool.group) ?? 0) + 1);
    const renderedGroups = Array.from(container.querySelectorAll<HTMLElement>('[data-v8-registry-group]'));
    expect(renderedGroups.map(group => group.dataset.v8RegistryGroup)).toEqual(referenceGroupOrder);
    for (const [group, count] of groups) {
      const region = renderedGroups.find(node => node.dataset.v8RegistryGroup === group)!;
      expect(within(region).getByRole('heading', { level: 3 }).textContent).toBe(`${group}${count} tools`);
      expect(region.querySelectorAll('[data-v8-registry-tool]')).toHaveLength(count);
    }

    expect(screen.queryAllByText('Live sample').length).toBe(tools.filter(tool => tool.status === 'live').length);
    expect(screen.queryAllByText('Scaffold').length).toBe(tools.filter(tool => tool.status === 'scaffold').length);
  });

  it('preserves project-orientation and tool-open navigation callbacks', async () => {
    const user = userEvent.setup();
    const onOpenTool = vi.fn();
    const onOpenProjectOrientation = vi.fn();
    render(<V8ToolRegistry tools={tools} onOpenTool={onOpenTool} onOpenProjectOrientation={onOpenProjectOrientation} />);

    await user.click(screen.getByRole('button', { name: 'Open project orientation' }));
    expect(onOpenProjectOrientation).toHaveBeenCalledOnce();

    const firstTool = tools[0];
    await user.click(screen.getByRole('button', { name: new RegExp(`^${firstTool.name}`) }));
    expect(onOpenTool).toHaveBeenCalledWith(firstTool.id);
  });
});
