import type { HTMLAttributes } from 'react';

export type SurfaceProps = HTMLAttributes<HTMLElement> & { as?: 'section' | 'article' | 'div'; level?: 'flat' | 'raised' | 'inset' | 'overlay' };
export type CardProps = SurfaceProps;

export function Surface({ as: Element = 'section', level = 'flat', className = '', ...props }: SurfaceProps) {
  return <Element {...props} data-ui="surface" className={`ax-surface ax-surface--${level} ${className}`.trim()} />;
}

export function Card(props: CardProps) { return <Surface {...props} />; }
