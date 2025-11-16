

import React, { useState, useRef, useEffect } from 'react';
import { WellnessPlanData, WellnessPlanSection } from '../types';
import { PlayerPauseIcon, PlayerPlayIcon, PlayerStopIcon } from './Icons';

type PlanKey = keyof WellnessPlanData;

interface WellnessPlanProps {
  plan: WellnessPlanData;
  onPlanChange: (newPlan: WellnessPlanData) => void;
  onGeneratePrompts: () => Promise<void>;
  isGeneratingPrompts: boolean;
}

const MEDITATION_TRACKS = [
  { title: 'Peaceful Music', url: 'https://archive.org/download/PeacefulMeditationMusic/Peaceful%20Meditation%20Music.mp3' },
  { title: 'Relaxing River', url: 'https://archive.org/download/river-meditation/River%20Meditation.mp3' },
  { title: 'Forest Ambience', url: 'https://archive.org/download/ForestAmbience/Forest%20Ambience.mp3' },
];


const MeditationPlayer: React.FC = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            setIsPlaying(false);
            audio.currentTime = 0;
            audio.load(); 
        }
    }, [selectedTrackIndex]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const setAudioData = () => {
            setDuration(audio.duration);
            setCurrentTime(audio.currentTime);
        }
        const setAudioTime = () => setCurrentTime(audio.currentTime);
        const handleEnded = () => setIsPlaying(false);
        const handleError = (e: Event) => {
            const audioEl = e.target as HTMLAudioElement;
            const error = audioEl.error;
            console.error("Audio player error:", error ? `${error.message} (Code: ${error.code})` : 'Unknown error');
            setIsPlaying(false);
        };

        audio.addEventListener('loadeddata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        if (audio.readyState > 0) {
            setAudioData();
        }

        return () => {
            if (audio) {
                audio.removeEventListener('loadeddata', setAudioData);
                audio.removeEventListener('timeupdate', setAudioTime);
                audio.removeEventListener('ended', handleEnded);
                audio.removeEventListener('error', handleError);
            }
        };
    }, []);

    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => console.error("Error playing audio:", e ? (e as Error).message : 'Unknown playback error.'));
            }
            setIsPlaying(!isPlaying);
        }
    };

    const stopPlayer = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time) || time === 0) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };
    
    return (
        <div className="mt-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
            <audio ref={audioRef} src={MEDITATION_TRACKS[selectedTrackIndex].url} preload="metadata" />

            <h4 className="text-md font-semibold text-slate-700 mb-4">Quick Guided Meditation</h4>
            
            <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                    {MEDITATION_TRACKS.map((track, index) => (
                        <button 
                            key={index} 
                            onClick={() => setSelectedTrackIndex(index)}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedTrackIndex === index ? 'bg-sky-500 text-white font-medium' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                        >
                            {track.title}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <button
                    onClick={togglePlayPause}
                    className="p-2 rounded-full text-sky-600 hover:bg-sky-100 transition-colors"
                    aria-label={isPlaying ? 'Pause meditation' : 'Play meditation'}
                >
                    {isPlaying ? <PlayerPauseIcon /> : <PlayerPlayIcon />}
                </button>
                <button
                    onClick={stopPlayer}
                    className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
                    aria-label="Stop meditation"
                >
                    <PlayerStopIcon />
                </button>
                <div className="flex-1 flex items-center space-x-2">
                    <span className="text-sm text-slate-600 font-mono w-10 text-center">{formatTime(currentTime)}</span>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div
                            className="bg-sky-500 h-1.5 rounded-full"
                            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                        ></div>
                    </div>
                    <span className="text-sm text-slate-600 font-mono w-10 text-center">{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
};


interface AccordionSectionProps {
  section: WellnessPlanSection;
  isOpen: boolean;
  onToggle: () => void;
  onContentChange: (content: string) => void;
  sectionKey: PlanKey;
  showGenerateButton?: boolean;
  onGenerateClick?: () => void;
  isGenerating?: boolean;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ section, isOpen, onToggle, onContentChange, sectionKey, showGenerateButton, onGenerateClick, isGenerating }) => {
  return (
    <div className="border border-slate-200 rounded-lg mb-4 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100 focus:outline-none"
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-semibold text-sky-800">{section.title}</h3>
        <svg
          className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 bg-white">
          <p className="text-sm text-slate-600 mb-4">{section.prompt}</p>
          
          {showGenerateButton && (
            <div className="mb-4">
              <button
                onClick={onGenerateClick}
                disabled={isGenerating}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors duration-150 bg-sky-500 text-white rounded-lg hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                    </>
                ) : (
                    "✨ Generate New Prompts"
                )}
              </button>
            </div>
          )}

          <textarea
            value={section.content}
            onChange={(e) => onContentChange(e.target.value)}
            rows={8}
            className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
            placeholder={`Your thoughts on ${section.title.toLowerCase()}...`}
          />
          {sectionKey === 'toolbox' && <MeditationPlayer />}
        </div>
      )}
    </div>
  );
};

export const WellnessPlan: React.FC<WellnessPlanProps> = ({ plan, onPlanChange, onGeneratePrompts, isGeneratingPrompts }) => {
  const [openSection, setOpenSection] = useState<PlanKey | null>('toolbox');

  const handleToggle = (key: PlanKey) => {
    setOpenSection(openSection === key ? null : key);
  };

  const handleContentChange = (key: PlanKey, content: string) => {
    const newPlan = {
      ...plan,
      [key]: {
        ...plan[key],
        content,
      },
    };
    onPlanChange(newPlan);
  };

  return (
    <div className="p-4 h-full">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Your Quiet Mind Plan</h2>
        <p className="text-slate-600 mb-8">This is your personal operating manual. Fill it out over time. It's here to support you when you need it most.</p>
        
        {(Object.keys(plan) as PlanKey[]).map((key) => (
          <AccordionSection
            key={key}
            sectionKey={key}
            section={plan[key]}
            isOpen={openSection === key}
            onToggle={() => handleToggle(key)}
            onContentChange={(content) => handleContentChange(key, content)}
            showGenerateButton={key === 'journalPrompts'}
            onGenerateClick={onGeneratePrompts}
            isGenerating={isGeneratingPrompts}
          />
        ))}
      </div>
    </div>
  );
};
