'use client';

import React from 'react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';
import { Surface } from '@/components/ui/Surface';
import { OrigamiIcon } from '@/lib/origami-icons';

export default function NotFound() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-[var(--ax-canvas)] px-4 py-6 text-[var(--ax-text)]">
      <Surface level="raised" className="w-full max-w-md text-center">
        <EmptyState
          title="Resource Not Found"
          guidance="The requested project or tool record could not be located in the Datum registry."
          icon={<span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#19B7B0]/30 bg-[#19B7B0]/10 text-[var(--ax-action-primary)]"><OrigamiIcon name="datum" size={30} /></span>}
          action={<Link href="/" className="ax-button ax-button--primary mt-4 w-full">Return to Project Datum</Link>}
        />
      </Surface>
    </main>
  );
}
