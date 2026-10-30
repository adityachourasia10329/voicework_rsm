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
  FolderKanban,
  Radio,
  Cpu
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

  // Download edited file modal state
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
      <div className="min-h-screen bg-[#0D0E15] flex items-center justify-center text-white font-mono">
        <div className="flex items-center space-x-3 glass-panel p-6 rounded-2xl border border-white/[0.08] shadow-2xl">
          <div className="w-5 h-5 border-2 border-[#FF4D36] border-t-transparent rounded-full animate-spin" />
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
          volumeDb: s.type === 'SPEECH_MAIN' ? +1.0 : -18.0,
          isMuted: false
        }));
      } else if (preset === 'REMOVE_MUSIC') {
        newStems = newStems.map((s) => ({
          ...s,
          volumeDb: s.type.includes('MUSIC') ? -60.0 : s.volumeDb,
          isMuted: s.type.includes('MUSIC') ? true : s.isMuted
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
      const suppressionDb = -((val / 100) * 40.0);
      const updatedStems = prev.stems.map((s) => {
        if (s.type === 'SPEECH_MAIN') return s;
        return {
          ...s,
          volumeDb: Math.min(s.volumeDb, suppressionDb),
          isMuted: val > 95
        };
      });

      return {
        ...prev,
        mixer: {
          ...prev.mixer,
          expressClarityDial: val,
          preset: 'CUSTOM'
        },
        stems: updatedStems
      };
    });
  };

  // Surgical Patch handlers
  const handleApplyPatch = (revision: SurgicalRevision) => {
    setProject((prev) => {
      if (!prev) return null;
      const history = [revision, ...(prev.surgicalHistory || [])];
      return {
        ...prev,
        surgicalHistory: history
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

  return (
    <div className="min-h-screen text-[#F3F4F8] font-sans pb-24">
      <Navbar projectCount={INITIAL_PROJECTS.length} activeTab="editor" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Top Navigation & Workspace Title Bar (Futuristic Studio HUD) */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <Link
              href="/"
              className="p-2 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-[#9FA4B8] hover:text-white transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-base sm:text-lg font-heading font-bold text-white tracking-tight">{project.title}</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#27A376]/15 text-[#33C287] border border-[#27A376]/30 font-semibold tracking-wider">
                  {project.status}
                </span>
                <FlyingBox
                  title="Session Workspace"
                  content="This workspace lets you mix isolated stems, inspect audio waves across frequency octaves, surgically repair defects, eliminate unwanted instruments or traffic, and download the finished master video or audio."
                />
              </div>
              <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs text-[#9FA4B8] font-mono">
                <span>Duration: {Math.floor(project.durationSeconds / 60)}m {Math.floor(project.durationSeconds % 60)}s</span>
                <span>&bull;</span>
                <div className="flex items-center space-x-1.5">
                  <FolderKanban className="w-3.5 h-3.5 text-[#6B70F0]" />
                  <span className="text-white/70 font-medium">Session:</span>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => {
                      setSelectedProjectId(e.target.value);
                      router.push(`/editor/${e.target.value}`);
                    }}
                    className="px-2.5 py-1 text-xs rounded-xl border border-white/[0.1] bg-[#12131C] text-white font-medium focus:outline-none focus:border-[#FF4D36] cursor-pointer max-w-[210px] sm:max-w-[320px] truncate"
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
          <div className="flex flex-wrap items-center gap-3">
            {/* 3-Tier Mode Selector: Stems Eliminator, Full Authority, Express */}
            <div className="flex items-center space-x-1.5">
              <nav className="flex p-1 rounded-xl bg-[#12131C] border border-white/[0.1] text-xs font-mono">
                <button
                  onClick={() => setEditorMode('STEMS_REMOVAL')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    editorMode === 'STEMS_REMOVAL'
                      ? 'bg-gradient-to-r from-[#FF4D36] to-[#FF7A59] text-white font-semibold shadow-[0_0_15px_rgba(255,77,54,0.4)]'
                      : 'text-[#9FA4B8] hover:text-white'
                  }`}
                  title="Stems & Noise Eliminator (Instruments, Traffic, Sound removal)"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Stems &amp; Noise</span>
                </button>

                <button
                  onClick={() => setEditorMode('FULL_AUTHORITY')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    editorMode === 'FULL_AUTHORITY'
                      ? 'bg-[#6B70F0] text-white font-semibold shadow-[0_0_15px_rgba(107,112,240,0.4)]'
                      : 'text-[#9FA4B8] hover:text-white'
                  }`}
                  title="Full Authority multi-channel mixer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Mixer</span>
                </button>

                <button
                  onClick={() => setEditorMode('EXPRESS')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    editorMode === 'EXPRESS'
                      ? 'bg-gradient-to-r from-[#6B70F0] to-[#FF5DB1] text-white font-semibold shadow-[0_0_15px_rgba(255,93,177,0.4)]'
                      : 'text-[#9FA4B8] hover:text-white'
                  }`}
                  title="1-dial express clarity"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Express</span>
                </button>
              </nav>
              <FlyingBox
                title="Editor Mode Switch"
                content="Stems & Noise lets you eliminate specific instruments, traffic, or noise boxes. Mixer provides multi-channel faders. Express provides a fast 1-dial clarity slider."
              />
            </div>

            {/* Sync State Button */}
            <button
              onClick={handleSaveToRedis}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono font-medium text-[#9FA4B8] hover:text-white transition-colors"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#27A376]" />
                  <span className="text-[#33C287] font-semibold">Synced (&lt;3ms)</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Sync State</span>
                </>
              )}
            </button>
            <FlyingBox
              title="Redis Hot Cache Sync"
              content="Saves all fader levels and surgical intervals into Tier 1 in-memory Redis in <3ms. Keeps your work preserved."
            />

            {/* Remux Export Master Button (Superlist Coral) */}
            <button
              onClick={() => setIsDownloadOpen(true)}
              className="btn-coral flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-[0_4px_20px_rgba(255,77,54,0.35)]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Master</span>
            </button>
          </div>
        </div>

        {/* Top Grid: Video Canvas & Spectrogram Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Synced Video Player & Dedicated Download Option Underneath Preview */}
          <div className="lg:col-span-5 space-y-4">
            <VideoPlayer
              videoUrl={project.mediaContainer.originalVideoUrl}
              currentTime={currentTime}
              duration={project.durationSeconds}
              isPlaying={isPlaying}
              onTimeUpdate={(t) => setCurrentTime(t)}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
            />

            {/* Download Option for the New Edited File Directly Under Video Preview */}
            <div className="glass-panel p-4 rounded-2xl border border-white/[0.08] shadow-lg flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FF4D36]/15 border border-[#FF4D36]/30 flex items-center justify-center text-[#FF4D36]">
                    <Download className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-heading font-bold text-white">Download Edited Master</span>
                  <FlyingBox
                    title="Export Edited File"
                    content="Download your refined video or audio file. Choose from MP4, MOV, MKV, WAV, FLAC, or MP3 with lossless video stream copy (-c:v copy)."
                    recommendation="Click the button to select your target container format and audio mix options."
                  />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#27A376]/15 text-[#33C287] border border-[#27A376]/30 font-semibold">
                  READY TO EXPORT
                </span>
              </div>

              <p className="text-[11px] text-[#9FA4B8] leading-relaxed">
                Zero-loss remuxing guarantees bit-identical video streams untouched by compression. Pick your preferred target container below.
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
                <div className="flex flex-wrap gap-1">
                  {['MP4', 'MOV', 'MKV', 'WAV', 'FLAC', 'MP3'].map((fmt) => (
                    <span key={fmt} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-[#9FA4B8] border border-white/[0.06]">
                      {fmt}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setIsDownloadOpen(true)}
                  className="btn-coral px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 flex-shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Choose Format</span>
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
            <div className="glass-panel rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
                <div className="flex items-center space-x-2 text-xs font-heading font-bold text-white">
                  <History className="w-4 h-4 text-[#6B70F0]" />
                  <span>Surgical Revision Audit Log</span>
                </div>
                <span className="text-[11px] font-mono text-[#9FA4B8]">
                  {project.surgicalHistory.length} re-processed intervals
                </span>
              </div>

              <div className="divide-y divide-white/[0.06]">
                {project.surgicalHistory.map((rev) => (
                  <div
                    key={rev.revisionId}
                    className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#6B70F0]/15 text-[#8E93FF] font-semibold border border-[#6B70F0]/30 text-[11px]">
                        {rev.flagType}
                      </span>
                      <span className="text-white font-medium">
                        {rev.startSec}s &rarr; {rev.endSec}s ({(rev.endSec - rev.startSec).toFixed(1)}s)
                      </span>
                      <span className="text-[#9FA4B8] text-[11px] hidden sm:inline">
                        {rev.appliedModel} (Crossfade: {rev.crossfadeWindowSec}s)
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-[#33C287] text-[11px] font-medium flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#27A376]" />
                        <span>Spliced into Master</span>
                      </span>
                      <button
                        onClick={() => setCurrentTime(rev.startSec)}
                        className="px-2.5 py-1 rounded-lg border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-white transition-colors text-[11px]"
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

      {/* Download Edited File Format Modal */}
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
