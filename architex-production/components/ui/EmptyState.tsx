import type { ReactNode } from 'react';
export type EmptyStateProps = { variant?: 'empty' | 'error' | 'permission'; title: string; guidance: string; icon?: ReactNode; action?: ReactNode };
export function EmptyState({ variant = 'empty', title, guidance, icon, action }: EmptyStateProps) { return <section className="ax-empty-state" data-variant={variant}>{icon ? <span aria-hidden="true">{icon}</span> : null}<h2>{title}</h2><p>{guidance}</p>{action}</section>; }
