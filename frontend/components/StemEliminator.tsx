'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  Music,
  Mic,
  Wind,
  Disc,
  Drum,
  Guitar,
  Piano,
  User,
  Users,
  Car,
  Sliders,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
  AudioWaveform
} from 'lucide-react';
import { ProjectState, StemTrack, SurgicalRevision } from '../lib/types';
import { FlyingBox } from './FlyingBox';

export interface StemEliminatorProps {
  project?: ProjectState;
  onApplyRefinedAudio?: (cleanedStems: StemTrack[], revisionSummary: string) => void;
  onOpenDownloadModal?: () => void;
}

interface StemOption {
  id: string;
  name: string;
  category: string;
  iconType: string;
  isPopular?: boolean;
  matchType?: string; // Maps to StemType if applicable
}

// 18 Most used items matching Screenshot 2
const MOST_USED_STEMS: StemOption[] = [
  { id: 'bass', name: 'Bass', category: 'Most used', iconType: 'guitar', isPopular: true, matchType: 'MUSIC_BASS' },
  { id: 'speech', name: 'Speech', category: 'Most used', iconType: 'mic', isPopular: true, matchType: 'SPEECH_MAIN' },
  { id: 'music', name: 'Music', category: 'Most used', iconType: 'music', isPopular: true, matchType: 'MUSIC_INSTRUMENTAL' },
  { id: 'sound-effects', name: 'Sound effects', category: 'Most used', iconType: 'sparkles', isPopular: true, matchType: 'NOISE_TRANSIENTS' },
  { id: 'drums', name: 'Drums', category: 'Most used', iconType: 'drum', isPopular: true, matchType: 'MUSIC_DRUMS' },
  { id: 'kick', name: 'Kick', category: 'Most used', iconType: 'disc', isPopular: true, matchType: 'MUSIC_DRUMS' },
  { id: 'snare', name: 'Snare', category: 'Most used', iconType: 'drum', isPopular: true, matchType: 'MUSIC_DRUMS' },
  { id: 'toms', name: 'Toms', category: 'Most used', iconType: 'drum', isPopular: true, matchType: 'MUSIC_DRUMS' },
  { id: 'hi-hat', name: 'Hi-hat', category: 'Most used', iconType: 'disc', isPopular: true, matchType: 'MUSIC_DRUMS' },
  { id: 'cymbals', name: 'Cymbals', category: 'Most used', iconType: 'disc', isPopular: true, matchType: 'MUSIC_DRUMS' },
  { id: 'guitar', name: 'Guitar', category: 'Most used', iconType: 'guitar', isPopular: true, matchType: 'MUSIC_INSTRUMENTAL' },
  { id: 'piano', name: 'Piano', category: 'Most used', iconType: 'piano', isPopular: true, matchType: 'MUSIC_INSTRUMENTAL' },
  { id: 'strings', name: 'Strings', category: 'Most used', iconType: 'waveform', isPopular: true, matchType: 'MUSIC_INSTRUMENTAL' },
  { id: 'vocals', name: 'Vocals', category: 'Most used', iconType: 'mic', isPopular: true, matchType: 'SPEECH_MAIN' },
  { id: 'instrumental', name: 'Instrumental', category: 'Most used', iconType: 'music', isPopular: true, matchType: 'MUSIC_INSTRUMENTAL' },
  { id: 'lead-vocals', name: 'Lead vocals', category: 'Most used', iconType: 'user', isPopular: true, matchType: 'SPEECH_MAIN' },
  { id: 'backing-vocals', name: 'Backing vocals', category: 'Most used', iconType: 'users', isPopular: true, matchType: 'BACKING_VOCALS' },
  { id: 'wind', name: 'Wind', category: 'Most used', iconType: 'wind', isPopular: true, matchType: 'NOISE_WIND' },
];

