'use client';

import React, { useEffect } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Surface } from '@/components/ui/Surface';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Architex OS Runtime Error:', error);
  }, [error]);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-[var(--ax-canvas)] px-4 py-6 text-[var(--ax-text)]">
      <Surface level="raised" className="w-full max-w-md text-center">
        <EmptyState
          variant="error"
          title="Session Interruption Handled"
          guidance="Architex OS state has been safely preserved in your workspace session."
          icon={<span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--ax-status-warning-border)] bg-[var(--ax-status-warning-bg)] text-[var(--ax-status-warning-fg)]"><OrigamiIcon name="warning" size={30} /></span>}
          action={
            <>
              <div className="mt-4 max-h-28 overflow-y-auto break-all rounded-xl border border-[var(--ax-border)] bg-[var(--ax-surface-2)] p-3 text-left font-mono text-[11px] text-[var(--ax-text-muted)]">
                {error.message || 'An unexpected state error occurred.'}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" className="flex-1" onClick={() => reset()}>Reload Module</Button>
                <Button type="button" variant="ink" className="flex-1" onClick={() => window.location.reload()}>Restart Architex OS</Button>
              </div>
            </>
          }
        />
      </Surface>
    </main>
  );
}
