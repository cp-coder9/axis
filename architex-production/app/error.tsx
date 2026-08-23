'use client';

import React, { useEffect } from 'react';
import { OrigamiIcon } from '@/lib/origami-icons';

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
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#f5faf9] text-[#102033] p-6">
      <div className="max-w-md w-full bg-white border border-[#102033]/15 rounded-3xl p-6 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
          <OrigamiIcon name="warning" size={30} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#102033]">Session Interruption Handled</h2>
          <p className="text-xs text-[#657287] mt-1">
            Architex OS state has been safely preserved in your workspace session.
          </p>
        </div>
        <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-left text-[11px] font-mono text-[#526074] break-all max-h-28 overflow-y-auto">
          {error.message || 'An unexpected state error occurred.'}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-2.5 bg-[#19B7B0] hover:bg-[#167E79] text-white font-bold rounded-xl text-xs shadow-sm transition-all"
          >
            Reload Module
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-2.5 bg-[#102033] hover:bg-black text-white font-bold rounded-xl text-xs shadow-sm transition-all"
          >
            Restart Architex OS
          </button>
        </div>
      </div>
    </div>
  );
}
