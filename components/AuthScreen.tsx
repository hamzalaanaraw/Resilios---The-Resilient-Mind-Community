
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { IMAGES } from '../constants';

interface AuthScreenProps {
    onBack?: () => void;
}

const AuthForm: React.FC<{
  isSignUp: boolean,
  setIsSignUp: (isSignUp: boolean) => void
}> = ({ isSignUp, setIsSignUp }) => {
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
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{isSignUp ? 'Create Free Account' : 'Welcome Back'}</h2>
        <p className="mt-2 text-slate-500 text-sm">
          {isSignUp ? 'Wellness Plan & tracking are free forever.' : 'Sign in to continue your journey.'}
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
            {loading ? 'Processing...' : (isSignUp ? 'Join Resilios' : 'Sign In')}
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
                {isSignUp ? 'Sign In' : 'Sign Up Free'}
            </button>
        </p>
      </div>
    </>
  );
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ onBack }) => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 animate-fadeIn">
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 shadow-2xl rounded-3xl overflow-hidden bg-white min-h-[600px] relative">
        
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
          <AuthForm isSignUp={isSignUp} setIsSignUp={setIsSignUp} />

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
