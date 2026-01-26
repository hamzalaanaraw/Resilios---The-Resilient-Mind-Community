
import React from 'react';
import { View } from '../types';
import { AvatarSparkIcon, CalendarIcon, LockIcon, MapIcon, WaveformHistoryIcon, SparklesIcon, DocumentTextIcon } from './Icons';

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
    className={`w-full flex items-center px-6 py-4 md:px-5 md:py-3.5 text-left text-[15px] font-bold transition-all duration-200 active:scale-[0.98] ${
      isActive
        ? 'bg-sky-500 text-white shadow-lg shadow-sky-200/50 rounded-2xl mx-2 !w-[calc(100%-1rem)]'
        : 'text-slate-600 hover:bg-sky-50/50 hover:text-sky-700'
    } ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
  >
    <span className={`mr-4 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>{icon}</span>
    <span className="flex-1">{children}</span>
    {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full ml-2"></div>}
  </button>
);

const ChatBubbleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.539 1.118l-3.975-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363 1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
);

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

export const Nav: React.FC<NavProps> = ({ activeView, setView, onCheckInClick, onLogout, onGoPremium, isPremium, latestMood, isNavOpen, onClose }) => {
  
  const getMoodIndicator = (mood: number | null): { emoji: string; label: string; color: string; ring: string } => {
    if (mood === null) return { emoji: '🤔', label: 'Check-in required', color: 'bg-slate-100 text-slate-600', ring: 'ring-slate-200' };
    if (mood <= 2) return { emoji: '😔', label: 'Hard day', color: 'bg-red-50 text-red-800', ring: 'ring-red-100' };
    if (mood <= 4) return { emoji: '😟', label: 'Tough', color: 'bg-amber-50 text-amber-800', ring: 'ring-amber-100' };
    if (mood <= 6) return { emoji: '😐', label: 'Managing', color: 'bg-yellow-50 text-yellow-800', ring: 'ring-yellow-100' };
    if (mood <= 8) return { emoji: '😊', label: 'Balanced', color: 'bg-green-50 text-green-800', ring: 'ring-green-100' };
    return { emoji: '😄', label: 'Thriving', color: 'bg-sky-50 text-sky-800', ring: 'ring-sky-100' };
  };

  const moodIndicator = getMoodIndicator(latestMood);

  const handleAction = (action: () => void) => {
    action();
    if (window.innerWidth < 768) onClose(); 
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 transition-opacity md:hidden ${isNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      <nav className={`fixed top-0 left-0 h-full w-[280px] md:w-64 bg-white border-r border-slate-100 flex flex-col justify-between z-40 transform transition-transform duration-300 md:static md:translate-x-0 md:shrink-0 ${isNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex-1 overflow-y-auto no-scrollbar pt-safe">
          <div className="py-6 space-y-1">
            <NavButton onClick={() => handleAction(() => setView('chat'))} isActive={activeView === 'chat'} icon={<ChatBubbleIcon />}>
              Support Chat
            </NavButton>
            <NavButton onClick={() => handleAction(() => setView('plan'))} isActive={activeView === 'plan'} icon={<DocumentTextIcon />}>
              Wellness Plan
            </NavButton>
            <NavButton onClick={() => handleAction(() => setView('calendar'))} isActive={activeView === 'calendar'} icon={<CalendarIcon />}>
              Daily Analytics
            </NavButton>
            <NavButton onClick={() => handleAction(() => setView('map'))} isActive={activeView === 'map'} icon={<MapIcon />}>
              Find Resources
            </NavButton>
            <NavButton 
              onClick={() => handleAction(isPremium ? () => setView('liveAvatar') : onGoPremium)} 
              isActive={activeView === 'liveAvatar'} 
              icon={isPremium ? <AvatarSparkIcon /> : <LockIcon />}
              className="relative"
            >
              Live Avatar
              {!isPremium && <span className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[9px] font-black text-amber-900 shimmer-premium rounded-full">PRO</span>}
            </NavButton>
            <NavButton onClick={() => handleAction(() => setView('liveHistory'))} isActive={activeView === 'liveHistory'} icon={<WaveformHistoryIcon />}>
              Voice Logs
            </NavButton>

            <div className="px-5 pt-8 mt-6 border-t border-slate-50 space-y-5">
                <div className={`p-4 rounded-[1.25rem] flex items-center ring-1 shadow-sm ${moodIndicator.color} ${moodIndicator.ring} transition-all animate-pop`}>
                    <span className="text-3xl mr-4">{moodIndicator.emoji}</span>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Today's Mood</p>
                        <p className="font-black text-sm leading-tight">{moodIndicator.label}</p>
                    </div>
                </div>
                 <button
                    onClick={() => handleAction(onCheckInClick)}
                    className="w-full flex items-center justify-center px-4 py-4 text-sm font-black transition-all duration-200 bg-sky-500 text-white rounded-[1.25rem] hover:bg-sky-600 shadow-xl shadow-sky-100 active:scale-[0.97]"
                >
                    <span className="mr-2"><SparklesIcon /></span>
                    Quick Check-in
                </button>
            </div>
          </div>
        </div>
        
        <div className="p-4 pt-4 border-t border-slate-50 pb-safe">
          {!isPremium && (
              <div className="mb-4">
                   <button
                      onClick={() => handleAction(onGoPremium)}
                      className="w-full flex items-center justify-center px-4 py-4 text-sm font-black transition-all shimmer-premium text-amber-900 rounded-[1.25rem] shadow-lg active:scale-[0.97]"
                  >
                      <span className="mr-2"><StarIcon /></span>
                      Upgrade to Pro
                  </button>
              </div>
          )}
           <button 
                onClick={() => handleAction(onLogout)}
                className="w-full flex items-center px-6 py-4 text-slate-400 font-bold hover:text-red-500 transition-colors"
           >
              <LogoutIcon />
              <span className="ml-4">Logout</span>
            </button>
        </div>
      </nav>
    </>
  );
};
