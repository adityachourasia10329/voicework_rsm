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
    <div className="glass-panel rounded-2xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Beginner / Express Mode Controls</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            One-touch intelligent AI clarity dial and studio-grade noise reduction presets.
          </p>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400 font-semibold flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Active Preset: {currentPreset || 'CUSTOM'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Quick Presets Buttons */}
        <div className="space-y-2.5 md:col-span-2">
          <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
            Studio Presets
          </span>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => onSelectPreset('VOICE_ONLY')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                currentPreset === 'VOICE_ONLY'
                  ? 'bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/20 text-white'
                  : 'bg-surface hover:bg-surface-elevated border-border text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold">Voice Only</span>
              </div>
              <p className="text-[10px] text-gray-400 line-clamp-2">
                100% voice isolation. Mutes traffic, chatter, and music beds.
              </p>
            </button>

            <button
              onClick={() => onSelectPreset('NATURAL_AMBIENT_CLEAN')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                currentPreset === 'NATURAL_AMBIENT_CLEAN'
                  ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/20 text-white'
                  : 'bg-surface hover:bg-surface-elevated border-border text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold">Natural Clean</span>
              </div>
              <p className="text-[10px] text-gray-400 line-clamp-2">
                Attenuates noise by 18dB while preserving natural room warmth.
              </p>
            </button>

            <button
              onClick={() => onSelectPreset('REMOVE_MUSIC')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                currentPreset === 'REMOVE_MUSIC'
                  ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20 text-white'
                  : 'bg-surface hover:bg-surface-elevated border-border text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Music className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold">Remove Music</span>
              </div>
              <p className="text-[10px] text-gray-400 line-clamp-2">
                Eliminates background instruments and keeps voice &amp; natural Foley.
              </p>
            </button>
          </div>
        </div>

        {/* Big Single Clarity & Denoise Dial */}
        <div className="glass-panel-elevated p-4 rounded-xl border border-border flex flex-col items-center text-center">
          <span className="text-[11px] font-mono text-gray-400 mb-2">Clarity &amp; Denoise Dial</span>

          <div className="relative w-28 h-28 flex items-center justify-center my-1">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="44"
                stroke="#1E293B"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="56"
                cy="56"
                r="44"
                stroke="#10B981"
                strokeWidth="8"
                fill="none"
                strokeDasharray={276}
                strokeDashoffset={276 - (276 * clarityDial) / 100}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-white font-mono">{Math.round(clarityDial)}%</span>
              <span className="text-[9px] font-mono text-emerald-400 uppercase font-semibold">Suppression</span>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={clarityDial}
            onChange={(e) => onChangeClarity(parseFloat(e.target.value))}
            className="w-full mt-2 accent-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};
