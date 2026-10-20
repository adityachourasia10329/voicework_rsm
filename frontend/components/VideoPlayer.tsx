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
    <div className="bg-white rounded border border-zerodha-border overflow-hidden shadow-sm flex flex-col justify-between">
      {/* Video Canvas */}
      <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center">
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
          <div className="flex flex-col items-center justify-center text-gray-400">
            <Volume2 className="w-10 h-10 mb-2 text-zerodha-blue" />
            <span className="text-xs font-mono">Audio-Only Master Container</span>
          </div>
        )}

        {/* Center play button when paused */}
        {!isPlaying && (
          <button
            onClick={onTogglePlay}
            className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-zerodha-blue hover:bg-zerodha-blue-hover text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          >
            <Play className="w-6 h-6 ml-1" />
          </button>
        )}
      </div>

      {/* Embedded Controls Bar - Zerodha Clean Toolbar */}
      <div className="p-3 bg-white border-t border-zerodha-border flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2">
          <button
            onClick={onTogglePlay}
            className="p-1.5 rounded border border-zerodha-border bg-white hover:bg-gray-50 text-zerodha-heading transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={() => onTimeUpdate(Math.max(0, currentTime - 5))}
            className="p-1.5 rounded border border-zerodha-border bg-white hover:bg-gray-50 text-zerodha-muted hover:text-zerodha-heading transition-colors"
            title="Rewind 5s"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onTimeUpdate(Math.min(duration, currentTime + 5))}
            className="p-1.5 rounded border border-zerodha-border bg-white hover:bg-gray-50 text-zerodha-muted hover:text-zerodha-heading transition-colors"
            title="Forward 5s"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <div className="text-zerodha-heading font-medium px-2 py-0.5 rounded bg-gray-50 border border-zerodha-border">
            <span>{formatTimecode(currentTime)}</span>
            <span className="text-gray-400 mx-1">/</span>
            <span className="text-zerodha-muted">{formatTimecode(duration)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-zerodha-muted">
          <span className="text-[10px] text-zerodha-green font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Frame Synced
          </span>
          <button
            onClick={() => {
              if (videoRef.current) videoRef.current.requestFullscreen?.();
            }}
            className="p-1.5 rounded hover:bg-gray-50 text-zerodha-muted hover:text-zerodha-heading transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
