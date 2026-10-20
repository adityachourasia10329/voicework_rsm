'use client';

export const dynamic = 'force-dynamic';

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
  Save,
  CheckCircle2,
  Clock,
  History,
  Activity,
  Layers,
  FileAudio
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
    const found = INITIAL_PROJECTS.find((p) => p.projectId === projectId) || INITIAL_PROJECTS[0];
    if (found) {
      setProject(JSON.parse(JSON.stringify(found)));
      setEditorMode(found.mixer?.mode || 'FULL_AUTHORITY');
    }
  }, [projectId]);

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
    alert(
      `Lossless Video Remuxing initialized!\nFFmpeg command: ffmpeg -i original.mp4 -i refined_master.wav -c:v copy -map 0:v:0 -map 1:a:0 -shortest output.mp4\nVideo streams copied untouched with zero quality loss.`
    );
  };

  return (
    <div className="min-h-screen bg-zerodha-bg pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Top Navigation & Workspace Title Bar */}
        <div className="bg-white rounded border border-zerodha-border p-4 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="p-1.5 rounded border border-zerodha-border hover:bg-gray-50 text-zerodha-muted hover:text-zerodha-heading transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-semibold text-zerodha-heading tracking-tight">{project.title}</h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  {project.status}
                </span>
              </div>
              <p className="text-xs text-zerodha-muted font-mono mt-0.5">
                ID: {project.projectId.slice(0, 18)}... &bull; Duration: {Math.floor(project.durationSeconds / 60)}m {Math.floor(project.durationSeconds % 60)}s
              </p>
            </div>
          </div>

          {/* Mode Selector & Clean Export Actions */}
          <div className="flex items-center space-x-3">
            {/* Express Mode vs Full Authority Mode Switch */}
            <div className="flex rounded border border-zerodha-border overflow-hidden text-xs">
              <button
                onClick={() => setEditorMode('EXPRESS')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 font-medium transition-colors ${
                  editorMode === 'EXPRESS'
                    ? 'bg-zerodha-blue text-white'
                    : 'bg-white text-zerodha-muted hover:bg-gray-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Express</span>
              </button>

              <button
                onClick={() => setEditorMode('FULL_AUTHORITY')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 font-medium border-l border-zerodha-border transition-colors ${
                  editorMode === 'FULL_AUTHORITY'
                    ? 'bg-zerodha-blue text-white'
                    : 'bg-white text-zerodha-muted hover:bg-gray-50'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Full Authority</span>
              </button>
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

            {/* Remux Export Button */}
            <button
              onClick={handleRemuxExport}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded bg-zerodha-blue hover:bg-zerodha-blue-hover text-white text-xs font-medium shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
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
    </div>
  );
}
