
import React from 'react';
import { IMAGES } from '../constants';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white border-b border-slate-100 w-full px-4 py-3 flex items-center shrink-0 z-20 sticky top-0 shadow-sm/50 backdrop-blur-sm bg-white/90 pt-safe">
      <button 
        onClick={onMenuClick} 
        className="mr-3 md:hidden p-2 -ml-2 text-slate-500 hover:text-sky-600 rounded-full hover:bg-slate-100 transition-colors active:scale-90"
        aria-label="Open navigation menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      
      <div className="flex items-center">
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-400 to-indigo-400 rounded-full opacity-75 group-hover:opacity-100 transition duration-200 blur-[2px]"></div>
            <img src={IMAGES.logo} alt="Resilios Logo" className="relative h-8 w-8 md:h-9 md:w-9 rounded-full border-2 border-white"/>
        </div>
        <div className="ml-3">
          <h1 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-700 to-indigo-700 tracking-tight">Resilios</h1>
        </div>
      </div>
      
      <div className="ml-auto flex items-center pr-safe">
        {/* Placeholder for future top-right actions (notifications, settings) */}
      </div>
    </header>
  );
};
