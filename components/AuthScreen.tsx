
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { IMAGES } from '../constants';
import { CreditCardIcon, GoogleAuthIcon } from './Icons';
import { loadPayPalScript } from '../utils/paypal';

interface AuthScreenProps {
    onBack?: () => void;
}

const AuthForm: React.FC<{
  isSignUp: boolean,
  setIsSignUp: (isSignUp: boolean) => void,
  setIsTrial: (isTrial: boolean) => void
}> = ({ isSignUp, setIsSignUp, setIsTrial }) => {
  const { loginWithEmail, signUp, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (isSignUp) {
      signUp(email, password, displayName);
    } else {
      loginWithEmail(email, password);
    }
  };

  return (
    <>
      <div className="text-center">
        <img src={IMAGES.logo} alt="Resilios Logo" className="w-16 h-16 mx-auto mb-4 rounded-full shadow-md border-4 border-white" />
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="mt-2 text-slate-500 text-sm">
          {isSignUp ? 'Start your wellness journey today.' : 'Sign in to continue your journey.'}
        </p>
      </div>
    
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {isSignUp && (
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1" htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              placeholder="How should we call you?"
              className="mt-1 w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>
        )}
         <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="mt-1 w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              placeholder="••••••••"
              className="mt-1 w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3.5 text-base font-bold text-white bg-sky-600 rounded-xl shadow-lg hover:bg-sky-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium animate-fadeIn" role="alert">
            {error}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={() => setIsSignUp(!isSignUp)} className="font-bold text-sky-600 hover:text-sky-700 ml-1 hover:underline transition-colors">
                {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
        </p>
      </div>

      {!isSignUp && (
          <div className="mt-6">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-400 font-medium">New here?</span>
                </div>
            </div>
            
            <button
            onClick={() => setIsTrial(true)}
            disabled={loading}
            className="mt-6 w-full px-6 py-3.5 text-base font-bold text-slate-700 bg-white border-2 border-slate-100 rounded-xl hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 transition-all flex items-center justify-center gap-2 group"
            >
            <span>Start 30-Day Free Trial</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
        </div>
      )}
    </>
  );
};

const OrderSummary: React.FC = () => (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 shadow-sm w-full">
        <div className="flex justify-between items-start mb-2">
            <div>
                <h3 className="font-bold text-slate-800 text-lg">Resilios Live Premium</h3>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">The Resilient Mind Co.</p>
            </div>
            <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">$4.99</div>
                <div className="text-xs text-slate-500">USD / month</div>
            </div>
        </div>
        <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-700">30-Day Free Trial</span>
            <span className="text-sm font-bold text-green-600">Free Today</span>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">Then $4.99/mo. Cancel anytime.</p>
    </div>
);

const PayPalFallbackButton: React.FC = () => (
    <a 
        href="https://www.paypal.com/ncp/payment/XF5ABMM4ZD7PC" 
        target="_blank" 
        rel="noreferrer"
        className="w-full flex items-center justify-center px-6 py-3 bg-[#FFC439] hover:bg-[#F4BB37] text-slate-900 font-bold rounded-lg transition-colors shadow-sm mb-4 border border-[#E0B030]"
    >
        <span className="italic font-bold text-lg">Pay</span><span className="italic text-lg">Pal</span>
        <span className="ml-2 text-sm font-normal">Checkout (Opens in new tab)</span>
    </a>
);

const TrialForm: React.FC<{ setIsTrial: (isTrial: boolean) => void }> = ({ setIsTrial }) => {
  const { signUp, subscribe, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [useFallback, setUseFallback] = useState(false);

  const containerId = "paypal-container-XF5ABMM4ZD7PC-Trial";

  useEffect(() => {
    let mounted = true;
    if (step === 'payment') {
         // Wait for DOM to update
        setTimeout(() => {
            if (!mounted) return;
            loadPayPalScript().then((paypal) => {
                if (paypal && paypal.HostedButtons) {
                    const container = document.getElementById(containerId);
                    
                    if (container) {
                        container.innerHTML = "";
                        try {
                            paypal.HostedButtons({
                                hostedButtonId: "XF5ABMM4ZD7PC"
                            }).render(`#${containerId}`)
                            .catch((err: any) => {
                                console.warn("Render error:", err);
                                if(mounted) setUseFallback(true);
                            });
                        } catch (err) {
                            console.warn("Error rendering hosted button:", err);
                            if(mounted) setUseFallback(true);
                        }
                    } else {
                         // Retry once if container isn't ready
                         setTimeout(() => {
                             const retryContainer = document.getElementById(containerId);
                             if (retryContainer && retryContainer.innerHTML === "") {
                                try {
                                    paypal.HostedButtons({
                                        hostedButtonId: "XF5ABMM4ZD7PC"
                                    }).render(`#${containerId}`)
                                    .catch(() => { if(mounted) setUseFallback(true) });
                                } catch (e) { 
                                    console.warn(e);
                                    if(mounted) setUseFallback(true);
                                }
                             }
                         }, 500);
                    }
                } else {
                    if(mounted) setUseFallback(true);
                }
            }).catch((err) => {
                console.warn(err);
                if(mounted) setUseFallback(true);
            });
        }, 100);
    }
    return () => { mounted = false; };
  }, [step]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    // Create the account first
    await signUp(email, password, displayName);
    // Move to payment step
    setStep('payment');
  };

  return (
    <>
      <div className="text-center">
        <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4 text-sky-600">
             <CreditCardIcon />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Start Free Trial</h2>
        <div className="flex justify-center gap-2 mt-4 mb-2">
            <div className={`h-1.5 w-8 rounded-full ${step === 'details' ? 'bg-sky-500' : 'bg-sky-200'}`}></div>
            <div className={`h-1.5 w-8 rounded-full ${step === 'payment' ? 'bg-sky-500' : 'bg-slate-200'}`}></div>
        </div>
        <p className="text-slate-500 text-sm">
          {step === 'details' ? 'Step 1: Create your account.' : 'Step 2: Activate with PayPal.'}
        </p>
      </div>

      {step === 'details' ? (
        <form onSubmit={handleCreateAccount} className="mt-8 space-y-4">
            <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1" htmlFor="trialDisplayName">Display Name</label>
            <input id="trialDisplayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="mt-1 w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all" />
            </div>
            <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1" htmlFor="trialEmail">Email</label>
            <input id="trialEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required className="mt-1 w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all" />
            </div>
            <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1" htmlFor="trialPassword">Password</label>
            <input id="trialPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required className="mt-1 w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all" />
            </div>
            
            <button type="submit" disabled={loading} className="w-full px-6 py-3.5 text-base font-bold text-white bg-sky-600 rounded-xl shadow-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all mt-4">
                {loading ? 'Creating Account...' : 'Continue to Activation'}
            </button>
        </form>
      ) : (
        <div className="mt-8 flex flex-col items-center animate-fadeIn w-full">
            <div className="bg-green-50 text-green-800 p-4 rounded-xl mb-6 w-full text-center border border-green-100 shadow-sm flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                <div className="font-bold">Account Created!</div>
            </div>
            
            <OrderSummary />

            {/* PayPal container */}
            <div id={containerId} className={`w-full flex justify-center z-10 min-h-[50px] mb-6 ${useFallback ? 'hidden' : ''}`}></div>

            {/* Fallback Button */}
            {useFallback && <PayPalFallbackButton />}

            {/* Manual Verification Button */}
            <button 
                onClick={() => subscribe()} 
                className="w-full px-4 py-3 bg-sky-600 text-white font-bold rounded-xl shadow-md hover:bg-sky-700 transition-colors"
            >
                I have subscribed (Activate Account)
            </button>
            <p className="text-xs text-slate-400 mt-2 text-center">
                Click this after completing payment on PayPal to unlock the app immediately.
            </p>
        </div>
      )}

      {error && step === 'details' && (
        <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium" role="alert">
            {error}
        </div>
      )}

      <div className="mt-6 text-center pt-6 border-t border-slate-100">
        <p className="text-sm text-slate-500">
          Already have an account?
          <button onClick={() => setIsTrial(false)} className="font-bold text-sky-600 hover:text-sky-700 ml-1 hover:underline">
            Sign In
          </button>
        </p>
      </div>
    </>
  );
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ onBack }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isTrial, setIsTrial] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 animate-fadeIn">
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 shadow-2xl rounded-3xl overflow-hidden bg-white min-h-[600px] relative">
        
        {/* Back Button */}
        {onBack && (
            <button 
                onClick={onBack}
                className="absolute top-4 left-4 z-20 text-white md:text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1"
            >
                ← Back
            </button>
        )}

        {/* Brand Side */}
        <div className="relative bg-slate-900 overflow-hidden flex flex-col items-center justify-center text-center p-12 text-white">
             {/* Abstract Background Shapes */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-sky-500 blur-[100px]"></div>
                <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-500 blur-[100px]"></div>
            </div>

            <div className="relative z-10">
                <img src={IMAGES.avatar} alt="Resilios Avatar" className="w-48 h-48 mx-auto mb-8 drop-shadow-2xl rounded-full border-4 border-white/10" />
                <h1 className="text-5xl font-bold mb-4 tracking-tight">Resilios</h1>
                <p className="text-xl text-sky-100 max-w-md mx-auto leading-relaxed font-light">
                    Your AI companion for proactive mental wellness. Build resilience, one conversation at a time.
                </p>
            </div>
        </div>

        {/* Form Side */}
        <div className="bg-white p-8 md:p-12 flex flex-col justify-center relative">
          {isTrial ? (
            <TrialForm setIsTrial={setIsTrial} />
          ) : (
            <AuthForm isSignUp={isSignUp} setIsSignUp={setIsSignUp} setIsTrial={setIsTrial} />
          )}

          <div className="mt-auto pt-8">
            <p className="text-[10px] text-slate-400 text-center leading-tight">
                By using Resilios, you agree that it is an AI tool and not a replacement for professional medical care. 
                <br/>If you are in danger, please call emergency services immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
