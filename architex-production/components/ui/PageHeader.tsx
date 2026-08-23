import type { ReactNode } from 'react';

export type PageHeaderProps = { title: string; metadata?: ReactNode; actions?: ReactNode; origami?: ReactNode; datum?: boolean };

export function PageHeader({ title, metadata, actions, origami, datum = false }: PageHeaderProps) {
  return <header className="ax-page-header" data-ui="page-header"><div className="ax-page-header__title">{origami ? <span aria-hidden="true">{origami}</span> : null}<div><h1>{title}</h1>{metadata ? <div className="ax-page-header__metadata">{metadata}</div> : null}</div></div>{actions ? <div className="ax-page-header__actions">{actions}</div> : null}{datum ? <div className="ax-page-header__datum" aria-hidden="true" /> : null}</header>;
}
