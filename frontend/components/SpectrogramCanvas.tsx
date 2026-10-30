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
    color: '#FF4D36', // Superlist Coral
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
    color: '#27A376', // Superlist Emerald
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
    color: '#258BF5', // Superlist Blue
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
    color: '#FF5DB1', // Superlist Pink
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
    color: '#6B70F0', // Superlist Purple
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

    ctx.fillStyle = '#0A0B10';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
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
          // Superlist Coral #FF4D36 (Traffic / Low Rumble)
          r = 255; g = 77; b = 54;
          alpha = trafficEnergy * 0.85;
          // Apply visual numbing if sub-bass is numbed
          if (isNumbApplied && suggestedTargetBand === 'sub-bass') {
            alpha *= Math.max(0.08, 1 - Math.abs(numbDbLevel) / 60);
          }
        } else if (freqRatio >= 0.2 && freqRatio <= 0.65) {
          // Superlist Emerald #27A376 (Speech Formants)
          r = 39; g = 163; b = 118;
          alpha = speechEnergy * 0.95;
        } else {
          // Superlist Azure #258BF5 (Air / Music)
          r = 37; g = 139; b = 245;
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

    // Draw past surgical patches in Superlist Purple
    surgicalHistory.forEach((patch) => {
      const patchXStart = (patch.startSec / duration) * width;
      const patchWidth = ((patch.endSec - patch.startSec) / duration) * width;
      ctx.fillStyle = 'rgba(107, 112, 240, 0.25)';
      ctx.fillRect(patchXStart, 0, patchWidth, height);
      ctx.strokeStyle = '#6B70F0';
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

    ctx.fillStyle = '#0A0B10';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();

    // Check if this band is currently numbed by the suggested noise control
    const isThisBandNumbed = isNumbApplied && suggestedTargetBand === band.id;
    const numbFactor = isThisBandNumbed ? Math.max(0.12, 1 - Math.abs(numbDbLevel) / 60) : 1.0;

    ctx.strokeStyle = isThisBandNumbed ? '#646982' : band.color;
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
    <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/[0.08] shadow-2xl space-y-5 backdrop-blur-xl text-white">
      {/* Top Header & Frequency Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-heading font-bold text-white tracking-wide">Multi-Band Spectral &amp; Wave Analysis</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF4D36]/15 text-[#FF7A59] border border-[#FF4D36]/30 font-semibold">
              5 Frequency Bands Identified (20 Hz &rarr; 20 kHz)
            </span>
            <FlyingBox
              title="Spectral Analysis & Waves"
              content="This engine breaks down your audio into separate frequency octaves. You can inspect individual wave crests, audition each frequency through your headphones, and numb unwanted noise."
              recommendation="Use Split View to view both the visual spectrogram heatmap and the audio waves together."
            />
          </div>
          <p className="text-[11px] text-[#9FA4B8] font-mono mt-0.5">
            Click &amp; drag over timeline or wave tracks to isolate intervals for surgical re-processing.
          </p>
        </div>

        {/* View Mode Toggle with Flying Boxes */}
        <div className="flex items-center space-x-2">
          <div className="flex rounded-xl border border-white/[0.08] bg-[#12131C] p-1 text-xs font-heading font-medium shadow-inner">
            <button
              onClick={() => setViewMode('SPLIT')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                viewMode === 'SPLIT'
                  ? 'bg-gradient-to-r from-[#FF4D36] to-[#FF7A59] text-white font-bold shadow-[0_0_12px_rgba(255,77,54,0.4)]'
                  : 'text-[#9FA4B8] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>

            <button
              onClick={() => setViewMode('FREQUENCY_WAVES')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                viewMode === 'FREQUENCY_WAVES'
                  ? 'bg-[#6B70F0] text-white font-bold shadow-[0_0_12px_rgba(107,112,240,0.4)]'
                  : 'text-[#9FA4B8] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Frequency Waves</span>
            </button>

            <button
              onClick={() => setViewMode('SPECTROGRAM')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                viewMode === 'SPECTROGRAM'
                  ? 'bg-[#258BF5] text-white font-bold shadow-[0_0_12px_rgba(37,139,245,0.4)]'
                  : 'text-[#9FA4B8] hover:text-white hover:bg-white/[0.04]'
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

      {/* Frequency Bands Filter Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono font-medium text-[#9FA4B8] mr-1 flex items-center space-x-1">
            <span>Identified Waves:</span>
            <FlyingBox
              title="Frequency Bands"
              content="Click any frequency range button to zoom into its dedicated waveform lane, or select All Bands to view all 5 frequency lanes stacked."
            />
          </span>

          <button
            onClick={() => setSelectedBandId('ALL')}
            className={`px-3 py-1 text-xs rounded-xl font-mono transition-all ${
              selectedBandId === 'ALL'
                ? 'bg-gradient-to-r from-[#FF4D36] to-[#FF7A59] text-white font-bold shadow-[0_0_12px_rgba(255,77,54,0.4)]'
                : 'bg-white/[0.04] text-[#9FA4B8] hover:text-white hover:bg-white/[0.08] border border-white/[0.08]'
            }`}
          >
            All Bands (Stacked)
          </button>

          {IDENTIFIED_BANDS.map((band) => (
            <button
              key={band.id}
              onClick={() => setSelectedBandId(band.id)}
              className={`px-2.5 py-1 text-xs rounded-xl font-mono flex items-center space-x-1.5 transition-all border ${
                selectedBandId === band.id
                  ? 'bg-white/[0.12] text-white font-bold border-white/[0.25] shadow-sm'
                  : 'bg-white/[0.03] text-[#9FA4B8] hover:text-white hover:bg-white/[0.06] border-white/[0.06]'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: band.color, boxShadow: `0 0 6px ${band.color}` }} />
              <span>{band.rangeLabel}</span>
              <span className="text-[10px] text-[#646982]">({band.identifiedPeakHz}Hz)</span>
            </button>
          ))}
        </div>

        {/* Headphones Connected Audition Guide */}
        <div className="flex items-center space-x-2 text-[11px] font-mono text-[#9FA4B8]">
          <Headphones className="w-3.5 h-3.5 text-[#27A376]" />
          <span>Connect headphones to audition isolated bands below</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. MEL-SPECTROGRAM VIEWPORT                                     */}
      {/* ============================================================== */}
      {(viewMode === 'SPECTROGRAM' || viewMode === 'SPLIT') && (
        <div>
          <div className="flex items-center justify-between text-xs text-[#9FA4B8] mb-1.5 px-1">
            <span className="font-mono text-[11px] flex items-center space-x-1 text-white">
              <span>Mel-Spectrogram Heatmap (20 Hz &rarr; 20,000 Hz)</span>
              <FlyingBox
                title="Mel-Spectrogram Heatmap"
                content="Visualizes sound intensity across time and pitch. Low red areas represent bass rumble; green areas represent speech; blue areas represent air and music."
              />
            </span>
            <div className="flex items-center space-x-3 text-[10px] font-mono">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF4D36] shadow-[0_0_6px_#FF4D36]" />
                <span className="text-[#FF7A59]">Low Rumble</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#27A376] shadow-[0_0_6px_#27A376]" />
                <span className="text-[#33C287]">Speech</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#258BF5] shadow-[0_0_6px_#258BF5]" />
                <span className="text-[#429CFF]">Air/Music</span>
              </span>
            </div>
          </div>

          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="relative h-36 w-full rounded-xl overflow-hidden cursor-crosshair border border-white/[0.12] bg-[#0A0B10] select-none shadow-inner"
          >
            <canvas
              ref={specCanvasRef}
              width={1000}
              height={144}
              className="w-full h-full object-cover"
            />

            {/* Playhead Scrubber */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-[#FF4D36] shadow-[0_0_10px_#FF4D36] pointer-events-none z-20"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            >
              <div className="w-2.5 h-2.5 -ml-1 bg-[#FF4D36] rounded-full border border-white shadow-md" />
            </div>

            {/* Time Bracket Highlight Selection */}
            {hasActiveBracket && (
              <div
                className="absolute top-0 bottom-0 bg-[#258BF5]/20 border-x-2 border-[#258BF5] z-10 flex flex-col justify-between"
                style={{
                  left: `${(selMin! / duration) * 100}%`,
                  width: `${((selMax! - selMin!) / duration) * 100}%`
                }}
              >
                <div className="bg-[#258BF5] px-2 py-0.5 text-[10px] font-mono text-white font-semibold w-fit rounded-br shadow-sm flex items-center space-x-1">
                  <Crosshair className="w-3 h-3" />
                  <span>{formatSec(selMin!)} – {formatSec(selMax!)} ({(selMax! - selMin!).toFixed(1)}s)</span>
                </div>

                <div className="p-1.5 flex justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenSurgicalModal(selMin!, selMax!);
                    }}
                    className="btn-coral px-3 py-1 rounded-xl text-white text-xs font-semibold shadow-[0_0_15px_rgba(255,77,54,0.4)] flex items-center space-x-1.5 transition-all"
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
          <div className="flex items-center justify-between text-xs text-[#9FA4B8] px-1">
            <span className="font-mono text-[11px] font-semibold text-white flex items-center space-x-1.5">
              <span>Decomposed Waveforms Across Identified Frequencies</span>
              <FlyingBox
                title="Frequency Wave Lanes"
                content="Each lane displays the physical wave oscillations of that frequency band. Use the audition buttons (Play/Pause, Rewind, Fast Forward, Speed) under each wave to listen directly through your audio device."
              />
            </span>
            <span className="text-[10px] font-mono text-[#646982]">
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
      {/* 3. AI SUGGESTED NOISE FREQUENCY NUMBING HUB                    */}
      {/* ============================================================== */}
      <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-white/[0.06]">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-[#FF4D36]" />
            <h4 className="text-xs font-heading font-bold text-white">
              AI Suggested Noise Frequency Suppression &amp; Numbing
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF4D36]/15 text-[#FF7A59] border border-[#FF4D36]/30 font-semibold">
              Noise Detected
            </span>
            <FlyingBox
              title="Suggested Frequency Numbing"
              content="The AI scans the entire 20Hz-20kHz spectrum and identifies frequency bands with unwanted environmental noise (AC whine, traffic rumble, mic hiss). You can numb or attenuate that frequency here with one click."
              recommendation="Use -18 dB for natural voice clarity without losing room presence."
            />
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-[#9FA4B8]">Status:</span>
            {isNumbApplied ? (
              <span className="text-[#27A376] font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Numbed at {numbDbLevel} dB</span>
              </span>
            ) : (
              <span className="text-[#646982]">Flat / Bypass</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Target Noise Band Selector */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-[11px] font-mono text-[#9FA4B8] block">
              Detected Acoustic Interference Target:
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSuggestedTargetBand('sub-bass')}
                className={`px-2.5 py-1 text-xs rounded-xl font-mono border transition-all ${
                  suggestedTargetBand === 'sub-bass'
                    ? 'border-[#FF4D36] bg-[#FF4D36]/20 text-[#FF7A59] font-bold shadow-[0_0_10px_rgba(255,77,54,0.25)]'
                    : 'border-white/[0.08] bg-white/[0.03] text-[#9FA4B8] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                Sub-Bass Rumble (20-140Hz)
              </button>

              <button
                type="button"
                onClick={() => setSuggestedTargetBand('air-highs')}
                className={`px-2.5 py-1 text-xs rounded-xl font-mono border transition-all ${
                  suggestedTargetBand === 'air-highs'
                    ? 'border-[#6B70F0] bg-[#6B70F0]/20 text-[#8E93FF] font-bold shadow-[0_0_10px_rgba(107,112,240,0.25)]'
                    : 'border-white/[0.08] bg-white/[0.03] text-[#9FA4B8] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                HVAC / Tape Hiss (8.5-16kHz)
              </button>

              <button
                type="button"
                onClick={() => setSuggestedTargetBand('sibilance')}
                className={`px-2.5 py-1 text-xs rounded-xl font-mono border transition-all ${
                  suggestedTargetBand === 'sibilance'
                    ? 'border-[#FF5DB1] bg-[#FF5DB1]/20 text-[#FF75C0] font-bold shadow-[0_0_10px_rgba(255,93,177,0.25)]'
                    : 'border-white/[0.08] bg-white/[0.03] text-[#9FA4B8] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                Sibilance Harshness (5-7.5kHz)
              </button>
            </div>
          </div>

          {/* Numb Attenuation Slider */}
          <div className="md:col-span-4 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#9FA4B8]">Suppression Factor:</span>
              <span className="font-bold text-white">
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
              className="w-full accent-[#FF4D36] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#646982]">
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
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-mono text-[#E0E2EC] transition-colors"
            >
              Numb -18dB
            </button>
            <button
              type="button"
              onClick={() => {
                setNumbDbLevel(-60);
                setIsNumbApplied(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#FF4D36]/15 hover:bg-[#FF4D36]/25 border border-[#FF4D36]/30 text-[11px] font-mono text-[#FF7A59] transition-colors"
            >
              Notch Mute
            </button>
            <button
              type="button"
              onClick={() => setIsNumbApplied(!isNumbApplied)}
              className={`px-3 py-1 rounded-lg text-[11px] font-mono transition-all ${
                isNumbApplied
                  ? 'btn-purple font-semibold text-white shadow-[0_0_12px_rgba(107,112,240,0.4)]'
                  : 'bg-white/[0.06] text-[#9FA4B8] hover:text-white hover:bg-white/[0.1]'
              }`}
            >
              {isNumbApplied ? 'Numb Active' : 'Enable Numb'}
            </button>
          </div>
        </div>
      </div>

      {/* Sound Event Detection (SED) Timeline Strip */}
      <div className="relative h-8 w-full bg-[#0A0B10] rounded-xl overflow-hidden border border-white/[0.08] flex items-center px-2">
        <span className="text-[10px] font-mono text-[#9FA4B8] uppercase px-1 font-bold z-10 flex-shrink-0 flex items-center space-x-1">
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
            let badgeClass = 'bg-[#27A376]/20 text-[#33C287] border-[#27A376]/30';
            if (evt.label.includes('TRAFFIC')) badgeClass = 'bg-[#FF4D36]/20 text-[#FF7A59] border-[#FF4D36]/30';
            if (evt.label.includes('CROWD')) badgeClass = 'bg-[#258BF5]/20 text-[#429CFF] border-[#258BF5]/30';
            if (evt.label.includes('MUSIC')) badgeClass = 'bg-[#6B70F0]/20 text-[#8E93FF] border-[#6B70F0]/30';

            return (
              <div
                key={idx}
                className={`absolute top-1 bottom-1 rounded border text-[9px] font-mono px-1.5 flex items-center overflow-hidden whitespace-nowrap ${badgeClass}`}
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
    <div className={`rounded-xl border p-3 transition-all ${
      isNumbed
        ? 'border-[#FF4D36]/40 bg-[#FF4D36]/[0.05] shadow-[0_0_15px_rgba(255,77,54,0.08)]'
        : 'border-white/[0.08] bg-[#12131C] hover:border-white/[0.15]'
    }`}>
      {/* Wave Header Info */}
      <div className="flex flex-wrap items-center justify-between text-xs font-mono mb-2 gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: band.color, boxShadow: `0 0 6px ${band.color}` }} />
          <span className="font-heading font-semibold text-white text-xs">{band.name}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.05] text-[#E0E2EC] border border-white/[0.08]">
            {band.rangeLabel}
          </span>
          <span className="text-[10px] text-[#9FA4B8] hidden sm:inline">
            (Peak: <strong className="text-white font-mono">{band.identifiedPeakHz} Hz</strong>)
          </span>

          {isNumbed && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FF4D36]/20 text-[#FF7A59] border border-[#FF4D36]/30">
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
          <span className="text-[#9FA4B8]">
            Energy: <strong className="text-[#27A376] font-mono">{currentEnergyDb} dBFS</strong>
          </span>
          <button
            onClick={() => onSelectBand(isSelected ? 'ALL' : band.id)}
            className="text-[#6B70F0] hover:text-[#8E93FF] font-semibold transition-colors"
          >
            {isSelected ? 'Show All Bands' : 'Solo Wave'}
          </button>
        </div>
      </div>

      {/* Waveform Canvas Viewport */}
      <div
        onClick={handleTrackClick}
        className="relative h-12 w-full rounded-lg overflow-hidden cursor-pointer bg-[#0A0B10] border border-white/[0.08] select-none group"
      >
        <canvas
          ref={canvasRef}
          width={900}
          height={48}
          className="w-full h-full object-cover"
        />

        {/* Playhead Marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[#FF4D36] shadow-[0_0_8px_#FF4D36] pointer-events-none z-10"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        >
          <div className="w-2 h-2 -ml-0.75 bg-[#FF4D36] rounded-full border border-white" />
        </div>

        <div className="absolute right-2 bottom-1 text-[9px] font-mono text-[#646982] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {band.sourceType}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Frequency Audition Bar (Play/Pause/Backward/Forward/Speed)     */}
      {/* ------------------------------------------------------------- */}
      <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs font-mono bg-white/[0.02] p-2 rounded-xl border border-white/[0.04]">
        <div className="flex items-center space-x-2">
          {/* Play/Pause Button to Audition Frequency */}
          <button
            onClick={onToggleAudition}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              isAuditioning
                ? 'bg-[#27A376] text-white shadow-[0_0_14px_rgba(39,163,118,0.5)] font-bold'
                : 'btn-purple'
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
            className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-[#9FA4B8] hover:text-white transition-colors"
            title="Rewind 5 seconds"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Fast Forward +5s */}
          <button
            onClick={() => onSeek(Math.min(duration, currentTime + 5))}
            className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-[#9FA4B8] hover:text-white transition-colors"
            title="Forward 5 seconds"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <FlyingBox
            title="Audition Controls"
            content="Play, rewind, or skip forward to hear this specific frequency octave through your headphones or audio monitors."
          />
        </div>

        {/* Speed Selector Buttons */}
        <div className="flex items-center space-x-1 text-[10px] font-mono">
          <span className="text-[#9FA4B8] mr-1 flex items-center space-x-1">
            <Gauge className="w-3 h-3 text-[#646982]" />
            <span>Speed:</span>
          </span>
          {speeds.map((spd) => (
            <button
              key={spd}
              onClick={() => onChangeSpeed(spd)}
              className={`px-2 py-0.5 rounded-md transition-all ${
                playbackSpeed === spd
                  ? 'bg-[#FF4D36] text-white font-bold shadow-[0_0_10px_rgba(255,77,54,0.4)]'
                  : 'bg-white/[0.04] text-[#9FA4B8] hover:text-white hover:bg-white/[0.08]'
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


