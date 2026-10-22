'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../../components/Navbar';
import { VideoPlayer } from '../../../components/VideoPlayer';
import { SpectrogramCanvas } from '../../../components/SpectrogramCanvas';
import { StemMixer } from '../../../components/StemMixer';
import { ExpressControls } from '../../../components/ExpressControls';
import { StemEliminator } from '../../../components/StemEliminator';
import { SurgicalModal } from '../../../components/SurgicalModal';
import { DownloadModal } from '../../../components/DownloadModal';
import { FlyingBox } from '../../../components/FlyingBox';
import { INITIAL_PROJECTS } from '../../../lib/mockData';
import { ProjectState, StemTrack, PresetMode, EditorMode, SurgicalRevision } from '../../../lib/types';
import {
  ArrowLeft,
  Sliders,
  Sparkles,
  Download,
  Save,
  CheckCircle2,
  History,
  FileAudio,
  SlidersHorizontal,
  FolderKanban
} from 'lucide-react';

interface EditorClientProps {
  projectId: string;
}

export default function EditorClient({ projectId }: EditorClientProps) {
  const router = useRouter();

  // Project state and current selected project
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId);
  const [project, setProject] = useState<ProjectState | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('STEMS_REMOVAL');

  // Surgical modal state
  const [isSurgicalOpen, setIsSurgicalOpen] = useState<boolean>(false);
  const [surgicalRange, setSurgicalRange] = useState<{ start: number; end: number }>({ start: 0, end: 5 });

  // Download edited file modal state (Requirements 1 & 5)
  const [isDownloadOpen, setIsDownloadOpen] = useState<boolean>(false);

  // Save/Export state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    const found = INITIAL_PROJECTS.find((p) => p.projectId === selectedProjectId) || INITIAL_PROJECTS[0];
    if (found) {
      setProject(JSON.parse(JSON.stringify(found)));
    }
  }, [selectedProjectId]);

  if (!project) {
    return (
      <div className="min-h-screen bg-zerodha-bg flex items-center justify-center text-zerodha-text font-mono">
        <div className="flex items-center space-x-3 bg-white p-6 rounded border border-zerodha-border shadow-sm">
          <div className="w-4 h-4 border-2 border-zerodha-blue border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Retrieving project state from Redis Hot Cache (&lt; 3ms)...</span>
        </div>
      </div>
    );
  }

  // Multi-stem mixer handlers
  const handleUpdateStem = (stemId: string, updates: Partial<StemTrack>) => {
    setProject((prev) => {
      if (!prev) return null;
      const updatedStems = prev.stems.map((s) => (s.stemId === stemId ? { ...s, ...updates } : s));
      return {
        ...prev,
        mixer: { ...prev.mixer, preset: 'CUSTOM' },
        stems: updatedStems
      };
    });
  };

  const handleUpdateMasterGain = (gainDb: number) => {
    setProject((prev) => (prev ? { ...prev, mixer: { ...prev.mixer, masterGainDb: gainDb } } : null));
  };

  // Express mode handlers
  const handleSelectPreset = (preset: PresetMode) => {
    setProject((prev) => {
      if (!prev) return null;
      let newStems = [...prev.stems];

      if (preset === 'VOICE_ONLY') {
        newStems = newStems.map((s) => ({
          ...s,
          volumeDb: s.type === 'SPEECH_MAIN' ? 0.0 : -60.0,
          isMuted: s.type !== 'SPEECH_MAIN'
        }));
      } else if (preset === 'NATURAL_AMBIENT_CLEAN') {
        newStems = newStems.map((s) => ({
          ...s,
          volumeDb: s.type === 'SPEECH_MAIN' ? 0.0 : (s.type.includes('NOISE') ? -18.0 : -12.0),
          isMuted: false
        }));
      } else if (preset === 'REMOVE_MUSIC') {
        newStems = newStems.map((s) => ({
          ...s,
          volumeDb: s.type.includes('MUSIC') ? -60.0 : 0.0,
          isMuted: s.type.includes('MUSIC')
        }));
      }

      return {
        ...prev,
        mixer: { ...prev.mixer, preset },
        stems: newStems
      };
    });
  };

  const handleChangeClarity = (val: number) => {
    setProject((prev) => {
      if (!prev) return null;
      const suppressionDb = -10 - (val / 100) * 45;
      const updatedStems = prev.stems.map((s) => {
        if (s.type.includes('NOISE')) {
          return { ...s, volumeDb: suppressionDb };
        }
        return s;
      });
      return {
        ...prev,
        mixer: { ...prev.mixer, expressClarityDial: val },
        stems: updatedStems
      };
    });
  };

  const handleApplyPatch = (revision: SurgicalRevision) => {
    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        surgicalHistory: [revision, ...(prev.surgicalHistory || [])]
      };
    });
  };

  const handleApplyRefinedAudio = (cleanedStems: StemTrack[], revisionSummary: string) => {
    setProject((prev) => {
      if (!prev) return null;
      const newRev: SurgicalRevision = {
        revisionId: `rev-stem-clean-${Date.now()}`,
        startSec: 0,
        endSec: prev.durationSeconds,
        flagType: 'RESIDUAL_NOISE_AUDIBLE',
        appliedModel: 'BS-RoFormer + DeepFilterNet3 Stems Subtraction',
        status: 'PATCHED',
        crossfadeWindowSec: 2.0,
        timestamp: new Date().toISOString()
      };
      return {
        ...prev,
        stems: cleanedStems,
        surgicalHistory: [newRev, ...(prev.surgicalHistory || [])]
      };
    });
  };

  const handleOpenSurgical = (startSec: number, endSec: number) => {
    setSurgicalRange({ start: startSec, end: endSec });
    setIsSurgicalOpen(true);
  };

  const handleSaveToRedis = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 300);
  };

  const handleRemuxExport = () => {
    setIsDownloadOpen(true);
  };

  return (
    <div className="min-h-screen bg-zerodha-bg pb-20">
      <Navbar projectCount={INITIAL_PROJECTS.length} activeTab="editor" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Top Navigation & Workspace Title Bar */}
        <div className="bg-white rounded border border-zerodha-border p-4 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="p-1.5 rounded border border-zerodha-border hover:bg-gray-50 text-zerodha-muted hover:text-zerodha-heading transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-semibold text-zerodha-heading tracking-tight">{project.title}</h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  {project.status}
                </span>
                <FlyingBox
                  title="Session Workspace"
                  content="This workspace lets you mix isolated stems, inspect audio waves across frequency octaves, surgically repair defects, eliminate unwanted instruments or traffic, and download the finished master video or audio."
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-zerodha-muted font-mono">
                <span>Duration: {Math.floor(project.durationSeconds / 60)}m {Math.floor(project.durationSeconds % 60)}s</span>
                <span>&bull;</span>
                <div className="flex items-center space-x-1.5">
                  <FolderKanban className="w-3.5 h-3.5 text-zerodha-blue" />
                  <span className="text-gray-600 font-medium">Session:</span>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => {
                      setSelectedProjectId(e.target.value);
                      router.push(`/editor/${e.target.value}`);
                    }}
                    className="px-2 py-0.5 text-xs rounded border border-zerodha-border bg-gray-50 hover:bg-white text-zerodha-heading font-medium focus:outline-none focus:border-zerodha-blue cursor-pointer max-w-[210px] sm:max-w-[320px] truncate"
                  >
                    {INITIAL_PROJECTS.map((p) => (
                      <option key={p.projectId} value={p.projectId}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Selector & Clean Export Actions */}
          <div className="flex items-center space-x-3">
            {/* 3-Tier Mode Selector: Stems Eliminator, Full Authority, Express */}
            <div className="flex items-center space-x-1.5">
              <div className="flex rounded border border-zerodha-border overflow-hidden text-xs">
                <button
                  onClick={() => setEditorMode('STEMS_REMOVAL')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 font-medium transition-colors ${
                    editorMode === 'STEMS_REMOVAL'
                      ? 'bg-zerodha-blue text-white font-semibold'
                      : 'bg-white text-zerodha-muted hover:bg-gray-50'
                  }`}
                  title="Stems & Noise Eliminator (Instruments, Traffic, Sound removal)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Stems &amp; Noise</span>
                </button>

                <button
                  onClick={() => setEditorMode('FULL_AUTHORITY')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 font-medium border-l border-zerodha-border transition-colors ${
                    editorMode === 'FULL_AUTHORITY'
                      ? 'bg-zerodha-blue text-white font-semibold'
                      : 'bg-white text-zerodha-muted hover:bg-gray-50'
                  }`}
                  title="Full Authority multi-channel mixer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Mixer</span>
                </button>

                <button
                  onClick={() => setEditorMode('EXPRESS')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 font-medium border-l border-zerodha-border transition-colors ${
                    editorMode === 'EXPRESS'
                      ? 'bg-zerodha-blue text-white font-semibold'
                      : 'bg-white text-zerodha-muted hover:bg-gray-50'
                  }`}
                  title="1-dial express clarity"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Express</span>
                </button>
              </div>
              <FlyingBox
                title="Editor Mode Switch"
                content="Stems & Noise lets you eliminate specific instruments, traffic, or noise boxes. Mixer provides multi-channel faders. Express provides a fast 1-dial clarity slider."
              />
            </div>

            {/* Sync State Button */}
            <button
              onClick={handleSaveToRedis}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded border border-zerodha-border bg-white hover:bg-gray-50 text-xs font-medium text-zerodha-text transition-colors"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-zerodha-green" />
                  <span className="text-zerodha-green font-mono">Synced (&lt;3ms)</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-zerodha-muted" />
                  <span>Sync State</span>
                </>
              )}
            </button>
            <FlyingBox
              title="Redis Hot Cache Sync"
              content="Saves all fader levels and surgical intervals into Tier 1 in-memory Redis in <3ms. Keeps your work preserved."
            />

            {/* Remux Export Button */}
            <button
              onClick={() => setIsDownloadOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded bg-zerodha-blue hover:bg-zerodha-blue-hover text-white text-xs font-medium shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Master</span>
            </button>
          </div>
        </div>

        {/* Top Grid: Video Canvas & Spectrogram Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Synced Video Player & Dedicated Download Option Underneath Preview (Requirements 1 & 5) */}
          <div className="lg:col-span-5 space-y-3">
            <VideoPlayer
              videoUrl={project.mediaContainer.originalVideoUrl}
              currentTime={currentTime}
              duration={project.durationSeconds}
              isPlaying={isPlaying}
              onTimeUpdate={(t) => setCurrentTime(t)}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
            />

            {/* Download Option for the New Edited File Directly Under Video Preview */}
            <div className="bg-white p-3.5 rounded border border-zerodha-border shadow-sm flex flex-col justify-between space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Download className="w-4 h-4 text-zerodha-blue" />
                  <span className="text-xs font-semibold text-zerodha-heading">Download Edited Master File</span>
                  <FlyingBox
                    title="Export Edited File"
                    content="Download your refined video or audio file. Choose from MP4, MOV, MKV, WAV, FLAC, or MP3 with lossless video stream copy (-c:v copy)."
                    recommendation="Click the button to select your target container format and audio mix options."
                  />
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Ready to Export
                </span>
              </div>

              <p className="text-[11px] text-zerodha-muted leading-relaxed">
                Lossless remuxing guarantees zero video compression artifacts. Prompts you to pick your preferred format before downloading.
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                <div className="flex flex-wrap gap-1">
                  {['MP4', 'MOV', 'MKV', 'WAV', 'FLAC', 'MP3'].map((fmt) => (
                    <span key={fmt} className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gray-100 text-gray-700 border border-gray-200">
                      {fmt}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setIsDownloadOpen(true)}
                  className="px-3.5 py-1.5 rounded bg-zerodha-blue hover:bg-zerodha-blue-hover text-white text-xs font-medium shadow-sm transition-all flex items-center space-x-1.5 flex-shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Choose Format &amp; Download</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Spectrogram & Multi-Band Frequency Waves Visualizer */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <SpectrogramCanvas
              currentTime={currentTime}
              duration={project.durationSeconds}
              surgicalHistory={project.surgicalHistory}
              onSeek={(t) => setCurrentTime(t)}
              onOpenSurgicalModal={handleOpenSurgical}
            />
          </div>
        </div>

        {/* Bottom Section: Three-Tier UX Hierarchy (Stems Eliminator vs Express vs Multi-Stem Mixer) */}
        <div className="space-y-6">
          {editorMode === 'STEMS_REMOVAL' ? (
            <StemEliminator
              project={project}
              onApplyRefinedAudio={handleApplyRefinedAudio}
              onOpenDownloadModal={() => setIsDownloadOpen(true)}
            />
          ) : editorMode === 'EXPRESS' ? (
            <ExpressControls
              clarityDial={project.mixer.expressClarityDial}
              currentPreset={project.mixer.preset}
              onChangeClarity={handleChangeClarity}
              onSelectPreset={handleSelectPreset}
            />
          ) : (
            <StemMixer
              stems={project.stems}
              masterGainDb={project.mixer.masterGainDb}
              onUpdateStem={handleUpdateStem}
              onUpdateMasterGain={handleUpdateMasterGain}
            />
          )}

          {/* Surgical Revisions History Log (Audit Trail) */}
          {project.surgicalHistory && project.surgicalHistory.length > 0 && (
            <div className="bg-white rounded border border-zerodha-border p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-zerodha-border">
                <div className="flex items-center space-x-2 text-xs font-semibold text-zerodha-heading">
                  <History className="w-4 h-4 text-zerodha-blue" />
                  <span>Surgical Revision Audit Log</span>
                </div>
                <span className="text-[11px] font-mono text-zerodha-muted">
                  {project.surgicalHistory.length} re-processed intervals
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {project.surgicalHistory.map((rev) => (
                  <div
                    key={rev.revisionId}
                    className="py-2.5 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-zerodha-blue font-medium border border-blue-200">
                        {rev.flagType}
                      </span>
                      <span className="text-zerodha-heading font-medium">
                        {rev.startSec}s &rarr; {rev.endSec}s ({(rev.endSec - rev.startSec).toFixed(1)}s)
                      </span>
                      <span className="text-zerodha-muted text-[11px]">
                        {rev.appliedModel} (Crossfade: {rev.crossfadeWindowSec}s)
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-zerodha-green text-[11px] font-medium">
                        &bull; Spliced into Master
                      </span>
                      <button
                        onClick={() => setCurrentTime(rev.startSec)}
                        className="px-2.5 py-1 rounded border border-zerodha-border hover:bg-gray-50 text-zerodha-text transition-colors text-[11px]"
                      >
                        Seek
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Surgical Time-Bracket Modal */}
      <SurgicalModal
        isOpen={isSurgicalOpen}
        startSec={surgicalRange.start}
        endSec={surgicalRange.end}
        projectId={project.projectId}
        onClose={() => setIsSurgicalOpen(false)}
        onApplyPatch={handleApplyPatch}
      />

      {/* Download Edited File Format Modal (Requirements 1 & 5) */}
      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        projectTitle={project.title}
        durationSeconds={project.durationSeconds}
        hasVideo={project.mediaContainer.hasVideo}
      />
    </div>
  );
}
