'use client';

import React, { useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, Maximize2, Radio } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onTogglePlay: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  currentTime,
  duration,
  isPlaying,
  onTimeUpdate,
  onTogglePlay
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying && videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      } else if (!isPlaying && !videoRef.current.paused) {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.3) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const formatTimecode = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 100);
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl flex flex-col justify-between">
      {/* Video Viewport Stage */}
      <div className="relative aspect-video w-full bg-[#08090E] flex items-center justify-center">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain cursor-pointer"
            onTimeUpdate={() => {
              if (videoRef.current) onTimeUpdate(videoRef.current.currentTime);
            }}
            onClick={onTogglePlay}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[#646982]">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#6B70F0] mb-3">
              <Volume2 className="w-7 h-7" />
            </div>
            <span className="text-xs font-mono tracking-wider text-[#9FA4B8]">AUDIO-ONLY LOSSLESS CONTAINER</span>
          </div>
        )}

        {/* Center play button when paused (Superlist Coral with Glow) */}
        {!isPlaying && (
          <button
            onClick={onTogglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full btn-coral flex items-center justify-center shadow-[0_0_35px_rgba(255,77,54,0.55)] transition-transform hover:scale-110 active:scale-95"
            aria-label="Play Video"
          >
            <Play className="w-7 h-7 ml-1 fill-white text-white" />
          </button>
        )}
      </div>

      {/* Embedded Controls Bar - Grounded Futuristic Studio HUD */}
      <div className="p-3.5 bg-[#12131C]/90 backdrop-blur-md border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onTogglePlay}
            className="p-2 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-white transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
          </button>

          <button
            onClick={() => onTimeUpdate(Math.max(0, currentTime - 5))}
            className="p-2 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-[#9FA4B8] hover:text-white transition-colors"
            title="Rewind 5s"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onTimeUpdate(Math.min(duration, currentTime + 5))}
            className="p-2 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-[#9FA4B8] hover:text-white transition-colors"
            title="Forward 5s"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Timecode Digital HUD */}
          <div className="px-3 py-1 rounded-xl bg-black/40 border border-white/[0.08] text-xs">
            <span className="text-[#33C287] font-semibold">{formatTimecode(currentTime)}</span>
            <span className="text-white/30 mx-1.5">/</span>
            <span className="text-[#9FA4B8]">{formatTimecode(duration)}</span>
          </div>
        </div>

        {/* Status Telemetry */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-[10px] text-[#33C287] font-medium bg-[#27A376]/10 px-2.5 py-1 rounded-full border border-[#27A376]/25">
            <span className="w-1.5 h-1.5 rounded-full bg-[#27A376] shadow-[0_0_6px_#27A376]" />
            <span>FRAME SYNCED &bull; 44.1kHz</span>
          </div>

          <button
            onClick={() => {
              if (videoRef.current) videoRef.current.requestFullscreen?.();
            }}
            className="p-2 rounded-xl hover:bg-white/[0.06] text-[#9FA4B8] hover:text-white transition-colors"
            title="Fullscreen Viewport"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
