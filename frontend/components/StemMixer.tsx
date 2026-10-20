'use client';

import React from 'react';
import { StemTrack } from '../lib/types';
import { SlidersHorizontal } from 'lucide-react';

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
    <div className="bg-white rounded border border-zerodha-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-zerodha-blue" />
          <h3 className="text-sm font-semibold text-zerodha-heading">Multi-stem lane mixer</h3>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-100 text-zerodha-muted border border-gray-200">
            Faders: -∞ to +6dB
          </span>
        </div>

        {/* Master Output Gain */}
        <div className="flex items-center space-x-3 bg-gray-50 px-3 py-1.5 rounded border border-zerodha-border">
          <span className="text-xs font-mono text-zerodha-muted">Master Gain:</span>
          <input
            type="range"
            min="-30"
            max="6"
            step="0.5"
            value={masterGainDb}
            onChange={(e) => onUpdateMasterGain(parseFloat(e.target.value))}
            className="w-24 accent-zerodha-blue"
          />
          <span className="text-xs font-mono font-semibold text-zerodha-heading w-12 text-right">
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
              className={`p-3.5 rounded border transition-all flex flex-col justify-between ${
                stem.isMuted
                  ? 'bg-gray-50 border-gray-200 opacity-60'
                  : 'bg-white border-zerodha-border hover:border-gray-300'
              }`}
            >
              {/* Stem Header */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: stem.colorHex }}
                    />
                    <span className="text-xs font-semibold text-zerodha-heading truncate max-w-[110px]" title={stem.label}>
                      {stem.label}
                    </span>
                  </div>

                  {/* Clean meter */}
                  <div className="flex items-end space-x-0.5 h-3">
                    <span className="w-1 bg-emerald-500 rounded-sm h-3" />
                    <span className="w-1 bg-emerald-400 rounded-sm h-2" />
                    <span className="w-1 bg-yellow-400 rounded-sm h-1" />
                  </div>
                </div>

                <div className="text-[10px] font-mono text-zerodha-muted mb-3">
                  {stem.type.replace('NOISE_', 'NOISE: ')}
                </div>
              </div>

              {/* Volume Slider */}
              <div className="my-2 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zerodha-muted">Volume</span>
                  <span className="text-zerodha-heading font-semibold">
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
                  className="w-full accent-zerodha-blue"
                />
              </div>

              {/* Pan Slider */}
              <div className="my-2 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-zerodha-muted">
                  <span>Pan</span>
                  <span>
                    {stem.pan === 0 ? 'Center' : (stem.pan < 0 ? `L ${Math.abs(Math.round(stem.pan * 100))}` : `R ${Math.round(stem.pan * 100)}`)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.05"
                  value={stem.pan}
                  onChange={(e) => onUpdateStem(stem.stemId, { pan: parseFloat(e.target.value) })}
                  className="w-full accent-gray-500 h-1"
                />
              </div>

              {/* Solo & Mute Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => onUpdateStem(stem.stemId, { isSolo: !stem.isSolo })}
                  className={`py-1 rounded text-xs font-mono font-semibold transition-all ${
                    stem.isSolo
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-white hover:bg-gray-50 text-zerodha-muted border border-zerodha-border'
                  }`}
                >
                  Solo
                </button>

                <button
                  onClick={() => onUpdateStem(stem.stemId, { isMuted: !stem.isMuted })}
                  className={`py-1 rounded text-xs font-mono font-semibold transition-all ${
                    stem.isMuted
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : 'bg-white hover:bg-gray-50 text-zerodha-muted border border-zerodha-border'
                  }`}
                >
                  Mute
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
