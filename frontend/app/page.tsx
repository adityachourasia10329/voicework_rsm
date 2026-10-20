'use client';

import React, { useState, useEffect } from 'react';
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
  FileAudio
} from 'lucide-react';

export default function HomePage() {
  const [projects, setProjects] = useState<ProjectState[]>(INITIAL_PROJECTS);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'gallery'>('dashboard');
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
      }
    }
  }, []);

  const handleTabChange = (tab: 'dashboard' | 'gallery') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleProjectCreated = (newProject: ProjectState) => {
    setProjects([newProject, ...projects]);
    setActiveTab('gallery'); // Jump directly to gallery to see the new project
  };

  const handleQuickYoutubeIngest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytUrl.trim()) return;
    setIsIngestOpen(true);
  };

  return (
    <div className="min-h-screen bg-zerodha-bg">
      <Navbar
        onOpenIngest={() => setIsIngestOpen(true)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        projectCount={projects.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        {activeTab === 'dashboard' ? (
          /* ============================================================ */
          /* DASHBOARD VIEW (Clean Zerodha Workstation & Quick Launch)    */
          /* ============================================================ */
          <div className="space-y-8 max-w-5xl mx-auto">
            {/* Zerodha Style Clean Hero Section */}
            <div className="text-center max-w-3xl mx-auto pt-4 pb-2">
              <h1 className="text-3xl sm:text-4xl font-semibold text-zerodha-heading tracking-tight leading-tight">
                High-fidelity audio separation &amp; video remuxing
              </h1>
              <p className="mt-3 text-sm sm:text-base text-zerodha-muted leading-relaxed">
                Enterprise neural stem isolation powered by BS-RoFormer &amp; DeepFilterNet3.
                Extract pristine speech, eliminate acoustic noise, and remux master video without stream re-encoding.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setIsIngestOpen(true)}
                  className="px-6 py-2.5 rounded bg-zerodha-blue hover:bg-zerodha-blue-hover text-white text-sm font-medium shadow-sm transition-all flex items-center space-x-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Ingest new media</span>
                </button>
                <button
                  onClick={() => handleTabChange('gallery')}
                  className="px-6 py-2.5 rounded border border-zerodha-border bg-white hover:bg-gray-50 text-zerodha-text text-sm font-medium transition-all flex items-center space-x-2"
                >
                  <FolderKanban className="w-4 h-4 text-zerodha-blue" />
                  <span>Open Projects Gallery ({projects.length})</span>
                </button>
              </div>
            </div>

            {/* Ingestion & Workstation Launchpad Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Direct File Ingestion */}
              <div className="bg-white p-6 rounded border border-zerodha-border shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-zerodha-blue mb-2">
                    <UploadCloud className="w-5 h-5" />
                    <h3 className="text-sm font-semibold text-zerodha-heading">Direct Media Upload</h3>
                  </div>
                  <p className="text-xs text-zerodha-muted leading-relaxed">
                    Upload arbitrary length video or audio files. Zero-loss PCM extraction with automated 60s chunking guard against OOM.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {['MP4', 'MOV', 'MKV', 'WAV', 'FLAC', 'MP3'].map((ext) => (
                      <span key={ext} className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                        {ext}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-zerodha-muted font-mono">Max size: Unlimited</span>
                  <button
                    onClick={() => setIsIngestOpen(true)}
                    className="px-4 py-1.5 rounded bg-zerodha-blue hover:bg-zerodha-blue-hover text-white text-xs font-medium transition-colors"
                  >
                    Select File
                  </button>
                </div>
              </div>

              {/* Card 2: Remote YouTube Stream Ingestion */}
              <div className="bg-white p-6 rounded border border-zerodha-border shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-red-600 mb-2">
                    <Youtube className="w-5 h-5" />
                    <h3 className="text-sm font-semibold text-zerodha-heading">YouTube Stream Extractor</h3>
                  </div>
                  <p className="text-xs text-zerodha-muted leading-relaxed">
                    Ingest podcasts, interviews, or lectures directly from YouTube. Lossless demuxing via <code className="text-gray-800 font-mono">yt-dlp</code>.
                  </p>
                  <form onSubmit={handleQuickYoutubeIngest} className="mt-4 flex gap-2">
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={ytUrl}
                      onChange={(e) => setYtUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded border border-zerodha-border bg-gray-50 focus:bg-white text-zerodha-heading focus:outline-none focus:border-zerodha-blue font-mono"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded bg-zerodha-blue hover:bg-zerodha-blue-hover text-white text-xs font-medium transition-colors"
                    >
                      Extract
                    </button>
                  </form>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-zerodha-muted font-mono">
                  <span>Stream Demux: 44.1kHz / 16-bit PCM</span>
                  <span className="text-zerodha-green font-semibold">&bull; Online</span>
                </div>
              </div>
            </div>

            {/* Active Projects Quick Access Banner */}
            <div className="bg-white p-6 rounded border border-zerodha-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-zerodha-blue">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zerodha-heading">
                    {projects.length} Projects in Hot Cache Repository
                  </h4>
                  <p className="text-xs text-zerodha-muted mt-0.5">
                    Multi-stem isolated sessions ready for spectrogram frequency inspection and video remuxing.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleTabChange('gallery')}
                className="px-5 py-2 rounded bg-zerodha-blue hover:bg-zerodha-blue-hover text-white text-xs font-medium shadow-sm transition-all flex items-center justify-center space-x-1.5 flex-shrink-0"
              >
                <span>View in Gallery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Clean Pipeline Architecture Specs Strip */}
            <div className="bg-white rounded border border-zerodha-border p-5 shadow-sm">
              <div className="text-xs font-semibold text-zerodha-heading uppercase tracking-wider mb-3">
                Core Engine Specifications
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded bg-gray-50 border border-gray-100">
                  <div className="font-semibold text-zerodha-heading">FFmpeg Stream Copy</div>
                  <div className="text-zerodha-muted mt-1 font-mono text-[11px]">
                    Zero quality loss video remuxing via <code className="text-gray-800">-c:v copy</code>. Video streams untouched.
                  </div>
                </div>

                <div className="p-3 rounded bg-gray-50 border border-gray-100">
                  <div className="font-semibold text-zerodha-heading">OOM Chunking Guard</div>
                  <div className="text-zerodha-muted mt-1 font-mono text-[11px]">
                    60s sliding windows with 2.0s crossfading. Smooth phase stitching with no boundary clicks.
                  </div>
                </div>

                <div className="p-3 rounded bg-gray-50 border border-gray-100">
                  <div className="font-semibold text-zerodha-heading">Multi-Band Frequency Waves</div>
                  <div className="text-zerodha-muted mt-1 font-mono text-[11px]">
                    Decomposed audio waves across identified frequency spectrums with surgical micro-inference.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* GALLERY VIEW (All Projects Repository & All Panel Visible)   */
          /* ============================================================ */
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h1 className="text-2xl font-semibold text-zerodha-heading tracking-tight">Projects Gallery</h1>
                <p className="text-xs text-zerodha-muted mt-0.5">
                  Browse and launch all active multi-stem project repositories and editor sessions.
                </p>
              </div>

              <button
                onClick={() => setIsIngestOpen(true)}
                className="px-4 py-2 rounded bg-zerodha-blue hover:bg-zerodha-blue-hover text-white text-xs font-medium shadow-sm transition-all flex items-center space-x-1.5"
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

