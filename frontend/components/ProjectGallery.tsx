'use client';

import React from 'react';
import Link from 'next/link';
import { ProjectState } from '../lib/types';
import { Sliders, Download, Archive, Play, Clock, Video, Mic, CheckCircle } from 'lucide-react';

interface ProjectGalleryProps {
  projects: ProjectState[];
  onOpenIngest: () => void;
}

export const ProjectGallery: React.FC<ProjectGalleryProps> = ({ projects, onOpenIngest }) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Audio Projects Gallery</h1>
          <p className="text-xs text-gray-400 mt-1">
            In-Memory Unified Cache (Redis Tier 1) — sub-3ms instant project loading &amp; state sync.
          </p>
        </div>

        <button
          onClick={onOpenIngest}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20 transition-all hover:scale-105"
        >
          + Ingest New Media
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-border">
          <Mic className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No projects found in Tier 1 cache</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Upload a video/audio file or ingest a YouTube URL to extract stems and enter the Full Authority Editor.
          </p>
          <button
            onClick={onOpenIngest}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-accent text-white"
          >
            Ingest Your First Media
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.projectId}
              className="glass-panel hover:glass-panel-elevated rounded-2xl overflow-hidden border border-border hover:border-accent/40 transition-all group flex flex-col justify-between"
            >
              {/* Media Thumbnail & Duration Header */}
              <div className="relative h-48 w-full bg-surface-elevated overflow-hidden">
                <img
                  src={project.mediaContainer.thumbnailUrl || '/thumbnails/default.jpg'}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                {/* Duration Badge */}
                <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono text-gray-200 border border-white/10 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-accent" />
                  <span>{formatDuration(project.durationSeconds)}</span>
                </div>

                {/* Container Type Badge */}
                <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono text-white border border-border flex items-center space-x-1.5">
                  <Video className="w-3 h-3 text-emerald-400" />
                  <span>{project.mediaContainer.hasVideo ? 'Video + Lossless PCM' : 'Lossless Audio'}</span>
                </div>

                {/* Quick Title overlay */}
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {project.status}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1 line-clamp-1 group-hover:text-accent transition-colors">
                    {project.title}
                  </h3>
                </div>
              </div>

              {/* Stem Tags */}
              <div className="p-4 border-b border-border/50">
                <div className="text-[11px] font-mono text-gray-400 mb-2">Isolated Stems:</div>
                <div className="flex flex-wrap gap-1.5">
                  {project.stems.map((stem) => (
                    <span
                      key={stem.stemId}
                      className="text-[10px] px-2 py-0.5 rounded-full font-mono border"
                      style={{
                        backgroundColor: `${stem.colorHex}15`,
                        color: stem.colorHex,
                        borderColor: `${stem.colorHex}40`,
                      }}
                    >
                      {stem.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer / Action Buttons */}
              <div className="p-4 bg-surface/40 flex items-center justify-between gap-2">
                <Link
                  href={`/editor/${project.projectId}`}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-md shadow-accent/20 transition-all hover:scale-[1.02]"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Open in Editor</span>
                </Link>

                <button
                  onClick={() => alert(`Triggering lossless remuxing with FFmpeg (-c:v copy) for project ${project.projectId}...`)}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-surface hover:bg-surface-elevated border border-border text-xs font-medium text-gray-300 hover:text-white transition-colors"
                  title="Lossless Remuxed Video Download"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Remux</span>
                </button>

                <button
                  onClick={() => alert(`Exporting stems ZIP for project ${project.projectId}...`)}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-surface hover:bg-surface-elevated border border-border text-xs font-medium text-gray-300 hover:text-white transition-colors"
                  title="Export Stems .zip"
                >
                  <Archive className="w-3.5 h-3.5 text-purple-400" />
                  <span className="hidden sm:inline">Stems</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
