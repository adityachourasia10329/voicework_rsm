'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProjectState } from '../lib/types';
import { Sliders, Download, Archive, Clock, Video, Search, Filter, CheckCircle2, Play, Volume2 } from 'lucide-react';

interface ProjectGalleryProps {
  projects: ProjectState[];
  onOpenIngest: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export const ProjectGallery: React.FC<ProjectGalleryProps> = ({
  projects,
  onOpenIngest,
  searchTerm: externalSearchTerm,
  onSearchChange: externalOnSearchChange
}) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
  const setSearchTerm = externalOnSearchChange || setInternalSearchTerm;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getStemColorClasses = (type: string) => {
    if (type.includes('SPEECH')) {
      return 'bg-[#27A376]/15 text-[#33C287] border-[#27A376]/30'; // Superlist Emerald
    }
    if (type.includes('TRAFFIC')) {
      return 'bg-[#FF4D36]/15 text-[#FF7A59] border-[#FF4D36]/30'; // Superlist Coral
    }
    if (type.includes('CROWD')) {
      return 'bg-[#258BF5]/15 text-[#429CFF] border-[#258BF5]/30'; // Superlist Blue
    }
    if (type.includes('HUM') || type.includes('TRANSIENT')) {
      return 'bg-[#FF5DB1]/15 text-[#FF75C0] border-[#FF5DB1]/30'; // Superlist Pink
    }
    return 'bg-[#6B70F0]/15 text-[#8E93FF] border-[#6B70F0]/30'; // Superlist Purple (Music)
  };

  const filteredProjects = projects.filter((p) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.youtubeId && p.youtubeId.toLowerCase().includes(q)) ||
      (p.transcript && p.transcript.toLowerCase().includes(q));

    if (filterType === 'ALL') return matchesSearch;
    if (filterType === 'VIDEO') return matchesSearch && p.mediaContainer.hasVideo;
    if (filterType === 'AUDIO') return matchesSearch && !p.mediaContainer.hasVideo;
    return matchesSearch;
  });


  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-7 shadow-2xl">
      {/* Header & Filter Controls - Futuristic Console Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <h2 className="text-xl font-heading font-bold text-white tracking-tight">Active Workload Sessions</h2>
          <p className="text-xs text-[#9FA4B8] font-mono mt-0.5">
            Hot in-memory state tier synced with Dragonfly / Redis &lt; 3ms.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#646982] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3.5 py-2 text-xs rounded-xl border border-white/[0.1] bg-[#12131C] text-white placeholder-[#646982] focus:outline-none focus:border-[#FF4D36] w-48 sm:w-64 font-mono transition-colors"
            />
          </div>

          <div className="flex rounded-xl border border-white/[0.1] overflow-hidden text-xs bg-[#12131C] p-0.5">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterType === 'ALL'
                  ? 'bg-[#FF4D36] text-white shadow-[0_0_12px_rgba(255,77,54,0.4)] font-semibold'
                  : 'text-[#9FA4B8] hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('VIDEO')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterType === 'VIDEO'
                  ? 'bg-[#FF4D36] text-white shadow-[0_0_12px_rgba(255,77,54,0.4)] font-semibold'
                  : 'text-[#9FA4B8] hover:text-white'
              }`}
            >
              Video
            </button>
            <button
              onClick={() => setFilterType('AUDIO')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterType === 'AUDIO'
                  ? 'bg-[#FF4D36] text-white shadow-[0_0_12px_rgba(255,77,54,0.4)] font-semibold'
                  : 'text-[#9FA4B8] hover:text-white'
              }`}
            >
              Audio
            </button>
          </div>
        </div>
      </div>

      {/* Projects List / Cards */}
      {filteredProjects.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-[#9FA4B8]">No projects found matching your search.</p>
          <button
            onClick={onOpenIngest}
            className="btn-coral mt-4 px-5 py-2 rounded-xl text-xs font-semibold"
          >
            Ingest New Media
          </button>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.06]">
          {filteredProjects.map((project) => (
            <div
              key={project.projectId}
              className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-white/[0.02] transition-colors -mx-6 px-6 rounded-xl"
            >
              {/* Left Details */}
              <div className="flex items-start space-x-4">
                <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-[#12131C] border border-white/[0.1] flex-shrink-0 group">
                  <img
                    src={project.mediaContainer.thumbnailUrl || '/thumbnails/default.jpg'}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                  {project.mediaContainer.hasVideo && (
                    <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/70 text-[9px] font-mono text-white">
                      HD
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2.5">
                    {project.code && (
                      <Link
                        href={`/editor/${project.code}`}
                        className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-[#FF4D36]/15 text-[#FF7A59] border border-[#FF4D36]/30 font-bold tracking-widest hover:bg-[#FF4D36]/25 transition-all shadow-[0_0_8px_rgba(255,77,54,0.15)] flex-shrink-0"
                        title="5-character collision-proof identifier. Click to open session."
                      >
                        #{project.code}
                      </Link>
                    )}
                    <Link
                      href={`/editor/${project.code || project.projectId}`}
                      className="text-sm sm:text-base font-heading font-semibold text-white hover:text-[#FF7A59] transition-colors line-clamp-1"
                    >
                      {project.title}
                    </Link>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#27A376]/15 text-[#33C287] border border-[#27A376]/30 font-semibold tracking-wider">
                      {project.status}
                    </span>
                    {project.virality_score !== undefined && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#6B70F0]/15 text-[#8E93FF] border border-[#6B70F0]/30 font-medium hidden sm:inline-flex items-center space-x-1" title="Virality Rating">
                        <span>🔥</span>
                        <span>{project.virality_score}% Viral</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[#9FA4B8] font-mono">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-[#646982]" />

                      <span>{formatDuration(project.durationSeconds)}</span>
                    </span>
                    <span>&bull;</span>
                    <span className="text-white/80">{project.mediaContainer.hasVideo ? 'Video + Lossless PCM' : 'Lossless WAV'}</span>
                    <span>&bull;</span>
                    <span className="text-[#6B70F0] font-semibold">{project.stems.length} stems isolated</span>
                  </div>

                  {/* Stem pills in Superlist "Orange-Purple-Pink-Blue-Green" scheme */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {project.stems.map((stem) => (
                      <span
                        key={stem.stemId}
                        className={`text-[10px] px-2.5 py-0.5 rounded-md border font-mono font-medium ${getStemColorClasses(
                          stem.type
                        )}`}
                      >
                        {stem.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center space-x-2.5 flex-shrink-0">
                <Link
                  href={`/editor/${project.code || project.projectId}`}
                  className="btn-coral px-4 py-2 rounded-xl text-xs font-semibold shadow-[0_4px_16px_rgba(255,77,54,0.35)] flex items-center space-x-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Open Studio</span>
                </Link>


                <button
                  onClick={() => alert(`Starting zero-loss video remuxing with FFmpeg (-c:v copy) for project ${project.projectId}...`)}
                  className="px-3.5 py-2 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-medium transition-colors flex items-center space-x-1.5"
                  title="Lossless Video Remuxing"
                >
                  <Download className="w-3.5 h-3.5 text-[#258BF5]" />
                  <span className="hidden sm:inline">Remux</span>
                </button>

                <button
                  onClick={() => alert(`Exporting stems ZIP for project ${project.projectId}...`)}
                  className="px-3.5 py-2 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-medium transition-colors flex items-center space-x-1.5"
                  title="Export Stems .zip"
                >
                  <Archive className="w-3.5 h-3.5 text-[#6B70F0]" />
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