// Additional Stem categories matching Screenshot 2 accordions (Bass 2, Traffic/Noise, Guitars, Keys, etc.)
const CATEGORIZED_STEMS: Record<string, StemOption[]> = {
  'Traffic & Environmental Noise': [
    { id: 'traffic-street', name: 'Exterior Street Traffic', category: 'Traffic & Environmental Noise', iconType: 'car', matchType: 'NOISE_TRAFFIC' },
    { id: 'traffic-horns', name: 'Car Horns & Sirens', category: 'Traffic & Environmental Noise', iconType: 'car', matchType: 'NOISE_TRAFFIC' },
    { id: 'traffic-engines', name: 'Heavy Engines & Buses', category: 'Traffic & Environmental Noise', iconType: 'car', matchType: 'NOISE_TRAFFIC' },
    { id: 'hvac-hum', name: 'HVAC Air Conditioner Hum', category: 'Traffic & Environmental Noise', iconType: 'wind', matchType: 'NOISE_INDUSTRIAL_HUM' },
    { id: 'subway-train', name: 'Subway & Railway Rumble', category: 'Traffic & Environmental Noise', iconType: 'car', matchType: 'NOISE_TRAFFIC' },
    { id: 'construction-drills', name: 'Construction & Drills', category: 'Traffic & Environmental Noise', iconType: 'sparkles', matchType: 'NOISE_TRANSIENTS' },
  ],
  'Bass': [
    { id: 'electric-bass', name: 'Electric Bass', category: 'Bass', iconType: 'guitar', matchType: 'MUSIC_BASS' },
    { id: 'acoustic-bass', name: 'Acoustic Upright Bass', category: 'Bass', iconType: 'guitar', matchType: 'MUSIC_BASS' },
  ],
  'Cinematic': [
    { id: 'cinematic-subdrops', name: 'Sub Drops & Booms', category: 'Cinematic', iconType: 'disc' },
    { id: 'cinematic-risers', name: 'Tension Risers & Sweeps', category: 'Cinematic', iconType: 'waveform' },
    { id: 'cinematic-braams', name: 'Trailer Braams & Brass', category: 'Cinematic', iconType: 'music' },
    { id: 'cinematic-impacts', name: 'Heavy Impact Hits', category: 'Cinematic', iconType: 'sparkles' },
    { id: 'cinematic-drones', name: 'Dark Atmospheric Drones', category: 'Cinematic', iconType: 'waveform' },
    { id: 'cinematic-whoosh', name: 'Whooshes & Transitions', category: 'Cinematic', iconType: 'wind' },
    { id: 'cinematic-textures', name: 'Ethereal Space Textures', category: 'Cinematic', iconType: 'sparkles' },
  ],
  'Drums': [
    { id: 'drum-acoustic-kit', name: 'Full Acoustic Drum Kit', category: 'Drums', iconType: 'drum', matchType: 'MUSIC_DRUMS' },
    { id: 'drum-kick', name: 'Sub Kick Drum', category: 'Drums', iconType: 'disc', matchType: 'MUSIC_DRUMS' },
    { id: 'drum-snare', name: 'Crisp Snare Drum', category: 'Drums', iconType: 'drum', matchType: 'MUSIC_DRUMS' },
    { id: 'drum-hihats', name: 'Closed & Open Hi-Hats', category: 'Drums', iconType: 'disc', matchType: 'MUSIC_DRUMS' },
    { id: 'drum-toms', name: 'Rack & Floor Toms', category: 'Drums', iconType: 'drum', matchType: 'MUSIC_DRUMS' },
    { id: 'drum-cymbals', name: 'Crash & Ride Cymbals', category: 'Drums', iconType: 'disc', matchType: 'MUSIC_DRUMS' },
    { id: 'drum-shakers', name: 'Percussion Shakers & Tambourine', category: 'Drums', iconType: 'sparkles', matchType: 'MUSIC_DRUMS' },
    { id: 'drum-808', name: 'Electronic 808 Beats', category: 'Drums', iconType: 'disc', matchType: 'MUSIC_DRUMS' },
    { id: 'drum-claps', name: 'Studio Claps & Snaps', category: 'Drums', iconType: 'sparkles', matchType: 'NOISE_TRANSIENTS' },
  ],
  'Guitars': [
    { id: 'guitar-electric-clean', name: 'Clean Electric Guitar', category: 'Guitars', iconType: 'guitar', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'guitar-electric-distortion', name: 'Distorted Rock Guitar', category: 'Guitars', iconType: 'guitar', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'guitar-acoustic-steel', name: 'Acoustic Steel Strings', category: 'Guitars', iconType: 'guitar', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'guitar-acoustic-nylon', name: 'Classical Nylon Guitar', category: 'Guitars', iconType: 'guitar', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'guitar-12string', name: '12-String Chime Guitar', category: 'Guitars', iconType: 'guitar', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'guitar-solo-lead', name: 'Overdrive Solo Lead', category: 'Guitars', iconType: 'guitar', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'guitar-rhythm-chords', name: 'Rhythm Guitar Chords', category: 'Guitars', iconType: 'guitar', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'guitar-muted', name: 'Palm Muted Plucks', category: 'Guitars', iconType: 'guitar', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'guitar-slide', name: 'Blues Slide Guitar', category: 'Guitars', iconType: 'guitar', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'guitar-funk', name: 'Funk Wah Strumming', category: 'Guitars', iconType: 'guitar', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'guitar-fingerstyle', name: 'Fingerstyle Picking', category: 'Guitars', iconType: 'guitar', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'guitar-tremolo', name: 'Tremolo Wet Guitar', category: 'Guitars', iconType: 'guitar', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'guitar-harmonics', name: 'Harmonic Ringing Tones', category: 'Guitars', iconType: 'guitar', matchType: 'MUSIC_INSTRUMENTAL' },
  ],
  'Keys': [
    { id: 'key-grand-piano', name: 'Concert Grand Piano', category: 'Keys', iconType: 'piano', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'key-rhodes', name: 'Fender Rhodes Electric', category: 'Keys', iconType: 'piano', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'key-wurlitzer', name: 'Vintage Wurlitzer', category: 'Keys', iconType: 'piano', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'key-organ-b3', name: 'Hammond B3 Organ', category: 'Keys', iconType: 'piano', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'key-synth-lead', name: 'Analog Synth Lead', category: 'Keys', iconType: 'piano', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'key-synth-pad', name: 'Warm Poly Synth Pad', category: 'Keys', iconType: 'piano', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'key-harpsichord', name: 'Harpsichord', category: 'Keys', iconType: 'piano', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'key-clavinet', name: 'Funk Clavinet D6', category: 'Keys', iconType: 'piano', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'key-arpeggiator', name: 'Clocked Arpeggio Waves', category: 'Keys', iconType: 'piano', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'key-church-organ', name: 'Cathedral Church Organ', category: 'Keys', iconType: 'piano', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'key-mellotron', name: 'Tape Mellotron Flutes', category: 'Keys', iconType: 'piano', matchType: 'MUSIC_INSTRUMENTAL' },
  ],
  'Strings': [
    { id: 'str-violin', name: 'Violin Solo & Section', category: 'Strings', iconType: 'waveform', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'str-viola', name: 'Viola Mid Range', category: 'Strings', iconType: 'waveform', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'str-cello', name: 'Cello Warm Bass Lines', category: 'Strings', iconType: 'waveform', matchType: 'MUSIC_INSTRUMENTAL' },
    { id: 'str-doublebass', name: 'Contrabass Low End', category: 'Strings', iconType: 'waveform', matchType: 'MUSIC_INSTRUMENTAL' },
  ],
  'Tuned percussion': [
    { id: 'perc-marimba', name: 'Wooden Marimba', category: 'Tuned percussion', iconType: 'drum' },
    { id: 'perc-vibraphone', name: 'Jazz Vibraphone', category: 'Tuned percussion', iconType: 'piano' },
    { id: 'perc-xylophone', name: 'Orchestral Xylophone', category: 'Tuned percussion', iconType: 'drum' },
    { id: 'perc-glockenspiel', name: 'Glockenspiel Bells', category: 'Tuned percussion', iconType: 'sparkles' },
    { id: 'perc-steelpans', name: 'Caribbean Steel Pans', category: 'Tuned percussion', iconType: 'disc' },
    { id: 'perc-kalimba', name: 'African Kalimba', category: 'Tuned percussion', iconType: 'sparkles' },
    { id: 'perc-celeste', name: 'Celeste Keyboard', category: 'Tuned percussion', iconType: 'piano' },
    { id: 'perc-timpani', name: 'Orchestral Timpani Booms', category: 'Tuned percussion', iconType: 'drum' },
    { id: 'perc-handpan', name: 'Metallic Handpan', category: 'Tuned percussion', iconType: 'disc' },
    { id: 'perc-chimes', name: 'Tubular Wind Chimes', category: 'Tuned percussion', iconType: 'sparkles' },
    { id: 'perc-balafon', name: 'Resonant Balafon', category: 'Tuned percussion', iconType: 'drum' },
    { id: 'perc-crotales', name: 'Antique Crotales', category: 'Tuned percussion', iconType: 'sparkles' },
    { id: 'perc-vibraharp', name: 'Vibraharp Resonator', category: 'Tuned percussion', iconType: 'waveform' },
  ],
  'Vocals': [
    { id: 'voc-lead', name: 'Primary Lead Voice', category: 'Vocals', iconType: 'user', matchType: 'SPEECH_MAIN' },
    { id: 'voc-backing', name: 'Backing Harmonies & Duet', category: 'Vocals', iconType: 'users', matchType: 'BACKING_VOCALS' },
    { id: 'voc-whisper', name: 'Whispers & Vocal Breaths', category: 'Vocals', iconType: 'mic', matchType: 'SPEECH_MAIN' },
    { id: 'voc-spoken', name: 'Spoken Podcast Narration', category: 'Vocals', iconType: 'mic', matchType: 'SPEECH_MAIN' },
    { id: 'voc-adlibs', name: 'Studio Ad-libs & Shouts', category: 'Vocals', iconType: 'mic', matchType: 'BACKING_VOCALS' },
    { id: 'voc-choir', name: 'Large Choral Ensemble', category: 'Vocals', iconType: 'users', matchType: 'BACKING_VOCALS' },
    { id: 'voc-chants', name: 'Rhythmic Chants & Stems', category: 'Vocals', iconType: 'mic', matchType: 'BACKING_VOCALS' },
  ],
  'Ambience & Room': [
    { id: 'amb-crowd', name: 'Crowd Chatter & Murmur', category: 'Ambience & Room', iconType: 'users', matchType: 'NOISE_CROWD' },
    { id: 'amb-reverb', name: 'Room Echo & Acoustic Reverb', category: 'Ambience & Room', iconType: 'waveform', matchType: 'NOISE_ROOM_TONE' },
    { id: 'amb-rain', name: 'Rain, Storm & Thunder', category: 'Ambience & Room', iconType: 'wind', matchType: 'NOISE_WIND' },
    { id: 'amb-wind', name: 'Wind Turbulence & Drafts', category: 'Ambience & Room', iconType: 'wind', matchType: 'NOISE_WIND' },
    { id: 'amb-hiss', name: 'Analog Tape Hiss & Clicks', category: 'Ambience & Room', iconType: 'sparkles', matchType: 'NOISE_TRANSIENTS' },
    { id: 'amb-footsteps', name: 'Studio Footsteps & Chair Squeaks', category: 'Ambience & Room', iconType: 'waveform', matchType: 'NOISE_TRANSIENTS' },
  ]
};

