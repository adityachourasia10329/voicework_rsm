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

  const getTimeFromEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = x / rect.width;
    return ratio * duration;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
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
      if (Math.abs(selectionEnd - selectionStart) < 0.5) {
        onSeek(selectionStart);
        setSelectionStart(null);
        setSelectionEnd(null);
      }
    }
    setIsSelecting(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Dark slate canvas for acoustic contrast
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Subtle horizontal gridlines
    ctx.strokeStyle = '#1e293b';
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

      const sliceCount = 32;
      const sliceHeight = height / sliceCount;

      for (let s = 0; s < sliceCount; s++) {
        const y = height - (s + 1) * sliceHeight;
        const freqRatio = s / sliceCount;

        const speechEnergy = Math.sin(colTime * 2.5 + s * 0.4) * 0.5 + 0.5;
        const trafficEnergy = Math.cos(colTime * 0.8 + s * 0.2) * 0.4 + 0.3;
        const crowdEnergy = Math.sin(colTime * 1.5 - s * 0.3) * 0.35 + 0.3;
        const musicEnergy = Math.sin(colTime * 3.0 + s) * 0.3 + 0.2;

        let r = 0, g = 0, b = 0, alpha = 0.15;

        if (freqRatio < 0.2) {
          // Lows (Traffic / Hum): Red
          r = 223; g = 81; b = 76;
          alpha = trafficEnergy * 0.85;
        } else if (freqRatio >= 0.2 && freqRatio <= 0.65) {
          // Mids (Speech): Emerald Green
          r = 38; g = 166; b = 154;
          alpha = speechEnergy * 0.95;
        } else {
          // Highs (Music/Crowd): Blue
          r = 56; g = 126; b = 209;
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
      ctx.fillStyle = 'rgba(56, 126, 209, 0.2)';
      ctx.fillRect(patchXStart, 0, patchWidth, height);
      ctx.strokeStyle = '#387ed1';
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
    <div className="bg-white rounded border border-zerodha-border p-4 shadow-sm">
      {/* Top Bar / Spectrogram Layer Legend & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-zerodha-heading">Mel-Spectrogram View</span>
          <span className="text-[11px] text-zerodha-muted font-mono">(Click &amp; drag over timeline to isolate intervals)</span>
        </div>

        {/* Color Legend */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-zerodha-green" />
            <span className="text-gray-700">Speech</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-zerodha-red" />
            <span className="text-gray-700">Traffic/Hum</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-zerodha-blue" />
            <span className="text-gray-700">Music/Crowd</span>
          </span>
        </div>

        {/* Layer Filter Toggles */}
        <div className="flex rounded border border-zerodha-border overflow-hidden text-xs">
          <button
            onClick={() => setActiveLayerFilter('ALL')}
            className={`px-2.5 py-1 font-medium transition-colors ${
              activeLayerFilter === 'ALL' ? 'bg-zerodha-blue text-white' : 'bg-white text-zerodha-muted hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveLayerFilter('SPEECH')}
            className={`px-2.5 py-1 font-medium border-l border-zerodha-border transition-colors ${
              activeLayerFilter === 'SPEECH' ? 'bg-zerodha-blue text-white' : 'bg-white text-zerodha-muted hover:bg-gray-50'
            }`}
          >
            Speech Only
          </button>
          <button
            onClick={() => setActiveLayerFilter('NOISE')}
            className={`px-2.5 py-1 font-medium border-l border-zerodha-border transition-colors ${
              activeLayerFilter === 'NOISE' ? 'bg-zerodha-blue text-white' : 'bg-white text-zerodha-muted hover:bg-gray-50'
            }`}
          >
            Noise Only
          </button>
        </div>
      </div>

      {/* Interactive Canvas Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative h-44 w-full rounded overflow-hidden cursor-crosshair border border-gray-200 select-none"
      >
        <canvas
          ref={canvasRef}
          width={1000}
          height={176}
          className="w-full h-full object-cover"
        />

        {/* Current Playhead Scrubber */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm pointer-events-none z-20"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        >
          <div className="w-2.5 h-2.5 -ml-1 bg-white rounded-full border border-gray-400" />
        </div>

        {/* Time Bracket Highlight Selection */}
        {hasActiveBracket && (
          <div
            className="absolute top-0 bottom-0 bg-blue-500/20 border-x-2 border-zerodha-blue z-10 flex flex-col justify-between"
            style={{
              left: `${(selMin! / duration) * 100}%`,
              width: `${((selMax! - selMin!) / duration) * 100}%`
            }}
          >
            <div className="bg-zerodha-blue px-2 py-0.5 text-[10px] font-mono text-white font-semibold w-fit rounded-br shadow-sm flex items-center space-x-1">
              <Crosshair className="w-3 h-3" />
              <span>{formatSec(selMin!)} – {formatSec(selMax!)} ({(selMax! - selMin!).toFixed(1)}s)</span>
            </div>

            <div className="p-1.5 flex justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSurgicalModal(selMin!, selMax!);
                }}
                className="px-3 py-1 rounded bg-zerodha-blue hover:bg-zerodha-blue-hover text-white text-xs font-medium shadow-sm flex items-center space-x-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Re-evaluate Interval</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sound Event Detection (SED) Timeline Strip */}
      <div className="mt-3 relative h-7 w-full bg-gray-50 rounded overflow-hidden border border-zerodha-border flex items-center px-1">
        <span className="text-[10px] font-mono text-gray-500 uppercase px-1.5 font-bold z-10">SED Timeline</span>
        <div className="relative flex-1 h-full">
          {soundEvents.map((evt, idx) => {
            const leftPct = (evt.startSec / duration) * 100;
            const widthPct = ((evt.endSec - evt.startSec) / duration) * 100;
            let badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
            if (evt.label.includes('TRAFFIC')) badgeClass = 'bg-red-100 text-red-800 border-red-200';
            if (evt.label.includes('CROWD')) badgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
            if (evt.label.includes('MUSIC')) badgeClass = 'bg-purple-100 text-purple-800 border-purple-200';

            return (
              <div
                key={idx}
                className={`absolute top-1 bottom-1 rounded border text-[9px] font-mono px-1 flex items-center overflow-hidden whitespace-nowrap ${badgeClass}`}
                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                title={`${evt.label} (${evt.startSec}s - ${evt.endSec}s)`}
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
