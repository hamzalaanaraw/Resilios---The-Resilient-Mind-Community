
import React from 'react';
import { View } from '../types';

interface FooterProps {
    setView: (view: View) => void;
}

const FooterLink: React.FC<{onClick: () => void, children: React.ReactNode}> = ({ onClick, children }) => (
    <button onClick={onClick} className="text-xs font-bold text-slate-400 hover:text-sky-600 hover:underline transition-colors uppercase tracking-widest">
        {children}
    </button>
);

export const Footer: React.FC<FooterProps> = ({ setView }) => {
    return (
        <footer className="bg-white border-t border-slate-100 p-8 w-full text-center shrink-0">
            <div className="flex flex-wrap justify-center items-center gap-8 mb-6">
                <FooterLink onClick={() => setView('mission')}>Our Mission</FooterLink>
                <FooterLink onClick={() => setView('contact')}>Contact Us</FooterLink>
                <FooterLink onClick={() => setView('policies')}>Policies</FooterLink>
            </div>
            <div className="max-w-xs mx-auto h-px bg-slate-50 mb-6"></div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                © {new Date().getFullYear()} The Resilient Mind Co.
            </p>
            <p className="text-[9px] text-slate-300 mt-2 font-medium">
                Resilios is an AI wellness companion, not a medical device.
            </p>
        </footer>
    );
};
