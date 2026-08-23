'use client';

import React from 'react';
import Link from 'next/link';
import { OrigamiIcon } from '@/lib/origami-icons';

export default function NotFound() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#f5faf9] text-[#102033] p-6">
      <div className="max-w-md w-full bg-white border border-[#102033]/15 rounded-3xl p-6 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#19B7B0]/10 border border-[#19B7B0]/30 flex items-center justify-center text-[#167E79]">
          <OrigamiIcon name="datum" size={30} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#102033]">Resource Not Found</h2>
          <p className="text-xs text-[#657287] mt-1">
            The requested project or tool record could not be located in the Datum registry.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block w-full py-2.5 bg-[#19B7B0] hover:bg-[#167E79] text-white font-bold rounded-xl text-xs shadow-sm transition-all"
        >
          Return to Project Datum
        </Link>
      </div>
    </div>
  );
}
