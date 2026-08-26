'use client';

import React from 'react';
import { ALL_TOOLS } from '@/lib/data';
import type { OrientationMode } from '@/lib/types';
import { V8ToolRegistry } from '@/components/v8/V8ToolRegistry';

interface ToolRegistryViewProps {
  mode: OrientationMode;
  onOpenTool: (toolId: string) => void;
  onSetMode: (mode: OrientationMode) => void;
}

export const ToolRegistryView: React.FC<ToolRegistryViewProps> = ({ onOpenTool, onSetMode }) => (
  <V8ToolRegistry
    tools={Object.values(ALL_TOOLS)}
    onOpenTool={onOpenTool}
    onOpenProjectOrientation={() => onSetMode('project')}
  />
);
