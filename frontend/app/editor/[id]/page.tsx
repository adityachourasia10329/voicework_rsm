'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '../../../components/Navbar';
import { VideoPlayer } from '../../../components/VideoPlayer';
import { SpectrogramCanvas } from '../../../components/SpectrogramCanvas';
import { StemMixer } from '../../../components/StemMixer';
import { ExpressControls } from '../../../components/ExpressControls';
import { SurgicalModal } from '../../../components/SurgicalModal';
import { INITIAL_PROJECTS } from '../../../lib/mockData';
import { ProjectState, StemTrack, PresetMode, EditorMode, SurgicalRevision } from '../../../lib/types';
import {
  ArrowLeft,
  Sliders,
  Sparkles,
  Download,
  Archive,
  Save,
  CheckCircle2,
  Clock,
  History,
  Activity,
  Layers
} from 'lucide-react';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  // Project state
  const [project, setProject] = useState<ProjectState | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('FULL_AUTHORITY');

  // Surgical modal state
  const [isSurgicalOpen, setIsSurgicalOpen] = useState<boolean>(false);
  const [surgicalRange, setSurgicalRange] = useState<{ start: number; end: number }>({ start: 0, end: 5 });

  // Save/Export state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Find project from initial seed or memory store
    const found = INITIAL_PROJECTS.find((p) => p.projectId === projectId) || INITIAL_PROJECTS[0];
    if (found) {
      setProject(JSON.parse(JSON.stringify(found)));
      setEditorMode(found.mixer?.mode || 'FULL_AUTHORITY');
    }
  }, [projectId]);

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white font-mono">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span>Fetching Hot State from Redis Tier 1 (&lt; 3ms)...</span>
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
      // Dynamically attenuate noise stems proportional to dial
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

  // Surgical micro-inference application
  const handleApplyPatch = (revision: SurgicalRevision) => {
    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        surgicalHistory: [revision, ...(prev.surgicalHistory || [])]
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
    }, 400);
  };

  const handleRemuxExport = () => {
    alert(
      `Lossless Video Remuxing initialized!\nFFmpeg command: ffmpeg -i original.mp4 -i refined_master.wav -c:v copy -map 0:v:0 -map 1:a:0 -shortest output.mp4\nVideo streams copied untouched with zero quality loss.`
    );
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Top Navigation & Project Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-surface hover:bg-surface-elevated border border-border text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white tracking-tight">{project.title}</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                  {project.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                ID: {project.projectId} &bull; Duration: {Math.floor(project.durationSeconds / 60)}m {Math.floor(project.durationSeconds % 60)}s
              </p>
            </div>
          </div>

          {/* Mode Selector & Quick Export Actions */}
          <div className="flex items-center space-x-3">
            {/* Express Mode vs Full Authority Mode Switch */}
            <div className="flex items-center bg-surface p-1 rounded-xl border border-border">
              <button
                onClick={() => setEditorMode('EXPRESS')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  editorMode === 'EXPRESS'
                    ? 'bg-accent text-white shadow-md shadow-accent/25'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Express Mode</span>
              </button>

              <button
                onClick={() => setEditorMode('FULL_AUTHORITY')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  editorMode === 'FULL_AUTHORITY'
                    ? 'bg-accent text-white shadow-md shadow-accent/25'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Full Authority Mode</span>
              </button>
            </div>

            {/* Save to In-Memory Hot State */}
            <button
              onClick={handleSaveToRedis}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-surface hover:bg-surface-elevated border border-border text-xs font-medium text-gray-200 hover:text-white transition-colors"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-mono">Synced (&lt;3ms)</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-gray-400" />
                  <span>Sync State</span>
                </>
              )}
            </button>

            {/* Remux Export */}
            <button
              onClick={handleRemuxExport}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>Remux Video (-c:v copy)</span>
            </button>
          </div>
        </div>

        {/* Top Grid: Video Canvas & Spectrogram Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Synced Video Player */}
          <div className="lg:col-span-5">
            <VideoPlayer
              videoUrl={project.mediaContainer.originalVideoUrl}
              currentTime={currentTime}
              duration={project.durationSeconds}
              isPlaying={isPlaying}
              onTimeUpdate={(t) => setCurrentTime(t)}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
            />
          </div>

          {/* Interactive Spectrogram & Surgical Bracket Selector */}
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

        {/* Bottom Section: Two-Tier UX Hierarchy (Express Controls vs Multi-Stem Mixer) */}
        <div className="space-y-6">
          {editorMode === 'EXPRESS' ? (
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
            <div className="glass-panel rounded-2xl p-4 border border-border">
              <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-white">
                  <History className="w-4 h-4 text-accent" />
                  <span>Surgical Revision Audit Log (Micro-Patches)</span>
                </div>
                <span className="text-[10px] font-mono text-gray-400">
                  {project.surgicalHistory.length} Re-processed Brackets
                </span>
              </div>

              <div className="space-y-2">
                {project.surgicalHistory.map((rev) => (
                  <div
                    key={rev.revisionId}
                    className="p-2.5 rounded-xl bg-surface/70 border border-border flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-0.5 rounded bg-accent/20 text-accent font-bold border border-accent/30">
                        {rev.flagType}
                      </span>
                      <span className="text-gray-300 font-semibold">
                        Interval: {rev.startSec}s &rarr; {rev.endSec}s ({(rev.endSec - rev.startSec).toFixed(1)}s)
                      </span>
                      <span className="text-gray-500 text-[11px]">
                        Model: {rev.appliedModel} (Crossfade: {rev.crossfadeWindowSec}s)
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Spliced into Master
                      </span>
                      <button
                        onClick={() => setCurrentTime(rev.startSec)}
                        className="px-2 py-1 rounded bg-surface-elevated hover:bg-accent text-gray-300 hover:text-white transition-colors text-[10px]"
                      >
                        Seek Bracket
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
    </div>
  );
}
