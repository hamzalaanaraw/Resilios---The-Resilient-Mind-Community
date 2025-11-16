
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
    // This triggers the animation on mount
    const timer = setTimeout(() => setIsEntering(true), 50); // small delay ensures transition is applied
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMood !== null) {
      onSubmit(selectedMood, notes);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isEntering ? 'bg-opacity-50' : 'bg-opacity-0'}`} onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()} 
        className={`bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 transform transition-all duration-300 ease-out ${isEntering ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">How are you feeling?</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        <p className="text-slate-600 mb-6">Take a moment to check in with yourself.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <div className="flex justify-around items-end">
              {moods.map(({ emoji, value, label }) => (
                <div key={value} className="text-center">
                  <button
                    type="button"
                    onClick={() => setSelectedMood(value)}
                    className={`text-4xl p-2 rounded-full transition-transform transform hover:scale-125 ${
                      selectedMood === value ? 'bg-sky-100 scale-125' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                  <span className={`mt-2 text-xs font-medium ${selectedMood === value ? 'text-sky-600' : 'text-slate-500'}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
              What's affecting your mood today? (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
              placeholder="e.g., work stress, a good conversation..."
            />
          </div>
          <button
            type="submit"
            disabled={selectedMood === null}
            className="w-full p-3 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 disabled:bg-slate-300 transition"
          >
            Submit Check-in
          </button>
        </form>
      </div>
    </div>
  );
};
