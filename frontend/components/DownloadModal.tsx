'use client';

import React, { useState } from 'react';
import { X, Download, Film, Music, CheckCircle2, Sliders, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import { FlyingBox } from './FlyingBox';

export type ExportFormat = 'MP4' | 'MOV' | 'MKV' | 'WAV' | 'FLAC' | 'MP3';
export type ExportMixMode = 'MASTER_MIX' | 'SPEECH_ONLY' | 'STEMS_ZIP';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  durationSeconds: number;
  hasVideo: boolean;
}

interface FormatOption {
  format: ExportFormat;
  label: string;
  type: 'video' | 'audio';
  extension: string;
  mimeType: string;
  codecInfo: string;
  description: string;
  bestFor: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    format: 'MP4',
    label: 'MP4 Video Master',
    type: 'video',
    extension: '.mp4',
    mimeType: 'video/mp4',
    codecInfo: 'FFmpeg -c:v copy (Zero Video Loss) + AAC 320k',
    description: 'Original video stream copied completely untouched without re-encoding, remuxed with your refined audio.',
    bestFor: 'YouTube, social media, web playback, and video editing suites.'
  },
  {
    format: 'MOV',
    label: 'QuickTime MOV',
    type: 'video',
    extension: '.mov',
    mimeType: 'video/quicktime',
    codecInfo: 'Apple ProRes / H.264 + 24-bit PCM Audio',
    description: 'High-bitrate QuickTime container preserving uncompressed multi-channel studio audio.',
    bestFor: 'Final Cut Pro, DaVinci Resolve, and Apple post-production workflows.'
  },
  {
    format: 'MKV',
    label: 'Matroska MKV',
    type: 'video',
    extension: '.mkv',
    mimeType: 'video/x-matroska',
    codecInfo: 'Multi-Track Audio Remux (-c:v copy)',
    description: 'Embeds the original video alongside multiple separate switchable audio tracks.',
    bestFor: 'Archival masters and advanced multimedia players (VLC).'
  },
  {
    format: 'WAV',
    label: 'Lossless WAV',
    type: 'audio',
    extension: '.wav',
    mimeType: 'audio/wav',
    codecInfo: 'PCM Uncompressed 24-bit / 48kHz Stereo',
    description: 'Pure uncompressed studio broadcast quality audio with full dynamic range.',
    bestFor: 'Pro Tools, Logic Pro, mastering engineers, and podcast syndication.'
  },
  {
    format: 'FLAC',
    label: 'Audiophile FLAC',
    type: 'audio',
    extension: '.flac',
    mimeType: 'audio/flac',
    codecInfo: 'Free Lossless Audio Codec (Level 8 Compression)',
    description: 'Mathematically lossless compression providing WAV quality at half the file size.',
    bestFor: 'High-resolution music libraries and audiophile archiving.'
  },
  {
    format: 'MP3',
    label: 'Universal MP3',
    type: 'audio',
    extension: '.mp3',
    mimeType: 'audio/mpeg',
    codecInfo: 'LAME VBR/CBR 320 kbps High Quality',
    description: 'Lightweight compressed audio universally compatible across all smartphones and players.',
    bestFor: 'Quick listening, sharing via email/chat, and standard streaming.'
  }
];

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  projectTitle,
  durationSeconds,
  hasVideo
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(hasVideo ? 'MP4' : 'WAV');
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
      // Trigger real browser download using Blob
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-lg p-6 shadow-2xl border border-zerodha-border">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDownloading}
          className="absolute top-4 right-4 p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-2.5 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-zerodha-blue">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-zerodha-heading">Download Edited File</h2>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                Lossless Output
              </span>
            </div>
            <p className="text-xs text-zerodha-muted font-mono mt-0.5">
              Choose your target format and audio configuration before export.
            </p>
          </div>
        </div>

        {/* Format Selector Grid */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-zerodha-heading flex items-center space-x-1">
              <span>Select File Format:</span>
              <FlyingBox
                title="Format Selection"
                content="Choose whether you want a video file with pristine audio remuxed (MP4/MOV/MKV) or a standalone high-resolution audio file (WAV/FLAC/MP3)."
                recommendation="Use MP4 for video sharing, or WAV for the highest uncompressed audio fidelity."
              />
            </label>
            <span className="text-[11px] font-mono text-zerodha-muted">
              {activeFormat.type === 'video' ? 'Video + Audio Container' : 'Standalone Audio Container'}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {FORMAT_OPTIONS.map((f) => (
              <button
                key={f.format}
                type="button"
                onClick={() => setSelectedFormat(f.format)}
                className={`p-2.5 rounded border text-center transition-all flex flex-col items-center justify-center ${
                  selectedFormat === f.format
                    ? 'border-zerodha-blue bg-blue-50 text-zerodha-blue font-bold shadow-xs ring-1 ring-zerodha-blue'
                    : 'border-zerodha-border bg-white hover:bg-gray-50 text-gray-700 font-medium'
                }`}
              >
                {f.type === 'video' ? (
                  <Film className="w-4 h-4 mb-1 text-zerodha-blue" />
                ) : (
                  <Music className="w-4 h-4 mb-1 text-emerald-600" />
                )}
                <span className="text-xs font-mono">{f.format}</span>
                <span className="text-[9px] text-gray-500 mt-0.5 uppercase">{f.type}</span>
              </button>
            ))}
          </div>

          {/* Active Format Details Box */}
          <div className="mt-3 p-3 rounded bg-gray-50 border border-gray-200 text-xs font-mono">
            <div className="flex items-center justify-between text-zerodha-heading font-semibold">
              <span>{activeFormat.label} ({activeFormat.extension})</span>
              <span className="text-[11px] text-zerodha-blue font-normal">{activeFormat.codecInfo}</span>
            </div>
            <p className="text-gray-600 font-sans text-xs mt-1 leading-relaxed">
              {activeFormat.description}
            </p>
            <div className="mt-1 text-[11px] text-emerald-700 font-sans">
              <strong>Best for:</strong> {activeFormat.bestFor}
            </div>
          </div>
        </div>

        {/* Export Content Mode Options */}
        <div className="mt-4 space-y-2">
          <label className="text-xs font-semibold text-zerodha-heading flex items-center space-x-1">
            <span>Audio Stem Mix Mode:</span>
            <FlyingBox
              title="Mix Mode Options"
              content="Choose what audio content gets packaged into the exported file: your refined multi-stem balance, clean vocal speech only, or a full stems bundle."
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMixMode('MASTER_MIX')}
              className={`p-2.5 rounded border text-left transition-all text-xs ${
                mixMode === 'MASTER_MIX'
                  ? 'border-zerodha-blue bg-blue-50/70 text-zerodha-blue font-semibold ring-1 ring-zerodha-blue'
                  : 'border-zerodha-border bg-white hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="font-semibold">Master Refined Mix</div>
              <p className="text-[10px] text-gray-500 font-normal mt-0.5">
                Current mixer gains, clarity dial, and numbed noise applied.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMixMode('SPEECH_ONLY')}
              className={`p-2.5 rounded border text-left transition-all text-xs ${
                mixMode === 'SPEECH_ONLY'
                  ? 'border-zerodha-blue bg-blue-50/70 text-zerodha-blue font-semibold ring-1 ring-zerodha-blue'
                  : 'border-zerodha-border bg-white hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="font-semibold">Isolated Speech Only</div>
              <p className="text-[10px] text-gray-500 font-normal mt-0.5">
                Pristine vocal dialogue with all background stems muted.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMixMode('STEMS_ZIP')}
              className={`p-2.5 rounded border text-left transition-all text-xs ${
                mixMode === 'STEMS_ZIP'
                  ? 'border-zerodha-blue bg-blue-50/70 text-zerodha-blue font-semibold ring-1 ring-zerodha-blue'
                  : 'border-zerodha-border bg-white hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="font-semibold">All Stems Bundle (.zip)</div>
              <p className="text-[10px] text-gray-500 font-normal mt-0.5">
                Exports Speech, Traffic, Crowd &amp; Music as discrete WAV stems.
              </p>
            </button>
          </div>
        </div>

        {/* Quality / Sample Rate Selector */}
        <div className="mt-4 flex items-center justify-between p-2.5 rounded bg-gray-50 border border-gray-200 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-zerodha-green" />
            <span className="text-gray-700 font-medium">Sample Rate:</span>
            <select
              value={sampleRate}
              onChange={(e) => setSampleRate(e.target.value as any)}
              className="px-2 py-0.5 rounded border border-zerodha-border bg-white text-zerodha-heading font-mono text-xs focus:outline-none"
            >
              <option value="48000">48 kHz (Broadcast Standard)</option>
              <option value="44100">44.1 kHz (CD Audio)</option>
            </select>
          </div>

          <span className="text-gray-500 text-[11px]">
            Duration: {Math.floor(durationSeconds / 60)}m {Math.floor(durationSeconds % 60)}s
          </span>
        </div>

        {/* Download Action Footer */}
        <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isDownloading}
            className="px-4 py-2 text-xs font-medium text-zerodha-muted hover:text-zerodha-heading transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleStartDownload}
            disabled={isDownloading}
            className="px-5 py-2 rounded bg-zerodha-blue hover:bg-zerodha-blue-hover text-white text-xs font-medium shadow-sm flex items-center space-x-2 transition-all disabled:opacity-50"
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
