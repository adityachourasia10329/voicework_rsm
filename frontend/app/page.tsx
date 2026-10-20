'use client';

import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { ProjectGallery } from '../components/ProjectGallery';
import { IngestionModal } from '../components/IngestionModal';
import { INITIAL_PROJECTS } from '../lib/mockData';
import { ProjectState } from '../lib/types';
import { Database, Cpu, Film, ShieldCheck, ArrowRight, UploadCloud } from 'lucide-react';

export default function HomePage() {
  const [projects, setProjects] = useState<ProjectState[]>(INITIAL_PROJECTS);
  const [isIngestOpen, setIsIngestOpen] = useState(false);

  const handleProjectCreated = (newProject: ProjectState) => {
    setProjects([newProject, ...projects]);
  };

  return (
    <div className="min-h-screen bg-zerodha-bg">
      <Navbar onOpenIngest={() => setIsIngestOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        {/* Zerodha Style Clean Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h1 className="text-3xl sm:text-4xl font-semibold text-zerodha-heading tracking-tight leading-tight">
            High-fidelity audio separation &amp; video remuxing
          </h1>
          <p className="mt-3 text-base text-zerodha-muted leading-relaxed">
            Enterprise audio isolation pipeline powered by BS-RoFormer &amp; DeepFilterNet3.
            Extract speech, remove environmental noise, and remux master video without quality loss.
          </p>

          <div className="mt-6 flex items-center justify-center space-x-4">
            <button
              onClick={() => setIsIngestOpen(true)}
              className="px-6 py-2.5 rounded bg-zerodha-blue hover:bg-zerodha-blue-hover text-white text-sm font-medium shadow-sm transition-all"
            >
              Ingest new media
            </button>
            <a
              href="#projects-section"
              className="px-6 py-2.5 rounded border border-zerodha-border bg-white hover:bg-gray-50 text-zerodha-text text-sm font-medium transition-all"
            >
              Browse active projects
            </a>
          </div>
        </div>

        {/* System Architecture Metrics - Clean Zerodha Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white p-4 rounded border border-zerodha-border shadow-sm">
            <div className="flex items-center space-x-2 text-zerodha-blue mb-1">
              <Database className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zerodha-muted">In-Memory Cache</span>
            </div>
            <div className="text-xl font-bold text-zerodha-heading">&lt; 3ms</div>
            <p className="text-xs text-zerodha-muted mt-0.5">Hot state query latency</p>
          </div>

          <div className="bg-white p-4 rounded border border-zerodha-border shadow-sm">
            <div className="flex items-center space-x-2 text-zerodha-blue mb-1">
              <Cpu className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zerodha-muted">Chunking Engine</span>
            </div>
            <div className="text-xl font-bold text-zerodha-heading">No Limit</div>
            <p className="text-xs text-zerodha-muted mt-0.5">30m to 2h+ files supported</p>
          </div>

          <div className="bg-white p-4 rounded border border-zerodha-border shadow-sm">
            <div className="flex items-center space-x-2 text-zerodha-blue mb-1">
              <Film className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zerodha-muted">Video Remuxing</span>
            </div>
            <div className="text-xl font-bold text-zerodha-heading">Zero Loss</div>
            <p className="text-xs text-zerodha-muted mt-0.5">FFmpeg stream copy (-c:v copy)</p>
          </div>

          <div className="bg-white p-4 rounded border border-zerodha-border shadow-sm">
            <div className="flex items-center space-x-2 text-zerodha-blue mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zerodha-muted">Surgical Patch</span>
            </div>
            <div className="text-xl font-bold text-zerodha-heading">2s Crossfade</div>
            <p className="text-xs text-zerodha-muted mt-0.5">Targeted micro-inference</p>
          </div>
        </div>

        {/* Enterprise Projects Section */}
        <div id="projects-section">
          <ProjectGallery
            projects={projects}
            onOpenIngest={() => setIsIngestOpen(true)}
          />
        </div>
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
