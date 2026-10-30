'use client';

import React, { useState } from 'react';
import { UploadCloud, Youtube, X, Cpu, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { ProjectState } from '../lib/types';
import { FlyingBox } from './FlyingBox';

interface IngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: ProjectState) => void;
}

export const IngestionModal: React.FC<IngestionModalProps> = ({ isOpen, onClose, onProjectCreated }) => {
  const [tab, setTab] = useState<'upload' | 'youtube'>('upload');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [model, setModel] = useState('bs-roformer-v2');
  const [deepFilter, setDeepFilter] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState('');

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      if (!title) {
        setTitle(e.dataTransfer.files[0].name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleStartIngestion = async () => {
    setIsProcessing(true);
    setProgressStep('Probe media format & container specs...');

    try {
      const formData = new FormData();
      if (title) formData.append('title', title);
      formData.append('separationModel', model);

      if (tab === 'upload' && file) {
        formData.append('file', file);
      } else if (tab === 'youtube' && youtubeUrl) {
        formData.append('youtubeUrl', youtubeUrl);
      }

      // Simulated pipeline steps
      setTimeout(() => setProgressStep('Lossless PCM 16-bit 44.1kHz audio extraction via FFmpeg...'), 600);
      setTimeout(() => setProgressStep('Slicing 60s overlapping chunks with 2.0s crossfades (OOM protection)...'), 1300);
      setTimeout(() => setProgressStep(`Running ${model} AI stem separation matrix...`), 2000);

      setTimeout(() => {
        const generatedId = `proj-${Date.now().toString(36)}`;
        const newProject: ProjectState = {
          projectId: generatedId,
          orgId: 'org-rsm-enterprise-01',
          title: title || (tab === 'upload' && file ? file.name : 'Stream Ingestion Master'),
          status: 'READY',
          durationSeconds: 118.0,
          sourceType: tab === 'upload' ? 'UPLOAD' : 'YOUTUBE',
          sourceUrl: tab === 'upload' && file ? file.name : youtubeUrl,
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
              colorHex: '#27A376'
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
              colorHex: '#FF4D36'
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
              colorHex: '#258BF5'
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
              colorHex: '#6B70F0'
            }
          ],
          surgicalHistory: [],
          updatedAt: new Date().toISOString()
        };

        setIsProcessing(false);
        onProjectCreated(newProject);
        onClose();
      }, 2700);

    } catch (err) {
      setIsProcessing(false);
      alert('Ingestion error: ' + err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl glass-panel-elevated rounded-2xl p-6 sm:p-7 shadow-2xl border border-white/[0.12] text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-white/[0.08] text-[#9FA4B8] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 pb-4 border-b border-white/[0.08]">
          <div className="w-9 h-9 rounded-xl bg-[#FF4D36]/15 border border-[#FF4D36]/30 flex items-center justify-center text-[#FF4D36]">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-bold text-white">Ingest Media Stream</h2>
            <p className="text-xs text-[#9FA4B8] font-mono mt-0.5">
              Lossless audio extraction, automated 60s chunking &amp; SOTA separation.
            </p>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-white/[0.08] mt-4 text-xs font-mono">
          <button
            onClick={() => setTab('upload')}
            className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 transition-all ${
              tab === 'upload' ? 'border-[#FF4D36] text-[#FF7A59] font-bold' : 'border-transparent text-[#9FA4B8] hover:text-white'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>File Upload (MP4 / MOV / WAV / MKV)</span>
          </button>
          <button
            onClick={() => setTab('youtube')}
            className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 transition-all ${
              tab === 'youtube' ? 'border-[#FF4D36] text-[#FF7A59] font-bold' : 'border-transparent text-[#9FA4B8] hover:text-white'
            }`}
          >
            <Youtube className="w-4 h-4 text-red-500" />
            <span>YouTube Stream (yt-dlp)</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#9FA4B8] uppercase tracking-wider font-semibold mb-1.5">
              Project Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Broadcast Episode 24 - Voice Master"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/[0.1] bg-[#12131C] text-white placeholder-[#646982] focus:outline-none focus:border-[#FF4D36] font-mono"
            />
          </div>

          {tab === 'upload' ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-white/[0.12] hover:border-[#FF4D36] rounded-2xl p-8 text-center cursor-pointer transition-all bg-[#12131C]/60 hover:bg-[#12131C]"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <UploadCloud className="w-9 h-9 text-[#646982] mx-auto mb-2" />
              {file ? (
                <div className="text-xs text-[#33C287] font-semibold flex items-center justify-center space-x-1.5 font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)</span>
                </div>
              ) : (
                <>
                  <p className="text-xs font-heading font-semibold text-white">Click or drag &amp; drop video or audio file</p>
                  <p className="text-[11px] text-[#9FA4B8] font-mono mt-1">MP4, MOV, MKV, WAV, FLAC, MP3 (No duration limit)</p>
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
              <label className="block text-xs font-mono text-[#9FA4B8] uppercase tracking-wider font-semibold mb-1.5">
                YouTube Video URL
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/[0.1] bg-[#12131C] text-white placeholder-[#646982] focus:outline-none focus:border-[#FF4D36] font-mono"
              />
              <p className="text-[11px] text-[#9FA4B8] font-mono mt-1">
                Extracted losslessly using headless `yt-dlp` stream capture.
              </p>
            </div>
          )}

          {/* Model selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="col-span-1">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono text-[#9FA4B8] uppercase tracking-wider font-semibold flex items-center space-x-1">
                  <Cpu className="w-3.5 h-3.5 text-[#258BF5]" />
                  <span>Separation Model</span>
                  <FlyingBox
                    title="Choosing a Separation Model"
                    content="Each neural model is trained for different acoustic challenges. BS-RoFormer is best for voice vs music; Mel-Band preserves high-end audio fidelity; HTDemucs handles multi-layer crowd and street noise."
                    recommendation="BS-RoFormer v2 is recommended for general podcasts and studio video."
                  />
                </label>
              </div>

              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-white/[0.1] bg-[#12131C] text-white focus:outline-none focus:border-[#FF4D36] font-mono"
              >
                <option value="bs-roformer-v2">BS-RoFormer v2 (SOTA Multi-Stem)</option>
                <option value="melband-roformer">Mel-Band RoFormer (HD Audio)</option>
                <option value="htdemucs-v4">HTDemucs v4 (6-Stem Demixing)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#9FA4B8] uppercase tracking-wider font-semibold mb-1 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-[#27A376]" />
                <span>Speech Enhancement</span>
              </label>
              <div className="flex items-center space-x-2 mt-2 bg-[#12131C] p-2 rounded-xl border border-white/[0.08]">
                <input
                  type="checkbox"
                  id="deepfilter"
                  checked={deepFilter}
                  onChange={(e) => setDeepFilter(e.target.checked)}
                  className="rounded border-white/[0.2] bg-[#181926] text-[#FF4D36] focus:ring-0 w-4 h-4 accent-[#FF4D36]"
                />
                <label htmlFor="deepfilter" className="text-xs text-[#F3F4F8] cursor-pointer font-mono">
                  DeepFilterNet3 Cleaning
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
          {isProcessing ? (
            <div className="w-full flex items-center space-x-2.5">
              <div className="w-4 h-4 border-2 border-[#FF4D36] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-[#FF7A59] font-mono">{progressStep}</span>
            </div>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#9FA4B8] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartIngestion}
                disabled={tab === 'upload' ? !file : !youtubeUrl}
                className="btn-coral px-5 py-2.5 rounded-xl disabled:opacity-50 text-white text-xs font-semibold shadow-[0_4px_20px_rgba(255,77,54,0.35)] transition-all"
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
