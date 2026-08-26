import type { ToolVersion } from '@/lib/types';

export function ToolVersionBadge({ version }: { version: ToolVersion }) {
  return (
    <span className="ax-tool-version" data-tool-version={version} aria-label={`Tool version ${version}`}>
      v{version}
    </span>
  );
}
