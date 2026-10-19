'use client';

import React from 'react';
import { StemTrack } from '../lib/types';
import { Volume2, VolumeX, SlidersHorizontal, Disc3, Mic, Activity } from 'lucide-react';

interface StemMixerProps {
  stems: StemTrack[];
  masterGainDb: number;
  onUpdateStem: (stemId: string, updates: Partial<StemTrack>) => void;
  onUpdateMasterGain: (gainDb: number) => void;
}

export const StemMixer: React.FC<StemMixerProps> = ({
  stems,
  masterGainDb,
  onUpdateStem,
  onUpdateMasterGain
}) => {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-border">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-5 h-5 text-accent" />
          <h3 className="text-sm font-bold text-white tracking-wide">Full Authority Multi-Stem Mixer</h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-gray-400">
            Zero-Loss Stems (-∞ to +6dB)
          </span>
        </div>

        {/* Master Output Gain */}
        <div className="flex items-center space-x-3 bg-surface px-3 py-1.5 rounded-xl border border-border">
          <span className="text-[11px] font-mono text-gray-400">Master Out:</span>
          <input
            type="range"
            min="-30"
            max="6"
            step="0.5"
            value={masterGainDb}
            onChange={(e) => onUpdateMasterGain(parseFloat(e.target.value))}
            className="w-24 accent-accent"
          />
          <span className="text-[11px] font-mono font-bold text-white w-12 text-right">
            {masterGainDb > 0 ? `+${masterGainDb.toFixed(1)}` : masterGainDb.toFixed(1)} dB
          </span>
        </div>
      </div>

      {/* Stem Lanes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stems.map((stem) => {
          const isSpeech = stem.type === 'SPEECH_MAIN';
          return (
            <div
              key={stem.stemId}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                stem.isMuted
                  ? 'bg-surface/30 border-border/40 opacity-60'
                  : 'bg-surface-elevated/80 border-border hover:border-border/80'
              }`}
            >
              {/* Stem Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: stem.colorHex }}
                    />
                    <span className="text-xs font-bold text-white truncate max-w-[110px]" title={stem.label}>
                      {stem.label}
                    </span>
                  </div>

                  {/* Peak meter animation */}
                  <div className="flex items-end space-x-0.5 h-3">
                    <span className="w-1 bg-emerald-500 rounded-sm animate-pulse h-3" />
                    <span className="w-1 bg-emerald-400 rounded-sm animate-pulse h-2" />
                    <span className="w-1 bg-yellow-500 rounded-sm animate-pulse h-1" />
                  </div>
                </div>

                <div className="text-[10px] font-mono text-gray-400 mb-3">
                  {stem.type.replace('NOISE_', 'NOISE: ')}
                </div>
              </div>

              {/* Volume Slider & Meter */}
              <div className="my-2 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-gray-400">Gain</span>
                  <span className="text-white font-semibold">
                    {stem.volumeDb <= -60 ? '-∞' : (stem.volumeDb > 0 ? `+${stem.volumeDb.toFixed(1)}` : stem.volumeDb.toFixed(1))} dB
                  </span>
                </div>

                <input
                  type="range"
                  min="-60"
                  max="6"
                  step="0.5"
                  value={stem.volumeDb}
                  onChange={(e) => onUpdateStem(stem.stemId, { volumeDb: parseFloat(e.target.value) })}
                  className="w-full accent-accent"
                  style={{ accentColor: stem.colorHex }}
                />
              </div>

              {/* Pan Slider */}
              <div className="my-2 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                  <span>Pan</span>
                  <span>
                    {stem.pan === 0 ? 'C' : (stem.pan < 0 ? `L${Math.abs(Math.round(stem.pan * 100))}` : `R${Math.round(stem.pan * 100)}`)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.05"
                  value={stem.pan}
                  onChange={(e) => onUpdateStem(stem.stemId, { pan: parseFloat(e.target.value) })}
                  className="w-full accent-gray-400 h-1"
                />
              </div>

              {/* Solo & Mute Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border/50">
                <button
                  onClick={() => onUpdateStem(stem.stemId, { isSolo: !stem.isSolo })}
                  className={`py-1 rounded text-[11px] font-mono font-bold transition-all ${
                    stem.isSolo
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                      : 'bg-surface hover:bg-surface-elevated text-gray-400 border border-border'
                  }`}
                >
                  S
                </button>

                <button
                  onClick={() => onUpdateStem(stem.stemId, { isMuted: !stem.isMuted })}
                  className={`py-1 rounded text-[11px] font-mono font-bold transition-all ${
                    stem.isMuted
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                      : 'bg-surface hover:bg-surface-elevated text-gray-400 border border-border'
                  }`}
                >
                  M
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
