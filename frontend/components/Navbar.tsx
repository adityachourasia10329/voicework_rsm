'use client';

import React from 'react';
import Link from 'next/link';
import { Waves, Plus, Layers, LayoutDashboard, FolderKanban, SlidersHorizontal } from 'lucide-react';

interface NavbarProps {
  onOpenIngest?: () => void;
  activeTab?: 'dashboard' | 'gallery' | 'editor';
  onTabChange?: (tab: 'dashboard' | 'gallery' | 'editor') => void;
  projectCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenIngest,
  activeTab = 'dashboard',
  onTabChange,
  projectCount
}) => {
  const handleNavClick = (tab: 'dashboard' | 'gallery' | 'editor') => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      if (tab === 'editor') {
        window.location.href = '/editor';
      } else {
        window.location.href = `/?tab=${tab}`;
      }
    }
  };

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

        {/* Center Links: Dashboard, Gallery, and Editor Option right beside each other */}
        <div className="flex items-center space-x-8 text-sm">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`pb-1 flex items-center space-x-1.5 border-b-2 font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'text-zerodha-blue border-zerodha-blue font-semibold'
                  : 'text-zerodha-muted border-transparent hover:text-zerodha-heading'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => handleNavClick('gallery')}
              className={`pb-1 flex items-center space-x-1.5 border-b-2 font-medium transition-all ${
                activeTab === 'gallery'
                  ? 'text-zerodha-blue border-zerodha-blue font-semibold'
                  : 'text-zerodha-muted border-transparent hover:text-zerodha-heading'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Gallery</span>
              {projectCount !== undefined && (
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-blue-50 text-zerodha-blue border border-blue-200 font-semibold">
                  {projectCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('editor')}
              className={`pb-1 flex items-center space-x-1.5 border-b-2 font-medium transition-all ${
                activeTab === 'editor'
                  ? 'text-zerodha-blue border-zerodha-blue font-semibold'
                  : 'text-zerodha-muted border-transparent hover:text-zerodha-heading'
              }`}
              title="Open Editor Space"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Editor</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                Studio
              </span>
            </button>
          </div>

          <span className="hidden md:inline text-gray-300">|</span>

          {/* Real-time Architecture Status Indicators */}
          <div className="hidden lg:flex items-center space-x-6 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-zerodha-green" />
              <span className="text-gray-500">Redis Tier 1:</span>
              <span className="text-zerodha-green font-semibold">&lt; 3ms</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <span>Lossless Engine:</span>
              <span className="font-semibold text-gray-700">FFmpeg -c:v copy</span>
            </div>
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

          <button
            onClick={() => handleNavClick('gallery')}
            className={`p-2 rounded border transition-colors ${
              activeTab === 'gallery'
                ? 'border-zerodha-blue bg-blue-50 text-zerodha-blue'
                : 'border-zerodha-border bg-white hover:bg-gray-50 text-zerodha-muted hover:text-zerodha-heading'
            }`}
            title="Projects Gallery"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

