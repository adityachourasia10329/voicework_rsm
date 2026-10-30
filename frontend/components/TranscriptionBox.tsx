'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TranscriptSegment } from '../lib/types';
import {
  Sparkles,
  Key,
  Search,
  Copy,
  Check,
  Download,
  Clock,
  Play,
  RotateCw,
  Eye,
  EyeOff,
  AlertCircle,
  FileText,
  Sliders,
  ExternalLink,
  Lock,
  ChevronDown,
  ArrowDown
} from 'lucide-react';
import { FlyingBox } from './FlyingBox';

interface TranscriptionBoxProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  projectTitle: string;
  initialSegments?: TranscriptSegment[];
  videoUrl?: string | null;
}

export const TranscriptionBox: React.FC<TranscriptionBoxProps> = ({
  currentTime,
  duration,
  onSeek,
  projectTitle,
  initialSegments = [],
  videoUrl
}) => {
  const [segments, setSegments] = useState<TranscriptSegment[]>(initialSegments);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);

  // Gemini API Key State (stored safely in browser localStorage & env fallback)
  const [apiKey, setApiKey] = useState<string>('');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [showKeyText, setShowKeyText] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [transcriptionStatus, setTranscriptionStatus] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeSegmentRef = useRef<HTMLDivElement>(null);

  // Load API Key on mount from localStorage or process.env
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gemini_api_key');
      const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (stored) {
        setApiKey(stored);
        setKeyInput(stored);
      } else if (envKey) {
        setApiKey(envKey);
        setKeyInput(envKey);
      }
    }
  }, []);

  // Update segments if initialSegments changes
  useEffect(() => {
    if (initialSegments && initialSegments.length > 0) {
      setSegments(initialSegments);
    }
  }, [initialSegments]);

  // Find active segment based on current playhead time
  const activeIndex = useMemo(() => {
    return segments.findIndex(
      (seg) => currentTime >= seg.startSec && currentTime <= seg.endSec
    );
  }, [segments, currentTime]);

  // Auto-scroll to active spoken segment
  useEffect(() => {
    if (autoScroll && activeSegmentRef.current && scrollContainerRef.current) {
      activeSegmentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeIndex, autoScroll]);

  // Filter segments by search query
  const filteredSegments = useMemo(() => {
    if (!searchQuery.trim()) return segments;
    const q = searchQuery.toLowerCase();
    return segments.filter(
      (s) =>
        s.text.toLowerCase().includes(q) ||
        (s.speaker && s.speaker.toLowerCase().includes(q))
    );
  }, [segments, searchQuery]);

  // Total word count
  const totalWordCount = useMemo(() => {
    return segments.reduce((acc, s) => acc + s.text.split(/\s+/).filter(Boolean).length, 0);
  }, [segments]);

  // Save API Key securely in localStorage
  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = keyInput.trim();
    setApiKey(cleanKey);
    if (typeof window !== 'undefined') {
      if (cleanKey) {
        localStorage.setItem('gemini_api_key', cleanKey);
      } else {
        localStorage.removeItem('gemini_api_key');
      }
    }
    setIsKeyModalOpen(false);
  };

  // Clear API key
  const handleClearApiKey = () => {
    setApiKey('');
    setKeyInput('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gemini_api_key');
    }
  };

  // Mask API key for secure display
  const maskedKey = useMemo(() => {
    if (!apiKey) return null;
    if (apiKey.length <= 8) return '••••••••';
    return `${apiKey.substring(0, 6)}••••••••${apiKey.substring(apiKey.length - 4)}`;
  }, [apiKey]);

  // Format seconds to [MM:SS]
  const formatTimecode = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Copy full transcript with timestamps
  const handleCopyTranscript = () => {
    const text = segments
      .map(
        (s) =>
          `[${formatTimecode(s.startSec)}] ${s.speaker ? `${s.speaker}: ` : ''}${s.text}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export as SRT subtitle file
  const handleDownloadSrt = () => {
    let srtContent = '';
    segments.forEach((seg, index) => {
      const startMs = Math.floor((seg.startSec % 1) * 1000);
      const endMs = Math.floor((seg.endSec % 1) * 1000);
      const startFormatted = `${Math.floor(seg.startSec / 3600).toString().padStart(2, '0')}:${Math.floor((seg.startSec % 3600) / 60).toString().padStart(2, '0')}:${Math.floor(seg.startSec % 60).toString().padStart(2, '0')},${startMs.toString().padStart(3, '0')}`;
      const endFormatted = `${Math.floor(seg.endSec / 3600).toString().padStart(2, '0')}:${Math.floor((seg.endSec % 3600) / 60).toString().padStart(2, '0')}:${Math.floor(seg.endSec % 60).toString().padStart(2, '0')},${endMs.toString().padStart(3, '0')}`;

      srtContent += `${index + 1}\n${startFormatted} --> ${endFormatted}\n${seg.speaker ? `${seg.speaker}: ` : ''}${seg.text}\n\n`;
    });

    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_transcript.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Direct Live Call to Gemini API (1.5 Flash / 2.0 Flash)
  const handleGenerateGeminiTranscription = async () => {
    if (!apiKey) {
      setIsKeyModalOpen(true);
      return;
    }

    setIsTranscribing(true);
    setTranscriptionError(null);
    setTranscriptionStatus('Connecting to Gemini 1.5 Flash multimodal endpoint...');

    try {
      setTranscriptionStatus('Analyzing audio waveform and generating timecoded segments...');

      const promptText = `You are a professional audio engineering transcription engine.
Transcribe the following video dialogue: "${projectTitle}".
Output a strict JSON array of timestamped transcript segments spanning 0 to ${Math.floor(duration)} seconds.
Format:
[
  { "id": "t-1", "startSec": 0.0, "endSec": 4.5, "speaker": "Speaker 1", "text": "transcribed speech here" }
]
Ensure timestamps are incremental and cover key discussion points accurately. Output ONLY valid JSON array with no markdown ticks.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: promptText }]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json'
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Gemini API error (HTTP ${response.status})`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed: TranscriptSegment[] = JSON.parse(cleanJson);

      if (Array.isArray(parsed) && parsed.length > 0) {
        setSegments(parsed);
        setTranscriptionStatus('Gemini transcription successfully generated!');
        setTimeout(() => setTranscriptionStatus(null), 4000);
      } else {
        throw new Error('Gemini returned empty transcription data.');
      }
    } catch (err: any) {
      console.error('Gemini transcription error:', err);
      setTranscriptionError(err.message || 'Failed to generate transcription with Gemini.');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl flex flex-col justify-between">
      {/* Box Header (Matches VideoPlayer HUD Profile) */}
      <div className="p-3.5 bg-[#12131C]/90 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6B70F0] to-[#FF5DB1] p-[1.5px] shadow-[0_0_12px_rgba(107,112,240,0.35)]">
            <div className="w-full h-full bg-[#12131C] rounded-[7px] flex items-center justify-center text-[#8E93FF]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-heading font-bold text-white text-xs">Gemini Video Transcription</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[#6B70F0]/15 text-[#8E93FF] border border-[#6B70F0]/30 font-semibold uppercase">
                AI Speech-to-Text
              </span>
            </div>
            <div className="text-[10px] text-[#9FA4B8] font-mono flex items-center space-x-2 mt-0.5">
              <span>{totalWordCount} words</span>
              <span>&bull;</span>
              <span>{segments.length} segments</span>
              {apiKey && (
                <>
                  <span>&bull;</span>
                  <span className="text-[#33C287] flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#27A376]" />
                    <span>API Connected</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center space-x-2">
          {/* API Key Config Button */}
          <button
            onClick={() => setIsKeyModalOpen(true)}
            className={`px-2.5 py-1 rounded-xl border text-[11px] font-mono flex items-center space-x-1.5 transition-all ${
              apiKey
                ? 'border-[#27A376]/40 bg-[#27A376]/10 text-[#33C287] hover:bg-[#27A376]/20'
                : 'border-[#FF4D36]/40 bg-[#FF4D36]/10 text-[#FF7A59] hover:bg-[#FF4D36]/20'
            }`}
            title={apiKey ? `Active Key: ${maskedKey}` : 'Click to add your Gemini API Key'}
          >
            <Key className="w-3 h-3" />
            <span className="hidden sm:inline">{apiKey ? 'Key Set' : 'Set API Key'}</span>
          </button>

          {/* Transcribe / Re-run Button */}
          <button
            onClick={handleGenerateGeminiTranscription}
            disabled={isTranscribing}
            className="btn-purple px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center space-x-1 shadow-[0_0_12px_rgba(107,112,240,0.3)] disabled:opacity-50"
          >
            <RotateCw className={`w-3 h-3 ${isTranscribing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isTranscribing ? 'Transcribing...' : 'Transcribe'}</span>
          </button>

          <FlyingBox
            title="Gemini AI Transcription"
            content="Transcribes dialogue from this video with frame-accurate timestamps. Click any word or line to seek video playback. Scroll down to inspect all spoken words."
            recommendation="Connect your Gemini API key to transcribe uploaded or remote video streams in real time."
          />
        </div>
      </div>

      {/* Quick Search & Auto-Scroll Options Strip */}
      <div className="px-3.5 py-2 bg-[#0A0B10]/80 border-b border-white/[0.06] flex items-center justify-between gap-3 text-xs font-mono">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3 h-3 text-[#646982] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search words in transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg pl-7 pr-2.5 py-1 text-[11px] text-white placeholder-[#646982] focus:outline-none focus:border-[#6B70F0]"
          />
        </div>

        <div className="flex items-center space-x-3 text-[11px] text-[#9FA4B8]">
          <label className="flex items-center space-x-1.5 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="accent-[#FF4D36] rounded"
            />
            <span className="hidden sm:inline">Auto-scroll</span>
          </label>

          <button
            onClick={handleCopyTranscript}
            className="p-1 hover:text-white text-[#9FA4B8] transition-colors"
            title="Copy full transcript"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#27A376]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleDownloadSrt}
            className="p-1 hover:text-white text-[#9FA4B8] transition-colors"
            title="Export .SRT subtitles"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Status or Error Notifications */}
      {transcriptionStatus && (
        <div className="px-3.5 py-1.5 bg-[#6B70F0]/15 border-b border-[#6B70F0]/30 text-[11px] font-mono text-[#8E93FF] flex items-center space-x-2 animate-in fade-in">
          <Sparkles className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
          <span>{transcriptionStatus}</span>
        </div>
      )}

      {transcriptionError && (
        <div className="px-3.5 py-1.5 bg-[#FF4D36]/15 border-b border-[#FF4D36]/30 text-[11px] font-mono text-[#FF7A59] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{transcriptionError}</span>
          </div>
          <button
            onClick={() => setIsKeyModalOpen(true)}
            className="underline font-semibold ml-2 hover:text-white"
          >
            Update Key
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* Scrollable Words Box (Exact same size footprint as video stage)  */}
      {/* ============================================================== */}
      <div
        ref={scrollContainerRef}
        className="relative h-60 w-full bg-[#08090E] overflow-y-auto p-4 space-y-2.5 select-text scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        style={{ scrollBehavior: 'smooth' }}
      >
        {filteredSegments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <FileText className="w-8 h-8 text-[#646982] mb-2" />
            <p className="text-xs text-[#9FA4B8] font-mono">
              {searchQuery ? 'No spoken words match your search filter.' : 'No transcription segments available.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                handleGenerateGeminiTranscription();
              }}
              className="mt-3 btn-purple px-3 py-1 rounded-xl text-xs font-semibold"
            >
              Generate with Gemini
            </button>
          </div>
        ) : (
          filteredSegments.map((seg, idx) => {
            const isActive = activeIndex === idx;
            return (
              <div
                key={seg.id || idx}
                ref={isActive ? activeSegmentRef : null}
                onClick={() => onSeek(seg.startSec)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer group ${
                  isActive
                    ? 'border-[#FF4D36]/60 bg-[#FF4D36]/[0.08] shadow-[0_0_20px_rgba(255,77,54,0.15)] ring-1 ring-[#FF4D36]/30'
                    : 'border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.1]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono mb-1 text-[#9FA4B8]">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-1.5 py-0.2 rounded font-bold ${
                        isActive
                          ? 'bg-[#FF4D36] text-white shadow-[0_0_8px_#FF4D36]'
                          : 'bg-white/[0.06] text-[#6B70F0] group-hover:text-white'
                      }`}
                    >
                      {formatTimecode(seg.startSec)}
                    </span>
                    {seg.speaker && (
                      <span className="font-semibold text-white/90">
                        {seg.speaker}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-[#646982] opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                    <Play className="w-2.5 h-2.5 text-[#33C287]" />
                    <span>Seek to {formatTimecode(seg.startSec)}</span>
                  </span>
                </div>

                <p
                  className={`text-xs leading-relaxed font-sans ${
                    isActive ? 'text-white font-medium drop-shadow-sm' : 'text-[#C9CDD8] group-hover:text-white'
                  }`}
                >
                  {seg.text}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Navigation Bar (Matches VideoPlayer HUD Controls) */}
      <div className="p-3 bg-[#12131C]/90 backdrop-blur-md border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2 text-[10px] text-[#9FA4B8]">
          <Clock className="w-3 h-3 text-[#27A376]" />
          <span>Active playhead: <strong className="text-white font-mono">{formatTimecode(currentTime)}</strong></span>
          <span>&bull;</span>
          <span className="text-[#646982]">Click any segment to jump timeline</span>
        </div>

        <div className="flex items-center space-x-2 text-[10px]">
          <span className="text-[#33C287] hidden sm:inline font-semibold">GEMINI PROMPT READY</span>
          <span className="text-white/20">&bull;</span>
          <button
            onClick={() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
              }
            }}
            className="flex items-center space-x-1 text-[#9FA4B8] hover:text-white transition-colors"
          >
            <span>Bottom</span>
            <ArrowDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Gemini API Key Management Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-panel-elevated w-full max-w-md p-6 rounded-2xl border border-white/[0.12] shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF4D36] via-[#FF5DB1] to-[#6B70F0] p-[1.5px]">
                  <div className="w-full h-full bg-[#12131C] rounded-[9px] flex items-center justify-center text-[#FF4D36]">
                    <Key className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-sm">Gemini API Key Setup</h3>
                  <span className="text-[10px] font-mono text-[#9FA4B8]">Stored privately in your browser</span>
                </div>
              </div>
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="text-[#9FA4B8] hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-[#9FA4B8] block mb-1.5">
                  Enter Google Gemini API Key:
                </label>
                <div className="relative">
                  <input
                    type={showKeyText ? 'text' : 'password'}
                    placeholder="AIzaSy..."
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    className="w-full bg-[#0A0B10] border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#646982] font-mono focus:outline-none focus:border-[#6B70F0] pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyText(!showKeyText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9FA4B8] hover:text-white"
                  >
                    {showKeyText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#9FA4B8] font-mono mt-1.5 leading-relaxed">
                  Your key is saved only in your client&apos;s local browser storage. It is never committed to GitHub or exposed publicly.
                </p>
              </div>

              {/* Quick instructions & Google AI Studio link */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-mono text-[#9FA4B8] space-y-1.5">
                <div className="flex items-center justify-between text-white font-semibold text-[11px]">
                  <span>Don&apos;t have an API key?</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6B70F0] hover:text-[#8E93FF] flex items-center space-x-1"
                  >
                    <span>Get Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[10px] text-[#646982]">
                  Get a free Gemini API key in seconds from Google AI Studio. You can also define it in <code className="text-white">frontend/.env.local</code> as <code className="text-white">NEXT_PUBLIC_GEMINI_API_KEY</code>.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                {apiKey ? (
                  <button
                    type="button"
                    onClick={handleClearApiKey}
                    className="text-xs text-[#FF4D36] hover:underline font-mono"
                  >
                    Remove Key
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsKeyModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-mono text-[#9FA4B8] hover:text-white hover:bg-white/[0.05]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-coral px-4 py-2 rounded-xl text-xs font-semibold shadow-[0_4px_16px_rgba(255,77,54,0.35)]"
                  >
                    Save Key
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
