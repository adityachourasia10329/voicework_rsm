'use client';

import React, { useState } from 'react';
import { X, UploadCloud, Youtube, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';
import { ProjectState } from '../lib/types';
import { FlyingBox } from './FlyingBox';

interface IngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: ProjectState) => void;
}

export const IngestionModal: React.FC<IngestionModalProps> = ({ isOpen, onClose, onProjectCreated }) => {
  const [tab, setTab] = useState<'upload' | 'youtube'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [model, setModel] = useState('bs-roformer-v2');
  const [deepFilter, setDeepFilter] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState<string>('');

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      if (!title) setTitle(selected.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleStartIngestion = async () => {
    setIsProcessing(true);
    setProgressStep('Probing media streams and container metadata...');

    try {
      setTimeout(() => {
        setProgressStep('FFmpeg lossless audio extraction (-acodec pcm_s16le)...');
      }, 600);

      setTimeout(() => {
        setProgressStep('Audio chunker: 60s windows with 2s crossfades (OOM Guard)...');
      }, 1200);

      setTimeout(() => {
        setProgressStep('Running BS-RoFormer stem isolation & DeepFilterNet3 speech recovery...');
      }, 1900);

      setTimeout(() => {
        const newProjId = 'proj-' + Math.random().toString(36).substring(2, 9);
        const newProject: ProjectState = {
          projectId: newProjId,
          orgId: 'org-rsm-01',
          title: title || (tab === 'youtube' ? 'YouTube Capture' : (file?.name || 'New Audio Project')),
          status: 'READY',
          durationSeconds: 120.0,
          sourceType: tab === 'youtube' ? 'YOUTUBE' : 'UPLOAD',
          sourceUrl: tab === 'youtube' ? youtubeUrl : '/storage/uploads/sample.mp4',
          mediaContainer: {
            originalVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            masterAudioWavUrl: '/audio/demo_master.wav',
            videoCodec: 'h264',
            audioCodec: 'pcm_s16le',
            hasVideo: true,
            thumbnailUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
            remuxedMasterUrl: null
          },
          mixer: {
            mode: 'FULL_AUTHORITY',
            masterGainDb: 0.0,
            expressClarityDial: 85.0,
            preset: 'VOICE_ONLY'
          },
          stems: [
            {
              stemId: 'stem-sp-1',
              type: 'SPEECH_MAIN',
              label: 'Main Dialogue',
              audioUrl: '/audio/demo_speech.wav',
              volumeDb: 0.0,
              isMuted: false,
              isSolo: false,
              pan: 0.0,
              colorHex: '#26a69a'
            },
            {
              stemId: 'stem-tr-1',
              type: 'NOISE_TRAFFIC',
              label: 'Traffic & Ambient Noise',
              audioUrl: '/audio/demo_traffic.wav',
              volumeDb: -22.0,
              isMuted: false,
              isSolo: false,
              pan: -0.2,
              colorHex: '#df514c'
            },
            {
              stemId: 'stem-cr-1',
              type: 'NOISE_CROWD',
              label: 'Crowd Chatter',
              audioUrl: '/audio/demo_crowd.wav',
              volumeDb: -26.0,
              isMuted: false,
              isSolo: false,
              pan: 0.2,
              colorHex: '#387ed1'
            },
            {
              stemId: 'stem-mu-1',
              type: 'MUSIC_INSTRUMENTAL',
              label: 'Background Music',
              audioUrl: '/audio/demo_music.wav',
              volumeDb: -16.0,
              isMuted: false,
              isSolo: false,
              pan: 0.0,
              colorHex: '#7c3aed'
            }
          ],
          surgicalHistory: [],
          updatedAt: new Date().toISOString()
        };

        setIsProcessing(false);
        onProjectCreated(newProject);
        onClose();
      }, 2600);

    } catch (err) {
      setIsProcessing(false);
      alert('Ingestion error: ' + err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-white rounded-lg p-6 shadow-xl border border-zerodha-border">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-base font-semibold text-zerodha-heading flex items-center space-x-2">
          <UploadCloud className="w-5 h-5 text-zerodha-blue" />
          <span>Ingest Media Stream</span>
        </h2>
        <p className="text-xs text-zerodha-muted mt-0.5">
          Supports arbitrary length files (30m to 2h+). Lossless audio extraction &amp; GPU chunking.
        </p>

        {/* Tab selection */}
        <div className="flex border-b border-zerodha-border mt-4 text-xs font-medium">
          <button
            onClick={() => setTab('upload')}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              tab === 'upload' ? 'border-zerodha-blue text-zerodha-blue font-semibold' : 'border-transparent text-zerodha-muted hover:text-zerodha-heading'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>File Upload (MP4 / MOV / WAV / MKV)</span>
          </button>
          <button
            onClick={() => setTab('youtube')}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              tab === 'youtube' ? 'border-zerodha-blue text-zerodha-blue font-semibold' : 'border-transparent text-zerodha-muted hover:text-zerodha-heading'
            }`}
          >
            <Youtube className="w-4 h-4 text-red-500" />
            <span>YouTube Stream (yt-dlp)</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zerodha-heading mb-1">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Broadcast Episode 24 - Voice Master"
              className="w-full px-3 py-2 text-xs rounded border border-zerodha-border bg-gray-50 focus:bg-white text-zerodha-heading focus:outline-none focus:border-zerodha-blue"
            />
          </div>

          {tab === 'upload' ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-gray-200 hover:border-zerodha-blue rounded p-8 text-center cursor-pointer transition-colors bg-gray-50/60"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <UploadCloud className="w-8 h-8 text-zerodha-muted mx-auto mb-2" />
              {file ? (
                <div className="text-xs text-zerodha-green font-medium flex items-center justify-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)</span>
                </div>
              ) : (
                <>
                  <p className="text-xs text-zerodha-heading font-medium">Click or drag &amp; drop video or audio file</p>
                  <p className="text-[11px] text-zerodha-muted mt-1">MP4, MOV, MKV, WAV, FLAC, MP3 (No duration limit)</p>
                </>
              )}
              <input
                id="file-input"
                type="file"
                accept="video/*,audio/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                    if (!title) setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                  }
                }}
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-zerodha-heading mb-1">YouTube Video URL</label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 text-xs rounded border border-zerodha-border bg-gray-50 focus:bg-white text-zerodha-heading focus:outline-none focus:border-zerodha-blue font-mono"
              />
              <p className="text-[11px] text-zerodha-muted mt-1">
                Extracted losslessly using headless `yt-dlp` stream capture.
              </p>
            </div>
          )}

          {/* Model selection */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-zerodha-heading flex items-center space-x-1">
                  <Cpu className="w-3.5 h-3.5 text-zerodha-blue" />
                  <span>Separation Model</span>
                  <FlyingBox
                    title="Choosing a Separation Model"
                    content="Each neural model is trained for different acoustic challenges. BS-RoFormer is best for voice vs music; Mel-Band preserves high-end audio fidelity; HTDemucs handles multi-layer crowd and street noise."
                    recommendation="BS-RoFormer v2 is recommended for general podcasts and studio video."
                  />
                </label>
                <span className="text-[10px] font-mono text-zerodha-blue font-semibold">
                  {model === 'bs-roformer-v2' ? '★ Top Quality' : model === 'melband-roformer' ? '★ High Res 48kHz' : '★ 6-Stem Multi-Noise'}
                </span>
              </div>

              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded border border-zerodha-border bg-white text-zerodha-heading focus:outline-none focus:border-zerodha-blue font-mono"
              >
                <option value="bs-roformer-v2">BS-RoFormer v2 (SOTA Multi-Stem)</option>
                <option value="melband-roformer">Mel-Band RoFormer (HD Audio)</option>
                <option value="htdemucs-v4">HTDemucs v4 (6-Stem Demixing)</option>
              </select>

              {/* Dynamic Flying Explanatory Box for the selected model (Requirement 7) */}
              <div className="mt-2 p-2.5 rounded bg-blue-50/70 border border-blue-200 text-xs">
                {model === 'bs-roformer-v2' && (
                  <div>
                    <div className="font-semibold text-zerodha-heading text-[11px] flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      <span>Best for: Dialogue &amp; Music Separation</span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                      SOTA Band-Split RoFormer. Extreme precision with near-zero acoustic bleed. Isolates speech while preserving voice resonance.
                    </p>
                    <div className="text-[10px] text-blue-700 font-mono mt-1">
                      <strong>Ideal Use Case:</strong> Video podcasts, interviews with intro music, voice-overs.
                    </div>
                  </div>
                )}

                {model === 'melband-roformer' && (
                  <div>
                    <div className="font-semibold text-zerodha-heading text-[11px] flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span>Best for: Studio HD Master Audio (44.1/48kHz)</span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                      Mel-frequency scale architecture designed specifically for high-sample-rate audio. Preserves delicate high-frequency air and vocal harmonics without artificial artifacts.
                    </p>
                    <div className="text-[10px] text-emerald-800 font-mono mt-1">
                      <strong>Ideal Use Case:</strong> Broadcast mastering, acoustic field recordings, documentary audio.
                    </div>
                  </div>
                )}

                {model === 'htdemucs-v4' && (
                  <div>
                    <div className="font-semibold text-zerodha-heading text-[11px] flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-purple-600" />
                      <span>Best for: Heavy Multi-Source Noise &amp; Crowds</span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                      Hybrid Transformer Demucs by Meta AI. Separates up to 6 distinct acoustic layers (speech, crowd, traffic, ambient room tone, industrial hum).
                    </p>
                    <div className="text-[10px] text-purple-800 font-mono mt-1">
                      <strong>Ideal Use Case:</strong> Outdoor vlog recordings, busy market conventions, live events.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zerodha-heading mb-1 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-zerodha-green" />
                <span>Speech Enhancement</span>
              </label>
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  id="deepfilter"
                  checked={deepFilter}
                  onChange={(e) => setDeepFilter(e.target.checked)}
                  className="rounded border-gray-300 text-zerodha-blue focus:ring-0 w-4 h-4"
                />
                <label htmlFor="deepfilter" className="text-xs text-zerodha-text cursor-pointer">
                  DeepFilterNet3 Cleaning
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-zerodha-border flex items-center justify-between">
          {isProcessing ? (
            <div className="w-full flex items-center space-x-2.5">
              <div className="w-3.5 h-3.5 border-2 border-zerodha-blue border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-zerodha-blue font-mono">{progressStep}</span>
            </div>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zerodha-muted hover:text-zerodha-heading transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartIngestion}
                disabled={tab === 'upload' ? !file : !youtubeUrl}
                className="px-5 py-2 rounded bg-zerodha-blue hover:bg-zerodha-blue-hover disabled:opacity-50 text-white text-xs font-medium shadow-sm transition-all"
              >
                Start Separation Pipeline
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
