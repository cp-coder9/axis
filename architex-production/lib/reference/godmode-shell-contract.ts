import rawShellContract from '@/generated/godmode-shell-contract.json';

export type GodModeShellRegion = 'rail' | 'navigator' | 'topbar' | 'canvas' | 'inspector';

export interface GodModeShellContract {
  readonly schemaVersion: 1;
  readonly sourcePath: string;
  readonly sourceSha256: string;
  readonly referenceToolCount: 47;
  readonly regionOrder: readonly GodModeShellRegion[];
  readonly regionSelectors: Readonly<Record<GodModeShellRegion, string>>;
  readonly geometry: {
    readonly rail: number;
    readonly railExpanded: number;
    readonly navigator: number;
    readonly navigatorCompact: number;
    readonly inspector: number;
    readonly topbar: number;
  };
  readonly breakpoints: readonly number[];
  readonly themes: {
    readonly light: Readonly<Record<string, string>>;
    readonly dark: Readonly<Record<string, string>>;
  };
  readonly referenceDarkTheme: boolean;
}

const candidate: unknown = rawShellContract;
if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
  throw new Error('Invalid generated God Mode shell contract');
}
const shell = candidate as Partial<GodModeShellContract>;
if (
  shell.schemaVersion !== 1
  || shell.referenceToolCount !== 47
  || shell.regionOrder?.join(',') !== 'rail,navigator,topbar,canvas,inspector'
  || shell.geometry?.rail !== 74
  || shell.geometry?.navigator !== 306
  || shell.geometry?.inspector !== 344
  || shell.geometry?.topbar !== 66
) {
  throw new Error('Generated God Mode shell contract failed invariant validation');
}

export const GODMODE_SHELL_CONTRACT = candidate as GodModeShellContract;
