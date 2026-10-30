'use client';

import React from 'react';
import { StemTrack } from '../lib/types';
import { SlidersHorizontal, Volume2, VolumeX, Mic } from 'lucide-react';
import { FlyingBox } from './FlyingBox';

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
    <div className="glass-panel rounded-2xl p-6 shadow-2xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/[0.08] pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#6B70F0]/15 border border-[#6B70F0]/30 flex items-center justify-center text-[#6B70F0]">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-heading font-bold text-white">Multi-Stem Lane Mixer</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-[#9FA4B8] border border-white/[0.08]">
                -∞ to +6 dB
              </span>
            </div>
            <p className="text-xs text-[#9FA4B8] mt-0.5">
              Independent acoustic balance with sub-3ms hot cache persistence.
            </p>
          </div>
          <FlyingBox
            title="Multi-Stem Audio Mixer"
            content="Independently balance the loudness of each sound layer. Speech, traffic, crowd, and music can be adjusted separately without affecting each other."
            recommendation="Click 'S' to Solo a track and listen to it alone; click 'M' to mute it."
          />
        </div>

        {/* Master Output Gain */}
        <div className="flex items-center space-x-3 bg-[#12131C] px-3.5 py-2 rounded-xl border border-white/[0.08]">
          <span className="text-xs font-mono text-[#9FA4B8]">Master Gain:</span>
          <input
            type="range"
            min="-30"
            max="6"
            step="0.5"
            value={masterGainDb}
            onChange={(e) => onUpdateMasterGain(parseFloat(e.target.value))}
            className="w-24 accent-[#FF4D36]"
          />
          <span className="text-xs font-mono font-bold text-[#FF7A59] w-14 text-right">
            {masterGainDb > 0 ? `+${masterGainDb.toFixed(1)}` : masterGainDb.toFixed(1)} dB
          </span>
        </div>
      </div>

      {/* Stem Lanes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stems.map((stem) => {
          return (
            <div
              key={stem.stemId}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                stem.isMuted
                  ? 'bg-[#12131C]/60 border-white/[0.04] opacity-50'
                  : 'bg-[#161726]/80 border-white/[0.08] hover:border-white/[0.2] hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]'
              }`}
            >
              {/* Stem Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                      style={{ backgroundColor: stem.colorHex, color: stem.colorHex }}
                    />
                    <span className="text-xs font-heading font-semibold text-white truncate max-w-[110px]" title={stem.label}>
                      {stem.label}
                    </span>
                  </div>

                  {/* High-tech Audio Meter Bar */}
                  <div className="flex items-end space-x-0.5 h-3.5 bg-black/40 px-1 py-0.5 rounded">
                    <span className="w-1 bg-[#27A376] rounded-xs h-3 shadow-[0_0_4px_#27A376]" />
                    <span className="w-1 bg-[#27A376] rounded-xs h-2.5" />
                    <span className="w-1 bg-[#258BF5] rounded-xs h-2" />
                    <span className="w-1 bg-[#FF4D36] rounded-xs h-1" />
                  </div>
                </div>

                <div className="text-[10px] font-mono text-[#9FA4B8] mb-3 uppercase tracking-wider">
                  {stem.type.replace('NOISE_', 'NOISE: ')}
                </div>
              </div>

              {/* Volume Slider */}
              <div className="my-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#9FA4B8]">Volume</span>
                  <span className="text-white font-bold">
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
                  className="w-full accent-[#FF4D36]"
                  disabled={stem.isMuted}
                />
              </div>

              {/* Pan Slider */}
              <div className="mb-4 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#9FA4B8]">Pan</span>
                  <span className="text-white/80 font-semibold">
                    {stem.pan === 0 ? 'C' : stem.pan < 0 ? `L ${Math.abs(Math.round(stem.pan * 100))}` : `R ${Math.round(stem.pan * 100)}`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.1"
                  value={stem.pan}
                  onChange={(e) => onUpdateStem(stem.stemId, { pan: parseFloat(e.target.value) })}
                  className="w-full accent-[#6B70F0]"
                  disabled={stem.isMuted}
                />
              </div>

              {/* Solo & Mute Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06]">
                <button
                  onClick={() => onUpdateStem(stem.stemId, { isSolo: !stem.isSolo })}
                  className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    stem.isSolo
                      ? 'bg-[#27A376] text-white shadow-[0_0_12px_rgba(39,163,118,0.5)]'
                      : 'bg-white/[0.04] text-[#9FA4B8] hover:text-white hover:bg-white/[0.08]'
                  }`}
                  title="Solo Stem"
                >
                  S
                </button>

                <button
                  onClick={() => onUpdateStem(stem.stemId, { isMuted: !stem.isMuted })}
                  className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    stem.isMuted
                      ? 'bg-[#FF4D36] text-white shadow-[0_0_12px_rgba(255,77,54,0.5)]'
                      : 'bg-white/[0.04] text-[#9FA4B8] hover:text-white hover:bg-white/[0.08]'
                  }`}
                  title="Mute Stem"
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
