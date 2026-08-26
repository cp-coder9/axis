// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ALL_TOOLS } from '@/lib/data';
import { ToolVersionBadge } from '@/components/ui/ToolVersionBadge';

afterEach(cleanup);

describe('tool version contract', () => {
  it('versions all 47 tools and increments SpecForge for this release', () => {
    const tools = Object.values(ALL_TOOLS);
    expect(tools).toHaveLength(47);
    expect(tools.every(tool => /^\d+\.\d$/.test(tool.version))).toBe(true);
    expect(tools.filter(tool => tool.id !== 'specforge').every(tool => tool.version === '1.0')).toBe(true);
    expect(ALL_TOOLS.specforge.version).toBe('1.1');
  });

  it('renders an accessible compact version label', () => {
    render(<ToolVersionBadge version="1.1" />);
    expect(screen.getByText('v1.1').getAttribute('data-tool-version')).toBe('1.1');
    expect(screen.getByLabelText('Tool version 1.1')).toBeTruthy();
  });
});
