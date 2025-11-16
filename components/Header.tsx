import React from 'react';
import { IMAGES } from '../constants';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white shadow-md w-full p-4 flex items-center shrink-0">
      <button 
        onClick={onMenuClick} 
        className="mr-4 md:hidden text-slate-600 hover:text-sky-600"
        aria-label="Open navigation menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      <img src={IMAGES.logo} alt="Resilios Logo" className="h-10 w-10 mr-4 rounded-full"/>
      <div>
        <h1 className="text-xl font-bold text-sky-800">Resilios</h1>
        <p className="text-sm text-slate-500">Your AI Companion for Mental Wellness</p>
      </div>
    </header>
  );
};
