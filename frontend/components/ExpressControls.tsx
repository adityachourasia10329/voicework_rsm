'use client';

import React from 'react';
import { PresetMode } from '../lib/types';
import { Sparkles, Sliders, Volume2, ShieldCheck, Music, Zap } from 'lucide-react';
import { FlyingBox } from './FlyingBox';

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
    <div className="glass-panel rounded-2xl p-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/[0.08]">
        <div>
          <h3 className="text-base font-heading font-bold text-white flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#FF4D36]/15 border border-[#FF4D36]/30 flex items-center justify-center text-[#FF4D36]">
              <Zap className="w-4 h-4" />
            </div>
            <span>Express Studio Mode &bull; Neural Clarity Intelligence</span>
            <FlyingBox
              title="Express Mode"
              content="Designed for rapid editing. Choose a pre-tuned preset (Voice Only, Natural Ambient Clean, Remove Music) or turn the Clarity Dial to clean speech automatically."
            />
          </h3>
          <p className="text-xs text-[#9FA4B8] mt-1">
            One-touch automated background noise suppression with formant preservation.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-full bg-[#6B70F0]/15 border border-[#6B70F0]/30 text-xs font-mono text-[#8E93FF] font-semibold flex items-center space-x-2 self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-[#6B70F0]" />
          <span>Active Preset: {currentPreset || 'CUSTOM'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Quick Presets Buttons */}
        <div className="space-y-3 md:col-span-2">
          <span className="text-xs font-mono text-[#9FA4B8] uppercase tracking-wider block font-semibold">
            Architectural Studio Presets
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => onSelectPreset('VOICE_ONLY')}
              className={`p-4 rounded-xl border text-left transition-all ${
                currentPreset === 'VOICE_ONLY'
                  ? 'bg-[#FF4D36]/15 border-[#FF4D36] text-white shadow-[0_0_20px_rgba(255,77,54,0.3)]'
                  : 'bg-[#141522] hover:bg-white/[0.04] border-white/[0.08] text-[#9FA4B8] hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1.5">
                <Volume2 className={`w-4 h-4 ${currentPreset === 'VOICE_ONLY' ? 'text-[#FF4D36]' : 'text-[#646982]'}`} />
                <span className="text-xs font-heading font-bold text-white">Voice Only</span>
              </div>
              <p className="text-[11px] text-[#9FA4B8] line-clamp-2 leading-relaxed">
                100% voice isolation. Mutes traffic, chatter, and music beds.
              </p>
            </button>

            <button
              onClick={() => onSelectPreset('NATURAL_AMBIENT_CLEAN')}
              className={`p-4 rounded-xl border text-left transition-all ${
                currentPreset === 'NATURAL_AMBIENT_CLEAN'
                  ? 'bg-[#258BF5]/15 border-[#258BF5] text-white shadow-[0_0_20px_rgba(37,139,245,0.3)]'
                  : 'bg-[#141522] hover:bg-white/[0.04] border-white/[0.08] text-[#9FA4B8] hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1.5">
                <Sliders className={`w-4 h-4 ${currentPreset === 'NATURAL_AMBIENT_CLEAN' ? 'text-[#258BF5]' : 'text-[#646982]'}`} />
                <span className="text-xs font-heading font-bold text-white">Natural Clean</span>
              </div>
              <p className="text-[11px] text-[#9FA4B8] line-clamp-2 leading-relaxed">
                Attenuates noise by 18dB while preserving natural room acoustics.
              </p>
            </button>

            <button
              onClick={() => onSelectPreset('REMOVE_MUSIC')}
              className={`p-4 rounded-xl border text-left transition-all ${
                currentPreset === 'REMOVE_MUSIC'
                  ? 'bg-[#6B70F0]/15 border-[#6B70F0] text-white shadow-[0_0_20px_rgba(107,112,240,0.3)]'
                  : 'bg-[#141522] hover:bg-white/[0.04] border-white/[0.08] text-[#9FA4B8] hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1.5">
                <Music className={`w-4 h-4 ${currentPreset === 'REMOVE_MUSIC' ? 'text-[#6B70F0]' : 'text-[#646982]'}`} />
                <span className="text-xs font-heading font-bold text-white">Remove Music</span>
              </div>
              <p className="text-[11px] text-[#9FA4B8] line-clamp-2 leading-relaxed">
                Eliminates background instruments and keeps speech &amp; Foley.
              </p>
            </button>
          </div>
        </div>

        {/* Big Single Clarity & Denoise Dial - Glowing Superlist Coral */}
        <div className="bg-[#12131C] p-5 rounded-2xl border border-white/[0.08] flex flex-col items-center text-center shadow-inner">
          <span className="text-xs font-mono text-[#9FA4B8] mb-3 tracking-wider uppercase font-semibold">
            Clarity &amp; Denoise Dial
          </span>

          <div className="relative w-32 h-32 flex items-center justify-center my-1">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke="#FF4D36"
                strokeWidth="8"
                fill="none"
                strokeDasharray={314}
                strokeDashoffset={314 - (314 * clarityDial) / 100}
                strokeLinecap="round"
                className="transition-all duration-300 drop-shadow-[0_0_8px_rgba(255,77,54,0.6)]"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-heading font-black text-white font-mono tracking-tight">
                {Math.round(clarityDial)}%
              </span>
              <span className="text-[9px] font-mono text-[#FF7A59] uppercase font-bold tracking-wider">
                Suppression
              </span>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={clarityDial}
            onChange={(e) => onChangeClarity(parseFloat(e.target.value))}
            className="w-full mt-3 accent-[#FF4D36]"
          />
        </div>
      </div>
    </div>
  );
};
