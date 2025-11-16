import React from 'react';
import { View } from '../types';
import { AvatarSparkIcon, ChartBarIcon, LockIcon, MapIcon } from './Icons';

interface NavProps {
  activeView: View;
  setView: (view: View) => void;
  onCheckInClick: () => void;
  onLogout: () => void;
  onGoPremium: () => void;
  isPremium: boolean;
  latestMood: number | null;
  isNavOpen: boolean;
  onClose: () => void;
}

const NavButton: React.FC<{
  onClick?: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
  disabled?: boolean;
}> = ({ onClick, isActive = false, children, icon, className = '', disabled=false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium transition-colors duration-150 ${
      isActive
        ? 'bg-sky-100 text-sky-700 border-l-4 border-sky-500'
        : 'text-slate-600 hover:bg-sky-50'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
  >
    <span className="mr-3">{icon}</span>
    {children}
  </button>
);

const ChatBubbleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const DocumentTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414l-2.293 2.293m0-4.028l2.293-2.293a1 1 0 011.414 0l2.293 2.293m-4.586 4.028l-2.293 2.293a1 1 0 01-1.414 0l-2.293-2.293m4.586 0l-2.293-2.293a1 1 0 010-1.414l2.293-2.293m0 4.028l2.293 2.293a1 1 0 010 1.414l-2.293 2.293M19 12a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.539 1.118l-3.975-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
);

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);


export const Nav: React.FC<NavProps> = ({ activeView, setView, onCheckInClick, onLogout, onGoPremium, isPremium, latestMood, isNavOpen, onClose }) => {
  
  const getMoodIndicator = (mood: number | null): { emoji: string; label: string; color: string } => {
    if (mood === null) {
        return { emoji: '🤔', label: 'Awaiting Check-in', color: 'bg-slate-100 text-slate-600' };
    }
    if (mood <= 2) return { emoji: '😔', label: 'Feeling Awful', color: 'bg-red-100 text-red-800' };
    if (mood <= 4) return { emoji: '😟', label: 'Feeling Bad', color: 'bg-amber-100 text-amber-800' };
    if (mood <= 6) return { emoji: '😐', label: 'Feeling Okay', color: 'bg-yellow-100 text-yellow-800' };
    if (mood <= 8) return { emoji: '😊', label: 'Feeling Good', color: 'bg-green-100 text-green-800' };
    return { emoji: '😄', label: 'Feeling Great', color: 'bg-sky-100 text-sky-800' };
  };

  const moodIndicator = getMoodIndicator(latestMood);

  const handleAction = (action: () => void) => {
    action();
    onClose(); // Always close nav after an action on mobile
  };


  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity md:hidden ${isNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      <nav className={`fixed top-0 left-0 h-full w-64 bg-slate-50 border-r border-slate-200 flex flex-col justify-between z-40 transform transition-transform md:static md:translate-x-0 md:h-auto md:shrink-0 ${isNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <div className="py-4">
            <NavButton onClick={() => handleAction(() => setView('chat'))} isActive={activeView === 'chat'} icon={<ChatBubbleIcon />}>
              AI Chat
            </NavButton>
            <NavButton onClick={() => handleAction(() => setView('plan'))} isActive={activeView === 'plan'} icon={<DocumentTextIcon />}>
              Wellness Plan
            </NavButton>
            <NavButton onClick={() => handleAction(() => setView('timeChart'))} isActive={activeView === 'timeChart'} icon={<ChartBarIcon />}>
              Timeline
            </NavButton>
            <NavButton onClick={() => handleAction(() => setView('map'))} isActive={activeView === 'map'} icon={<MapIcon />}>
              Find Support
            </NavButton>
            <NavButton 
              onClick={() => handleAction(isPremium ? () => setView('liveAvatar') : onGoPremium)} 
              isActive={activeView === 'liveAvatar'} 
              icon={isPremium ? <AvatarSparkIcon /> : <LockIcon />}
              className="relative"
            >
              Live Avatar
              {!isPremium && <span className="absolute right-4 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-xs font-semibold text-amber-800 bg-amber-200 rounded-full">PRO</span>}
            </NavButton>
            <div className="px-4 pt-4 mt-4 border-t border-slate-200 space-y-4">
                 <div className={`p-3 rounded-lg flex items-center ${moodIndicator.color} transition-colors`}>
                    <span className="text-2xl mr-3">{moodIndicator.emoji}</span>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Current Mood</p>
                        <p className="font-bold text-sm">{moodIndicator.label}</p>
                    </div>
                </div>
                 <button
                    onClick={() => handleAction(onCheckInClick)}
                    className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors duration-150 bg-sky-500 text-white rounded-lg hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                >
                    <span className="mr-2"><SparklesIcon /></span>
                    Daily Check-in
                </button>
            </div>
          </div>
        </div>
        <div className="py-4 border-t border-slate-200">
          {!isPremium && (
              <div className="px-4 mb-4">
                   <button
                      onClick={() => handleAction(onGoPremium)}
                      className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors duration-150 bg-amber-400 text-amber-900 rounded-lg hover:bg-amber-500"
                  >
                      <span className="mr-2"><StarIcon /></span>
                      Go Premium
                  </button>
              </div>
          )}
           <NavButton onClick={() => handleAction(onLogout)} icon={<LogoutIcon />}>
              Logout
            </NavButton>
        </div>
      </nav>
    </>
  );
};
