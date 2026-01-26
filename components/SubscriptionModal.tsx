
import React, { useState } from 'react';
import { CheckIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionModalProps {
  onClose: () => void;
  onSubscribe: () => void;
}

const FeatureListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start py-2.5 border-b border-slate-50 last:border-0 w-full">
        <div className="bg-emerald-100 rounded-full p-1 mt-0.5 mr-3 shrink-0">
            <CheckIcon className="w-3 h-3 text-emerald-600" />
        </div>
        <span className="text-slate-700 text-sm font-medium">{children}</span>
    </li>
);

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose, onSubscribe }) => {
  const { isTrialActive, hasTrialEnded, trialDaysLeft, startTrial, isPremium } = useAuth();
  const [isStartingTrial, setIsStartingTrial] = useState(false);

  const handleStartTrial = async () => {
    setIsStartingTrial(true);
    try {
      await startTrial();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsStartingTrial(false);
    }
  };

  const showTrialButton = !isTrialActive && !hasTrialEnded && !isPremium;
  const showPaypalButton = !isPremium && (isTrialActive || hasTrialEnded);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-slideUp border border-slate-100">
        
        {/* Header Section */}
        <div className="p-8 text-center bg-gradient-to-b from-sky-50 to-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <div className="w-20 h-20 bg-sky-500 rounded-3xl mx-auto flex items-center justify-center text-white text-4xl mb-6 shadow-2xl shadow-sky-200 rotate-3 transition-transform hover:rotate-0">
            {hasTrialEnded ? '⌛' : isTrialActive ? '⏳' : '🎁'}
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {hasTrialEnded ? 'Trial Finished' : isTrialActive ? 'Premium Active' : '7-Day Free Trial'}
          </h2>
          <p className="text-slate-500 font-medium mt-2">
            {hasTrialEnded 
              ? 'Keep your unlimited access' 
              : isTrialActive 
                ? `${trialDaysLeft} days remaining in trial` 
                : 'Full experience. Zero commitment.'}
          </p>
        </div>

        {/* Features List */}
        <div className="px-8 py-4">
            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Included with Premium</h4>
                <ul className="space-y-1">
                    <FeatureListItem><strong>Unlimited</strong> Daily Messaging</FeatureListItem>
                    <FeatureListItem><strong>Live Voice</strong> Interactive Sessions</FeatureListItem>
                    <FeatureListItem><strong>Priority</strong> Reasoning (Gemini 3)</FeatureListItem>
                    <FeatureListItem><strong>Daily</strong> Micro-Step Challenges</FeatureListItem>
                </ul>
            </div>
        </div>

        {/* Action Area */}
        <div className="px-8 pb-10 text-center">
            {showTrialButton && (
                <button
                    onClick={handleStartTrial}
                    disabled={isStartingTrial}
                    className="w-full py-5 bg-sky-500 text-white text-lg font-black rounded-2xl shadow-2xl shadow-sky-200 hover:bg-sky-600 active:scale-95 transition-all mb-4"
                >
                    {isStartingTrial ? 'Unlocking...' : 'Start My 7-Day Free Trial'}
                </button>
            )}

            {showPaypalButton && (
                <div className="w-full mb-6 flex flex-col items-center animate-pop">
                  <style>{`
                    .pp-QJKJPDAXV8UWG {
                      text-align: center;
                      border: none;
                      border-radius: 1.25rem;
                      width: 100%;
                      height: 4.5rem;
                      font-weight: 900;
                      background-color: #FFD140;
                      color: #000000;
                      font-family: inherit;
                      font-size: 1.125rem;
                      cursor: pointer;
                      transition: all 0.2s;
                      box-shadow: 0 8px 25px rgba(255, 209, 64, 0.4);
                    }
                    .pp-QJKJPDAXV8UWG:hover {
                      background-color: #f4bb37;
                      transform: translateY(-2px);
                      box-shadow: 0 12px 30px rgba(255, 209, 64, 0.5);
                    }
                  `}</style>
                  <form 
                    action="https://www.paypal.com/ncp/payment/QJKJPDAXV8UWG" 
                    method="post" 
                    target="_blank" 
                    className="w-full flex flex-col items-center"
                  >
                    <input className="pp-QJKJPDAXV8UWG" type="submit" value={hasTrialEnded ? "Renew for $4.99/mo" : "Upgrade to Lifetime Pro"} />
                    <div className="mt-4 flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                        <img src="https://www.paypalobjects.com/images/Debit_Credit.svg" alt="cards" className="h-6" />
                    </div>
                  </form>
                </div>
            )}
            
            <p className="text-[10px] text-slate-400 font-medium px-4">
                {showTrialButton 
                  ? "Trial requires email verification. No credit card needed today." 
                  : "Secure checkout via PayPal. Cancel anytime in your PayPal settings."}
            </p>
        </div>
      </div>
    </div>
  );
};
