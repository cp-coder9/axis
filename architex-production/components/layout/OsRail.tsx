'use client';

import React from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { RoleKey } from '@/lib/types';
import { ROLE_PROFILES } from '@/lib/data';
import { visibleGlobalDestinations, type NavigationEvent, type NavigationState } from '@/lib/navigation';

interface OsRailProps {
  navigation: NavigationState;
  onNavigate: (event: NavigationEvent) => void;
  railExpanded: boolean;
  onToggleRail: () => void;
  currentRole: RoleKey;
  totalToolsCount: number;
}

export const OsRail: React.FC<OsRailProps> = ({
  navigation,
  onNavigate,
  railExpanded,
  onToggleRail,
  currentRole,
  totalToolsCount,
}) => {
  const currentProfile = ROLE_PROFILES[currentRole] || ROLE_PROFILES.architect;

  const globalItems = visibleGlobalDestinations(navigation, totalToolsCount);

  return (
    <aside
      className={`relative z-20 flex flex-col h-full bg-gradient-to-b from-[#167E79] to-[#0f5854] border-r border-white/20 shadow-xl transition-all duration-300 ${
        railExpanded ? 'w-[264px]' : 'w-[74px]'
      }`}
    >
      {/* Brand Logo & Toggle */}
      <div className="h-[64px] flex items-center justify-between px-3.5 border-b border-white/15">
        <button
          onClick={onToggleRail}
          title={railExpanded ? 'Collapse navigation' : 'Expand navigation'}
          className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-white/10 transition-colors"
        >
          <div className="w-[42px] h-[42px] rounded-xl bg-white p-1 flex items-center justify-center shadow-md">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4L6 10v12l10 6 10-6V10L16 4z" fill="#19B7B0" opacity="0.3" />
              <path d="M16 8l-6 4v8l6 4 6-4v-8l-6-4z" fill="#167E79" />
              <circle cx="16" cy="16" r="3" fill="#ffffff" />
            </svg>
          </div>
          {railExpanded && (
            <div className="text-left whitespace-nowrap overflow-hidden">
              <div className="text-[14px] font-bold tracking-wider text-white">ARCHITEX OS</div>
              <div className="text-[10px] text-white/70">Built Environment OS</div>
            </div>
          )}
        </button>
        {railExpanded && (
          <button
            onClick={onToggleRail}
            className="text-white/60 hover:text-white text-lg p-1"
            title="Collapse menu"
          >
            ×
          </button>
        )}
      </div>

      {railExpanded && (
        <div className="mx-3 my-2 p-2.5 bg-white/10 border border-white/15 rounded-xl text-[11px] text-white/90 leading-snug">
          <strong>Global OS Rail</strong>
          <p className="text-white/70 mt-0.5">Switch between Command, Project Datum, and Workspace Tools.</p>
        </div>
      )}

      {/* Global Navigation Items */}
      <nav className="flex-1 py-2 px-1.5 space-y-1 overflow-y-auto">
        {globalItems.map((item) => {
          const isActive = navigation.globalId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate({ type: 'select-global', id: item.id })}
              aria-current={isActive ? 'page' : undefined}
              className={`os-rail-btn group relative w-full h-[46px] px-2.5 flex items-center gap-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-white text-[#102033] shadow-md font-semibold'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              title={item.label}
            >
              <div className="w-[36px] h-[36px] flex items-center justify-center flex-shrink-0">
                <OrigamiIcon name={item.icon} size={22} />
              </div>
              {railExpanded && (
                <>
                  <span className="text-[13px] text-left truncate flex-1">{item.label}</span>
                  {item.meta && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-[#19B7B0]/15 text-[#167E79]' : 'bg-white/15 text-white'
                      }`}
                    >
                      {item.meta}
                    </span>
                  )}
                </>
              )}

              {/* Tooltip for collapsed state */}
              {!railExpanded && (
                <span className="absolute left-[78px] hidden group-hover:flex items-center px-2.5 py-1 bg-[#102033] text-white text-[12px] font-medium rounded-lg shadow-xl z-50 whitespace-nowrap pointer-events-none">
                  {item.label}
                  {item.meta && <span className="ml-1.5 text-white/60">({item.meta})</span>}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User / Persona Footer */}
      <div className="p-2.5 border-t border-white/15 flex items-center gap-2.5">
        <div className="w-[38px] h-[38px] rounded-full bg-white text-[#167E79] font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm border border-white/30">
          {currentProfile.code}
        </div>
        {railExpanded && (
          <div className="text-left whitespace-nowrap overflow-hidden flex-1">
            <div className="text-[12px] font-bold text-white truncate">{currentProfile.label}</div>
            <div className="text-[10px] text-white/70 truncate">{currentProfile.description}</div>
          </div>
        )}
      </div>
    </aside>
  );
};
