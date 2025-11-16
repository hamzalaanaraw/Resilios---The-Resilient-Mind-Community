
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { IMAGES } from '../constants';

export const AuthScreen: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Brand & Visuals Panel */}
        <div className="bg-gradient-to-br from-sky-500 to-sky-700 p-8 md:p-12 text-white flex flex-col items-center justify-center text-center">
            <img src={IMAGES.avatar} alt="Resilios Avatar" className="w-40 h-40 mx-auto mb-6 drop-shadow-lg" />
            <h1 className="text-4xl font-bold">Resilios</h1>
            <p className="mt-2 text-lg opacity-90">
                Your AI companion for mental wellness.
            </p>
        </div>

        {/* Login Panel */}
        <div className="bg-sky-50 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center">
            <img src={IMAGES.logo} alt="Resilios Logo" className="w-16 h-16 mx-auto mb-4 rounded-full" />
            <h2 className="text-2xl font-bold text-sky-800">Welcome Back</h2>
            <p className="mt-2 text-slate-600">
              Ready to continue your wellness journey?
            </p>
          </div>
        
          <div className="mt-8">
            <button
              onClick={login}
              className="w-full px-6 py-3 text-lg font-semibold text-white bg-sky-500 rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-transform transform hover:scale-105"
            >
              Login as Demo User
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
