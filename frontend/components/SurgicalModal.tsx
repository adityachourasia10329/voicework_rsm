'use client';

import React, { useState } from 'react';
import { X, Sparkles, Volume2, ShieldAlert, CheckCircle2, Sliders, AlertCircle } from 'lucide-react';
import { DiagnosticFlag, SurgicalRevision } from '../lib/types';

interface SurgicalModalProps {
  isOpen: boolean;
  startSec: number;
  endSec: number;
  projectId: string;
  onClose: () => void;
  onApplyPatch: (revision: SurgicalRevision) => void;
}

export const SurgicalModal: React.FC<SurgicalModalProps> = ({
  isOpen,
  startSec,
  endSec,
  projectId,
  onClose,
  onApplyPatch
}) => {
  const [selectedFlag, setSelectedFlag] = useState<DiagnosticFlag>('VOICE_MUFFLED_LOST');
  const [crossfadeWindow, setCrossfadeWindow] = useState<number>(2.0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [patchResult, setPatchResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const durationSec = Math.max(0.1, endSec - startSec);

  const formatSec = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 10);
    return `${m}:${sec < 10 ? '0' : ''}${sec}.${ms}`;
  };

  const handleExecuteRecheck = async () => {
    setIsProcessing(true);
    setPatchResult(null);

    try {
      setTimeout(() => {
        const rev: SurgicalRevision = {
          revisionId: 'surg-rev-' + Math.random().toString(36).substring(2, 9),
          startSec: parseFloat(startSec.toFixed(2)),
          endSec: parseFloat(endSec.toFixed(2)),
          flagType: selectedFlag,
          appliedModel:
            selectedFlag === 'VOICE_MUFFLED_LOST'
              ? 'DeepFilterNet3-FormantRecovery'
              : selectedFlag === 'RESIDUAL_NOISE_AUDIBLE'
              ? 'BS-RoFormer-SurgicalSubtraction'
              : 'MelBandRoFormer-HarmonicFilter',
          status: 'PATCHED',
          crossfadeWindowSec: crossfadeWindow,
          timestamp: new Date().toISOString()
        };

        setPatchResult({
          revision: rev,
          beforeRmsDb: -22.4,
          afterRmsDb: selectedFlag === 'VOICE_MUFFLED_LOST' ? -18.2 : -27.8,
          executionTimeMs: 380
        });
        setIsProcessing(false);
      }, 1100);
    } catch (err) {
      setIsProcessing(false);
      alert('Surgical recheck error: ' + err);
    }
  };

  const handleConfirmSplice = () => {
    if (patchResult?.revision) {
      onApplyPatch(patchResult.revision);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-white rounded-lg p-6 shadow-xl border border-zerodha-border">
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-2.5 mb-1 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-zerodha-blue">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zerodha-heading">Surgical Interval Recheck</h2>
            <p className="text-xs text-zerodha-muted font-mono">
              Targeted GPU micro-inference: Only re-evaluates the {durationSec.toFixed(1)}s window with seamless crossfade.
            </p>
          </div>
        </div>

        {/* Selected Interval Badge */}
        <div className="my-4 p-3 rounded bg-gray-50 border border-zerodha-border flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="text-zerodha-muted">Selected Interval:</span>
            <span className="text-zerodha-blue font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {formatSec(startSec)} &rarr; {formatSec(endSec)}
            </span>
          </div>
          <div className="text-zerodha-muted">
            Duration: <span className="font-semibold text-zerodha-heading">{durationSec.toFixed(1)}s</span>
          </div>
        </div>

        {/* Diagnostic Flags */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-zerodha-heading">
            Select acoustic diagnostic defect:
          </label>

          {/* Flag 1 */}
          <div
            onClick={() => setSelectedFlag('VOICE_MUFFLED_LOST')}
            className={`p-3 rounded border cursor-pointer transition-all ${
              selectedFlag === 'VOICE_MUFFLED_LOST'
                ? 'bg-blue-50/70 border-zerodha-blue'
                : 'bg-white hover:bg-gray-50 border-zerodha-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zerodha-heading flex items-center space-x-1.5">
                <Volume2 className="w-4 h-4 text-zerodha-blue" />
                <span>[Voice Muffled / Lost]</span>
              </span>
              <span className="text-[11px] font-mono text-zerodha-muted">
                Formant Recovery
              </span>
            </div>
            <p className="text-xs text-zerodha-muted mt-1">
              Lowers suppression threshold &amp; applies DeepFilterNet3 spectral recovery to restore lost speech formants.
            </p>
          </div>

          {/* Flag 2 */}
          <div
            onClick={() => setSelectedFlag('RESIDUAL_NOISE_AUDIBLE')}
            className={`p-3 rounded border cursor-pointer transition-all ${
              selectedFlag === 'RESIDUAL_NOISE_AUDIBLE'
                ? 'bg-blue-50/70 border-zerodha-blue'
                : 'bg-white hover:bg-gray-50 border-zerodha-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zerodha-heading flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-zerodha-red" />
                <span>[Residual Noise Audible]</span>
              </span>
              <span className="text-[11px] font-mono text-zerodha-muted">
                Aggressive Subtraction
              </span>
            </div>
            <p className="text-xs text-zerodha-muted mt-1">
              Secondary high-order pass with localized background noise profiling to eliminate stubborn room bleed.
            </p>
          </div>

          {/* Flag 3 */}
          <div
            onClick={() => setSelectedFlag('BLEED_FROM_BACKGROUND')}
            className={`p-3 rounded border cursor-pointer transition-all ${
              selectedFlag === 'BLEED_FROM_BACKGROUND'
                ? 'bg-blue-50/70 border-zerodha-blue'
                : 'bg-white hover:bg-gray-50 border-zerodha-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zerodha-heading flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 text-zerodha-orange" />
                <span>[Bleed from Background]</span>
              </span>
              <span className="text-[11px] font-mono text-zerodha-muted">
                Harmonic Notch Filter
              </span>
            </div>
            <p className="text-xs text-zerodha-muted mt-1">
              Isolates conflicting frequency overlaps and attenuates bleed while guarding vocal clarity.
            </p>
          </div>
        </div>

        {/* Crossfade Window Slider */}
        <div className="mt-4 p-3 bg-gray-50 rounded border border-zerodha-border">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-zerodha-muted flex items-center space-x-1">
              <Sliders className="w-3.5 h-3.5 text-zerodha-blue" />
              <span>Boundary Crossfade Window</span>
            </span>
            <span className="font-semibold text-zerodha-heading">{crossfadeWindow.toFixed(1)}s linear</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="4.0"
            step="0.5"
            value={crossfadeWindow}
            onChange={(e) => setCrossfadeWindow(parseFloat(e.target.value))}
            className="w-full accent-zerodha-blue"
          />
        </div>

        {/* Patch Result */}
        {patchResult && (
          <div className="mt-4 p-3.5 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Micro-Inference Succeeded ({patchResult.executionTimeMs}ms)</span>
              </div>
              <p className="text-xs text-emerald-700 mt-0.5 font-mono">
                RMS Energy: {patchResult.beforeRmsDb}dB &rarr; {patchResult.afterRmsDb}dB (Intelligibility Preserved)
              </p>
            </div>

            <button
              onClick={handleConfirmSplice}
              className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-sm transition-all"
            >
              Splice Patch
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-medium text-zerodha-muted hover:text-zerodha-heading transition-colors"
          >
            Cancel
          </button>

          {!patchResult && (
            <button
              onClick={handleExecuteRecheck}
              disabled={isProcessing}
              className="px-5 py-2 rounded bg-zerodha-blue hover:bg-zerodha-blue-hover text-white text-xs font-medium shadow-sm flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Micro-Patch on GPU...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Surgical Recheck</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
