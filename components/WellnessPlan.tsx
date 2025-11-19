import React, { useState } from 'react';
import { WellnessPlanData, WellnessPlanSection, SavedMeditation } from '../types';
import { AIGuidedMeditation } from './AIGuidedMeditation';

type PlanKey = keyof WellnessPlanData;

interface WellnessPlanProps {
  plan: WellnessPlanData;
  onPlanChange: (newPlan: WellnessPlanData) => void;
  onGeneratePrompts: () => Promise<void>;
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
  isGenerating?: boolean;
  initError: string | null;
  children?: React.ReactNode;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ section, isOpen, onToggle, onContentChange, sectionKey, showGenerateButton, onGenerateClick, isGenerating, initError, children }) => {
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
                disabled={isGenerating || !!initError}
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
          {children}
        </div>
      )}
    </div>
  );
};

export const WellnessPlan: React.FC<WellnessPlanProps> = (props) => {
  const { plan, onPlanChange, onGeneratePrompts, isGeneratingPrompts, initError, ...meditationProps } = props;
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
            initError={initError}
          >
            {key === 'toolbox' && <AIGuidedMeditation {...meditationProps} initError={initError} />}
          </AccordionSection>
        ))}
      </div>
    </div>
  );
};