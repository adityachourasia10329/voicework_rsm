'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProjectState } from '../lib/types';
import { Sliders, Download, Archive, Clock, Video, Search, Filter, CheckCircle2 } from 'lucide-react';

interface ProjectGalleryProps {
  projects: ProjectState[];
  onOpenIngest: () => void;
}

export const ProjectGallery: React.FC<ProjectGalleryProps> = ({ projects, onOpenIngest }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterType === 'ALL') return matchesSearch;
    if (filterType === 'VIDEO') return matchesSearch && p.mediaContainer.hasVideo;
    if (filterType === 'AUDIO') return matchesSearch && !p.mediaContainer.hasVideo;
    return matchesSearch;
  });

  return (
    <div className="bg-white rounded border border-zerodha-border shadow-sm p-6">
      {/* Header & Filter Controls - Zerodha Console Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zerodha-border">
        <div>
          <h2 className="text-lg font-semibold text-zerodha-heading">Projects repository</h2>
          <p className="text-xs text-zerodha-muted mt-0.5">
            Active audio workloads synced with Tier 1 in-memory hot cache.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded border border-zerodha-border bg-gray-50 focus:bg-white text-zerodha-heading focus:outline-none focus:border-zerodha-blue w-48 sm:w-64"
            />
          </div>

          <div className="flex rounded border border-zerodha-border overflow-hidden text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 font-medium transition-colors ${
                filterType === 'ALL' ? 'bg-zerodha-blue text-white' : 'bg-white text-zerodha-muted hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('VIDEO')}
              className={`px-3 py-1.5 font-medium border-l border-zerodha-border transition-colors ${
                filterType === 'VIDEO' ? 'bg-zerodha-blue text-white' : 'bg-white text-zerodha-muted hover:bg-gray-50'
              }`}
            >
              Video
            </button>
            <button
              onClick={() => setFilterType('AUDIO')}
              className={`px-3 py-1.5 font-medium border-l border-zerodha-border transition-colors ${
                filterType === 'AUDIO' ? 'bg-zerodha-blue text-white' : 'bg-white text-zerodha-muted hover:bg-gray-50'
              }`}
            >
              Audio
            </button>
          </div>
        </div>
      </div>

      {/* Projects List / Cards */}
      {filteredProjects.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-zerodha-muted">No projects found matching your search.</p>
          <button
            onClick={onOpenIngest}
            className="mt-3 px-4 py-2 rounded bg-zerodha-blue text-white text-xs font-medium"
          >
            Ingest new media
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {filteredProjects.map((project) => (
            <div
              key={project.projectId}
              className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors -mx-6 px-6"
            >
              {/* Left Details */}
              <div className="flex items-start space-x-4">
                <div className="w-20 h-14 rounded overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                  <img
                    src={project.mediaContainer.thumbnailUrl || '/thumbnails/default.jpg'}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/editor/${project.projectId}`}
                      className="text-sm font-semibold text-zerodha-heading hover:text-zerodha-blue transition-colors line-clamp-1"
                    >
                      {project.title}
                    </Link>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                      {project.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 mt-1.5 text-xs text-zerodha-muted font-mono">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{formatDuration(project.durationSeconds)}</span>
                    </span>
                    <span>&bull;</span>
                    <span>{project.mediaContainer.hasVideo ? 'Video + Lossless PCM' : 'Lossless WAV'}</span>
                    <span>&bull;</span>
                    <span>{project.stems.length} stems separated</span>
                  </div>

                  {/* Stem pills */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {project.stems.map((stem) => (
                      <span
                        key={stem.stemId}
                        className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200 font-mono"
                      >
                        {stem.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Link
                  href={`/editor/${project.projectId}`}
                  className="px-4 py-2 rounded bg-zerodha-blue hover:bg-zerodha-blue-hover text-white text-xs font-medium shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Open Editor</span>
                </Link>

                <button
                  onClick={() => alert(`Starting zero-loss video remuxing with FFmpeg (-c:v copy) for project ${project.projectId}...`)}
                  className="px-3 py-2 rounded border border-zerodha-border bg-white hover:bg-gray-50 text-zerodha-text text-xs font-medium transition-colors flex items-center space-x-1"
                  title="Lossless Video Remuxing"
                >
                  <Download className="w-3.5 h-3.5 text-zerodha-muted" />
                  <span className="hidden sm:inline">Remux</span>
                </button>

                <button
                  onClick={() => alert(`Exporting stems ZIP for project ${project.projectId}...`)}
                  className="px-3 py-2 rounded border border-zerodha-border bg-white hover:bg-gray-50 text-zerodha-text text-xs font-medium transition-colors flex items-center space-x-1"
                  title="Export Stems .zip"
                >
                  <Archive className="w-3.5 h-3.5 text-zerodha-muted" />
                  <span className="hidden sm:inline">Stems</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
