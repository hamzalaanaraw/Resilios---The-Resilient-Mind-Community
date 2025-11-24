

import React, { useState } from 'react';
import { WellnessPlanData, WellnessPlanSection, SavedMeditation, WellnessPlanEntry } from '../types';
import { AIGuidedMeditation } from './AIGuidedMeditation';
import { ClockIcon, RestoreIcon, SaveIcon, WandSparklesIcon } from './Icons';

type PlanKey = keyof WellnessPlanData;

interface WellnessPlanProps {
  plan: WellnessPlanData;
  onPlanChange: (newPlan: WellnessPlanData) => void;
  onGeneratePrompts: () => Promise<void>;
  onSaveEntry: (key: PlanKey) => void;
  isGeneratingPrompts: boolean;
  initError: string | null;
  // AI Meditation Props
  isGeneratingMeditation: boolean;
  generatedMeditationScript: string;
  savedMeditations: SavedMeditation[];
  onGenerateMeditation: () => void;
  onPlayMeditation: (script: string) => void;
  onSaveMeditation: (script: string) => void;
  onDeleteMeditation: (id: string) => void;
}

interface AccordionSectionProps {
  section: WellnessPlanSection;
  isOpen: boolean;
  onToggle: () => void;
  onContentChange: (content: string) => void;
  sectionKey: PlanKey;
  showGenerateButton?: boolean;
  onGenerateClick?: () => void;
  onSaveEntry: () => void;
  isGenerating?: boolean;
  initError: string | null;
  children?: React.ReactNode;
}

