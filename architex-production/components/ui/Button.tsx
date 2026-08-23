import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger' | 'ink';
  size?: 'sm' | 'md' | 'lg';
  busy?: boolean;
};

export function Button({ variant = 'primary', size = 'md', busy = false, className = '', disabled, children, ...props }: ButtonProps) {
  return <button {...props} aria-busy={busy || undefined} className={`ax-button ax-button--${variant} ax-button--${size} ${className}`.trim()} disabled={disabled || busy}>{children}</button>;
}

export type IconButtonProps = Omit<ButtonProps, 'children'> & { label: string; icon: ReactNode };

export function IconButton({ label, icon, ...props }: IconButtonProps) {
  return <Button {...props} aria-label={label} className={`ax-icon-button ${props.className ?? ''}`.trim()}><span aria-hidden="true">{icon}</span></Button>;
}
