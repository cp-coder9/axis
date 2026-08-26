import contract from '@/fixtures/v8-shell-contract.json';

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
  viewports: Record<string, { viewport: { width: number; height: number }; regions: Record<string, V8RegionRectangle | null> }>;
};

export const V8_SHELL_CONTRACT = contract as V8ShellContract;
