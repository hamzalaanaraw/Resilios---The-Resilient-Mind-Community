import React from 'react';
import { View } from '../types';

interface FooterProps {
    setView: (view: View) => void;
}

const FooterLink: React.FC<{onClick: () => void, children: React.ReactNode}> = ({ onClick, children }) => (
    <button onClick={onClick} className="text-sm text-slate-500 hover:text-sky-600 hover:underline transition-colors">
        {children}
    </button>
);

export const Footer: React.FC<FooterProps> = ({ setView }) => {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 p-4 w-full text-center shrink-0">
            <div className="flex justify-center items-center space-x-6">
                <FooterLink onClick={() => setView('mission')}>Our Mission</FooterLink>
                <FooterLink onClick={() => setView('contact')}>Contact Us</FooterLink>
                <FooterLink onClick={() => setView('policies')}>Policies</FooterLink>
            </div>
            <p className="text-xs text-slate-400 mt-3">
                © {new Date().getFullYear()} The Resilient Mind Community. All Rights Reserved.
            </p>
        </footer>
    );
};
