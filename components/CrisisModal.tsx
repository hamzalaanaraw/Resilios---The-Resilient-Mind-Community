
import React from 'react';

interface CrisisModalProps {
  onClose: () => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-red-800 bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg m-4 transform transition-all border-4 border-red-500">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-800">Immediate Support is Available</h2>
        </div>
        <p className="text-slate-700 mb-4">
          It sounds like you are going through a difficult time. Please know that you are not alone and help is available.
        </p>
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
          <h3 className="font-bold text-red-700 mb-2">Crisis Hotlines:</h3>
          <ul className="list-disc list-inside text-slate-700 space-y-1">
            <li><span className="font-semibold">USA/Canada:</span> Call or text 988</li>
            <li><span className="font-semibold">International:</span> Visit <a href="https://befrienders.org" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline">Befrienders.org</a></li>
            <li><span className="font-semibold">Morocco:</span> Stop Silence at 0801-00-53-53</li>
          </ul>
        </div>
        <p className="text-slate-600 text-sm mb-6">
          If you are in immediate danger, please call your local emergency services. This is a wellness companion and not a substitute for professional care.
        </p>
        <button
          onClick={onClose}
          className="w-full p-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition"
        >
          Close this message
        </button>
      </div>
    </div>
  );
};
