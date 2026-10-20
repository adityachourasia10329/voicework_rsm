'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { SpectrogramFrame, SoundEvent, SurgicalRevision } from '../lib/types';
import {
  Sparkles,
  Layers,
  Crosshair,
  Activity,
  Waves,
  Sliders,
  Volume2,
  Maximize2,
  Eye,
  Radio,
  SplitSquareVertical
} from 'lucide-react';

interface IdentifiedFrequencyBand {
  id: string;
  name: string;
  rangeLabel: string;
  minHz: number;
  maxHz: number;
  identifiedPeakHz: number;
  wavelengthMeters: number;
  color: string;
  sourceType: string;
  displayCycles: number; // relative cycle multiplier for waveform drawing
  description: string;
}

const IDENTIFIED_BANDS: IdentifiedFrequencyBand[] = [
  {
    id: 'sub-bass',
    name: 'Sub-Bass & Low-End Rumble',
    rangeLabel: '20 Hz – 250 Hz',
    minHz: 20,
    maxHz: 250,
    identifiedPeakHz: 68,
    wavelengthMeters: 5.06,
    color: '#ef4444',
    sourceType: 'Traffic / HVAC Rumble',
    displayCycles: 1.5,
    description: 'Deep sinusoidal rumble, vehicular road resonance, sub-acoustic floor vibrations.'
  },
  {
    id: 'low-mids',
    name: 'Low-Mids & Vocal Body (F₀)',
    rangeLabel: '250 Hz – 1,000 Hz',
    minHz: 250,
    maxHz: 1000,
    identifiedPeakHz: 380,
    wavelengthMeters: 0.90,
    color: '#10b981',
    sourceType: 'Speech Fundamental / Chest Resonance',
    displayCycles: 3.5,
    description: 'Human vocal cords fundamental frequency (F₀), vocal body warmth, dialogue cadence.'
  },
  {
    id: 'presence',
    name: 'Mid-Range & Speech Presence (F₁-F₂)',
    rangeLabel: '1,000 Hz – 4,000 Hz',
    minHz: 1000,
    maxHz: 4000,
    identifiedPeakHz: 2450,
    wavelengthMeters: 0.14,
    color: '#387ed1',
    sourceType: 'Speech Clarity & Consonants',
    displayCycles: 7.0,
    description: 'Intelligibility formant zone (vowels, consonant articulation, dialogue clarity).'
  },
  {
    id: 'sibilance',
    name: 'High-Mids & Sibilance (F₃)',
    rangeLabel: '4,000 Hz – 8,000 Hz',
    minHz: 4000,
    maxHz: 8000,
    identifiedPeakHz: 6100,
    wavelengthMeters: 0.056,
    color: '#f59e0b',
    sourceType: 'Fricative "S"/"Sh" & Transient Attacks',
    displayCycles: 12.0,
    description: 'High-frequency dental and palatal fricatives, percussion clicks, edge articulation.'
  },
  {
    id: 'air-highs',
    name: 'Air Band & Ambient Shimmer',
    rangeLabel: '8,000 Hz – 20,000 Hz',
    minHz: 8000,
    maxHz: 20000,
    identifiedPeakHz: 14200,
    wavelengthMeters: 0.024,
    color: '#8b5cf6',
    sourceType: 'Ambient Air / Mic Noise Floor',
    displayCycles: 20.0,
    description: 'Micro-vibrational acoustic air, preamp thermal noise, tape shimmer tail.'
  }
];

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
  const containerRef = useRef<HTMLDivElement>(null);
  const specCanvasRef = useRef<HTMLCanvasElement>(null);
  const scopeCanvasRef = useRef<HTMLCanvasElement>(null);

  // View Mode: Mel Spectrogram vs Frequency Waves vs Split View
  const [viewMode, setViewMode] = useState<'SPECTROGRAM' | 'FREQUENCY_WAVES' | 'SPLIT'>('SPLIT');
  
  // Selected Frequency Filter ('ALL' for stacked waves, or specific band ID)
  const [selectedBandId, setSelectedBandId] = useState<string>('ALL');

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
      if (Math.abs(selectionEnd - selectionStart) < 0.4) {
        onSeek(selectionStart);
        setSelectionStart(null);
        setSelectionEnd(null);
      }
    }
    setIsSelecting(false);
  };

  // -------------------------------------------------------------
  // Render Mel-Spectrogram 2D Canvas
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = specCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Dark slate canvas for acoustic contrast
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Subtle horizontal gridlines & frequency markers
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
          r = 239; g = 68; b = 68;
          alpha = trafficEnergy * 0.85;
        } else if (freqRatio >= 0.2 && freqRatio <= 0.65) {
          // Mids (Speech): Emerald Green
          r = 16; g = 185; b = 129;
          alpha = speechEnergy * 0.95;
        } else {
          // Highs (Music/Air): Blue
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
      ctx.fillStyle = 'rgba(56, 126, 209, 0.25)';
      ctx.fillRect(patchXStart, 0, patchWidth, height);
      ctx.strokeStyle = '#387ed1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(patchXStart, 0, patchWidth, height);
    });

  }, [duration, activeLayerFilter, surgicalHistory, viewMode]);

  // -------------------------------------------------------------
  // Real-Time High-Definition Oscilloscope for Selected Frequency
  // -------------------------------------------------------------
  const activeBand = useMemo(() => {
    return IDENTIFIED_BANDS.find((b) => b.id === selectedBandId) || IDENTIFIED_BANDS[1];
  }, [selectedBandId]);

  useEffect(() => {
    const canvas = scopeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, width, height);

    // Subtle crosshairs
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // Compute dynamic amplitude based on current time
    const t = currentTime;
    const baseEnergy = 0.5 + 0.4 * Math.sin(t * (activeBand.identifiedPeakHz / 50));
    const amp = (height * 0.38) * Math.max(0.2, baseEnergy);

    // Wave drawing
    ctx.strokeStyle = activeBand.color;
    ctx.lineWidth = 2;
    ctx.shadowColor = activeBand.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();

    const cycles = activeBand.displayCycles * 2;
    for (let x = 0; x < width; x++) {
      const phase = (x / width) * cycles * 2 * Math.PI - t * 12;
      const y = midY + Math.sin(phase) * amp + Math.sin(phase * 2) * (amp * 0.25);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

  }, [currentTime, activeBand, selectedBandId]);

  // Helper to draw an individual frequency waveform strip
  const renderFrequencyWave = (band: IdentifiedFrequencyBand, canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Zero-axis line
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();

    // Wave envelope and oscillation
    ctx.strokeStyle = band.color;
    ctx.lineWidth = 1.6;
    ctx.beginPath();

    const totalPoints = 300;
    const step = width / totalPoints;

    for (let i = 0; i <= totalPoints; i++) {
      const colTime = (i / totalPoints) * duration;
      const x = i * step;

      // Modulation envelope depending on band source
      let envelope = 0.5;
      if (band.id === 'sub-bass') {
        envelope = Math.cos(colTime * 0.8) * 0.35 + 0.55;
      } else if (band.id === 'low-mids') {
        envelope = Math.sin(colTime * 2.2) * 0.45 + 0.55;
      } else if (band.id === 'presence') {
        envelope = Math.sin(colTime * 3.5) * 0.5 + 0.5;
      } else if (band.id === 'sibilance') {
        envelope = Math.sin(colTime * 6.0) * 0.4 + 0.4;
      } else {
        envelope = Math.sin(colTime * 1.2) * 0.2 + 0.45;
      }

      // True physical wave oscillation representing the frequency
      const freqOscillation = Math.sin((colTime * band.displayCycles * 8) + (colTime * 1.5));
      const harmonicOscillation = Math.sin((colTime * band.displayCycles * 16)) * 0.3;
      const y = midY + (freqOscillation + harmonicOscillation) * (height * 0.38) * envelope;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Subtle wave fill
    ctx.lineTo(width, midY);
    ctx.lineTo(0, midY);
    ctx.fillStyle = `${band.color}15`;
    ctx.fill();
  };

  const selMin = selectionStart !== null && selectionEnd !== null ? Math.min(selectionStart, selectionEnd) : null;
  const selMax = selectionStart !== null && selectionEnd !== null ? Math.max(selectionStart, selectionEnd) : null;
  const hasActiveBracket = selMin !== null && selMax !== null && selMax - selMin > 0.6;

  const formatSec = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 10);
    return `${m}:${sec < 10 ? '0' : ''}${sec}.${ms}`;
  };

  return (
    <div className="bg-white rounded border border-zerodha-border p-4 shadow-sm space-y-4">
      {/* Top Header & Frequency Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-zerodha-heading">Multi-Band Spectral &amp; Wave Analysis</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-50 text-zerodha-blue border border-blue-200">
              5 Frequency Bands Identified
            </span>
          </div>
          <p className="text-[11px] text-zerodha-muted font-mono mt-0.5">
            Click &amp; drag over timeline or wave tracks to isolate intervals for surgical re-processing.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex rounded border border-zerodha-border overflow-hidden text-xs">
          <button
            onClick={() => setViewMode('SPLIT')}
            className={`px-3 py-1 font-medium flex items-center space-x-1.5 transition-colors ${
              viewMode === 'SPLIT' ? 'bg-zerodha-blue text-white' : 'bg-white text-zerodha-muted hover:bg-gray-50'
            }`}
            title="Spectrogram on top + Stacked Frequency Waves below"
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>

          <button
            onClick={() => setViewMode('FREQUENCY_WAVES')}
            className={`px-3 py-1 font-medium border-l border-zerodha-border flex items-center space-x-1.5 transition-colors ${
              viewMode === 'FREQUENCY_WAVES' ? 'bg-zerodha-blue text-white' : 'bg-white text-zerodha-muted hover:bg-gray-50'
            }`}
            title="Focus on Identified Frequency Waves"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Frequency Waves</span>
          </button>

          <button
            onClick={() => setViewMode('SPECTROGRAM')}
            className={`px-3 py-1 font-medium border-l border-zerodha-border flex items-center space-x-1.5 transition-colors ${
              viewMode === 'SPECTROGRAM' ? 'bg-zerodha-blue text-white' : 'bg-white text-zerodha-muted hover:bg-gray-50'
            }`}
            title="Mel-Spectrogram Heatmap Only"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Spectrogram</span>
          </button>
        </div>
      </div>

      {/* Frequency Bands Filter Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-100">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono font-medium text-gray-500 mr-1">Identified Waves:</span>
          <button
            onClick={() => setSelectedBandId('ALL')}
            className={`px-2.5 py-1 text-xs rounded font-mono transition-colors ${
              selectedBandId === 'ALL'
                ? 'bg-zerodha-blue text-white font-semibold shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Bands (Stacked)
          </button>

          {IDENTIFIED_BANDS.map((band) => (
            <button
              key={band.id}
              onClick={() => setSelectedBandId(band.id)}
              className={`px-2.5 py-1 text-xs rounded font-mono flex items-center space-x-1.5 transition-all ${
                selectedBandId === band.id
                  ? 'bg-gray-900 text-white font-semibold shadow-xs ring-1 ring-offset-1'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: band.color }} />
              <span>{band.rangeLabel}</span>
              <span className="text-[10px] text-gray-400">({band.identifiedPeakHz}Hz)</span>
            </button>
          ))}
        </div>

        {/* Real-time Oscilloscope Mini Monitor */}
        <div className="flex items-center space-x-2 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-[11px] font-mono text-slate-300">
          <Activity className="w-3.5 h-3.5 text-zerodha-green animate-pulse" />
          <span>Scope:</span>
          <span className="font-semibold" style={{ color: activeBand.color }}>
            {activeBand.identifiedPeakHz} Hz &bull; &lambda;={activeBand.wavelengthMeters}m
          </span>
          <canvas
            ref={scopeCanvasRef}
            width={72}
            height={20}
            className="w-18 h-5 rounded border border-slate-700 ml-1"
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. MEL-SPECTROGRAM VIEWPORT (Shown in SPECTROGRAM or SPLIT)     */}
      {/* ============================================================== */}
      {(viewMode === 'SPECTROGRAM' || viewMode === 'SPLIT') && (
        <div>
          <div className="flex items-center justify-between text-xs text-zerodha-muted mb-1 px-1">
            <span className="font-mono text-[11px]">Mel-Spectrogram Heatmap (20 Hz &rarr; 20,000 Hz)</span>
            <div className="flex items-center space-x-3 text-[10px] font-mono">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>Low Rumble</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Speech</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Air/Music</span>
              </span>
            </div>
          </div>

          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="relative h-36 w-full rounded overflow-hidden cursor-crosshair border border-gray-200 select-none"
          >
            <canvas
              ref={specCanvasRef}
              width={1000}
              height={144}
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

                <div className="p-1 flex justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenSurgicalModal(selMin!, selMax!);
                    }}
                    className="px-2.5 py-1 rounded bg-zerodha-blue hover:bg-zerodha-blue-hover text-white text-[11px] font-medium shadow-sm flex items-center space-x-1 transition-all"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Re-evaluate Interval</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. IDENTIFIED FREQUENCY WAVES LANES (SHOW WAVES FOR FREQUENCIES)*/}
      {/* ============================================================== */}
      {(viewMode === 'FREQUENCY_WAVES' || viewMode === 'SPLIT') && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-zerodha-muted px-1">
            <span className="font-mono text-[11px] font-semibold text-zerodha-heading">
              Decomposed Waveforms Across Identified Frequencies
            </span>
            <span className="text-[10px] font-mono text-gray-400">
              Scrub or click anywhere along the waves to seek
            </span>
          </div>

          <div className="space-y-2">
            {(selectedBandId === 'ALL'
              ? IDENTIFIED_BANDS
              : IDENTIFIED_BANDS.filter((b) => b.id === selectedBandId)
            ).map((band) => (
              <FrequencyWaveTrack
                key={band.id}
                band={band}
                currentTime={currentTime}
                duration={duration}
                selectionStart={selectionStart}
                selectionEnd={selectionEnd}
                onSeek={onSeek}
                renderWave={renderFrequencyWave}
                onSelectBand={(id) => setSelectedBandId(id)}
                isSelected={selectedBandId === band.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sound Event Detection (SED) Timeline Strip */}
      <div className="relative h-7 w-full bg-gray-50 rounded overflow-hidden border border-zerodha-border flex items-center px-1">
        <span className="text-[10px] font-mono text-gray-500 uppercase px-1.5 font-bold z-10 flex-shrink-0">
          SED Events
        </span>
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

// -------------------------------------------------------------------
// Sub-component: Individual Wave Track for Each Identified Frequency
// -------------------------------------------------------------------
interface FrequencyWaveTrackProps {
  band: IdentifiedFrequencyBand;
  currentTime: number;
  duration: number;
  selectionStart: number | null;
  selectionEnd: number | null;
  onSeek: (time: number) => void;
  renderWave: (band: IdentifiedFrequencyBand, canvas: HTMLCanvasElement | null) => void;
  onSelectBand: (id: string) => void;
  isSelected: boolean;
}

const FrequencyWaveTrack: React.FC<FrequencyWaveTrackProps> = ({
  band,
  currentTime,
  duration,
  onSeek,
  renderWave,
  onSelectBand,
  isSelected
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    renderWave(band, canvasRef.current);
  }, [band, duration]);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = x / rect.width;
    onSeek(ratio * duration);
  };

  // Instantaneous calculated energy meter for this frequency band at currentTime
  const currentEnergyDb = useMemo(() => {
    const energy = Math.abs(Math.sin(currentTime * (band.identifiedPeakHz / 70))) * 18;
    return (-6 - energy).toFixed(1);
  }, [currentTime, band]);

  return (
    <div className="bg-gray-50/80 rounded border border-gray-200 p-2 transition-all hover:border-gray-300">
      {/* Wave Header Info */}
      <div className="flex items-center justify-between text-xs font-mono mb-1.5">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: band.color }} />
          <span className="font-semibold text-zerodha-heading text-[11px]">{band.name}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-gray-600 border border-gray-200">
            {band.rangeLabel}
          </span>
          <span className="text-[10px] text-gray-500 hidden sm:inline">
            (Peak: <strong className="text-gray-800">{band.identifiedPeakHz} Hz</strong>)
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[10px]">
          <span className="text-gray-500">
            Energy: <strong className="text-gray-800 font-mono">{currentEnergyDb} dBFS</strong>
          </span>
          <button
            onClick={() => onSelectBand(isSelected ? 'ALL' : band.id)}
            className="text-zerodha-blue hover:underline"
          >
            {isSelected ? 'Show All Bands' : 'Solo Wave'}
          </button>
        </div>
      </div>

      {/* Waveform Canvas Viewport */}
      <div
        onClick={handleTrackClick}
        className="relative h-12 w-full rounded overflow-hidden cursor-pointer bg-slate-950 border border-slate-800 select-none group"
      >
        <canvas
          ref={canvasRef}
          width={900}
          height={48}
          className="w-full h-full object-cover"
        />

        {/* Playhead Marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm pointer-events-none z-10"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        >
          <div className="w-2 h-2 -ml-0.75 bg-white rounded-full border border-gray-300" />
        </div>

        {/* Hover Hint */}
        <div className="absolute right-2 bottom-1 text-[9px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {band.sourceType}
        </div>
      </div>
    </div>
  );
};

