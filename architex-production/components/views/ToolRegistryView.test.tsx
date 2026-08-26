// @vitest-environment jsdom

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { ToolRegistryView } from '@/components/views/ToolRegistryView';

afterEach(cleanup);

describe('ToolRegistryView V8 route integration', () => {
  it('mounts the grouped V8 registry instead of the legacy filter-card page', () => {
    render(<ToolRegistryView mode="standalone" onOpenTool={vi.fn()} onSetMode={vi.fn()} />);

    expect(screen.getByTestId('v8-tool-registry')).toBeTruthy();
    expect(screen.queryByRole('searchbox', { name: 'Search workspace tools' })).toBeNull();
  });
});
