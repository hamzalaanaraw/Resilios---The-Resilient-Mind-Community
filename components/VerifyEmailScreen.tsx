
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { IMAGES } from '../constants';

export const VerifyEmailScreen: React.FC = () => {
  const { user, sendVerificationEmail, logout } = useAuth();
  const [emailSent, setEmailSent] = useState(false);

  const handleResend = async () => {
    await sendVerificationEmail();
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-md w-full text-center border border-slate-100">
        <img 
            src={IMAGES.logo} 
            alt="Resilios Logo" 
            className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-white shadow-sm" 
        />
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Verify your email</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          We've sent a verification link to <strong>{user?.email}</strong>. 
          <br/>Please check your inbox to continue.
        </p>

        <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 mb-8 text-sm text-sky-800">
            <p className="font-semibold mb-1">Can't find it?</p>
            <p>Check your spam folder or click below to resend.</p>
        </div>

        <div className="space-y-4">
            <button 
                onClick={handleResend}
                disabled={emailSent}
                className="w-full py-3 px-6 bg-sky-600 text-white font-bold rounded-xl shadow-md hover:bg-sky-700 transition-transform transform active:scale-95 disabled:opacity-50"
            >
                {emailSent ? "Email Sent!" : "Resend Verification Email"}
            </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
            <button 
                onClick={() => logout()}
                className="text-slate-400 hover:text-slate-600 text-sm"
            >
                Sign Out
            </button>
        </div>
      </div>
    </div>
  );
};
