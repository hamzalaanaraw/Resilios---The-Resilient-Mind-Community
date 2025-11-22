
import React, { useState } from 'react';
import { WellnessPlanData, WellnessPlanSection, SavedMeditation, WellnessPlanEntry } from '../types';
import { AIGuidedMeditation } from './AIGuidedMeditation';
import { ClockIcon, RestoreIcon, SaveIcon } from './Icons';

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
    <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-3">
        <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {new Date(entry.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
            <button
                onClick={() => onRestore(entry.content)}
                className="text-xs flex items-center text-sky-600 hover:text-sky-700 font-medium transition-colors"
                title="Restore this version"
            >
                <RestoreIcon />
                <span className="ml-1">Restore</span>
            </button>
        </div>
        <p className="text-sm text-slate-700 line-clamp-3 whitespace-pre-wrap">{entry.content}</p>
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

  return (
    <div className="border border-slate-200 rounded-lg mb-4 overflow-hidden bg-white shadow-sm transition-all duration-200">
      <button
        onClick={onToggle}
        className="w-full p-5 flex justify-between items-center bg-white hover:bg-slate-50 focus:outline-none transition-colors border-b border-transparent data-[expanded=true]:border-slate-100"
        aria-expanded={isOpen}
        data-expanded={isOpen}
      >
        <div className="flex items-center">
             <div className={`w-1.5 h-8 rounded-full mr-4 ${section.content ? 'bg-green-400' : 'bg-slate-200'}`}></div>
             <h3 className="text-lg font-bold text-slate-800">{section.title}</h3>
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="p-5 bg-slate-50/50">
          <p className="text-sm text-slate-600 mb-4 italic border-l-2 border-sky-300 pl-3 py-1 bg-sky-50 rounded-r-md">
            {section.prompt}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-3">
              {showGenerateButton && (
                <button
                    onClick={onGenerateClick}
                    disabled={isGenerating || !!initError}
                    className="inline-flex items-center px-3 py-2 text-xs font-semibold text-sky-700 bg-sky-100 rounded-md hover:bg-sky-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 transition-colors disabled:opacity-50"
                >
                    {isGenerating ? "Generating..." : "✨ AI Suggestion"}
                </button>
              )}
          </div>

          <textarea
            value={section.content}
            onChange={(e) => onContentChange(e.target.value)}
            rows={8}
            className="w-full p-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent shadow-sm text-slate-700 transition-all text-sm leading-relaxed"
            placeholder={`Type your thoughts here...`}
          />

          <div className="flex items-center justify-between mt-3 mb-6">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center text-xs font-medium text-slate-500 hover:text-sky-600 transition-colors"
              >
                  <ClockIcon />
                  <span className="ml-1.5">{showHistory ? "Hide History" : "View Save History"}</span>
              </button>

              <button
                onClick={handleSave}
                disabled={!section.content.trim()}
                className={`flex items-center px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-md transition-all duration-300 transform active:scale-95 ${justSaved ? 'bg-green-500 hover:bg-green-600' : 'bg-slate-800 hover:bg-slate-900'} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                 {justSaved ? (
                     <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Saved!
                     </>
                 ) : (
                     <>
                        <SaveIcon />
                        <span className="ml-2">Save Entry</span>
                     </>
                 )}
              </button>
          </div>
            
          {/* History Panel */}
          {showHistory && (
              <div className="mt-4 animate-fadeIn">
                  <div className="flex items-center mb-3">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <span className="px-3 text-xs font-semibold text-slate-400 uppercase">Previous Versions</span>
                    <div className="h-px bg-slate-200 flex-1"></div>
                  </div>
                  
                  {section.history && section.history.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto pr-1 space-y-2">
                          {section.history.map((entry) => (
                              <HistoryItem 
                                key={entry.id} 
                                entry={entry} 
                                onRestore={(content) => {
                                    if(confirm("Restore this version? This will overwrite your current text.")) {
                                        onContentChange(content);
                                        window.scrollTo({top: 0, behavior: 'smooth'}); // Scroll to top to see change? or just focus textarea
                                    }
                                }} 
                            />
                          ))}
                      </div>
                  ) : (
                      <p className="text-center text-sm text-slate-400 py-4 italic">No saved history yet. Click "Save Entry" to create a backup.</p>
                  )}
              </div>
          )}

          {children}
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
    <div className="p-4 h-full">
      <div className="max-w-3xl mx-auto pb-10">
        <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-800 mb-3 tracking-tight">Your Operating Manual</h2>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
                A personalized guide for your mental wellness. Fill this out at your own pace.
                It's here to catch you when you fall and help you stand taller when you rise.
            </p>
        </div>
        
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
  );
};
