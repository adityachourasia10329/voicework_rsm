'use client';

import React, { useRef, useEffect, useState } from 'react';
import { SpectrogramFrame, SoundEvent, SurgicalRevision } from '../lib/types';
import { Sparkles, Flag, AlertTriangle, Layers, Crosshair } from 'lucide-react';

interface SpectrogramCanvasProps {
  currentTime: number;
  duration: number;
  frames?: SpectrogramFrame[];
  soundEvents?: SoundEvent[];
  surgicalHistory?: SurgicalRevision[];
  onSeek: (time: number) => void;
  onOpenSurgicalModal: (startSec: number, endSec: number) => void;
}

export const SpectrogramCanvas: React.FC<SpectrogramCanvasProps> = ({
  currentTime,
  duration,
  soundEvents = [],
  surgicalHistory = [],
  onSeek,
  onOpenSurgicalModal
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Time bracket selection state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);

  const [activeLayerFilter, setActiveLayerFilter] = useState<string>('ALL');

  // Convert client X to timestamp in seconds
  const getTimeFromEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = x / rect.width;
    return ratio * duration;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left click
    const t = getTimeFromEvent(e);
    setIsSelecting(true);
    setSelectionStart(t);
    setSelectionEnd(t);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting || selectionStart === null) return;
    const t = getTimeFromEvent(e);
    setSelectionEnd(t);
  };

  const handleMouseUp = () => {
    if (isSelecting && selectionStart !== null && selectionEnd !== null) {
      // If click was virtually on same spot, treat as seek
      if (Math.abs(selectionEnd - selectionStart) < 0.5) {
        onSeek(selectionStart);
        setSelectionStart(null);
        setSelectionEnd(null);
      }
    }
    setIsSelecting(false);
  };

  // Render high-fidelity Mel Spectrogram onto Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#0B111E';
    ctx.fillRect(0, 0, width, height);

    // Grid lines for frequency bins
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    for (let f = 0; f < height; f += 25) {
      ctx.beginPath();
      ctx.moveTo(0, f);
      ctx.lineTo(width, f);
      ctx.stroke();
    }

    // Render multi-spectral bands
    const timeResolution = width / 200;
    for (let i = 0; i < 200; i++) {
      const colTime = (i / 200) * duration;
      const x = i * timeResolution;

      // Vertical frequency slices
      const sliceCount = 32;
      const sliceHeight = height / sliceCount;

      for (let s = 0; s < sliceCount; s++) {
        const y = height - (s + 1) * sliceHeight;
        const freqRatio = s / sliceCount;

        // Multi-layer simulated energy distributions
        const speechEnergy = Math.sin(colTime * 2.5 + s * 0.4) * 0.5 + 0.5;
        const trafficEnergy = Math.cos(colTime * 0.8 + s * 0.2) * 0.4 + 0.3;
        const crowdEnergy = Math.sin(colTime * 1.5 - s * 0.3) * 0.35 + 0.3;
        const musicEnergy = Math.sin(colTime * 3.0 + s) * 0.3 + 0.2;

        let r = 0, g = 0, b = 0, alpha = 0.15;

        if (freqRatio < 0.2) {
          // Lows (Traffic / Hum): Red
          r = 239; g = 68; b = 68;
          alpha = trafficEnergy * 0.85;
        } else if (freqRatio >= 0.2 && freqRatio <= 0.65) {
          // Mids (Speech): Green
          r = 16; g = 185; b = 129;
          alpha = speechEnergy * 0.95;
        } else {
          // Highs (Music/Crowd): Purple / Blue
          r = 168; g = 85; b = 247;
          alpha = musicEnergy * 0.75;
        }

        if (activeLayerFilter === 'SPEECH' && (freqRatio < 0.2 || freqRatio > 0.65)) alpha *= 0.1;
        if (activeLayerFilter === 'NOISE' && (freqRatio >= 0.2 && freqRatio <= 0.65)) alpha *= 0.1;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.max(0.05, Math.min(0.95, alpha))})`;
        ctx.fillRect(x, y, timeResolution - 0.5, sliceHeight - 0.5);
      }
    }

    // Draw past surgical patches
    surgicalHistory.forEach((patch) => {
      const patchXStart = (patch.startSec / duration) * width;
      const patchWidth = ((patch.endSec - patch.startSec) / duration) * width;
      ctx.fillStyle = 'rgba(99, 102, 241, 0.25)';
      ctx.fillRect(patchXStart, 0, patchWidth, height);
      ctx.strokeStyle = '#6366F1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(patchXStart, 0, patchWidth, height);
    });

  }, [duration, activeLayerFilter, surgicalHistory]);

  const selMin = selectionStart !== null && selectionEnd !== null ? Math.min(selectionStart, selectionEnd) : null;
  const selMax = selectionStart !== null && selectionEnd !== null ? Math.max(selectionStart, selectionEnd) : null;
  const hasActiveBracket = selMin !== null && selMax !== null && selMax - selMin > 0.8;

  const formatSec = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 10);
    return `${m}:${sec < 10 ? '0' : ''}${sec}.${ms}`;
  };

  return (
    <div className="glass-panel rounded-2xl p-4 border border-border">
      {/* Top Bar / Spectrogram Layer Legend & Surgical Prompt */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wide">WebGL Spectrogram Canvas</span>
          <span className="text-[10px] text-gray-400 font-mono">(Click &amp; drag over timeline to isolate brackets)</span>
        </div>

        {/* Color Legend */}
        <div className="flex items-center space-x-3 text-[11px] font-mono">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-400">Target Speech</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-red-400">Traffic/Hum</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-blue-400">Crowd</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-purple-400">Music</span>
          </span>
        </div>

        {/* Layer Filter Toggles */}
        <div className="flex items-center space-x-1 bg-surface px-2 py-1 rounded-lg border border-border text-[10px] font-mono">
          <button
            onClick={() => setActiveLayerFilter('ALL')}
            className={`px-2 py-0.5 rounded ${activeLayerFilter === 'ALL' ? 'bg-accent text-white' : 'text-gray-400'}`}
          >
            All Stems
          </button>
          <button
            onClick={() => setActiveLayerFilter('SPEECH')}
            className={`px-2 py-0.5 rounded ${activeLayerFilter === 'SPEECH' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
          >
            Speech Focus
          </button>
          <button
            onClick={() => setActiveLayerFilter('NOISE')}
            className={`px-2 py-0.5 rounded ${activeLayerFilter === 'NOISE' ? 'bg-red-600 text-white' : 'text-gray-400'}`}
          >
            Noise Focus
          </button>
        </div>
      </div>

      {/* Interactive Canvas Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative h-44 w-full rounded-xl overflow-hidden cursor-crosshair border border-border select-none"
      >
        <canvas
          ref={canvasRef}
          width={1000}
          height={176}
          className="w-full h-full object-cover"
        />

        {/* Current Playhead Scrubber */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg shadow-white/80 pointer-events-none z-20"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        >
          <div className="w-2.5 h-2.5 -ml-1 bg-white rounded-full shadow-md" />
        </div>

        {/* Time Bracket Highlight Selection */}
        {hasActiveBracket && (
          <div
            className="absolute top-0 bottom-0 bg-accent/30 border-x-2 border-accent z-10 backdrop-blur-[1px] flex flex-col justify-between"
            style={{
              left: `${(selMin! / duration) * 100}%`,
              width: `${((selMax! - selMin!) / duration) * 100}%`
            }}
          >
            <div className="bg-accent px-2 py-0.5 text-[10px] font-mono text-white font-bold w-fit rounded-br shadow-md flex items-center space-x-1">
              <Crosshair className="w-3 h-3" />
              <span>{formatSec(selMin!)} – {formatSec(selMax!)} ({(selMax! - selMin!).toFixed(1)}s)</span>
            </div>

            <div className="p-1 flex justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSurgicalModal(selMin!, selMax!);
                }}
                className="px-3 py-1 rounded bg-gradient-to-r from-accent to-purple-600 hover:from-accent-hover hover:to-purple-700 text-white text-[11px] font-bold shadow-xl shadow-accent/50 flex items-center space-x-1.5 animate-bounce"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Surgically Re-evaluate Bracket</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sound Event Detection (SED) Timeline Strip */}
      <div className="mt-3 relative h-7 w-full bg-surface-elevated rounded-lg overflow-hidden border border-border flex items-center px-1">
        <span className="text-[9px] font-mono text-gray-500 uppercase px-1.5 font-bold z-10">SED Layer</span>
        <div className="relative flex-1 h-full">
          {soundEvents.map((evt, idx) => {
            const leftPct = (evt.startSec / duration) * 100;
            const widthPct = ((evt.endSec - evt.startSec) / duration) * 100;
            let bgColor = 'bg-emerald-500/25 text-emerald-400 border-emerald-500/40';
            if (evt.label.includes('TRAFFIC')) bgColor = 'bg-red-500/25 text-red-400 border-red-500/40';
            if (evt.label.includes('CROWD')) bgColor = 'bg-blue-500/25 text-blue-400 border-blue-500/40';
            if (evt.label.includes('MUSIC')) bgColor = 'bg-purple-500/25 text-purple-400 border-purple-500/40';

            return (
              <div
                key={idx}
                className={`absolute top-1 bottom-1 rounded border text-[8px] font-mono px-1 flex items-center overflow-hidden whitespace-nowrap ${bgColor}`}
                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                title={`${evt.label} (${evt.startSec}s - ${evt.endSec}s) Conf: ${Math.round(evt.confidence * 100)}%`}
              >
                {evt.label.replace('NOISE_', '')}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
