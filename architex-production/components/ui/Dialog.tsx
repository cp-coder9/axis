'use client';
import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
export type DialogProps = {
  open: boolean;
  onOpenChange(open: boolean): void;
  title: string;
  description: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
  hideHeading?: boolean;
  className?: string;
  children: ReactNode;
};

const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({ open, onOpenChange, title, description, initialFocusRef, hideHeading = false, className, children }: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const previousFocus = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    const focusInitial = () => (initialFocusRef?.current ?? panelRef.current)?.focus();
    const timer = window.setTimeout(focusInitial, 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onOpenChange(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current?.focus();
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
      previousFocus.current?.focus();
    };
  }, [open, onOpenChange, initialFocusRef]);

  if (!open) return null;
  return createPortal(
    <div className="ax-dialog__backdrop" onMouseDown={() => onOpenChange(false)}>
      <section
        ref={panelRef}
        className={['ax-dialog', className].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label={hideHeading ? title : undefined}
        aria-labelledby={hideHeading ? undefined : titleId}
        aria-describedby={hideHeading ? undefined : descriptionId}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {!hideHeading && <><h2 id={titleId}>{title}</h2><p id={descriptionId}>{description}</p></>}
        {children}
      </section>
    </div>,
    document.body,
  );
}
