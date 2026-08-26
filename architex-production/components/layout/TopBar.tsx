'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { ProjectEntity, RoleKey, ToolDefinition } from '@/lib/types';
import { ROLES, ROLE_PROFILES } from '@/lib/data';
import { type NavigationEvent, type NavigationState } from '@/lib/navigation';
import { type WorkspaceTheme } from '@/lib/useWorkspaceTheme';

interface TopBarProps {
  navigation: NavigationState;
  activeProject: ProjectEntity;
  activeTool: ToolDefinition | null;
  currentRole: RoleKey;
  onSetRole: (role: RoleKey) => void;
  onToggleCompactNav: () => void;
  onOpenGlobalNavigation: () => void;
  onToggleInspector: () => void;
  onOpenWingman: () => void;
  onNavigate: (event: NavigationEvent) => void;
  inspectorOpen: boolean;
  narrowLayout: boolean;
  godModeEnabled: boolean;
  theme: WorkspaceTheme;
  onToggleTheme: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  navigation,
  activeProject,
  activeTool,
  currentRole,
  onSetRole,
  onToggleCompactNav,
  onOpenGlobalNavigation,
  onToggleInspector,
  onOpenWingman,
  onNavigate,
  inspectorOpen,
  narrowLayout,
  godModeEnabled,
  theme,
  onToggleTheme,
}) => {
  const currentProfile = ROLE_PROFILES[currentRole] || ROLE_PROFILES.architect;
  const { mode, globalId: activeGlobal } = navigation;
  const godMode = navigation.godSession !== null;

  return (
    <header className="h-[64px] bg-white/90 border-b border-[#102033]/10 backdrop-blur-md px-4 flex items-center gap-3 z-10">
      {/* Mobile global-navigation drawer trigger */}
      <button
        onClick={onOpenGlobalNavigation}
        className="md:hidden w-9 h-9 rounded-xl bg-white border border-[#102033]/10 flex items-center justify-center text-[var(--ax-text-muted)] hover:text-[var(--ax-action-primary)] hover:bg-[#DFF5F2] transition-colors shadow-sm"
        aria-label="Open global navigation"
      >
        <OrigamiIcon name="menu" size={18} />
      </button>

      {/* Toggle Navigator Compact / Expand */}
      <button
        onClick={onToggleCompactNav}
        className="w-9 h-9 rounded-xl bg-white border border-[#102033]/10 flex items-center justify-center text-[var(--ax-text-muted)] hover:text-[var(--ax-action-primary)] hover:bg-[#DFF5F2] transition-colors shadow-sm"
        aria-label={narrowLayout ? 'Open context navigation' : 'Toggle Context Navigator'}
        title={narrowLayout ? 'Open context navigation' : 'Toggle Context Navigator'}
      >
        <OrigamiIcon name="menu" size={18} />
      </button>

      {/* Dynamic Breadcrumb Path */}
      <div className="flex items-center gap-1.5 text-[13px] text-[var(--ax-text-muted)] overflow-hidden whitespace-nowrap">
        <span>Architex OS</span>
        <span className="text-[#102033]/30">›</span>
        {activeTool ? (
          <>
            <span>{mode === 'project' ? `Projects › ${activeProject.name}` : 'Workspace Tools'}</span>
            <span className="text-[#102033]/30">›</span>
            <strong className="text-[#102033] font-semibold">{activeTool.name}</strong>
          </>
        ) : activeGlobal === 'projects' ? (
          <>
            <span>Projects</span>
            <span className="text-[#102033]/30">›</span>
            <strong className="text-[#102033] font-semibold">{activeProject.name} (Datum)</strong>
          </>
        ) : (
          <strong className="text-[#102033] font-semibold capitalize">{activeGlobal}</strong>
        )}
      </div>

      <div className="flex-1" />

      {/* Scope Orientation Pill */}
      <span className={`hidden sm:inline-flex items-center text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
        godMode
          ? 'bg-[#8B5CF6]/10 text-[#5B21B6] border-[#8B5CF6]/20'
          : 'bg-[#19B7B0]/10 text-[var(--ax-text)] border-[#19B7B0]/20'
      }`}>
        {godMode ? 'God Mode · demo explorer' : mode === 'project' ? 'Project orientation' : 'Standalone mode'}
      </span>

      {/* Project Indicator Chip */}
      <div className="hidden md:flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 bg-[#DFF5F2] text-[var(--ax-text)] border border-[#19B7B0]/20 rounded-lg whitespace-nowrap">
        <span className="w-2 h-2 rounded-full bg-[#19B7B0] animate-pulse" />
        <span>{mode === 'project' ? activeProject.name : 'Portfolio / unassigned'}</span>
      </div>

      <button
        type="button"
        data-testid="workspace-theme-toggle"
        data-v8-control="theme"
        aria-pressed={theme === 'dark'}
        aria-label="Switch colour theme"
        onClick={onToggleTheme}
        className="h-9 px-2.5 rounded-xl bg-white border border-[#102033]/10 flex items-center gap-1.5 justify-center text-[var(--ax-text-muted)] hover:text-[var(--ax-action-primary)] hover:bg-[#DFF5F2] transition-colors shadow-sm"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        <span className="text-[12px] font-bold">{theme === 'dark' ? 'Light' : 'Dark'}</span>
      </button>

      {/* God Mode Toggle — between project chip and role switcher (plan 5B) */}
      {(godMode || godModeEnabled) && <button
          type="button"
          data-testid="god-mode-toggle"
          aria-pressed={godMode}
          onClick={() => onNavigate(godMode ? { type: 'exit-god' } : { type: 'enter-god', initialLens: currentRole })}
          className={`flex items-center gap-1.5 px-3 h-9 rounded-xl border transition-colors shadow-sm ${
            godMode
              ? 'bg-[#8B5CF6]/15 text-[#5B21B6] border-[#8B5CF6]/30'
              : 'bg-white text-[#5B21B6] border-[#102033]/10 hover:bg-[#8B5CF6]/10'
          }`}
          title={godMode ? 'Exit God Mode' : 'Explore the entire Architex ecosystem'}
        >
          <OrigamiIcon name="god_mode" size={18} />
          <span className="hidden xl:inline text-[12px] font-bold">God Mode</span>
          <span className="hidden sm:inline text-[9px] font-bold uppercase">
            {godMode ? 'On' : 'Explore'}
          </span>
        </button>}

      {/* 20 Role Personas Switcher */}
      <div className="flex items-center gap-1.5 bg-white border border-[#102033]/15 rounded-xl px-2 py-1 shadow-sm">
        <span className="text-[11px] text-[var(--ax-text-muted)] font-semibold hidden lg:inline">Role:</span>
        <select
          data-testid="role-switcher"
          aria-label="Active role"
          value={currentRole}
          onChange={(e) => onSetRole(e.target.value as RoleKey)}
          className="bg-transparent text-[12px] font-bold text-[#102033] focus:outline-none cursor-pointer"
        >
          {ROLES.map((r) => (
            <option key={r.key} value={r.key}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Wingman Copilot Quick Trigger */}
      <button
        onClick={onOpenWingman}
        className="w-9 h-9 rounded-xl bg-white border border-[#102033]/10 flex items-center justify-center text-[var(--ax-ref-violet-600)] hover:bg-[#8B5CF6]/10 transition-colors shadow-sm"
        title="Open Wingman AI"
      >
        <OrigamiIcon name="wingman" size={18} />
      </button>

      {/* Contextual Inspector Toggle */}
      <button
        onClick={onToggleInspector}
        className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors shadow-sm ${
          inspectorOpen
            ? 'bg-[#19B7B0]/15 text-[var(--ax-action-primary)] border-[#19B7B0]/30'
            : 'bg-white text-[#657287] border-[#102033]/10 hover:bg-[#DFF5F2]'
        }`}
        aria-label={narrowLayout ? (inspectorOpen ? 'Close context inspector' : 'Open context inspector') : 'Toggle Contextual Inspector'}
        title={narrowLayout ? (inspectorOpen ? 'Close context inspector' : 'Open context inspector') : 'Toggle Contextual Inspector'}
      >
        <OrigamiIcon name="inspector" size={18} />
      </button>
    </header>
  );
};
