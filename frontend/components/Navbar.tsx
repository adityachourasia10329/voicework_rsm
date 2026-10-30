'use client';

import React from 'react';
import Link from 'next/link';
import { Waves, Plus, Layers, LayoutDashboard, FolderKanban, SlidersHorizontal, Cpu, Activity } from 'lucide-react';

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
    <header className="sticky top-0 z-50 w-full bg-[#0D0E15]/80 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo with Futuristic Superlist Accent */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF4D36] via-[#FF5DB1] to-[#6B70F0] p-[1.5px] shadow-[0_0_20px_rgba(255,77,54,0.35)] group-hover:shadow-[0_0_28px_rgba(255,77,54,0.5)] transition-all">
            <div className="w-full h-full bg-[#12131C] rounded-[10px] flex items-center justify-center text-[#FF4D36] group-hover:text-white transition-colors">
              <Waves className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-heading font-bold text-lg tracking-tight text-white group-hover:text-[#FF7A59] transition-colors">
              VoiceWork
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-[#9FA4B8] border border-white/[0.1] font-semibold tracking-wider">
              RSM
            </span>
          </div>
        </Link>

        {/* Center Futuristic Pill Navigation */}
        <div className="flex items-center space-x-6">
          <nav className="flex items-center p-1 rounded-full bg-[#161726]/80 border border-white/[0.08] backdrop-blur-md shadow-inner">
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1.5 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-[#FF4D36] to-[#FF7A59] text-white shadow-[0_0_15px_rgba(255,77,54,0.4)] font-semibold'
                  : 'text-[#9FA4B8] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => handleNavClick('gallery')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1.5 transition-all ${
                activeTab === 'gallery'
                  ? 'bg-[#6B70F0] text-white shadow-[0_0_15px_rgba(107,112,240,0.4)] font-semibold'
                  : 'text-[#9FA4B8] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Gallery</span>
              {projectCount !== undefined && (
                <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/20 text-white font-bold">
                  {projectCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('editor')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1.5 transition-all ${
                activeTab === 'editor'
                  ? 'bg-gradient-to-r from-[#6B70F0] to-[#FF5DB1] text-white shadow-[0_0_15px_rgba(255,93,177,0.4)] font-semibold'
                  : 'text-[#9FA4B8] hover:text-white hover:bg-white/[0.04]'
              }`}
              title="Open Editor Space"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Editor</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[#FF4D36]/20 text-[#FF7A59] border border-[#FF4D36]/30 font-bold uppercase">
                Studio
              </span>
            </button>
          </nav>

          {/* Real-time Architecture Status Indicator (bpssite telemetry style) */}
          <div className="hidden lg:flex items-center space-x-4 pl-2">
            <div className="status-indicator-box">
              <span className="status-dot-pulse" />
              <span>TIER 1 HOT CACHE &lt; 3ms</span>
            </div>
            
            <div className="flex items-center space-x-1.5 text-[11px] font-mono text-[#9FA4B8] bg-white/[0.03] px-2.5 py-1 rounded-full border border-white/[0.06]">
              <Cpu className="w-3 h-3 text-[#258BF5]" />
              <span>BS-RoFormer v2</span>
            </div>
          </div>
        </div>

        {/* Right CTA - Superlist Coral Button with Glow */}
        <div className="flex items-center space-x-3">
          {onOpenIngest && (
            <button
              onClick={onOpenIngest}
              className="btn-coral px-4 py-2 rounded-xl font-medium text-xs flex items-center space-x-1.5 shadow-[0_4px_20px_rgba(255,77,54,0.35)] hover:shadow-[0_6px_28px_rgba(255,77,54,0.5)] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="font-semibold tracking-wide">Ingest Media</span>
            </button>
          )}

          <button
            onClick={() => handleNavClick('gallery')}
            className={`p-2 rounded-xl border transition-all ${
              activeTab === 'gallery'
                ? 'border-[#6B70F0] bg-[#6B70F0]/15 text-white shadow-[0_0_12px_rgba(107,112,240,0.3)]'
                : 'border-white/[0.08] bg-[#161726]/60 hover:bg-white/[0.06] text-[#9FA4B8] hover:text-white'
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
