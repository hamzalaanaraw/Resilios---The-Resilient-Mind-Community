
import React, { useEffect, useState } from 'react';
import { loadPayPalScript } from '../utils/paypal';
import { CheckIcon } from './Icons';

interface SubscriptionModalProps {
  onClose: () => void;
  onSubscribe: () => void;
}

const FeatureListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start py-2 border-b border-slate-50 last:border-0 w-full">
        <div className="bg-green-100 rounded-full p-0.5 mt-0.5 mr-3 shrink-0">
            <CheckIcon className="w-3 h-3 text-green-600" />
        </div>
        <span className="text-slate-700 text-sm font-medium">{children}</span>
    </li>
);

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose, onSubscribe }) => {
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    loadPayPalScript()
      .then((paypal) => {
        if (paypal && paypal.HostedButtons) {
            const containerId = "paypal-container-XF5ABMM4ZD7PC";
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = "";
                paypal.HostedButtons({ hostedButtonId: "XF5ABMM4ZD7PC" }).render(`#${containerId}`)
                .catch(() => setUseFallback(true));
            }
        }
      })
      .catch(() => setUseFallback(true));
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
        <div className="p-8 text-center bg-gradient-to-b from-sky-50 to-white">
          <div className="w-16 h-16 bg-sky-500 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl mb-4 shadow-lg shadow-sky-200">
            👑
          </div>
          <h2 className="text-3xl font-black text-slate-800">30-Day Free Trial</h2>
          <p className="text-slate-500 font-medium mt-1">Unlock the full power of Resilios</p>
        </div>

        <div className="p-8">
            <ul className="space-y-1 mb-8">
                <FeatureListItem><strong>Unlimited</strong> AI Chat & Voice Messaging</FeatureListItem>
                <FeatureListItem><strong>Live Avatar</strong> Interactive Conversations</FeatureListItem>
                <FeatureListItem><strong>Verified</strong> Google Search & Map support</FeatureListItem>
                <FeatureListItem><strong>Deeper</strong> Reasoning with 2.5 Pro models</FeatureListItem>
            </ul>

            <div id="paypal-container-XF5ABMM4ZD7PC" className={`w-full min-h-[50px] ${useFallback ? 'hidden' : ''}`} />

            <button 
                onClick={onSubscribe} 
                className="w-full py-4 bg-sky-600 text-white font-black rounded-2xl shadow-xl hover:bg-sky-700 transition-all transform active:scale-[0.98] mb-4"
            >
                Start Free Trial & Activate
            </button>
            
            <p className="text-[10px] text-slate-400 text-center leading-tight">
                Trial ends after 30 days. You will be charged $4.99/mo thereafter. <br/>Cancel anytime in your settings.
            </p>

            <button onClick={onClose} className="w-full mt-6 text-sm font-bold text-slate-400 hover:text-slate-600">
                Maybe Later
            </button>
        </div>
      </div>
    </div>
  );
};
