
import React from 'react';
import { SparklesIcon } from './Icons';

interface DailyFocusProps {
  challenge: string;
  isCompleted: boolean;
  onToggle: () => void;
}

export const DailyFocus: React.FC<DailyFocusProps> = ({ challenge, isCompleted, onToggle }) => {
  if (!challenge) return null;

  return (
    <div className="mx-4 mt-4 animate-fadeIn">
      <div className={`p-4 rounded-2xl border transition-all duration-300 ${isCompleted ? 'bg-emerald-50 border-emerald-100 opacity-75' : 'bg-white border-sky-100 shadow-sm shadow-sky-100/50'}`}>
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-sky-100 text-sky-600'}`}>
            <SparklesIcon />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-0.5">Today's Micro-Step</p>
                <p className={`text-sm font-bold leading-tight ${isCompleted ? 'text-emerald-800 line-through' : 'text-slate-800'}`}>
                  {challenge}
                </p>
              </div>
              <button 
                onClick={onToggle}
                className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center shrink-0 ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 hover:border-sky-400'}`}
              >
                {isCompleted && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
