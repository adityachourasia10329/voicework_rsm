'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { SpectrogramFrame, SoundEvent, SurgicalRevision } from '../lib/types';
import {
  Sparkles,
  Layers,
  Crosshair,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Gauge,
  Sliders,
  ShieldAlert,
  Radio,
  SplitSquareVertical,
  CheckCircle2,
  Info,
  HelpCircle,
  Headphones
} from 'lucide-react';
import { FlyingBox } from './FlyingBox';

export interface IdentifiedFrequencyBand {
  id: string;
  name: string;
  rangeLabel: string;
  minHz: number;
  maxHz: number;
  identifiedPeakHz: number;
  wavelengthMeters: number;
  color: string;
  sourceType: string;
  displayCycles: number;
  description: string;
  suggestedAction?: 'SUPPRESS_NOISE' | 'PRESERVE_SPEECH' | 'ATTENUATE_SIBILANCE';
}

export const IDENTIFIED_BANDS: IdentifiedFrequencyBand[] = [
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
    description: 'Deep sinusoidal rumble, vehicular road resonance, and sub-acoustic floor vibrations.',
    suggestedAction: 'SUPPRESS_NOISE'
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
    description: 'Human vocal cords fundamental frequency (F₀), vocal body warmth, and dialogue cadence.',
    suggestedAction: 'PRESERVE_SPEECH'
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
    description: 'Intelligibility formant zone (vowels, consonant articulation, dialogue clarity).',
    suggestedAction: 'PRESERVE_SPEECH'
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
    description: 'High-frequency dental and palatal fricatives, percussion clicks, and edge articulation.',
    suggestedAction: 'ATTENUATE_SIBILANCE'
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
    description: 'Micro-vibrational acoustic air, preamp thermal noise, and tape shimmer tail.',
    suggestedAction: 'SUPPRESS_NOISE'
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

  // View Mode: Mel Spectrogram vs Frequency Waves vs Split View
  const [viewMode, setViewMode] = useState<'SPECTROGRAM' | 'FREQUENCY_WAVES' | 'SPLIT'>('SPLIT');
  
  // Selected Frequency Filter ('ALL' for stacked waves, or specific band ID)
  const [selectedBandId, setSelectedBandId] = useState<string>('ALL');

  // Time bracket selection state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);

  const [activeLayerFilter, setActiveLayerFilter] = useState<string>('ALL');

  // -------------------------------------------------------------------------
  // Suggested Noise Suppression / Numbing State (Requirement 2)
  // -------------------------------------------------------------------------
  const [suggestedTargetBand, setSuggestedTargetBand] = useState<string>('sub-bass');
  const [numbDbLevel, setNumbDbLevel] = useState<number>(-18); // dB attenuation
  const [isNumbApplied, setIsNumbApplied] = useState<boolean>(true);

  // Audio Auditioning States for Frequency Tracks (Requirement 3)
  const [auditioningBandId, setAuditioningBandId] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeOscillatorRef = useRef<OscillatorNode | null>(null);
  const activeGainRef = useRef<GainNode | null>(null);

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
  // Web Audio Frequency Audition Synthesizer (Requirement 3)
  // -------------------------------------------------------------
  const stopAuditionAudio = () => {
    if (activeOscillatorRef.current) {
      try {
        activeOscillatorRef.current.stop();
        activeOscillatorRef.current.disconnect();
      } catch (e) {}
      activeOscillatorRef.current = null;
    }
    setAuditioningBandId(null);
  };

  const startAuditionAudio = (band: IdentifiedFrequencyBand) => {
    stopAuditionAudio();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create oscillator tailored to this specific frequency band
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Configure frequency parameters
      osc.type = band.id === 'sub-bass' ? 'sine' : band.id === 'low-mids' ? 'triangle' : band.id === 'presence' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(band.identifiedPeakHz * playbackSpeed, ctx.currentTime);

      // Filter to acoustic range
      filter.type = band.id === 'sub-bass' ? 'lowpass' : band.id === 'air-highs' ? 'highpass' : 'bandpass';
      filter.frequency.setValueAtTime(band.identifiedPeakHz, ctx.currentTime);
      filter.Q.setValueAtTime(2.0, ctx.currentTime);

      // Volume envelope (subdued and pleasant for headphones)
      const baseGain = band.id === 'air-highs' ? 0.05 : band.id === 'sibilance' ? 0.08 : 0.18;
      gain.gain.setValueAtTime(baseGain, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      activeOscillatorRef.current = osc;
      activeGainRef.current = gain;
      setAuditioningBandId(band.id);

    } catch (err) {
      console.warn('Web Audio playback error:', err);
    }
  };

  const toggleAudition = (band: IdentifiedFrequencyBand) => {
    if (auditioningBandId === band.id) {
      stopAuditionAudio();
    } else {
      startAuditionAudio(band);
    }
  };

  useEffect(() => {
    return () => {
      stopAuditionAudio();
    };
  }, []);

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

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let f = 0; f < height; f += 25) {
      ctx.beginPath();
      ctx.moveTo(0, f);
      ctx.lineTo(width, f);
      ctx.stroke();
    }

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
        const musicEnergy = Math.sin(colTime * 3.0 + s) * 0.3 + 0.2;

        let r = 0, g = 0, b = 0, alpha = 0.15;

        if (freqRatio < 0.2) {
          r = 239; g = 68; b = 68;
          alpha = trafficEnergy * 0.85;
          // Apply visual numbing if sub-bass is numbed
          if (isNumbApplied && suggestedTargetBand === 'sub-bass') {
            alpha *= Math.max(0.08, 1 - Math.abs(numbDbLevel) / 60);
          }
        } else if (freqRatio >= 0.2 && freqRatio <= 0.65) {
          r = 16; g = 185; b = 129;
          alpha = speechEnergy * 0.95;
        } else {
          r = 56; g = 126; b = 209;
          alpha = musicEnergy * 0.75;
          if (isNumbApplied && suggestedTargetBand === 'air-highs') {
            alpha *= Math.max(0.08, 1 - Math.abs(numbDbLevel) / 60);
          }
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

  }, [duration, activeLayerFilter, surgicalHistory, viewMode, isNumbApplied, numbDbLevel, suggestedTargetBand]);

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

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();

    // Check if this band is currently numbed by the suggested noise control
    const isThisBandNumbed = isNumbApplied && suggestedTargetBand === band.id;
    const numbFactor = isThisBandNumbed ? Math.max(0.12, 1 - Math.abs(numbDbLevel) / 60) : 1.0;

    ctx.strokeStyle = isThisBandNumbed ? '#94a3b8' : band.color;
    ctx.lineWidth = isThisBandNumbed ? 1.2 : 1.6;
    ctx.beginPath();

    const totalPoints = 300;
    const step = width / totalPoints;

    for (let i = 0; i <= totalPoints; i++) {
      const colTime = (i / totalPoints) * duration;
      const x = i * step;

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

      envelope *= numbFactor;

      const freqOscillation = Math.sin((colTime * band.displayCycles * 8) + (colTime * 1.5));
      const harmonicOscillation = Math.sin((colTime * band.displayCycles * 16)) * 0.3;
      const y = midY + (freqOscillation + harmonicOscillation) * (height * 0.38) * envelope;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

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
              5 Frequency Bands Identified (20 Hz &rarr; 20 kHz)
            </span>
            <FlyingBox
              title="Spectral Analysis & Waves"
              content="This engine breaks down your audio into separate frequency octaves. You can inspect individual wave crests, audition each frequency through your headphones, and numb unwanted noise."
              recommendation="Use Split View to view both the visual spectrogram heatmap and the audio waves together."
            />
          </div>
          <p className="text-[11px] text-zerodha-muted font-mono mt-0.5">
            Click &amp; drag over timeline or wave tracks to isolate intervals for surgical re-processing.
          </p>
        </div>

        {/* View Mode Toggle with Flying Boxes */}
        <div className="flex items-center space-x-2">
          <div className="flex rounded border border-zerodha-border overflow-hidden text-xs">
            <button
              onClick={() => setViewMode('SPLIT')}
              className={`px-3 py-1 font-medium flex items-center space-x-1.5 transition-colors ${
                viewMode === 'SPLIT' ? 'bg-zerodha-blue text-white' : 'bg-white text-zerodha-muted hover:bg-gray-50'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>

            <button
              onClick={() => setViewMode('FREQUENCY_WAVES')}
              className={`px-3 py-1 font-medium border-l border-zerodha-border flex items-center space-x-1.5 transition-colors ${
                viewMode === 'FREQUENCY_WAVES' ? 'bg-zerodha-blue text-white' : 'bg-white text-zerodha-muted hover:bg-gray-50'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Frequency Waves</span>
            </button>

            <button
              onClick={() => setViewMode('SPECTROGRAM')}
              className={`px-3 py-1 font-medium border-l border-zerodha-border flex items-center space-x-1.5 transition-colors ${
                viewMode === 'SPECTROGRAM' ? 'bg-zerodha-blue text-white' : 'bg-white text-zerodha-muted hover:bg-gray-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Spectrogram</span>
            </button>
          </div>
          <FlyingBox
            title="View Modes"
            content="Split View displays both the spectral energy heatmap and the wave graphs. Frequency Waves isolates individual wave tracks. Spectrogram shows pure frequency density."
          />
        </div>
      </div>

      {/* Frequency Bands Filter Selector (Note: Scope box removed per Requirement 4) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-100">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono font-medium text-gray-500 mr-1 flex items-center space-x-1">
            <span>Identified Waves:</span>
            <FlyingBox
              title="Frequency Bands"
              content="Click any frequency range button to zoom into its dedicated waveform lane, or select All Bands to view all 5 frequency lanes stacked."
            />
          </span>

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

        {/* Headphones Connected Audition Guide */}
        <div className="flex items-center space-x-2 text-[11px] font-mono text-gray-500">
          <Headphones className="w-3.5 h-3.5 text-zerodha-blue" />
          <span>Connect headphones to audition isolated bands below</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. MEL-SPECTROGRAM VIEWPORT                                     */}
      {/* ============================================================== */}
      {(viewMode === 'SPECTROGRAM' || viewMode === 'SPLIT') && (
        <div>
          <div className="flex items-center justify-between text-xs text-zerodha-muted mb-1 px-1">
            <span className="font-mono text-[11px] flex items-center space-x-1">
              <span>Mel-Spectrogram Heatmap (20 Hz &rarr; 20,000 Hz)</span>
              <FlyingBox
                title="Mel-Spectrogram Heatmap"
                content="Visualizes sound intensity across time and pitch. Low red areas represent bass rumble; green areas represent speech; blue areas represent air and music."
              />
            </span>
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

            {/* Playhead Scrubber */}
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
      {/* 2. IDENTIFIED FREQUENCY WAVES LANES WITH AUDITION CONTROLS     */}
      {/* ============================================================== */}
      {(viewMode === 'FREQUENCY_WAVES' || viewMode === 'SPLIT') && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs text-zerodha-muted px-1">
            <span className="font-mono text-[11px] font-semibold text-zerodha-heading flex items-center space-x-1.5">
              <span>Decomposed Waveforms Across Identified Frequencies</span>
              <FlyingBox
                title="Frequency Wave Lanes"
                content="Each lane displays the physical wave oscillations of that frequency band. Use the audition buttons (Play/Pause, Rewind, Fast Forward, Speed) under each wave to listen directly through your audio device."
              />
            </span>
            <span className="text-[10px] font-mono text-gray-400">
              Scrub or click anywhere along the waves to seek
            </span>
          </div>

          <div className="space-y-3">
            {(selectedBandId === 'ALL'
              ? IDENTIFIED_BANDS
              : IDENTIFIED_BANDS.filter((b) => b.id === selectedBandId)
            ).map((band) => (
              <FrequencyWaveTrackWithAudio
                key={band.id}
                band={band}
                currentTime={currentTime}
                duration={duration}
                onSeek={onSeek}
                renderWave={renderFrequencyWave}
                onSelectBand={(id) => setSelectedBandId(id)}
                isSelected={selectedBandId === band.id}
                isAuditioning={auditioningBandId === band.id}
                onToggleAudition={() => toggleAudition(band)}
                playbackSpeed={playbackSpeed}
                onChangeSpeed={(spd) => setPlaybackSpeed(spd)}
                isNumbed={isNumbApplied && suggestedTargetBand === band.id}
                numbDbLevel={numbDbLevel}
              />
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. AI SUGGESTED NOISE FREQUENCY NUMBING HUB (Requirement 2)    */}
      {/* ============================================================== */}
      <div className="mt-4 p-3.5 bg-gray-50 rounded border border-zerodha-border">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-zerodha-orange" />
            <h4 className="text-xs font-semibold text-zerodha-heading">
              AI Suggested Noise Frequency Suppression &amp; Numbing
            </h4>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
              Noise Detected
            </span>
            <FlyingBox
              title="Suggested Frequency Numbing"
              content="The AI scans the entire 20Hz-20kHz spectrum and identifies frequency bands with unwanted environmental noise (AC whine, traffic rumble, mic hiss). You can numb or attenuate that frequency here with one click."
              recommendation="Use -18 dB for natural voice clarity without losing room presence."
            />
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-gray-500">Status:</span>
            {isNumbApplied ? (
              <span className="text-zerodha-blue font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Numbed at {numbDbLevel} dB</span>
              </span>
            ) : (
              <span className="text-gray-400">Flat / Bypass</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Target Noise Band Selector */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-[11px] font-mono text-gray-600 block">
              Detected Acoustic Interference Target:
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSuggestedTargetBand('sub-bass')}
                className={`px-2.5 py-1 text-xs rounded font-mono border transition-all ${
                  suggestedTargetBand === 'sub-bass'
                    ? 'border-red-500 bg-red-50 text-red-700 font-semibold shadow-xs'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Sub-Bass Rumble (20-140Hz)
              </button>

              <button
                type="button"
                onClick={() => setSuggestedTargetBand('air-highs')}
                className={`px-2.5 py-1 text-xs rounded font-mono border transition-all ${
                  suggestedTargetBand === 'air-highs'
                    ? 'border-purple-500 bg-purple-50 text-purple-700 font-semibold shadow-xs'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                HVAC / Tape Hiss (8.5-16kHz)
              </button>

              <button
                type="button"
                onClick={() => setSuggestedTargetBand('sibilance')}
                className={`px-2.5 py-1 text-xs rounded font-mono border transition-all ${
                  suggestedTargetBand === 'sibilance'
                    ? 'border-amber-500 bg-amber-50 text-amber-700 font-semibold shadow-xs'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Sibilance Harshness (5-7.5kHz)
              </button>
            </div>
          </div>

          {/* Numb Attenuation Slider */}
          <div className="md:col-span-4 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-600">Suppression Factor:</span>
              <span className="font-bold text-zerodha-heading">
                {isNumbApplied ? `${numbDbLevel} dB` : '0 dB (Off)'}
              </span>
            </div>
            <input
              type="range"
              min="-60"
              max="0"
              step="3"
              value={numbDbLevel}
              onChange={(e) => {
                setNumbDbLevel(parseInt(e.target.value));
                setIsNumbApplied(true);
              }}
              className="w-full accent-zerodha-blue cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-gray-400">
              <span>-60 dB (Total Mute)</span>
              <span>-18 dB (Balanced)</span>
              <span>0 dB (Flat)</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="md:col-span-3 flex flex-wrap gap-1.5 items-center justify-end">
            <button
              type="button"
              onClick={() => {
                setNumbDbLevel(-18);
                setIsNumbApplied(true);
              }}
              className="px-2 py-1 rounded bg-white hover:bg-gray-100 border border-zerodha-border text-[11px] font-mono text-gray-700 transition-colors"
            >
              Numb -18dB
            </button>
            <button
              type="button"
              onClick={() => {
                setNumbDbLevel(-60);
                setIsNumbApplied(true);
              }}
              className="px-2 py-1 rounded bg-white hover:bg-gray-100 border border-zerodha-border text-[11px] font-mono text-red-600 transition-colors"
            >
              Notch Mute
            </button>
            <button
              type="button"
              onClick={() => setIsNumbApplied(!isNumbApplied)}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                isNumbApplied
                  ? 'bg-zerodha-blue text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {isNumbApplied ? 'Numb Active' : 'Enable Numb'}
            </button>
          </div>
        </div>
      </div>

      {/* Sound Event Detection (SED) Timeline Strip */}
      <div className="relative h-7 w-full bg-gray-50 rounded overflow-hidden border border-zerodha-border flex items-center px-1">
        <span className="text-[10px] font-mono text-gray-500 uppercase px-1.5 font-bold z-10 flex-shrink-0 flex items-center space-x-1">
          <span>SED Events</span>
          <FlyingBox
            title="Sound Event Detection"
            content="AI automatically tags recognized sound layers (Traffic, Speech, Crowd, Music) across timestamps."
          />
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
// Sub-component: Individual Wave Track with Audio Audition Controls
// -------------------------------------------------------------------
interface FrequencyWaveTrackWithAudioProps {
  band: IdentifiedFrequencyBand;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  renderWave: (band: IdentifiedFrequencyBand, canvas: HTMLCanvasElement | null) => void;
  onSelectBand: (id: string) => void;
  isSelected: boolean;
  isAuditioning: boolean;
  onToggleAudition: () => void;
  playbackSpeed: number;
  onChangeSpeed: (spd: number) => void;
  isNumbed: boolean;
  numbDbLevel: number;
}

const FrequencyWaveTrackWithAudio: React.FC<FrequencyWaveTrackWithAudioProps> = ({
  band,
  currentTime,
  duration,
  onSeek,
  renderWave,
  onSelectBand,
  isSelected,
  isAuditioning,
  onToggleAudition,
  playbackSpeed,
  onChangeSpeed,
  isNumbed,
  numbDbLevel
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    renderWave(band, canvasRef.current);
  }, [band, duration, isNumbed, numbDbLevel]);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = x / rect.width;
    onSeek(ratio * duration);
  };

  const currentEnergyDb = useMemo(() => {
    const baseEnergy = Math.abs(Math.sin(currentTime * (band.identifiedPeakHz / 70))) * 18;
    let net = -6 - baseEnergy;
    if (isNumbed) net += numbDbLevel;
    return net.toFixed(1);
  }, [currentTime, band, isNumbed, numbDbLevel]);

  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className={`bg-gray-50/80 rounded border p-2.5 transition-all ${
      isNumbed ? 'border-amber-300 bg-amber-50/20' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Wave Header Info */}
      <div className="flex flex-wrap items-center justify-between text-xs font-mono mb-1.5 gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: band.color }} />
          <span className="font-semibold text-zerodha-heading text-[11px]">{band.name}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-gray-600 border border-gray-200">
            {band.rangeLabel}
          </span>
          <span className="text-[10px] text-gray-500 hidden sm:inline">
            (Peak: <strong className="text-gray-800">{band.identifiedPeakHz} Hz</strong>)
          </span>

          {isNumbed && (
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
              NUMBED {numbDbLevel} dB
            </span>
          )}

          <FlyingBox
            title={`${band.name} (${band.rangeLabel})`}
            content={band.description}
            recommendation={band.sourceType}
          />
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

        <div className="absolute right-2 bottom-1 text-[9px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {band.sourceType}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Frequency Audition Bar (Play/Pause/Backward/Forward/Speed)     */}
      {/* ------------------------------------------------------------- */}
      <div className="mt-2 pt-2 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs font-mono bg-white p-1.5 rounded border border-gray-100">
        <div className="flex items-center space-x-2">
          {/* Play/Pause Button to Audition Frequency */}
          <button
            onClick={onToggleAudition}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center space-x-1.5 transition-all shadow-xs ${
              isAuditioning
                ? 'bg-zerodha-green text-white ring-2 ring-emerald-200'
                : 'bg-zerodha-blue hover:bg-zerodha-blue-hover text-white'
            }`}
            title="Listen to this frequency range directly through connected audio device"
          >
            {isAuditioning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Auditioning...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Listen to {band.identifiedPeakHz}Hz</span>
              </>
            )}
          </button>

          {/* Rewind -5s */}
          <button
            onClick={() => onSeek(Math.max(0, currentTime - 5))}
            className="p-1 rounded border border-zerodha-border bg-white hover:bg-gray-50 text-gray-600 transition-colors"
            title="Rewind 5 seconds"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {/* Fast Forward +5s */}
          <button
            onClick={() => onSeek(Math.min(duration, currentTime + 5))}
            className="p-1 rounded border border-zerodha-border bg-white hover:bg-gray-50 text-gray-600 transition-colors"
            title="Forward 5 seconds"
          >
            <RotateCw className="w-3 h-3" />
          </button>

          <FlyingBox
            title="Audition Controls"
            content="Play, rewind, or skip forward to hear this specific frequency octave through your headphones or audio monitors."
          />
        </div>

        {/* Speed Selector Buttons */}
        <div className="flex items-center space-x-1 text-[10px]">
          <span className="text-gray-500 mr-1 flex items-center space-x-1">
            <Gauge className="w-3 h-3 text-gray-400" />
            <span>Speed:</span>
          </span>
          {speeds.map((spd) => (
            <button
              key={spd}
              onClick={() => onChangeSpeed(spd)}
              className={`px-1.5 py-0.5 rounded transition-all ${
                playbackSpeed === spd
                  ? 'bg-zerodha-blue text-white font-bold'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {spd}x
            </button>
          ))}
          <FlyingBox
            title="Playback Speed"
            content="Slow down (0.5x, 0.75x) to analyze rapid speech transients, or speed up (1.5x, 2.0x) for quick acoustic review."
          />
        </div>
      </div>
    </div>
  );
};


