'use client';

import React, { useState } from 'react';
import { Download, Film, Music, X, ShieldCheck, CheckCircle2, Sliders, Archive } from 'lucide-react';
import { FlyingBox } from './FlyingBox';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  durationSeconds: number;
  hasVideo: boolean;
}

export type ExportFormatType = 'MP4' | 'MOV' | 'MKV' | 'WAV' | 'FLAC' | 'MP3';
export type ExportMixMode = 'MASTER_MIX' | 'SPEECH_ONLY' | 'STEMS_ZIP';

interface FormatOption {
  format: ExportFormatType;
  label: string;
  extension: string;
  type: 'video' | 'audio';
  description: string;
  codecInfo: string;
  mimeType: string;
  bestFor: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    format: 'MP4',
    label: 'MP4 Video (H.264 + Lossless AAC)',
    extension: '.mp4',
    type: 'video',
    description: 'Zero quality loss video remuxing with bit-identical H.264 stream copy and refined audio.',
    codecInfo: '-c:v copy -c:a aac -b:a 320k',
    mimeType: 'video/mp4',
    bestFor: 'Universal web & social video playback'
  },
  {
    format: 'MOV',
    label: 'Apple QuickTime ProRes / PCM',
    extension: '.mov',
    type: 'video',
    description: 'Studio broadcast format with 24-bit uncompressed PCM audio master tracks.',
    codecInfo: '-c:v copy -c:a pcm_s24le',
    mimeType: 'video/quicktime',
    bestFor: 'Final Cut Pro, DaVinci Resolve & Premiere Pro'
  },
  {
    format: 'MKV',
    label: 'Matroska Open Multimedia Container',
    extension: '.mkv',
    type: 'video',
    description: 'Lossless audio/video container supporting multi-channel audio tracks without re-compression.',
    codecInfo: '-c:v copy -c:a copy',
    mimeType: 'video/x-matroska',
    bestFor: 'Archival & high-resolution video masters'
  },
  {
    format: 'WAV',
    label: 'Broadcast Waveform Audio (PCM 24-bit)',
    extension: '.wav',
    type: 'audio',
    description: 'Uncompressed studio master audio. Zero compression artifacts with pristine dynamic range.',
    codecInfo: '44.1 / 48 kHz, 24-bit Linear PCM',
    mimeType: 'audio/wav',
    bestFor: 'DAW mixing, mastering & podcast distribution'
  },
  {
    format: 'FLAC',
    label: 'Free Lossless Audio Codec',
    extension: '.flac',
    type: 'audio',
    description: 'Bit-for-bit lossless compressed audio. Up to 50% smaller file size than WAV with 100% data preservation.',
    codecInfo: 'FLAC Compression Level 8, 24-bit',
    mimeType: 'audio/flac',
    bestFor: 'Audiophile archiving & bandwidth-efficient transfer'
  },
  {
    format: 'MP3',
    label: 'MPEG-3 Audio (320 kbps CBR)',
    extension: '.mp3',
    type: 'audio',
    description: 'High-bitrate compressed audio master. Compact file size compatible with all hardware and apps.',
    codecInfo: '320 kbps Constant Bitrate, 48 kHz',
    mimeType: 'audio/mpeg',
    bestFor: 'Quick client previews & email attachments'
  }
];

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  projectTitle,
  durationSeconds,
  hasVideo
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormatType>(hasVideo ? 'MP4' : 'WAV');
  const [mixMode, setMixMode] = useState<ExportMixMode>('MASTER_MIX');
  const [sampleRate, setSampleRate] = useState<'48000' | '44100'>('48000');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');

  if (!isOpen) return null;

  const activeFormat = FORMAT_OPTIONS.find((f) => f.format === selectedFormat) || FORMAT_OPTIONS[0];

  const handleStartDownload = () => {
    setIsDownloading(true);
    setProgressMsg('Step 1/3: Reading current stem fader gains and surgical cuts...');

    setTimeout(() => {
      setProgressMsg('Step 2/3: Remuxing audio with zero-loss FFmpeg (-c:v copy)...');
    }, 700);

    setTimeout(() => {
      setProgressMsg(`Step 3/3: Packaging ${activeFormat.format} file container...`);
    }, 1400);

    setTimeout(() => {
      const safeTitle = projectTitle.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
      const filename = `${safeTitle}_edited${activeFormat.extension}`;

      const dummyContent = `VoiceWork RSM Master Export\nProject: ${projectTitle}\nFormat: ${activeFormat.format}\nCodec: ${activeFormat.codecInfo}\nMix Mode: ${mixMode}\nSample Rate: ${sampleRate} Hz\nDuration: ${durationSeconds}s\nTimestamp: ${new Date().toISOString()}\nStatus: Zero-loss stream copy verified.`;
      const blob = new Blob([dummyContent], { type: activeFormat.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsDownloading(false);
      onClose();
    }, 2100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl glass-panel-elevated rounded-2xl p-6 sm:p-7 shadow-2xl border border-white/[0.12] text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDownloading}
          className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-white/[0.08] text-[#9FA4B8] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-white/[0.08]">
          <div className="w-9 h-9 rounded-xl bg-[#FF4D36]/15 border border-[#FF4D36]/30 flex items-center justify-center text-[#FF4D36]">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-heading font-bold text-white">Download Edited File</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#27A376]/15 text-[#33C287] border border-[#27A376]/30 font-semibold uppercase">
                Lossless Output
              </span>
            </div>
            <p className="text-xs text-[#9FA4B8] font-mono mt-0.5">
              Choose your target format and audio configuration before export.
            </p>
          </div>
        </div>

        {/* Format Selector Grid */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-mono text-[#9FA4B8] uppercase tracking-wider font-semibold flex items-center space-x-1">
              <span>Select File Container Format:</span>
              <FlyingBox
                title="Format Selection"
                content="Choose whether you want a video file with pristine audio remuxed (MP4/MOV/MKV) or a standalone high-resolution audio file (WAV/FLAC/MP3)."
                recommendation="Use MP4 for video sharing, or WAV for the highest uncompressed audio fidelity."
              />
            </label>
            <span className="text-[11px] font-mono text-white/70">
              {activeFormat.type === 'video' ? 'Video + Audio Container' : 'Standalone Audio Container'}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {FORMAT_OPTIONS.map((f) => (
              <button
                key={f.format}
                type="button"
                onClick={() => setSelectedFormat(f.format)}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                  selectedFormat === f.format
                    ? 'border-[#FF4D36] bg-[#FF4D36]/15 text-white font-bold shadow-[0_0_15px_rgba(255,77,54,0.35)] ring-1 ring-[#FF4D36]'
                    : 'border-white/[0.08] bg-[#12131C] hover:bg-white/[0.04] text-[#9FA4B8] hover:text-white'
                }`}
              >
                {f.type === 'video' ? (
                  <Film className={`w-4 h-4 mb-1.5 ${selectedFormat === f.format ? 'text-[#FF4D36]' : 'text-[#258BF5]'}`} />
                ) : (
                  <Music className={`w-4 h-4 mb-1.5 ${selectedFormat === f.format ? 'text-[#FF4D36]' : 'text-[#6B70F0]'}`} />
                )}
                <span className="text-xs font-mono font-bold">{f.format}</span>
                <span className="text-[9px] text-white/50 mt-0.5 uppercase tracking-wider">{f.type}</span>
              </button>
            ))}
          </div>

          {/* Active Format Details Box */}
          <div className="mt-3.5 p-3.5 rounded-xl bg-[#12131C] border border-white/[0.08] text-xs font-mono">
            <div className="flex items-center justify-between text-white font-bold">
              <span>{activeFormat.label} ({activeFormat.extension})</span>
              <span className="text-[11px] text-[#6B70F0] font-normal">{activeFormat.codecInfo}</span>
            </div>
            <p className="text-[#9FA4B8] font-sans text-xs mt-1 leading-relaxed">
              {activeFormat.description}
            </p>
            <div className="mt-1.5 text-[11px] text-[#33C287] font-sans">
              <strong className="text-white">Best for:</strong> {activeFormat.bestFor}
            </div>
          </div>
        </div>

        {/* Export Content Mode Options */}
        <div className="mt-5 space-y-2.5">
          <label className="text-xs font-mono text-[#9FA4B8] uppercase tracking-wider font-semibold flex items-center space-x-1">
            <span>Audio Stem Mix Mode:</span>
            <FlyingBox
              title="Mix Mode Options"
              content="Choose what audio content gets packaged into the exported file: your refined multi-stem balance, clean vocal speech only, or a full stems bundle."
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setMixMode('MASTER_MIX')}
              className={`p-3 rounded-xl border text-left transition-all text-xs ${
                mixMode === 'MASTER_MIX'
                  ? 'border-[#FF4D36] bg-[#FF4D36]/15 text-white font-semibold ring-1 ring-[#FF4D36]'
                  : 'border-white/[0.08] bg-[#12131C] hover:bg-white/[0.04] text-[#9FA4B8] hover:text-white'
              }`}
            >
              <div className="font-bold text-white">Master Refined Mix</div>
              <p className="text-[10px] text-[#9FA4B8] font-normal mt-1 leading-relaxed">
                Current mixer gains, clarity dial, and numbed noise applied.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMixMode('SPEECH_ONLY')}
              className={`p-3 rounded-xl border text-left transition-all text-xs ${
                mixMode === 'SPEECH_ONLY'
                  ? 'border-[#27A376] bg-[#27A376]/15 text-white font-semibold ring-1 ring-[#27A376]'
                  : 'border-white/[0.08] bg-[#12131C] hover:bg-white/[0.04] text-[#9FA4B8] hover:text-white'
              }`}
            >
              <div className="font-bold text-white">Isolated Speech Only</div>
              <p className="text-[10px] text-[#9FA4B8] font-normal mt-1 leading-relaxed">
                Pristine vocal dialogue with all background stems muted.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMixMode('STEMS_ZIP')}
              className={`p-3 rounded-xl border text-left transition-all text-xs ${
                mixMode === 'STEMS_ZIP'
                  ? 'border-[#6B70F0] bg-[#6B70F0]/15 text-white font-semibold ring-1 ring-[#6B70F0]'
                  : 'border-white/[0.08] bg-[#12131C] hover:bg-white/[0.04] text-[#9FA4B8] hover:text-white'
              }`}
            >
              <div className="font-bold text-white">All Stems Bundle (.zip)</div>
              <p className="text-[10px] text-[#9FA4B8] font-normal mt-1 leading-relaxed">
                Exports Speech, Traffic, Crowd &amp; Music as discrete WAV stems.
              </p>
            </button>
          </div>
        </div>

        {/* Quality / Sample Rate Selector */}
        <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-[#12131C] border border-white/[0.08] text-xs font-mono">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#27A376]" />
            <span className="text-[#9FA4B8] font-medium">Sample Rate:</span>
            <select
              value={sampleRate}
              onChange={(e) => setSampleRate(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg border border-white/[0.1] bg-[#181926] text-white font-mono text-xs focus:outline-none focus:border-[#FF4D36]"
            >
              <option value="48000">48 kHz (Broadcast Standard)</option>
              <option value="44100">44.1 kHz (CD Audio)</option>
            </select>
          </div>

          <span className="text-[#9FA4B8] text-[11px]">
            Duration: {Math.floor(durationSeconds / 60)}m {Math.floor(durationSeconds % 60)}s
          </span>
        </div>

        {/* Download Action Footer */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isDownloading}
            className="px-4 py-2 text-xs font-medium text-[#9FA4B8] hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleStartDownload}
            disabled={isDownloading}
            className="btn-coral px-5 py-2.5 rounded-xl text-xs font-semibold shadow-[0_4px_20px_rgba(255,77,54,0.35)] flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="font-mono">{progressMsg}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Start Download ({activeFormat.format})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
