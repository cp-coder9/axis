import type { ReactNode, TableHTMLAttributes } from 'react';
export type Density = 'comfortable' | 'compact';
export type DataTableProps = TableHTMLAttributes<HTMLTableElement> & { caption: string; density?: Density; stickyHeader?: boolean; empty?: ReactNode };
export function DataTable({ caption, density = 'comfortable', stickyHeader = false, empty, children, ...props }: DataTableProps) { return <div className={`ax-data-table ax-data-table--${density}`}>{empty ? <div className="ax-data-table__empty">{empty}</div> : <table {...props}><caption>{caption}</caption><thead className={stickyHeader ? 'ax-data-table__sticky' : undefined}>{children}</thead></table>}</div>; }
