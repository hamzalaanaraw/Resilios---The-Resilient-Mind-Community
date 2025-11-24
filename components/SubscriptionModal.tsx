
import React, { useEffect, useState } from 'react';
import { loadPayPalScript } from '../utils/paypal';
import { LockIcon, CheckIcon } from './Icons';

interface SubscriptionModalProps {
  onClose: () => void;
  onSubscribe: () => void;
}

const FeatureListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start py-2 border-b border-slate-50 last:border-0 w-full">
        <div className="bg-green-100 rounded-full p-0.5 mt-0.5 mr-3 shrink-0">
            <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <span className="text-slate-700 text-sm font-medium whitespace-normal">{children}</span>
    </li>
);

const OrderSummary: React.FC = () => (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 shadow-sm w-full">
        <div className="flex justify-between items-start mb-2 w-full">
            <div>
                <h3 className="font-bold text-slate-800 text-lg whitespace-nowrap">Resilios Live Premium</h3>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">The Resilient Mind Co.</p>
            </div>
            <div className="text-right">
                <div className="text-2xl font-bold text-slate-900 whitespace-nowrap">$4.99</div>
                <div className="text-xs text-slate-500">USD / month</div>
            </div>
        </div>
        <p className="text-sm text-slate-600 mb-3 italic w-full">Enjoy Resilios Live for just $4.99/mo</p>
        <div className="border-t border-slate-200 pt-3 flex justify-between items-center w-full">
            <span className="text-sm font-semibold text-slate-700">Total due today</span>
            <span className="text-sm font-bold text-slate-900">$4.99 USD</span>
        </div>
    </div>
);

const PayPalFallbackButton: React.FC = () => (
    <a 
        href="https://www.paypal.com/ncp/payment/XF5ABMM4ZD7PC" 
        target="_blank" 
        rel="noreferrer"
        className="w-full flex items-center justify-center px-6 py-3 bg-[#FFC439] hover:bg-[#F4BB37] text-slate-900 font-bold rounded-lg transition-colors shadow-sm mb-2 border border-[#E0B030]"
    >
        <span className="italic font-bold text-lg">Pay</span><span className="italic text-lg">Pal</span>
        <span className="ml-2 text-sm font-normal">Checkout (Opens in new tab)</span>
    </a>
);

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose, onSubscribe }) => {
  const containerId = "paypal-container-XF5ABMM4ZD7PC";
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    let mounted = true;

    loadPayPalScript()
      .then((paypal) => {
        if (!mounted) return;
        setIsScriptLoaded(true);
        
        if (paypal && paypal.HostedButtons) {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = ""; // Clear existing
                try {
                    paypal.HostedButtons({
                        hostedButtonId: "XF5ABMM4ZD7PC"
                    }).render(`#${containerId}`)
                    .catch((err: any) => {
                        console.warn("PayPal render failed, switching to fallback:", err);
                        if(mounted) setUseFallback(true);
                    });
                } catch (err) {
                    console.warn("PayPal render error, switching to fallback:", err);
                    if(mounted) setUseFallback(true);
                }
            } else {
                 // Container might not be ready in some render cycles
                 if(mounted) setUseFallback(true);
            }
        } else {
            if(mounted) setUseFallback(true);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        console.warn("PayPal script load error, switching to fallback:", err);
        setUseFallback(true);
      });

    return () => { mounted = false; };
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 flex justify-between items-start rounded-t-2xl w-full">
          <div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 mb-2 border border-amber-200">
                  <span className="mr-1">👑</span> PREMIUM
              </div>
              <h2 className="text-2xl font-bold text-slate-800 whitespace-nowrap">Unlock Resilios</h2>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 -mt-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar w-full">
            
            <OrderSummary />

            <div className="mb-6 w-full">
                <h4 className="text-sm font-bold text-slate-700 mb-2">What's included:</h4>
                <div className="bg-white border border-slate-100 rounded-xl p-1 shadow-sm w-full">
                    <ul className="rounded-lg p-2 w-full">
                        <FeatureListItem><strong>Unlimited</strong> AI conversations</FeatureListItem>
                        <FeatureListItem><strong>Live Avatar</strong> voice interaction</FeatureListItem>
                        <FeatureListItem>Save & Replay <strong>Voice History</strong></FeatureListItem>
                        <FeatureListItem>Advanced <strong>Image & Video</strong> analysis</FeatureListItem>
                    </ul>
                </div>
            </div>
            
            <div className="flex flex-col items-center min-h-[140px] justify-center relative w-full">
                {/* Loading Spinner */}
                {!isScriptLoaded && !useFallback && !loadingError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                        <div className="w-8 h-8 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin"></div>
                    </div>
                )}

                {/* PayPal Container */}
                <div id={containerId} className={`w-full flex justify-center z-0 ${useFallback ? 'hidden' : ''}`}></div>

                {/* Fallback Button */}
                {useFallback && <PayPalFallbackButton />}
                
                {loadingError && (
                    <div className="text-red-500 text-sm mt-2 p-3 bg-red-50 rounded-lg w-full text-center border border-red-100">{loadingError}</div>
                )}

                <div className="mt-4 w-full text-center">
                    <p className="text-[10px] text-slate-400 mb-2">
                        Already completed payment?
                    </p>
                    <button onClick={onSubscribe} className="text-xs font-semibold text-sky-600 hover:text-sky-800 underline">
                        Validate Subscription & Unlock
                    </button>
                    <p className="text-[10px] text-slate-300 mt-2">
                        Secure payment processed by PayPal. Cancel anytime.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
