'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar, NavTab } from '../components/Navbar';
import { ProjectGallery } from '../components/ProjectGallery';
import { OurChannelView } from '../components/OurChannelView';
import { IngestionModal } from '../components/IngestionModal';
import { INITIAL_PROJECTS } from '../lib/mockData';
import { ProjectState } from '../lib/types';
import {
  UploadCloud,
  Youtube,
  FolderKanban,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  FileAudio,
  Activity,
  Zap,
  Radio,
  SlidersHorizontal,
  Clock,
  Play,
  LayoutDashboard
} from 'lucide-react';

export default function HomePage() {
  const [projects, setProjects] = useState<ProjectState[]>(INITIAL_PROJECTS);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [ytUrl, setYtUrl] = useState('');

  // Sync tab with URL search parameter if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'gallery') {
        setActiveTab('gallery');
      } else if (tabParam === 'dashboard') {
        setActiveTab('dashboard');
      } else if (tabParam === 'channel') {
        setActiveTab('channel');
      } else if (tabParam === 'editor') {
        window.location.href = '/editor';
      }
    }
  }, []);

  const handleTabChange = (tab: NavTab) => {
    if (tab === 'editor') {
      window.location.href = '/editor';
      return;
    }
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleProjectCreated = (newProject: ProjectState) => {
    setProjects([newProject, ...projects]);
    setActiveTab('gallery');
  };

  const handleQuickYoutubeIngest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytUrl.trim()) return;
    setIsIngestOpen(true);
  };

  return (
    <div className="min-h-screen text-[#F3F4F8] font-sans">
      <Navbar
        onOpenIngest={() => setIsIngestOpen(true)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        projectCount={projects.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
        
        {/* ============================================================ */}
        {/* GALLERY, DASHBOARD & OUR CHANNEL LEVEL SWITCHER ROW          */}
        {/* ============================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/[0.08]">
          <div className="flex flex-wrap items-center gap-2 bg-[#12131C] p-1.5 rounded-2xl border border-white/[0.08] shadow-inner">
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-heading font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-[#FF4D36] to-[#FF7A59] text-white shadow-[0_0_18px_rgba(255,77,54,0.45)]'
                  : 'text-[#9FA4B8] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => handleTabChange('gallery')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-heading font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'gallery'
                  ? 'bg-[#6B70F0] text-white shadow-[0_0_18px_rgba(107,112,240,0.45)]'
                  : 'text-[#9FA4B8] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Projects Gallery</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-white font-bold ml-1">
                {projects.length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('channel')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-heading font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'channel'
                  ? 'bg-gradient-to-r from-red-600 via-[#FF4D36] to-[#FF7A59] text-white shadow-[0_0_18px_rgba(255,0,0,0.45)]'
                  : 'text-[#9FA4B8] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Youtube className="w-4 h-4 text-red-500 fill-red-500/20" />
              <span>Our Channel</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold ml-1 hidden md:inline">
                @rsmglobalsatsang
              </span>
            </button>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono text-[#9FA4B8]">
            <span className="hidden sm:inline">Active Level:</span>
            <span className="text-white font-bold px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] uppercase tracking-wider text-[11px]">
              {activeTab === 'dashboard'
                ? 'Studio Dashboard'
                : activeTab === 'channel'
                ? 'RSM Global Satsang (@rsmglobalsatsang)'
                : 'Projects Gallery'}
            </span>
          </div>
        </div>

        {activeTab === 'dashboard' ? (
          /* ============================================================ */
          /* DASHBOARD VIEW (Futuristic Workstation & Superlist Hero)     */
          /* ============================================================ */
          <div className="space-y-10 max-w-5xl mx-auto">
            {/* Grounded Futuristic Hero Section (Superlist Style) */}
            <div className="text-center max-w-3xl mx-auto pt-2 pb-4">
              
              {/* Telemetry Badge */}
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-[#9FA4B8] mb-5 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#27A376] shadow-[0_0_8px_#27A376]" />
                <span className="text-white font-medium">NEURAL SEPARATION ENGINE v2.0</span>
                <span className="text-[#646982]">•</span>
                <span className="text-[#FF7A59]">SUB-3MS HOT STORE</span>
              </div>

              {/* Headline with Superpower Gradient (Attached Photo 2) */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-white leading-[1.1]">
                Audio Separation with{' '}
                <span className="text-superpower drop-shadow-[0_0_35px_rgba(255,77,54,0.35)]">
                  Superpowers
                </span>
              </h1>

              <p className="mt-4 text-base sm:text-lg text-[#9FA4B8] leading-relaxed max-w-2xl mx-auto">
                Next-generation stem demixing powered by BS-RoFormer &amp; DeepFilterNet3. 
                Surgical visual spectrogram editing and zero-loss video remuxing without stream re-encoding.
              </p>

              {/* Action Buttons in Superlist Palette */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
                <button
                  onClick={() => setIsIngestOpen(true)}
                  className="btn-coral px-6 py-3 rounded-xl font-semibold text-sm flex items-center space-x-2 shadow-[0_4px_24px_rgba(255,77,54,0.4)] hover:shadow-[0_8px_32px_rgba(255,77,54,0.6)] transition-all"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Ingest New Media</span>
                  <ArrowRight className="w-4 h-4 ml-0.5 opacity-80" />
                </button>

                <button
                  onClick={() => handleTabChange('gallery')}
                  className="glass-panel px-6 py-3 rounded-xl text-sm font-medium text-white hover:bg-white/[0.08] hover:border-white/[0.2] transition-all flex items-center space-x-2"
                >
                  <FolderKanban className="w-4 h-4 text-[#6B70F0]" />
                  <span>Projects Gallery ({projects.length})</span>
                </button>

                <button
                  onClick={() => handleTabChange('channel')}
                  className="px-6 py-3 rounded-xl text-sm font-semibold text-white border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-all flex items-center space-x-2 shadow-[0_4px_20px_rgba(255,0,0,0.25)]"
                >
                  <Youtube className="w-4 h-4 text-red-500 fill-red-500/20" />
                  <span>Our Channel Feed</span>
                </button>

                <button
                  onClick={() => handleTabChange('editor')}
                  className="btn-purple px-6 py-3 rounded-xl text-sm font-semibold text-white flex items-center space-x-2 shadow-[0_4px_24px_rgba(107,112,240,0.35)] hover:shadow-[0_8px_32px_rgba(107,112,240,0.55)] transition-all"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Launch Studio Editor</span>
                </button>
              </div>
            </div>

            {/* Ingestion & Workstation Launchpad Grid (Futuristic Glass Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: Direct File Ingestion (Coral Border Glow) */}
              <div className="glass-panel-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4D36]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#FF4D36]/20 transition-all" />
                
                <div>
                  <div className="flex items-center space-x-2.5 text-[#FF7A59] mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FF4D36]/15 border border-[#FF4D36]/30 flex items-center justify-center text-[#FF4D36]">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-heading font-bold text-white">Direct Media Upload</h3>
                      <span className="text-[10px] font-mono text-[#9FA4B8] tracking-wider uppercase">Lossless Demuxing Engine</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#9FA4B8] leading-relaxed">
                    Upload arbitrary length video or audio files. Zero-loss PCM 16-bit 44.1kHz audio extraction with automated 60s chunking guard against OOM.
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {['MP4', 'MOV', 'MKV', 'WAV', 'FLAC', 'MP3'].map((ext) => (
                      <span
                        key={ext}
                        className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-white/[0.04] text-[#E0E2EC] border border-white/[0.08]"
                      >
                        {ext}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs text-[#9FA4B8] font-mono">Max size: Unlimited &bull; 60s Crossfade</span>
                  <button
                    onClick={() => setIsIngestOpen(true)}
                    className="btn-coral px-4 py-2 rounded-xl text-xs font-semibold"
                  >
                    Select File
                  </button>
                </div>
              </div>

              {/* Card 2: Remote YouTube Stream Ingestion (Purple/Pink Glow) */}
              <div className="glass-panel-card p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#6B70F0]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#6B70F0]/20 transition-all" />

                <div>
                  <div className="flex items-center space-x-2.5 text-[#6B70F0] mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#6B70F0]/15 border border-[#6B70F0]/30 flex items-center justify-center text-[#6B70F0]">
                      <Youtube className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-heading font-bold text-white">YouTube Stream Extractor</h3>
                      <span className="text-[10px] font-mono text-[#9FA4B8] tracking-wider uppercase">Headless yt-dlp Core</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#9FA4B8] leading-relaxed">
                    Ingest podcasts, interviews, or lectures directly from YouTube. Stream demuxing at full fidelity with synchronized audio metadata.
                  </p>

                  <form onSubmit={handleQuickYoutubeIngest} className="mt-4 flex gap-2">
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={ytUrl}
                      onChange={(e) => setYtUrl(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-white/[0.1] bg-[#12131C] text-white placeholder-[#646982] focus:outline-none focus:border-[#6B70F0] focus:ring-1 focus:ring-[#6B70F0] font-mono transition-all"
                    />
                    <button
                      type="submit"
                      className="btn-purple px-4 py-2 rounded-xl text-xs font-semibold"
                    >
                      Extract
                    </button>
                  </form>
                </div>

                <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#9FA4B8]">Stream Demux: 44.1kHz PCM</span>
                  <div className="flex items-center space-x-1.5 text-[#27A376]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#27A376] shadow-[0_0_6px_#27A376]" />
                    <span className="font-semibold text-[11px]">ONLINE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Projects Quick Access Banner */}
            <div className="glass-panel-elevated p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
              <div className="absolute -left-10 top-0 bottom-0 w-24 bg-gradient-to-r from-[#6B70F0]/20 to-transparent pointer-events-none" />
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#6B70F0]/15 border border-[#6B70F0]/30 flex items-center justify-center text-[#6B70F0] shadow-[0_0_15px_rgba(107,112,240,0.25)] flex-shrink-0">
                  <FolderKanban className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-heading font-bold text-white">
                    {projects.length} Workspaces in Hot Cache Repository
                  </h4>
                  <p className="text-xs text-[#9FA4B8] mt-0.5 max-w-xl">
                    Multi-stem isolated sessions ready for spectrogram frequency inspection, surgical time-bracket flagging, and video remuxing.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleTabChange('gallery')}
                className="btn-purple px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 flex-shrink-0"
              >
                <span>View in Gallery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Core Pipeline Architecture Specs Strip */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
                <div className="text-xs font-mono font-bold text-[#9FA4B8] uppercase tracking-wider flex items-center space-x-2">
                  <Cpu className="w-3.5 h-3.5 text-[#258BF5]" />
                  <span>Core Engine Specifications &bull; Architectural Modules</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-[#27A376] border border-[#27A376]/30 font-semibold">
                  SOTA BENCHMARKS VERIFIED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#FF4D36]/30 transition-colors">
                  <div className="font-heading font-bold text-white text-sm flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF4D36]" />
                    <span>FFmpeg Stream Copy</span>
                  </div>
                  <div className="text-[#9FA4B8] mt-2 font-mono text-[11px] leading-relaxed">
                    Zero quality loss video remuxing via <code className="text-white font-semibold">-c:v copy</code>. Video streams untouched and bit-identical.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#6B70F0]/30 transition-colors">
                  <div className="font-heading font-bold text-white text-sm flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#6B70F0]" />
                    <span>OOM Chunking Guard</span>
                  </div>
                  <div className="text-[#9FA4B8] mt-2 font-mono text-[11px] leading-relaxed">
                    60s sliding windows with 2.0s crossfades. Smooth phase stitching preventing GPU memory overflow on 2h+ master files.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#27A376]/30 transition-colors">
                  <div className="font-heading font-bold text-white text-sm flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#27A376]" />
                    <span>Surgical Patching</span>
                  </div>
                  <div className="text-[#9FA4B8] mt-2 font-mono text-[11px] leading-relaxed">
                    Diagnostic time-bracket micro-inference. Re-evaluates only targeted intervals without re-rendering entire tracks.
                  </div>
                </div>

              </div>
            </div>

          </div>
        ) : activeTab === 'channel' ? (
          /* ============================================================ */
          /* OUR CHANNEL VIEW (RSM Global Satsang Official Hub)           */
          /* ============================================================ */
          <OurChannelView onOpenIngest={() => setIsIngestOpen(true)} />
        ) : (
          /* ============================================================ */
          /* GALLERY VIEW (Projects Repository)                           */
          /* ============================================================ */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Projects Gallery</h1>
                <p className="text-xs text-[#9FA4B8] mt-1 font-mono">
                  Browse and launch all active multi-stem project repositories and editor sessions synced with Redis Hot Cache.
                </p>
              </div>

              <button
                onClick={() => setIsIngestOpen(true)}
                className="btn-coral px-4 py-2.5 rounded-xl text-xs font-semibold shadow-[0_4px_20px_rgba(255,77,54,0.35)] flex items-center space-x-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Ingest Media</span>
              </button>
            </div>

            <ProjectGallery
              projects={projects}
              onOpenIngest={() => setIsIngestOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Ingestion Modal */}
      <IngestionModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
