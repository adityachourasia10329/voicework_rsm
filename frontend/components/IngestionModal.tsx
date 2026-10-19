'use client';

import React, { useState } from 'react';
import { X, UploadCloud, Youtube, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';
import { ProjectState } from '../lib/types';

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
    setProgressStep('Ingesting stream container & probing codecs...');

    try {
      // Simulation or Live API call
      setTimeout(() => {
        setProgressStep('FFmpeg lossless PCM extraction (-acodec pcm_s16le)...');
      }, 700);

      setTimeout(() => {
        setProgressStep('Audio chunker: 60s overlapping windows with 2s crossfade...');
      }, 1400);

      setTimeout(() => {
        setProgressStep('Running BS-RoFormer stem isolation & DeepFilterNet3 speech recovery...');
      }, 2100);

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
              colorHex: '#10B981'
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
              colorHex: '#EF4444'
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
              colorHex: '#3B82F6'
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
              colorHex: '#A855F7'
            }
          ],
          surgicalHistory: [],
          updatedAt: new Date().toISOString()
        };

        setIsProcessing(false);
        onProjectCreated(newProject);
        onClose();
      }, 3000);

    } catch (err) {
      setIsProcessing(false);
      alert('Ingestion error: ' + err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl glass-panel-elevated rounded-2xl p-6 shadow-2xl border border-border">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <UploadCloud className="w-6 h-6 text-accent" />
          <span>Ingest Media Stream</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Supports arbitrary length files (30m to 2h+). Lossless audio extraction &amp; GPU chunking with 2s crossfades.
        </p>

        {/* Tab selection */}
        <div className="flex border-b border-border mt-5">
          <button
            onClick={() => setTab('upload')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              tab === 'upload' ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>File Upload (MP4 / MOV / WAV / MKV)</span>
          </button>
          <button
            onClick={() => setTab('youtube')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              tab === 'youtube' ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Youtube className="w-4 h-4 text-red-400" />
            <span>YouTube Stream (yt-dlp)</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Broadcast Episode 24 - Voice Master"
              className="w-full px-3 py-2 text-xs rounded-lg bg-surface border border-border text-white placeholder-gray-500 focus:outline-none focus:border-accent"
            />
          </div>

          {tab === 'upload' ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-border hover:border-accent/60 rounded-xl p-8 text-center cursor-pointer transition-colors bg-surface/50"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              {file ? (
                <div className="text-xs text-emerald-400 font-medium flex items-center justify-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)</span>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-300 font-medium">Click or drag &amp; drop video or audio file</p>
                  <p className="text-[10px] text-gray-500 mt-1">MP4, MOV, MKV, WAV, FLAC, MP3 (No duration limit)</p>
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
              <label className="block text-xs font-medium text-gray-300 mb-1">YouTube Video URL</label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 text-xs rounded-lg bg-surface border border-border text-white placeholder-gray-500 focus:outline-none focus:border-accent font-mono"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Ingested directly using high-speed headless `yt-dlp` stream extraction.
              </p>
            </div>
          )}

          {/* Model and Enhancement settings */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5 text-accent" />
                <span>Stem Separation Model</span>
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-surface border border-border text-white focus:outline-none focus:border-accent"
              >
                <option value="bs-roformer-v2">BS-RoFormer v2 (SOTA Multi-Stem)</option>
                <option value="melband-roformer">Mel-Band RoFormer (HD Audio)</option>
                <option value="htdemucs-v4">HTDemucs v4 (6-Stem Demixing)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Speech Enhancement</span>
              </label>
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  id="deepfilter"
                  checked={deepFilter}
                  onChange={(e) => setDeepFilter(e.target.checked)}
                  className="rounded bg-surface border-border text-accent focus:ring-0 w-4 h-4"
                />
                <label htmlFor="deepfilter" className="text-xs text-gray-300 cursor-pointer">
                  DeepFilterNet3 Post-Cleaning
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Progress or Actions */}
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
          {isProcessing ? (
            <div className="w-full flex items-center space-x-3">
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-accent font-mono animate-pulse">{progressStep}</span>
            </div>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartIngestion}
                disabled={tab === 'upload' ? !file : !youtubeUrl}
                className="px-5 py-2 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-lg shadow-accent/20 transition-all"
              >
                Start Demixing Pipeline
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
