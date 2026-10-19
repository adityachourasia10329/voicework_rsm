'use client';

import React, { useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, Maximize2 } from 'lucide-react';

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
    <div className="relative glass-panel rounded-2xl overflow-hidden border border-border group bg-black">
      {/* Video Canvas */}
      <div className="relative aspect-video w-full flex items-center justify-center">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            onTimeUpdate={() => {
              if (videoRef.current) onTimeUpdate(videoRef.current.currentTime);
            }}
            onClick={onTogglePlay}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <Volume2 className="w-12 h-12 mb-2 text-accent" />
            <span className="text-xs font-mono">Audio-Only Master Container</span>
          </div>
        )}

        {/* Big play overlay when paused */}
        {!isPlaying && (
          <button
            onClick={onTogglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-accent/90 hover:bg-accent text-white flex items-center justify-center shadow-xl shadow-accent/40 backdrop-blur-md transition-transform hover:scale-110 active:scale-95"
          >
            <Play className="w-8 h-8 ml-1" />
          </button>
        )}
      </div>

      {/* Embedded Controls Bar */}
      <div className="p-3 bg-surface/80 border-t border-border flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2">
          <button
            onClick={onTogglePlay}
            className="p-1.5 rounded-lg bg-surface-elevated hover:bg-accent text-white transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={() => onTimeUpdate(Math.max(0, currentTime - 5))}
            className="p-1.5 rounded-lg bg-surface-elevated hover:bg-surface text-gray-400 hover:text-white transition-colors"
            title="Rewind 5s"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onTimeUpdate(Math.min(duration, currentTime + 5))}
            className="p-1.5 rounded-lg bg-surface-elevated hover:bg-surface text-gray-400 hover:text-white transition-colors"
            title="Forward 5s"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <div className="text-gray-300 font-semibold px-2 py-0.5 rounded bg-surface border border-border">
            <span>{formatTimecode(currentTime)}</span>
            <span className="text-gray-500 mx-1">/</span>
            <span className="text-gray-400">{formatTimecode(duration)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-gray-400">
          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Synced Frame-for-Frame
          </span>
          <button
            onClick={() => {
              if (videoRef.current) videoRef.current.requestFullscreen?.();
            }}
            className="p-1.5 rounded-lg hover:bg-surface-elevated text-gray-400 hover:text-white transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
