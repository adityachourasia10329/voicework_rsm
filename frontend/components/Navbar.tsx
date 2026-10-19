'use client';

import React from 'react';
import Link from 'next/link';
import { Waves, Plus, HardDrive, Radio, Layers } from 'lucide-react';

interface NavbarProps {
  onOpenIngest?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenIngest }) => {
  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent to-purple-600 flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform">
            <Waves className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">VoiceWork</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-accent/20 text-accent font-mono font-medium">RSM</span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">Enterprise AI Audio Separation & Remuxing</p>
          </div>
        </Link>

        {/* Center Indicators */}
        <div className="hidden md:flex items-center space-x-6 text-xs text-gray-400 font-mono">
          <div className="flex items-center space-x-2 bg-surface px-3 py-1.5 rounded-full border border-border">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-gray-300">Tier 1 Redis Hot Cache:</span>
            <span className="text-emerald-400 font-semibold">&lt; 3ms</span>
          </div>

          <div className="flex items-center space-x-2 bg-surface px-3 py-1.5 rounded-full border border-border">
            <Radio className="w-3.5 h-3.5 text-accent" />
            <span className="text-gray-300">GPU Chunker:</span>
            <span className="text-purple-400 font-semibold">2s Crossfade OOM Guard</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {onOpenIngest && (
            <button
              onClick={onOpenIngest}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-purple-600 hover:from-accent-hover hover:to-purple-700 text-white font-medium text-xs shadow-lg shadow-accent/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Ingest Media</span>
            </button>
          )}

          <Link
            href="/"
            className="p-2 rounded-lg bg-surface hover:bg-surface-elevated border border-border text-gray-300 hover:text-white transition-colors"
            title="Projects Gallery"
          >
            <Layers className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};
