import type { ReactNode } from 'react';

export type StatusTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral' | 'exploration';
export type StatusBadgeProps = { tone: StatusTone; label: string; icon?: ReactNode };

export function StatusBadge({ tone, label, icon }: StatusBadgeProps) {
  return <span className="ax-status-badge" data-tone={tone}>{icon ? <span aria-hidden="true">{icon}</span> : null}<span>{label}</span></span>;
}
