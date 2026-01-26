
import React, { useState } from 'react';
import { WellnessPlanData, WellnessPlanSection, SavedMeditation, WellnessPlanEntry } from '../types';
import { AIGuidedMeditation } from './AIGuidedMeditation';
import { ClockIcon, RestoreIcon, SaveIcon, WandSparklesIcon, DocumentTextIcon, SparklesIcon } from './Icons';

type PlanKey = keyof WellnessPlanData;

interface WellnessPlanProps {
  plan: WellnessPlanData;
  synthesis?: string;
  isSynthesizing?: boolean;
  onSynthesize?: () => void;
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
                <span className="ml-1">Bring Back</span>
            </button>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">{entry.content}</p>
    </div>
);

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const renderLine = (line: string, index: number) => {
        const bolded = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        if (line.startsWith('### ')) {
            return <h3 key={index} className="text-lg font-bold text-slate-800 mt-4 mb-2" dangerouslySetInnerHTML={{ __html: bolded.substring(4) }} />;
        }
        if (line.startsWith('# ') || line.startsWith('## ')) {
            return <h2 key={index} className="text-xl font-black text-slate-900 mt-6 mb-3 tracking-tight border-b border-slate-100 pb-2" dangerouslySetInnerHTML={{ __html: bolded.replace(/^#+ /, '') }} />;
        }
        if (line.startsWith('* ') || line.startsWith('- ')) {
            return <li key={index} className="ml-4 list-disc text-slate-700 mb-1" dangerouslySetInnerHTML={{ __html: bolded.substring(2) }} />;
        }
        return <p key={index} className="text-slate-700 mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: bolded }} />;
    };

    const lines = content.split('\n');
    return <div className="prose prose-sm max-w-none">{lines.map((line, idx) => line.trim() ? renderLine(line, idx) : <br key={idx} />)}</div>;
};

const WellnessManualView: React.FC<{ plan: WellnessPlanData; synthesis: string; isSynthesizing: boolean; onSynthesize: () => void }> = ({ plan, synthesis, isSynthesizing, onSynthesize }) => {
    const sections = Object.keys(plan) as PlanKey[];
    const hasAnyContent = sections.some(key => plan[key].content.trim().length > 0);

    return (
        <div className="animate-view space-y-8 pb-12">
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-8 md:p-12 text-white relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/20 blur-[80px]"></div>
                    <div className="relative z-10">
                        <span className="inline-block px-3 py-1 bg-sky-500/20 text-sky-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4">Your Private Guide</span>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">My Stability Guide</h2>
                        <p className="text-sky-100/60 max-w-xl font-medium leading-relaxed">
                            This is your personal operating manual. A place to store your strengths and reminders for when things feel difficult.
                        </p>
                    </div>
                </div>

                <div className="p-8 md:p-12">
                    {/* Synthesis Card */}
                    <div className="bg-sky-50 rounded-3xl p-6 md:p-10 border border-sky-100 shadow-sm mb-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <SparklesIcon className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-sky-900 tracking-tight flex items-center gap-3">
                                        <SparklesIcon /> Deep Insight
                                    </h3>
                                    <p className="text-sky-700/60 text-sm font-medium">I can weave your personal thoughts into a single, cohesive story.</p>
                                </div>
                                <button 
                                    onClick={onSynthesize}
                                    disabled={isSynthesizing || !hasAnyContent}
                                    className="px-6 py-3 bg-sky-500 text-white font-black rounded-2xl shadow-lg shadow-sky-200 hover:bg-sky-600 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                                >
                                    {isSynthesizing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Listening...
                                        </>
                                    ) : (
                                        <>
                                            <WandSparklesIcon /> {synthesis ? 'Refresh My Story' : 'Weave My Guide'}
                                        </>
                                    )}
                                </button>
                            </div>

                            {synthesis ? (
                                <div className="bg-white rounded-2xl p-6 md:p-10 border border-sky-100 shadow-inner">
                                    <MarkdownRenderer content={synthesis} />
                                </div>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed border-sky-200 rounded-2xl bg-white/50">
                                    <p className="text-sky-600 font-bold mb-1">Your guide is waiting to be written.</p>
                                    <p className="text-sky-400 text-xs text-center px-4">Tap the button above to let me analyze your notes and create a supportive path forward.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-100"></div>
                        YOUR PERSONAL NOTES
                        <div className="h-px flex-1 bg-slate-100"></div>
                    </h4>

                    <div className="space-y-12">
                        {!hasAnyContent ? (
                            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                                    <DocumentTextIcon />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 mb-2">It's a blank canvas for now.</h3>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed font-medium">Head back to "Writing Mode" to start capturing your anchors and reflections.</p>
                            </div>
                        ) : (
                            sections.filter(key => plan[key].content.trim().length > 0).map((key) => (
                                <div key={key} className="relative pl-10 border-l-2 border-slate-100 pb-2 last:pb-0">
                                    <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-white border-4 border-sky-500 shadow-sm"></div>
                                    <h3 className="text-xs font-black text-sky-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        {plan[key].title}
                                    </h3>
                                    <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 shadow-sm">
                                        <MarkdownRenderer content={plan[key].content} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                
                <div className="bg-slate-50 p-8 text-center border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Created with empathy by Resilios</p>
                    <p className="text-[10px] text-slate-400">This guide is a reminder that you are the expert of your own experience.</p>
                </div>
            </div>
        </div>
    );
};

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
                    {section.content ? 'In progress' : 'Ready for your thoughts'} • {historyCount} saved version{historyCount !== 1 ? 's' : ''}
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
                                        Deep Thinking...
                                    </>
                                ) : "✨ Create New Prompts"}
                            </button>
                            <p className="text-xs text-sky-600 mt-2 italic">
                                I'll look at your plan above to find specific topics for you to explore.
                            </p>
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="px-6 py-3 bg-white border-b border-slate-100 flex flex-wrap justify-between items-center gap-3 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Note Editor</span>
              </div>
              <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${showHistory ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                      <ClockIcon />
                      <span className="ml-1.5">View History</span>
                  </button>
                  
                  <div className="h-4 w-px bg-slate-200 mx-1"></div>

                  <button
                    onClick={handleSave}
                    disabled={!section.content.trim()}
                    className={`flex items-center px-4 py-1.5 text-sm font-bold text-white rounded-md shadow-sm transition-all duration-200 transform active:scale-95 ${justSaved ? 'bg-green-500 ring-2 ring-green-300 ring-offset-1' : 'bg-sky-600 hover:bg-sky-700'} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                     {justSaved ? (
                         <>
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path></svg>
                            Note Kept
                         </>
                     ) : (
                         <>
                            <SaveIcon />
                            <span className="ml-1.5">Keep this Version</span>
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
                placeholder={showGenerateButton ? "Your journal prompts will appear here..." : "What's on your mind?..."}
            />
            
            {/* History Panel */}
            {showHistory && (
                <div className="mt-6 border-t border-slate-200 pt-6 animate-fadeIn">
                    <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center">
                        <ClockIcon /> 
                        <span className="ml-2">Previous Reflections</span>
                    </h4>
                    
                    {section.history && section.history.length > 0 ? (
                        <div className="max-h-80 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {section.history.map((entry) => (
                                <HistoryItem 
                                    key={entry.id} 
                                    entry={entry} 
                                    onRestore={(content) => {
                                        if(confirm("Replace your current text with this previous version?")) {
                                            onContentChange(content);
                                        }
                                    }} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                            <p className="text-slate-500 text-sm">No previous versions yet.</p>
                            <p className="text-xs text-slate-400 mt-1">Click <strong>Keep this Version</strong> to save your current work.</p>
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
  const { plan, synthesis = "", isSynthesizing = false, onSynthesize = () => {}, onPlanChange, onGeneratePrompts, onSaveEntry, isGeneratingPrompts, initError, ...meditationProps } = props;
  const [openSection, setOpenSection] = useState<PlanKey | null>('toolbox');
  const [viewMode, setViewMode] = useState<'build' | 'manual'>('build');

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
    <div className="h-full w-full bg-slate-50/50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24">
        <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 bg-sky-100 text-sky-700 text-xs font-bold rounded-full uppercase tracking-widest mb-3">Your Foundation</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Your Mental Wellness Journey</h2>
            
            <div className="flex justify-center mt-8">
                <div className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm flex items-center">
                    <button 
                        onClick={() => setViewMode('build')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${viewMode === 'build' ? 'bg-sky-500 text-white shadow-lg shadow-sky-100' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <WandSparklesIcon /> Writing Mode
                    </button>
                    <button 
                        onClick={() => setViewMode('manual')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${viewMode === 'manual' ? 'bg-sky-500 text-white shadow-lg shadow-sky-100' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <DocumentTextIcon /> My Story
                    </button>
                </div>
            </div>
        </div>
        
        {viewMode === 'build' ? (
            <div className="space-y-6 animate-view">
                <div className="bg-sky-50 border border-sky-100 p-6 rounded-3xl mb-8 text-center">
                    <p className="text-sm text-sky-800 font-medium leading-relaxed">
                        These notes are for you. Use them to map out what keeps you steady. Everything is private and kept securely.
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
        ) : (
            <WellnessManualView plan={plan} synthesis={synthesis} isSynthesizing={isSynthesizing} onSynthesize={onSynthesize} />
        )}
      </div>
    </div>
  );
};
