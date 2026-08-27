import contract from '@/fixtures/v8-shell-contract.json';
import { GODMODE_SHELL_CONTRACT, type GodModeShellRegion } from '@/lib/reference/godmode-shell-contract';

export type V8RegionRectangle = { x: number; y: number; width: number; height: number };
export type V8ShellContract = {
  source: string;
  regions: {
    rail: { width: number };
    navigator: { width: number };
    topbar: { height: number };
    inspector: { width: number };
  };
  controls: string[];
  referenceControlOrder: string[];
  labels: string[];
  referenceToolCount: number;
  fontFamily: string;
  colours: Record<string, string>;
  regionStyles: Record<string, Record<string, string> | null>;
  viewports: Record<string, { viewport: { width: number; height: number }; regions: Record<string, V8RegionRectangle | null> }>;
  regionOrder: readonly GodModeShellRegion[];
  regionSelectors: Readonly<Record<GodModeShellRegion, string>>;
  geometry: typeof GODMODE_SHELL_CONTRACT.geometry;
  breakpoints: readonly number[];
  themes: typeof GODMODE_SHELL_CONTRACT.themes;
  referenceDarkTheme: boolean;
};

export const V8_SHELL_CONTRACT: V8ShellContract = {
  ...contract,
  regions: {
    rail: { width: GODMODE_SHELL_CONTRACT.geometry.rail },
    navigator: { width: GODMODE_SHELL_CONTRACT.geometry.navigator },
    topbar: { height: GODMODE_SHELL_CONTRACT.geometry.topbar },
    inspector: { width: GODMODE_SHELL_CONTRACT.geometry.inspector },
  },
  referenceToolCount: GODMODE_SHELL_CONTRACT.referenceToolCount,
  regionOrder: GODMODE_SHELL_CONTRACT.regionOrder,
  regionSelectors: GODMODE_SHELL_CONTRACT.regionSelectors,
  geometry: GODMODE_SHELL_CONTRACT.geometry,
  breakpoints: GODMODE_SHELL_CONTRACT.breakpoints,
  themes: GODMODE_SHELL_CONTRACT.themes,
  referenceDarkTheme: GODMODE_SHELL_CONTRACT.referenceDarkTheme,
};