const HistoryItem: React.FC<{ entry: WellnessPlanEntry; onRestore: (content: string) => void }> = ({ entry, onRestore }) => (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg hover:border-sky-300 transition-colors mb-3 group">
        <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <ClockIcon />
                {new Date(entry.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
            <button
                onClick={() => onRestore(entry.content)}
                className="text-xs flex items-center px-2 py-1 bg-white border border-slate-200 rounded text-sky-600 hover:bg-sky-50 hover:border-sky-300 font-medium transition-colors shadow-sm"
                title="Restore this version"
            >
                <RestoreIcon />
                <span className="ml-1">Restore</span>
            </button>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-mono text-xs md:text-sm">{entry.content}</p>
    </div>
);

const AccordionSection: React.FC<AccordionSectionProps> = ({ 
    section, 
    isOpen, 
    onToggle, 
    onContentChange, 
    sectionKey, 
    showGenerateButton, 
    onGenerateClick, 
    onSaveEntry,
    isGenerating, 
    initError, 
    children 
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const handleSave = () => {
    onSaveEntry();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const historyCount = section.history?.length || 0;

  return (
    <div className={`border rounded-xl mb-4 overflow-hidden transition-all duration-300 ${isOpen ? 'border-sky-200 shadow-lg ring-1 ring-sky-100 bg-white' : 'border-slate-200 bg-white hover:border-sky-200'}`}>
      <button
        onClick={onToggle}
        className="w-full p-5 flex justify-between items-center bg-white hover:bg-slate-50 focus:outline-none transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
             <div className={`w-2 h-2 rounded-full mr-4 transition-colors ${section.content ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-300'}`}></div>
             <div className="text-left">
                <h3 className="text-lg font-bold text-slate-800">{section.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                    {section.content ? 'Content added' : 'Not started'} • {historyCount} saved version{historyCount !== 1 ? 's' : ''}
                </p>
             </div>
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-sky-100 text-sky-600 rotate-180' : 'bg-slate-100 text-slate-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </button>
      
      {isOpen && (
        <div className="border-t border-slate-100 animate-fadeIn">
          {/* Prompt Banner */}
          <div className="bg-sky-50 px-6 py-4 border-b border-sky-100">
            <div className="flex gap-3">
                <div className="mt-1 text-sky-500 shrink-0"><WandSparklesIcon /></div>
                <div>
                    <p className="text-sm text-sky-900 font-medium leading-relaxed">{section.prompt}</p>
                    {showGenerateButton && (
                        <div className="mt-2">
                             <button
                                onClick={onGenerateClick}
                                disabled={isGenerating || !!initError}
                                className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-sky-500 rounded-lg hover:bg-sky-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                            >
                                {isGenerating ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Generating Ideas...
                                    </>
                                ) : "✨ Generate Personalized Prompts"}
                            </button>
                            <p className="text-xs text-sky-600 mt-2 italic">
                                AI will analyze your plan above to create custom prompts.
                            </p>
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="px-6 py-3 bg-white border-b border-slate-100 flex flex-wrap justify-between items-center gap-3 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Editor</span>
              </div>
              <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${showHistory ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                      <ClockIcon />
                      <span className="ml-1.5">History ({historyCount})</span>
                  </button>
                  
                  <div className="h-4 w-px bg-slate-200 mx-1"></div>

                  <button
                    onClick={handleSave}
                    disabled={!section.content.trim()}
                    className={`flex items-center px-4 py-1.5 text-sm font-bold text-white rounded-md shadow-sm transition-all duration-200 transform active:scale-95 ${justSaved ? 'bg-green-500 ring-2 ring-green-300 ring-offset-1' : 'bg-sky-600 hover:bg-sky-700'} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                     {justSaved ? (
                         <>
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            Saved!
                         </>
                     ) : (
                         <>
                            <SaveIcon />
                            <span className="ml-1.5">Save Version</span>
                         </>
                     )}
                  </button>
              </div>
          </div>

          <div className="p-6">
            <textarea
                value={section.content}
                onChange={(e) => onContentChange(e.target.value)}
                rows={10}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all text-base text-slate-800 leading-relaxed resize-y placeholder-slate-400"
                placeholder={showGenerateButton ? "Your journal prompts will appear here..." : "Start typing your plan here..."}
            />
            
            {/* History Panel */}
            {showHistory && (
                <div className="mt-6 border-t border-slate-200 pt-6 animate-fadeIn">
                    <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center">
                        <ClockIcon /> 
                        <span className="ml-2">Previous Versions</span>
                    </h4>
                    
                    {section.history && section.history.length > 0 ? (
                        <div className="max-h-80 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {section.history.map((entry) => (
                                <HistoryItem 
                                    key={entry.id} 
                                    entry={entry} 
                                    onRestore={(content) => {
                                        if(confirm("Restore this version? This will replace your current text.")) {
                                            onContentChange(content);
                                            // Optional: Scroll to text area
                                        }
                                    }} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                            <p className="text-slate-500 text-sm">No saved versions yet.</p>
                            <p className="text-xs text-slate-400 mt-1">Click the <strong>Save Version</strong> button to create a checkpoint.</p>
                        </div>
                    )}
                </div>
            )}

            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export const WellnessPlan: React.FC<WellnessPlanProps> = (props) => {
  const { plan, onPlanChange, onGeneratePrompts, onSaveEntry, isGeneratingPrompts, initError, ...meditationProps } = props;
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
    <div className="h-full bg-slate-50/50">
      <div className="max-w-4xl mx-auto p-4 md:p-8 pb-20">
        <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-sky-100 text-sky-700 text-xs font-bold rounded-full uppercase tracking-widest mb-3">Operating Manual</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Your Mental Wellness Plan</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                This is your personal guide for navigation. Fill it out when you're feeling steady, so it's ready when you need support.
            </p>
        </div>
        
        <div className="space-y-6">
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
                onSaveEntry={() => onSaveEntry(key)}
                isGenerating={isGeneratingPrompts}
                initError={initError}
            >
                {key === 'toolbox' && <AIGuidedMeditation {...meditationProps} initError={initError} />}
            </AccordionSection>
            ))}
        </div>
      </div>
    </div>
  );
};