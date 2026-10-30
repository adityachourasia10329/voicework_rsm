'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '../components/Navbar';
import { ProjectGallery } from '../components/ProjectGallery';
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
  Search,
  X,
  Clock,
  Play,
  Filter
} from 'lucide-react';

export default function HomePage() {
  const [projects, setProjects] = useState<ProjectState[]>(INITIAL_PROJECTS);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'gallery' | 'editor'>('dashboard');
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [ytUrl, setYtUrl] = useState('');

  // Global Top-Level Search & Filter State (above dashboard & gallery)
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [activeStemFilter, setActiveStemFilter] = useState<'ALL' | 'SPEECH' | 'TRAFFIC' | 'CROWD' | 'MUSIC'>('ALL');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync tab with URL search parameter if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'gallery') {
        setActiveTab('gallery');
      } else if (tabParam === 'dashboard') {
        setActiveTab('dashboard');
      } else if (tabParam === 'editor') {
        window.location.href = '/editor';
      }
    }
  }, []);

  // Keyboard shortcut for quick search focus (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTabChange = (tab: 'dashboard' | 'gallery' | 'editor') => {
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

  // Filter projects by global search query and selected stem category
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = globalSearchQuery.toLowerCase().trim();
      const matchesText =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.sourceType.toLowerCase().includes(q) ||
        p.stems.some((s) => s.label.toLowerCase().includes(q) || s.type.toLowerCase().includes(q));

      const matchesStem =
        activeStemFilter === 'ALL' ||
        (activeStemFilter === 'SPEECH' && p.stems.some((s) => s.type.includes('SPEECH'))) ||
        (activeStemFilter === 'TRAFFIC' && p.stems.some((s) => s.type.includes('TRAFFIC'))) ||
        (activeStemFilter === 'CROWD' && p.stems.some((s) => s.type.includes('CROWD'))) ||
        (activeStemFilter === 'MUSIC' && p.stems.some((s) => s.type.includes('MUSIC')));

      return matchesText && matchesStem;
    });
  }, [projects, globalSearchQuery, activeStemFilter]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
        {/* GLOBAL COMMAND & SEARCH BAR (Above Dashboard & Gallery Level)*/}
        {/* ============================================================ */}
        <section className="mb-8 relative z-30" aria-label="Global Workspace Search">
          <div className="glass-panel rounded-2xl p-2 sm:p-2.5 border border-white/[0.08] shadow-2xl transition-all focus-within:border-[#FF4D36]/50 focus-within:shadow-[0_0_30px_rgba(255,77,54,0.18)]">
            <div className="flex flex-col md:flex-row md:items-center gap-2.5">
              
              {/* Search Input Container */}
              <div className="relative flex-1 flex items-center">
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#FF4D36] ml-1 flex-shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search projects, stems, noise profiles, models (e.g. Lex Fridman, Traffic, BS-RoFormer, 44.1kHz)..."
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full bg-transparent pl-3 pr-20 py-2.5 text-xs sm:text-sm text-white placeholder-[#646982] focus:outline-none font-sans"
                />

                {/* Clear or Shortcut Pill */}
                <div className="absolute right-3 flex items-center space-x-1.5">
                  {globalSearchQuery ? (
                    <button
                      onClick={() => setGlobalSearchQuery('')}
                      className="p-1 rounded-md text-[#9FA4B8] hover:text-white hover:bg-white/[0.08] transition-colors"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <kbd className="hidden sm:inline-flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-[#9FA4B8] border border-white/[0.08]">
                      <span>Ctrl</span>
                      <span>+</span>
                      <span>K</span>
                    </kbd>
                  )}
                </div>
              </div>

              {/* Quick Stem Filter Chips (Superlist Palette) */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 px-1 border-t md:border-t-0 md:border-l border-white/[0.06] md:pl-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#646982] hidden lg:inline mr-1">
                  Filter:
                </span>
                
                <button
                  onClick={() => setActiveStemFilter('ALL')}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-medium transition-all flex-shrink-0 ${
                    activeStemFilter === 'ALL'
                      ? 'bg-white text-[#0D0E15] font-bold shadow-sm'
                      : 'bg-white/[0.04] text-[#9FA4B8] hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  All ({projects.length})
                </button>

                <button
                  onClick={() => setActiveStemFilter('SPEECH')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono font-medium transition-all flex-shrink-0 flex items-center space-x-1 ${
                    activeStemFilter === 'SPEECH'
                      ? 'bg-[#27A376] text-white font-bold shadow-[0_0_12px_rgba(39,163,118,0.4)]'
                      : 'bg-[#27A376]/10 text-[#33C287] hover:bg-[#27A376]/20'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#27A376]" />
                  <span>Speech</span>
                </button>

                <button
                  onClick={() => setActiveStemFilter('TRAFFIC')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono font-medium transition-all flex-shrink-0 flex items-center space-x-1 ${
                    activeStemFilter === 'TRAFFIC'
                      ? 'bg-[#FF4D36] text-white font-bold shadow-[0_0_12px_rgba(255,77,54,0.4)]'
                      : 'bg-[#FF4D36]/10 text-[#FF7A59] hover:bg-[#FF4D36]/20'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D36]" />
                  <span>Traffic</span>
                </button>

                <button
                  onClick={() => setActiveStemFilter('CROWD')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono font-medium transition-all flex-shrink-0 flex items-center space-x-1 ${
                    activeStemFilter === 'CROWD'
                      ? 'bg-[#258BF5] text-white font-bold shadow-[0_0_12px_rgba(37,139,245,0.4)]'
                      : 'bg-[#258BF5]/10 text-[#429CFF] hover:bg-[#258BF5]/20'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#258BF5]" />
                  <span>Crowd</span>
                </button>

                <button
                  onClick={() => setActiveStemFilter('MUSIC')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono font-medium transition-all flex-shrink-0 flex items-center space-x-1 ${
                    activeStemFilter === 'MUSIC'
                      ? 'bg-[#6B70F0] text-white font-bold shadow-[0_0_12px_rgba(107,112,240,0.4)]'
                      : 'bg-[#6B70F0]/10 text-[#8E93FF] hover:bg-[#6B70F0]/20'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6B70F0]" />
                  <span>Music</span>
                </button>
              </div>

            </div>

            {/* Live Instant Search Matches Dropdown (when query or active filter is active on dashboard) */}
            {(globalSearchQuery.trim().length > 0 || activeStemFilter !== 'ALL') && (
              <div className="mt-2.5 pt-2.5 border-t border-white/[0.08] px-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center space-x-2 text-[#9FA4B8]">
                  <span>Found</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FF4D36]/15 text-[#FF7A59] font-bold">
                    {filteredProjects.length} matching workspace{filteredProjects.length === 1 ? '' : 's'}
                  </span>
                  {globalSearchQuery && (
                    <span>for &ldquo;<span className="text-white font-semibold">{globalSearchQuery}</span>&rdquo;</span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleTabChange('gallery')}
                    className="text-[#6B70F0] hover:text-[#8E93FF] font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <span>View all in Gallery</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setGlobalSearchQuery('');
                      setActiveStemFilter('ALL');
                    }}
                    className="text-[#9FA4B8] hover:text-white transition-colors"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

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
                  <span>Projects Gallery ({filteredProjects.length})</span>
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
                    {filteredProjects.length} Workspaces in Hot Cache Repository
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
              projects={filteredProjects}
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
