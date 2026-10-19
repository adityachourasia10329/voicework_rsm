'use client';

import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { ProjectGallery } from '../components/ProjectGallery';
import { IngestionModal } from '../components/IngestionModal';
import { INITIAL_PROJECTS } from '../lib/mockData';
import { ProjectState } from '../lib/types';
import { Cpu, Zap, Database, Film, ShieldCheck, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [projects, setProjects] = useState<ProjectState[]>(INITIAL_PROJECTS);
  const [isIngestOpen, setIsIngestOpen] = useState(false);

  const handleProjectCreated = (newProject: ProjectState) => {
    setProjects([newProject, ...projects]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onOpenIngest={() => setIsIngestOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden glass-panel border border-border p-8 md:p-12 mb-10 glow-indigo">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent font-mono text-xs font-semibold mb-4">
              <Zap className="w-3.5 h-3.5" />
              <span>Next-Gen Audio Intelligence &bull; BS-RoFormer &bull; DeepFilterNet3</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Enterprise Audio Separation &amp; <br />
              <span className="bg-gradient-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Zero-Loss Video Remuxing
              </span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
              Engineered for broadcast streams, podcasts, and field recordings of arbitrary duration.
              Isolate speech, traffic, and crowd layers, perform surgical time-bracket re-processing,
              and remux video without re-encoding.
            </p>

            {/* Architecture Highlights Pill Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-border/60">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-surface border border-border text-emerald-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-mono font-bold text-white">&lt; 3ms Cache</div>
                  <div className="text-[10px] text-gray-400">Redis Tier 1 Hot State</div>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-surface border border-border text-purple-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-mono font-bold text-white">No Duration Limit</div>
                  <div className="text-[10px] text-gray-400">60s Overlap Chunker</div>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-surface border border-border text-blue-400">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-mono font-bold text-white">Stream Copy</div>
                  <div className="text-[10px] text-gray-400">FFmpeg -c:v copy</div>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-surface border border-border text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-mono font-bold text-white">Surgical Patching</div>
                  <div className="text-[10px] text-gray-400">Sub-Segment Recheck</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise Projects Gallery */}
        <ProjectGallery
          projects={projects}
          onOpenIngest={() => setIsIngestOpen(true)}
        />
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
