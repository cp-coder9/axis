'use client';

import React, { useState } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { OrientationMode, ToolDefinition } from '@/lib/types';
import { ALL_TOOLS } from '@/lib/data';

interface ToolRegistryViewProps {
  mode: OrientationMode;
  onOpenTool: (toolId: string) => void;
  onSetMode: (mode: OrientationMode) => void;
}

export const ToolRegistryView: React.FC<ToolRegistryViewProps> = ({
  mode,
  onOpenTool,
  onSetMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'scaffold'>('all');

  const tools = Object.values(ALL_TOOLS);
  const groups = ['All', ...Array.from(new Set(tools.map((t) => t.group)))];
  const liveCount = tools.filter((t) => t.status === 'live').length;
  const scaffoldCount = tools.filter((t) => t.status === 'scaffold').length;

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.group.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === 'All' || tool.group === selectedGroup;
    const matchesStatus = filterStatus === 'all' || tool.status === filterStatus;
    return matchesSearch && matchesGroup && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
            <OrigamiIcon name="tools" size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#102033] tracking-tight">Workspace Tool Registry</h1>
            <p className="text-[13px] text-[#657287]">
              Browse all {tools.length} integrated capabilities. Live modules retain their full functional workflows; scaffolds reserve standard integration contracts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSetMode('project')}
            className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-[#102033]/15 text-[#102033] rounded-xl text-[12px] font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <OrigamiIcon name="projects" size={16} />
            <span>Open Project Datum</span>
          </button>
        </div>
      </div>

      {/* Mode Explanation Notice */}
      <div className="p-3.5 bg-[#DFF5F2]/60 border border-[#19B7B0]/20 rounded-2xl text-[12px] text-[#167E79] flex items-center justify-between">
        <div>
          <strong>One Capability, Two Orientations.</strong>
          <span className="text-[#526074] ml-1.5">
            Every tool operates standalone or connected to a project. Scope, data persistence, and audit logging adjust dynamically.
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-white border border-[#102033]/10 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="search"
              aria-label="Search workspace tools"
              placeholder={`Search across all ${tools.length} tools by name, discipline or standard...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f7fbfa] border border-[#102033]/15 rounded-xl text-[13px] text-[#102033] focus:outline-none focus:border-[#19B7B0]"
            />
            <span className="absolute left-3 top-2.5 text-[#96a0ad]">🔍</span>
          </div>

          <div className="flex gap-1.5">
            {(['all', 'live', 'scaffold'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-[12px] font-bold capitalize transition-all ${
                  filterStatus === st
                    ? 'bg-[#102033] text-white shadow-sm'
                    : 'bg-[#f7fbfa] border border-[#102033]/10 text-[#657287] hover:text-[#102033]'
                }`}
              >
                {st === 'all' ? `All (${tools.length})` : st === 'live' ? `Live (${liveCount})` : `Scaffold (${scaffoldCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Group category chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {groups.map((grp) => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                selectedGroup === grp
                  ? 'bg-[#19B7B0]/15 text-[#167E79] border border-[#19B7B0]/30 font-bold'
                  : 'bg-gray-50 text-[#657287] hover:bg-gray-100 border border-transparent'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredTools.map((tool) => {
          return (
            <button
              type="button"
              key={tool.id}
              onClick={() => onOpenTool(tool.id)}
              className={`w-full p-4 text-left bg-white border rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between ${
                tool.status === 'scaffold'
                  ? 'border-dashed border-[#102033]/20 bg-[#fafcfb]'
                  : 'border-[#102033]/10 hover:border-[#19B7B0]/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#DFF5F2] flex items-center justify-center text-[#167E79]">
                    <OrigamiIcon name={tool.icon} size={22} />
                  </div>
                  <span
                    className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                      tool.status === 'live'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}
                  >
                    {tool.status === 'live' ? 'Live Flagship' : 'Scaffold'}
                  </span>
                </div>

                <h3 className="text-[14px] font-bold text-[#102033] mb-1">{tool.name}</h3>
                <div className="text-[11px] font-semibold text-[#167E79] mb-1.5">{tool.group}</div>
                <p className="text-[12px] text-[#657287] line-clamp-3 leading-relaxed mb-3">{tool.summary}</p>
              </div>

              <div className="pt-2.5 border-t border-[#102033]/5 flex items-center justify-between text-[11px] text-[#96a0ad]">
                <span>Stage: {tool.stage}</span>
                <span className="text-[#167E79] font-bold">Open Tool ›</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
