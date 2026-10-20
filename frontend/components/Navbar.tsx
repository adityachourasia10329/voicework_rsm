'use client';

import React from 'react';
import Link from 'next/link';
import { Waves, Plus, Layers, ShieldCheck, Activity } from 'lucide-react';

interface NavbarProps {
  onOpenIngest?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenIngest }) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-zerodha-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo - Zerodha style */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 rounded bg-zerodha-blue flex items-center justify-center text-white font-bold text-sm shadow-sm">
            <Waves className="w-4 h-4" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-semibold text-base tracking-tight text-zerodha-heading">VoiceWork</span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-zerodha-muted font-medium border border-gray-200">
              RSM
            </span>
          </div>
        </Link>

        {/* Center Links & Status */}
        <div className="hidden md:flex items-center space-x-8 text-sm text-zerodha-muted">
          <Link href="/" className="text-zerodha-heading font-medium hover:text-zerodha-blue transition-colors">
            Dashboard
          </Link>
          <span className="text-gray-300">|</span>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-zerodha-green" />
            <span className="text-gray-600">Redis Tier 1:</span>
            <span className="text-zerodha-green font-semibold">&lt; 3ms</span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono text-gray-500">
            <span>Lossless Engine:</span>
            <span className="font-semibold text-gray-700">FFmpeg -c:v copy</span>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center space-x-3">
          {onOpenIngest && (
            <button
              onClick={onOpenIngest}
              className="flex items-center space-x-1.5 px-4 py-2 rounded bg-zerodha-blue hover:bg-zerodha-blue-hover text-white font-medium text-xs shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Ingest Media</span>
            </button>
          )}

          <Link
            href="/"
            className="p-2 rounded border border-zerodha-border bg-white hover:bg-gray-50 text-zerodha-muted hover:text-zerodha-heading transition-colors"
            title="Projects Gallery"
          >
            <Layers className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};
