'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Youtube,
  Clock,
  Film,
  ExternalLink,
  Copy,
  Check,
  Sliders,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Radio,
  Play,
  Share2,
  CheckCircle2,
  TrendingUp,
  Layers
} from 'lucide-react';
import { RSM_CHANNEL_VIDEOS, RSM_CHANNEL_URL } from '../lib/mockData';
import { RSMChannelVideo } from '../lib/types';

interface OurChannelViewProps {
  onOpenIngest?: () => void;
}

export const OurChannelView: React.FC<OurChannelViewProps> = ({ onOpenIngest }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const handleCopyLink = (video: RSMChannelVideo, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(video.youtubeUrl);
    setCopiedId(video.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedVideoId(expandedVideoId === id ? null : id);
  };

  const totalClips = RSM_CHANNEL_VIDEOS.reduce((acc, v) => acc + v.clipsCount, 0);

  const filteredVideos = RSM_CHANNEL_VIDEOS.filter((v) => {
    if (categoryFilter === 'ALL') return true;
    return v.category.toLowerCase().includes(categoryFilter.toLowerCase());
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ============================================================ */}
      {/* 1. CHANNEL HEADER BANNER (Official @rsmglobalsatsang Hub)   */}
      {/* ============================================================ */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-600/10 via-[#FF4D36]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4 sm:space-x-5">
            {/* YouTube Channel Avatar / Icon */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-red-600 via-[#FF4D36] to-[#FF7A59] p-0.5 shadow-[0_0_25px_rgba(255,0,0,0.35)] flex items-center justify-center">
                <div className="w-full h-full bg-[#12131C] rounded-[14px] flex items-center justify-center">
                  <Youtube className="w-8 h-8 sm:w-10 sm:h-10 text-red-500 fill-red-500/20" />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#27A376] border-2 border-[#0D0E15] flex items-center justify-center text-[10px] text-white font-bold" title="Channel Auto-Synced">
                ✓
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
                  RSM Global Satsang
                </h1>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-semibold tracking-wide">
                  @rsmglobalsatsang
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#27A376]/15 text-[#33C287] border border-[#27A376]/30 font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#27A376] animate-pulse" />
                  <span>Auto-Sync Active</span>
                </span>
              </div>

              <p className="mt-1.5 text-xs sm:text-sm text-[#9FA4B8] max-w-2xl leading-relaxed">
                Official YouTube channel feed for Ramashram Satsang Math. Synchronized via Google WebSub push notifications &amp; scheduled cron fallback. All videos are pre-indexed with isolated speech stems and AI-generated clips.
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-mono text-[#9FA4B8]">
                <a
                  href={RSM_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#FF7A59] flex items-center space-x-1.5 underline underline-offset-4 transition-colors"
                >
                  <span>youtube.com/@rsmglobalsatsang</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span>&bull;</span>
                <span className="text-[#33C287]">WebSub Push Listener: Healthy</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={RSM_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all shadow-[0_0_20px_rgba(255,0,0,0.35)] flex items-center space-x-2"
            >
              <Youtube className="w-4 h-4 fill-white" />
              <span>Visit YouTube Channel</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
            </a>

            {onOpenIngest && (
              <button
                onClick={onOpenIngest}
                className="btn-coral px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center space-x-2 shadow-[0_4px_16px_rgba(255,77,54,0.35)]"
              >
                <span>+ Ingest Custom URL</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Channel Stats Overview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-white/[0.08]">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[11px] font-mono text-[#9FA4B8] uppercase tracking-wider block">Synced Videos</span>
            <span className="text-xl font-heading font-bold text-white mt-0.5 block">{RSM_CHANNEL_VIDEOS.length}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[11px] font-mono text-[#9FA4B8] uppercase tracking-wider block">Total Clips Made</span>
            <span className="text-xl font-heading font-bold text-[#FF7A59] mt-0.5 block">{totalClips} Clips</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[11px] font-mono text-[#9FA4B8] uppercase tracking-wider block">Average Virality</span>
            <span className="text-xl font-heading font-bold text-[#33C287] mt-0.5 block">93.2% Rating</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[11px] font-mono text-[#9FA4B8] uppercase tracking-wider block">Channel Format</span>
            <span className="text-xl font-heading font-bold text-[#8E93FF] mt-0.5 block">Lossless PCM</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. CATEGORY FILTERS                                         */}
      {/* ============================================================ */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-bold text-white tracking-tight">Channel Video Catalog</h2>
          <p className="text-xs text-[#9FA4B8] font-mono mt-0.5">
            Displaying all synchronized videos from @rsmglobalsatsang with duration, clip breakdowns, and direct links.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#12131C] border border-white/[0.1] text-xs font-mono">
          {['ALL', 'Meditation', 'Satsang', 'Seva', 'Consciousness'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                categoryFilter === cat
                  ? 'bg-[#FF4D36] text-white shadow-[0_0_12px_rgba(255,77,54,0.4)] font-semibold'
                  : 'text-[#9FA4B8] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. RECTANGULAR BOXES FOR EACH VIDEO                          */}
      {/* ============================================================ */}
      <div className="space-y-4">
        {filteredVideos.map((video) => {
          const isExpanded = expandedVideoId === video.id;

          return (
            <div
              key={video.id}
              className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/[0.08] hover:border-[#FF4D36]/40 transition-all shadow-xl hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] group"
            >
              {/* Main Rectangular Row */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                
                {/* Left: Thumbnail & Core Metadata */}
                <div className="flex items-start space-x-4 sm:space-x-5 flex-1 min-w-0">
                  {/* Video Thumbnail Box with Play Badge */}
                  <div className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-xl overflow-hidden bg-[#12131C] border border-white/[0.1] flex-shrink-0 group/thumb shadow-md">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white font-medium">
                      {video.durationFormatted}
                    </span>
                  </div>

                  {/* Video Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {/* 5-Character Alphanumeric Code Badge */}
                      <span
                        className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-[#FF4D36]/15 text-[#FF7A59] border border-[#FF4D36]/30 font-bold tracking-widest shadow-[0_0_8px_rgba(255,77,54,0.15)]"
                        title="5-Character Alphanumeric Code"
                      >
                        #{video.code}
                      </span>

                      {/* No. of Clips Made Badge */}
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#6B70F0]/15 text-[#8E93FF] border border-[#6B70F0]/30 font-bold flex items-center space-x-1 shadow-[0_0_8px_rgba(107,112,240,0.2)]">
                        <Film className="w-3 h-3 text-[#6B70F0]" />
                        <span>{video.clipsCount} Clips Made</span>
                      </span>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-[#9FA4B8] border border-white/[0.08]">
                        {video.category}
                      </span>
                    </div>

                    {/* Video Title */}
                    <h3 className="text-base sm:text-lg font-heading font-bold text-white group-hover:text-[#FF7A59] transition-colors leading-snug line-clamp-2">
                      {video.title}
                    </h3>

                    {/* Duration & Metadata Row */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-xs font-mono text-[#9FA4B8]">
                      {/* Duration */}
                      <span className="flex items-center space-x-1.5 text-white/90">
                        <Clock className="w-3.5 h-3.5 text-[#FF7A59]" />
                        <span className="font-semibold">{video.durationFormatted}</span>
                      </span>

                      <span>&bull;</span>

                      {/* Actual YouTube Link */}
                      <div className="flex items-center space-x-1.5">
                        <Youtube className="w-3.5 h-3.5 text-red-500 fill-red-500/20" />
                        <a
                          href={video.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#9FA4B8] hover:text-white underline underline-offset-2 flex items-center space-x-1 transition-colors"
                          title="Open actual YouTube link"
                        >
                          <span className="truncate max-w-[150px] sm:max-w-xs">{video.youtubeUrl}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        <button
                          onClick={(e) => handleCopyLink(video, e)}
                          className="p-1 rounded hover:bg-white/[0.08] text-[#646982] hover:text-white transition-colors"
                          title="Copy YouTube URL"
                        >
                          {copiedId === video.id ? (
                            <Check className="w-3 h-3 text-[#27A376]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      <span>&bull;</span>
                      <span className="text-white/60">Published: {video.publishedAt}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2.5 lg:self-center">
                  {/* Expand/Collapse Clips Button */}
                  <button
                    onClick={() => toggleExpand(video.id)}
                    className="px-3.5 py-2 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-mono font-medium transition-colors flex items-center space-x-1.5"
                  >
                    <Film className="w-3.5 h-3.5 text-[#6B70F0]" />
                    <span>{isExpanded ? 'Hide Clips' : `View Clips (${video.clipsCount})`}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
                  </button>

                  {/* Direct YouTube Watch Button */}
                  <a
                    href={video.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-white text-xs font-semibold transition-colors flex items-center space-x-1.5"
                    title="Watch on YouTube"
                  >
                    <Youtube className="w-3.5 h-3.5 fill-red-500" />
                    <span>Watch YT</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {/* Open in Studio Editor */}
                  <Link
                    href={`/editor/${video.code}`}
                    className="btn-coral px-4 py-2 rounded-xl text-xs font-semibold shadow-[0_4px_16px_rgba(255,77,54,0.35)] flex items-center space-x-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Open Studio</span>
                  </Link>
                </div>
              </div>

              {/* ============================================================ */}
              {/* Expandable Section: Rectangular Sub-Boxes for Clips Made      */}
              {/* ============================================================ */}
              {isExpanded && (
                <div className="mt-5 pt-5 border-t border-white/[0.08] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center space-x-2 text-xs font-mono text-[#9FA4B8]">
                      <span className="w-2 h-2 rounded-full bg-[#6B70F0] animate-pulse" />
                      <span className="font-semibold text-white uppercase tracking-wider">
                        Generated Clips ({video.clips.length})
                      </span>
                      <span>&bull;</span>
                      <span>Paced for social reels &amp; discourse highlights</span>
                    </div>

                    <span className="text-[11px] font-mono text-[#27A376]">
                      Virality Average: {video.viralityScore}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {video.clips.map((clip, index) => (
                      <div
                        key={clip.clip_id}
                        className="p-3.5 rounded-xl bg-[#12131C] border border-white/[0.08] hover:border-[#6B70F0]/40 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                            <span className="text-[#9FA4B8]">Clip #{index + 1}</span>
                            <span className="px-2 py-0.5 rounded bg-[#27A376]/15 text-[#33C287] font-bold">
                              🔥 {clip.viral_score}% Viral
                            </span>
                          </div>

                          <h4 className="text-xs font-semibold text-white line-clamp-2 mb-2">
                            {clip.title}
                          </h4>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[11px] font-mono">
                          <span className="text-[#FF7A59] font-medium">{clip.timeRange}</span>

                          <Link
                            href={`/editor/${video.code}`}
                            className="text-[#6B70F0] hover:text-[#8E93FF] font-semibold flex items-center space-x-1 transition-colors"
                          >
                            <span>Edit Clip &rarr;</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