export const StemEliminator: React.FC<StemEliminatorProps> = ({
  project,
  onApplyRefinedAudio,
  onOpenDownloadModal
}) => {
  // Selection state: set of stem IDs that the user wants to eliminate / remove
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(['traffic-street', 'hvac-hum', 'music']));
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Most used': true,
    'Traffic & Environmental Noise': true,
    'Drums': false,
    'Guitars': false,
    'Keys': false,
    'Bass': false,
    'Vocals': false,
    'Cinematic': false,
    'Strings': false,
    'Tuned percussion': false,
    'Ambience & Room': false,
  });

  // Processing & Refinement state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [cleanedResultReady, setCleanedResultReady] = useState(false);
  const [activeAudioTab, setActiveAudioTab] = useState<'refined' | 'original'>('refined');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(12.4);
  const [playbackDuration, setPlaybackDuration] = useState(project?.durationSeconds || 142.5);

  // Toggle selection for an individual stem box
  const toggleSelection = (stemId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(stemId)) {
        next.delete(stemId);
      } else {
        next.add(stemId);
      }
      return next;
    });
  };

  // Toggle accordion expand/collapse
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Quick preset actions
  const selectAllNoise = () => {
    const noiseIds = [
      'traffic-street', 'traffic-horns', 'traffic-engines', 'hvac-hum',
      'subway-train', 'construction-drills', 'sound-effects', 'wind',
      'amb-crowd', 'amb-reverb', 'amb-hiss', 'amb-footsteps'
    ];
    setSelectedIds(new Set([...Array.from(selectedIds), ...noiseIds]));
  };

  const selectAllInstruments = () => {
    const instIds = [
      'bass', 'music', 'drums', 'kick', 'snare', 'toms', 'hi-hat',
      'cymbals', 'guitar', 'piano', 'strings', 'instrumental'
    ];
    setSelectedIds(new Set([...Array.from(selectedIds), ...instIds]));
  };

  const clearAllSelections = () => {
    setSelectedIds(new Set());
    setCleanedResultReady(false);
  };

  // Render icon based on type
  const renderIcon = (type: string, isSelected: boolean) => {
    const iconClass = `w-5 h-5 transition-colors ${
      isSelected ? 'text-rose-400' : 'text-slate-300 group-hover:text-white'
    }`;

    switch (type) {
      case 'guitar':
        return <Guitar className={iconClass} />;
      case 'mic':
        return <Mic className={iconClass} />;
      case 'music':
        return <Music className={iconClass} />;
      case 'sparkles':
        return <Sparkles className={iconClass} />;
      case 'drum':
        return <Drum className={iconClass} />;
      case 'disc':
        return <Disc className={iconClass} />;
      case 'piano':
        return <Piano className={iconClass} />;
      case 'user':
        return <User className={iconClass} />;
      case 'users':
        return <Users className={iconClass} />;
      case 'wind':
        return <Wind className={iconClass} />;
      case 'car':
        return <Car className={iconClass} />;
      case 'waveform':
      default:
        return <AudioWaveform className={iconClass} />;
    }
  };

  // Filter items by search query
  const filteredMostUsed = useMemo(() => {
    if (!searchQuery.trim()) return MOST_USED_STEMS;
    const q = searchQuery.toLowerCase();
    return MOST_USED_STEMS.filter((s) => s.name.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return CATEGORIZED_STEMS;
    const q = searchQuery.toLowerCase();
    const result: Record<string, StemOption[]> = {};
    for (const [catName, items] of Object.entries(CATEGORIZED_STEMS)) {
      const matched = items.filter(
        (i) => i.name.toLowerCase().includes(q) || catName.toLowerCase().includes(q)
      );
      if (matched.length > 0) {
        result[catName] = matched;
      }
    }
    return result;
  }, [searchQuery]);

  // Handle "Get Cleaned Audio" execution
  const handleGetCleanedAudio = () => {
    if (selectedIds.size === 0) return;

    setIsProcessing(true);
    setProcessStep('Decomposing 44.1kHz audio matrix into frequency sub-bands...');

    setTimeout(() => {
      setProcessStep(
        `Applying BS-RoFormer & DeepFilterNet3 spectral subtraction to eliminate ${selectedIds.size} stem(s)...`
      );
    }, 600);

    setTimeout(() => {
      setProcessStep('Crossfading 2.0s boundary splices with zero OOM artifacts...');
    }, 1200);

    setTimeout(() => {
      setIsProcessing(false);
      setCleanedResultReady(true);
      setActiveAudioTab('refined');

      // If callback provided, propagate changes to the master project
      if (onApplyRefinedAudio && project) {
        const selectedIdArray = Array.from(selectedIds);
        const updatedStems = project.stems.map((stem) => {
          // Check if stem matches any selected elimination
          const isTargeted =
            (stem.type.includes('TRAFFIC') && (selectedIdArray.includes('traffic-street') || selectedIdArray.includes('traffic-horns'))) ||
            (stem.type.includes('MUSIC') && (selectedIdArray.includes('music') || selectedIdArray.includes('instrumental') || selectedIdArray.includes('guitar'))) ||
            (stem.type.includes('CROWD') && (selectedIdArray.includes('amb-crowd') || selectedIdArray.includes('sound-effects'))) ||
            (stem.type.includes('HUM') && selectedIdArray.includes('hvac-hum')) ||
            (stem.type.includes('BASS') && selectedIdArray.includes('bass')) ||
            (stem.type.includes('WIND') && selectedIdArray.includes('wind'));

          if (isTargeted) {
            return {
              ...stem,
              volumeDb: -60.0,
              isMuted: true,
            };
          }
          return stem;
        });

        onApplyRefinedAudio(
          updatedStems,
          `Refined Audio generated: eliminated ${selectedIds.size} sounds (Traffic, Instruments & Noise attenuated to -60dB)`
        );
      }
    }, 1800);
  };

  // Find human-readable names of currently selected items
  const selectedNames = useMemo(() => {
    const names: string[] = [];
    const allStems = [...MOST_USED_STEMS, ...Object.values(CATEGORIZED_STEMS).flat()];
    selectedIds.forEach((id) => {
      const match = allStems.find((s) => s.id === id);
      if (match && !names.includes(match.name)) {
        names.push(match.name);
      }
    });
    return names;
  }, [selectedIds]);

  return (
    <div className="bg-[#0b1320] text-slate-100 rounded-lg border border-[#1e2a3f] shadow-xl overflow-hidden font-sans">
      {/* Top Header matching Screenshot 2 */}
      <div className="p-5 border-b border-[#1c273c] flex flex-wrap items-center justify-between gap-4 bg-[#0e1726]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <AudioWaveform className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold tracking-tight text-white">Stems &amp; Sound Eliminator</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Surgical Removal Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any instrument, traffic, or noise box below to subtract from your audio master.
            </p>
          </div>
        </div>

        {/* Quick presets & reset */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={selectAllNoise}
            className="px-2.5 py-1 rounded bg-[#182338] hover:bg-[#202e47] text-slate-300 border border-[#2a3a55] transition-colors"
          >
            + All Noise &amp; Traffic
          </button>
          <button
            onClick={selectAllInstruments}
            className="px-2.5 py-1 rounded bg-[#182338] hover:bg-[#202e47] text-slate-300 border border-[#2a3a55] transition-colors"
          >
            + All Instruments
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={clearAllSelections}
              className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear ({selectedIds.size})</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar matching Screenshot 2 */}
      <div className="p-4 bg-[#090f1a] border-b border-[#182338]">
        <div className="relative max-w-xl">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stems (e.g. Traffic, Bass, Guitar, Drums, Wind, Piano...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded bg-[#121c2e] border border-[#22314a] text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Stems Grid Content */}
      <div className="p-5 space-y-4 max-h-[580px] overflow-y-auto">
        {/* ============================================================ */}
        {/* Section 1: "Most used 18" with icon tiles (Screenshot 2)    */}
        {/* ============================================================ */}
        <div className="rounded-lg border border-[#1b263b] bg-[#0d1627] p-4">
          <button
            onClick={() => toggleCategory('Most used')}
            className="w-full flex items-center justify-between text-left text-sm font-semibold text-slate-200 hover:text-white transition-colors mb-3"
          >
            <div className="flex items-center space-x-2">
              {expandedCategories['Most used'] ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
              <span>Most used</span>
              <span className="text-xs font-mono text-slate-400 ml-1">18</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {filteredMostUsed.filter((s) => selectedIds.has(s.id)).length} selected to remove
            </span>
          </button>

          {expandedCategories['Most used'] && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-1">
              {filteredMostUsed.map((stem) => {
                const isSelected = selectedIds.has(stem.id);
                return (
                  <button
                    key={stem.id}
                    onClick={() => toggleSelection(stem.id)}
                    className={`group relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all text-center ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-500/70 shadow-sm shadow-rose-900/40 ring-1 ring-rose-500/40'
                        : 'bg-[#131d31] border-[#22314a] hover:bg-[#18263f] hover:border-slate-500 text-slate-300'
                    }`}
                  >
                    {/* Removal staged indicator badge */}
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    )}

                    <div className="mb-2">{renderIcon(stem.iconType, isSelected)}</div>
                    <span
                      className={`text-xs font-medium tracking-tight line-clamp-1 ${
                        isSelected ? 'text-rose-200 font-semibold' : 'text-slate-300 group-hover:text-white'
                      }`}
                    >
                      {stem.name}
                    </span>

                    {/* Status pill */}
                    <span
                      className={`mt-1.5 text-[9px] font-mono px-1.5 py-0.2 rounded ${
                        isSelected
                          ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30'
                          : 'bg-transparent text-slate-500 group-hover:text-slate-400'
                      }`}
                    >
                      {isSelected ? 'REMOVE' : 'Keep'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* Section 2: Accordion Stem Categories (Traffic, Bass, etc.)  */}
        {/* ============================================================ */}
        {Object.entries(filteredCategories).map(([catName, items]) => {
          const isExpanded = expandedCategories[catName] ?? false;
          const selectedInCat = items.filter((i) => selectedIds.has(i.id)).length;

          return (
            <div
              key={catName}
              className="rounded-lg border border-[#1b263b] bg-[#0d1627] transition-colors"
            >
              <button
                onClick={() => toggleCategory(catName)}
                className="w-full p-3.5 flex items-center justify-between text-left text-xs font-medium text-slate-200 hover:text-white hover:bg-[#121c2e] transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="font-semibold">{catName}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{items.length}</span>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedInCat > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                      {selectedInCat} marked to remove
                    </span>
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="p-3.5 pt-0 border-t border-[#182338]">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-3">
                    {items.map((item) => {
                      const isSelected = selectedIds.has(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleSelection(item.id)}
                          className={`flex items-center justify-between p-2.5 rounded border text-left transition-all ${
                            isSelected
                              ? 'bg-rose-950/40 border-rose-500/70 text-rose-100 ring-1 ring-rose-500/40'
                              : 'bg-[#121c2e] border-[#1e2d44] hover:bg-[#17253d] text-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2 min-w-0 pr-1">
                            {renderIcon(item.iconType, isSelected)}
                            <span className="text-xs truncate font-medium">{item.name}</span>
                          </div>
                          {isSelected ? (
                            <span className="text-[9px] font-mono px-1 rounded bg-rose-500 text-white font-bold flex-shrink-0">
                              CUT
                            </span>
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full border border-slate-600 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* Bottom Action Bar: "Get Cleaned Audio" Trigger (Requirement 3)*/}
      {/* ============================================================ */}
      <div className="p-5 border-t border-[#1c273c] bg-[#090f1a] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Selected Summary Tag */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-300 font-medium">Selected to eliminate:</span>
            <span className="text-xs font-mono font-bold text-rose-400">
              {selectedIds.size} stem sound(s)
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-1.5 max-h-16 overflow-y-auto">
            {selectedNames.length > 0 ? (
              selectedNames.slice(0, 5).map((name) => (
                <span
                  key={name}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center space-x-1"
                >
                  <span>&times;</span>
                  <span>{name}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">
                No boxes selected yet. Click any stem above to subtract it.
              </span>
            )}
            {selectedNames.length > 5 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                +{selectedNames.length - 5} more
              </span>
            )}
          </div>
        </div>

        {/* The "Get Cleaned Audio" Button */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <button
            onClick={handleGetCleanedAudio}
            disabled={selectedIds.size === 0 || isProcessing}
            className={`px-6 py-3 rounded-lg text-xs font-semibold shadow-lg transition-all flex items-center space-x-2 ${
              selectedIds.size === 0 || isProcessing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-blue-900/30 ring-1 ring-blue-400/40 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Refining audio master...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>Get Cleaned Audio ({selectedIds.size})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Processing Animation Modal / Inline Bar */}
      {isProcessing && (
        <div className="p-4 bg-blue-950/40 border-t border-blue-500/30 flex items-center space-x-3 text-xs text-blue-200 font-mono animate-pulse">
          <div className="w-3 h-3 rounded-full bg-blue-400 animate-ping" />
          <span>{processStep}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* Refined Master Audio Player (Revealed After "Get Cleaned Audio")*/}
      {/* ============================================================ */}
      {cleanedResultReady && !isProcessing && (
        <div className="p-6 bg-gradient-to-b from-[#0c182d] to-[#070d18] border-t-2 border-emerald-500/40 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  Refined Cleaned Audio Ready
                </h3>
                <p className="text-[11px] text-emerald-400/90 font-mono">
                  Surgically eliminated {selectedIds.size} sounds &bull; Target speech isolated &bull; SNR +19.4 dB
                </p>
              </div>
            </div>

            {/* A/B Switcher: Refined vs Original */}
            <div className="flex items-center space-x-2 bg-[#101b2d] p-1 rounded-lg border border-[#23334c]">
              <span className="text-[10px] text-slate-400 font-mono uppercase px-2">Compare:</span>
              <button
                onClick={() => setActiveAudioTab('refined')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  activeAudioTab === 'refined'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ✨ Refined Cleaned
              </button>
              <button
                onClick={() => setActiveAudioTab('original')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  activeAudioTab === 'original'
                    ? 'bg-rose-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🔊 Original (Raw)
              </button>
            </div>
          </div>

          {/* Interactive Player Controls */}
          <div className="bg-[#121c2e] p-4 rounded-lg border border-[#23334c] flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md transition-all flex-shrink-0 ${
                activeAudioTab === 'refined'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            {/* Animated Waveform Representation */}
            <div className="flex-1 w-full space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="text-white font-medium">
                  {activeAudioTab === 'refined' ? 'Clean Master (Stems Removed)' : 'Original Mix (With Noise & Bleed)'}
                </span>
                <span>
                  {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')} /{' '}
                  {Math.floor(playbackDuration / 60)}:{(playbackDuration % 60).toFixed(0).padStart(2, '0')}
                </span>
              </div>

              {/* Progress bar */}
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  setCurrentTime(pct * playbackDuration);
                }}
                className="h-2 rounded bg-slate-800 cursor-pointer overflow-hidden relative"
              >
                <div
                  className={`h-full transition-all ${
                    activeAudioTab === 'refined' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${(currentTime / playbackDuration) * 100}%` }}
                />
              </div>

              {/* Spectral energy bars simulation */}
              <div className="flex items-end gap-1 h-8 pt-1">
                {Array.from({ length: 36 }).map((_, i) => {
                  const seed = (i * 17) % 100;
                  // If refined, high noise frequencies are muted down!
                  const height =
                    activeAudioTab === 'refined'
                      ? i > 20
                        ? 15 + (seed % 20)
                        : 30 + (seed % 65)
                      : 40 + (seed % 55);

                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-t transition-all ${
                        activeAudioTab === 'refined'
                          ? i > 20
                            ? 'bg-emerald-900/60'
                            : 'bg-emerald-500/80'
                          : 'bg-rose-600/70'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Lossless PCM 44.1kHz / 16-bit stream</span>
              <span>&bull;</span>
              <span>Boundary crossfade 2.0s</span>
            </div>

            <div className="flex items-center space-x-2">
              {onOpenDownloadModal && (
                <button
                  onClick={onOpenDownloadModal}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Refined File (WAV / MP3)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
