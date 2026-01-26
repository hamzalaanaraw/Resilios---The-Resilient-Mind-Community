
import React, { useState, useEffect } from 'react';

interface DailyCheckInModalProps {
  onClose: () => void;
  onSubmit: (mood: number, notes: string) => void;
}

const moods = [
  { emoji: '😔', value: 1, label: 'Awful' },
  { emoji: '😟', value: 3, label: 'Bad' },
  { emoji: '😐', value: 5, label: 'Okay' },
  { emoji: '😊', value: 7, label: 'Good' },
  { emoji: '😄', value: 10, label: 'Great' },
];

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({ onClose, onSubmit }) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsEntering(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMood !== null) {
      onSubmit(selectedMood, notes);
    }
  };

  return (
    <div className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isEntering ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()} 
        className={`bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-md m-4 transform transition-all duration-300 ease-out border border-slate-100 ${isEntering ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
      >
        <div className="flex justify-between items-start mb-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">How's your energy?</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        <p className="text-slate-500 font-medium mb-8">Take a moment to check in with yourself. No judgment, just awareness.</p>
        
        <form onSubmit={handleFormSubmit}>
          <div className="mb-10">
            <div className="flex justify-between items-center px-2">
              {moods.map(({ emoji, value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedMood(value)}
                  className={`flex flex-col items-center gap-2 group transition-all duration-300 ${
                    selectedMood === value ? 'scale-110' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                  }`}
                >
                  <div className={`text-4xl p-2 rounded-2xl transition-all duration-300 ${
                    selectedMood === value ? 'bg-sky-100 shadow-inner' : ''
                  }`}>
                    {emoji}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${selectedMood === value ? 'text-sky-600' : 'text-slate-400'}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label htmlFor="notes" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
              What's affecting you today?
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-base font-medium placeholder-slate-400 resize-none"
              placeholder="Stress at work, a great morning coffee, just feeling steady..."
            />
          </div>

          <button
            type="submit"
            disabled={selectedMood === null}
            className="w-full py-5 bg-sky-500 text-white rounded-2xl font-black shadow-xl shadow-sky-100 hover:bg-sky-600 active:scale-[0.98] transition-all disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed text-lg tracking-tight"
          >
            Log and Check-in
          </button>
          
          <p className="mt-6 text-[10px] text-slate-400 text-center font-bold uppercase tracking-[0.2em]">Resilios is here to listen.</p>
        </form>
      </div>
    </div>
  );
};
