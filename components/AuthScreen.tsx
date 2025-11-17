
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { IMAGES } from '../constants';
import { GoogleAuthIcon } from './Icons';

export const AuthScreen: React.FC = () => {
  const { loginWithGoogle, loginWithEmail, signUp, loading, error } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 shadow-2xl rounded-2xl overflow-hidden">
        
        <div className="bg-gradient-to-br from-sky-500 to-sky-700 p-8 md:p-12 text-white flex flex-col items-center justify-center text-center">
            <img src={IMAGES.avatar} alt="Resilios Avatar" className="w-40 h-40 mx-auto mb-6 drop-shadow-lg" />
            <h1 className="text-4xl font-bold">Resilios</h1>
            <p className="mt-2 text-lg opacity-90">
                Your AI companion for mental wellness.
            </p>
        </div>

        <div className="bg-sky-50 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center">
            <img src={IMAGES.logo} alt="Resilios Logo" className="w-16 h-16 mx-auto mb-4 rounded-full" />
            <h2 className="text-2xl font-bold text-sky-800">{isSignUp ? 'Create an Account' : 'Welcome Back'}</h2>
            <p className="mt-2 text-slate-600">
              {isSignUp ? 'Start your wellness journey today.' : 'Ready to continue your wellness journey?'}
            </p>
          </div>
        
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {isSignUp && (
              <div>
                <label className="text-sm font-medium text-slate-600" htmlFor="displayName">Display Name</label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            )}
             <div>
                <label className="text-sm font-medium text-slate-600" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 text-lg font-semibold text-white bg-sky-500 rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-800 text-sm rounded-lg text-center" role="alert">
                <p>{error}</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center">
            <p className="text-sm text-slate-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-sky-600 hover:underline ml-1">
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
            </p>
          </div>

          <div className="mt-6 flex items-center">
            <div className="flex-grow border-t border-slate-300"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-sm">OR</span>
            <div className="flex-grow border-t border-slate-300"></div>
          </div>
        
          <div className="mt-6">
            <button
              onClick={loginWithGoogle}
              disabled={loading}
              className="w-full px-6 py-3 text-lg font-semibold text-slate-700 bg-white rounded-lg shadow-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-transform transform hover:scale-105 flex items-center justify-center gap-3 border border-slate-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <GoogleAuthIcon />
              Sign in with Google
            </button>
          </div>
          <p className="mt-8 text-xs text-slate-400 text-center">
            By continuing, you acknowledge that Resilios is an AI companion and not a substitute for professional medical advice. If you are in crisis, please contact a local emergency number.
          </p>
        </div>
      </div>
    </div>
  );
};
