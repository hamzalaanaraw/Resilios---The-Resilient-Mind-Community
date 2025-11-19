import React, { useState } from 'react';
import { SavedMeditation } from '../types';
import { BookmarkIcon, PlayerPlayIcon, TrashIcon, WandSparklesIcon } from './Icons';

interface AIGuidedMeditationProps {
    isGeneratingMeditation: boolean;
    generatedMeditationScript: string;
    savedMeditations: SavedMeditation[];
    onGenerateMeditation: () => void;
    onPlayMeditation: (script: string) => void;
    onSaveMeditation: (script: string) => void;
    onDeleteMeditation: (id: string) => void;
    initError: string | null;
}

export const AIGuidedMeditation: React.FC<AIGuidedMeditationProps> = ({
    isGeneratingMeditation,
    generatedMeditationScript,
    savedMeditations,
    onGenerateMeditation,
    onPlayMeditation,
    onSaveMeditation,
    onDeleteMeditation,
    initError
}) => {
    const [isPlayingId, setIsPlayingId] = useState<string | null>(null);

    const handlePlay = async (id: string, script: string) => {
        setIsPlayingId(id);
        await onPlayMeditation(script);
        // Note: We don't have a callback for when TTS finishes, so the playing state is optimistic.
        // For a more robust solution, a more advanced TTS service/library would be needed.
        setIsPlayingId(null);
    };

    return (
        <div className="mt-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
            <h4 className="text-md font-semibold text-slate-700 mb-4">AI Guided Meditation</h4>
            <button
                onClick={onGenerateMeditation}
                disabled={isGeneratingMeditation || !!initError}
                className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors duration-150 bg-sky-500 text-white rounded-lg hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400"
            >
                {isGeneratingMeditation ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Generating...
                    </>
                ) : (
                    <>
                        <span className="mr-2"><WandSparklesIcon /></span>
                        Generate a New Guided Meditation
                    </>
                )}
            </button>
            
            {generatedMeditationScript && (
                <div className="mt-4 p-4 bg-white border border-sky-200 rounded-lg">
                    <h5 className="font-semibold text-slate-700 mb-2">New Meditation</h5>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap mb-4">{generatedMeditationScript}</p>
                    <div className="flex items-center space-x-2">
                         <button
                            onClick={() => handlePlay('new', generatedMeditationScript)}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors duration-150 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200"
                        >
                            <PlayerPlayIcon />
                        </button>
                         <button
                            onClick={() => onSaveMeditation(generatedMeditationScript)}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors duration-150 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        >
                            <BookmarkIcon />
                            <span className="ml-2">Save as Favorite</span>
                        </button>
                    </div>
                </div>
            )}
            
            {savedMeditations.length > 0 && (
                <div className="mt-6">
                    <h5 className="font-semibold text-slate-700 mb-2">Your Favorite Meditations</h5>
                    <div className="space-y-2">
                        {savedMeditations.map(meditation => (
                            <div key={meditation.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                                <p className="text-sm font-medium text-slate-800">{meditation.name}</p>
                                <div className="flex items-center space-x-2">
                                    <button 
                                        onClick={() => handlePlay(meditation.id, meditation.script)}
                                        className="p-2 text-sky-600 hover:bg-sky-100 rounded-full"
                                        title="Play"
                                    >
                                        <PlayerPlayIcon />
                                    </button>
                                     <button 
                                        onClick={() => onDeleteMeditation(meditation.id)}
                                        className="p-2 text-red-500 hover:bg-red-100 rounded-full"
                                        title="Delete"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
