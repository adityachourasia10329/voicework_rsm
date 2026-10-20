'use client';

import React from 'react';
import { PresetMode } from '../lib/types';
import { Sparkles, Sliders, Volume2, ShieldCheck, Music } from 'lucide-react';

interface ExpressControlsProps {
  clarityDial: number;
  currentPreset: PresetMode;
  onChangeClarity: (val: number) => void;
  onSelectPreset: (preset: PresetMode) => void;
}

export const ExpressControls: React.FC<ExpressControlsProps> = ({
  clarityDial,
  currentPreset,
  onChangeClarity,
  onSelectPreset
}) => {
  return (
    <div className="bg-white rounded border border-zerodha-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-zerodha-heading flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-zerodha-blue" />
            <span>Express mode &bull; One-touch speech enhancement</span>
          </h3>
          <p className="text-xs text-zerodha-muted mt-0.5">
            Quick studio presets and automatic background noise suppression.
          </p>
        </div>

        <div className="px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-xs font-mono text-zerodha-blue font-medium flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Active Preset: {currentPreset || 'CUSTOM'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Quick Presets Buttons */}
        <div className="space-y-2 md:col-span-2">
          <span className="text-xs font-mono text-zerodha-muted uppercase tracking-wider block">
            Studio Presets
          </span>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => onSelectPreset('VOICE_ONLY')}
              className={`p-3.5 rounded border text-left transition-all ${
                currentPreset === 'VOICE_ONLY'
                  ? 'bg-blue-50 border-zerodha-blue text-zerodha-blue'
                  : 'bg-white hover:bg-gray-50 border-zerodha-border text-zerodha-text'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Volume2 className="w-4 h-4" />
                <span className="text-xs font-semibold">Voice Only</span>
              </div>
              <p className="text-[11px] text-zerodha-muted line-clamp-2">
                100% voice isolation. Mutes traffic, chatter, and music beds.
              </p>
            </button>

            <button
              onClick={() => onSelectPreset('NATURAL_AMBIENT_CLEAN')}
              className={`p-3.5 rounded border text-left transition-all ${
                currentPreset === 'NATURAL_AMBIENT_CLEAN'
                  ? 'bg-blue-50 border-zerodha-blue text-zerodha-blue'
                  : 'bg-white hover:bg-gray-50 border-zerodha-border text-zerodha-text'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Sliders className="w-4 h-4" />
                <span className="text-xs font-semibold">Natural Clean</span>
              </div>
              <p className="text-[11px] text-zerodha-muted line-clamp-2">
                Attenuates noise by 18dB while preserving natural room acoustics.
              </p>
            </button>

            <button
              onClick={() => onSelectPreset('REMOVE_MUSIC')}
              className={`p-3.5 rounded border text-left transition-all ${
                currentPreset === 'REMOVE_MUSIC'
                  ? 'bg-blue-50 border-zerodha-blue text-zerodha-blue'
                  : 'bg-white hover:bg-gray-50 border-zerodha-border text-zerodha-text'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Music className="w-4 h-4" />
                <span className="text-xs font-semibold">Remove Music</span>
              </div>
              <p className="text-[11px] text-zerodha-muted line-clamp-2">
                Eliminates background instruments and keeps voice &amp; natural Foley.
              </p>
            </button>
          </div>
        </div>

        {/* Big Single Clarity & Denoise Dial - Clean Zerodha Blue */}
        <div className="bg-gray-50 p-4 rounded border border-zerodha-border flex flex-col items-center text-center">
          <span className="text-xs font-mono text-zerodha-muted mb-2">Clarity &amp; Denoise Dial</span>

          <div className="relative w-28 h-28 flex items-center justify-center my-1">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="44"
                stroke="#e2e8f0"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="56"
                cy="56"
                r="44"
                stroke="#387ed1"
                strokeWidth="7"
                fill="none"
                strokeDasharray={276}
                strokeDashoffset={276 - (276 * clarityDial) / 100}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold text-zerodha-heading font-mono">{Math.round(clarityDial)}%</span>
              <span className="text-[9px] font-mono text-zerodha-muted uppercase font-medium">Suppression</span>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={clarityDial}
            onChange={(e) => onChangeClarity(parseFloat(e.target.value))}
            className="w-full mt-2 accent-zerodha-blue"
          />
        </div>
      </div>
    </div>
  );
};
