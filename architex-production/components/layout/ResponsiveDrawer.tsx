'use client';

import { useEffect, useRef, type ReactNode } from 'react';

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

interface ResponsiveDrawerProps {
  open: boolean;
  title: string;
  side: 'start' | 'end';
  onClose: () => void;
  children: ReactNode;
}

/** Focus-managed tablet/mobile shell drawer. It owns no product navigation state. */
export function ResponsiveDrawer({ open, title, side, onClose, children }: ResponsiveDrawerProps) {
  const panelRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    const focusPanel = () => panelRef.current?.focus();
    const timer = window.setTimeout(focusPanel, 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);
      if (focusable.length === 0) {
        event.preventDefault();
        focusPanel();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === panelRef.current || document.activeElement === first)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-[#102033]/45" onMouseDown={onClose}>
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`absolute inset-y-0 ${side === 'start' ? 'left-0' : 'right-0'} w-[min(344px,calc(100vw-1.5rem))] bg-[var(--ax-surface-1)] shadow-2xl`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </aside>
    </div>
  );
}
