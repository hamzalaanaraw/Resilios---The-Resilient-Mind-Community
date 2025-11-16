
import React from 'react';

// FIX: Added `onSubscribe` to the props interface to match the usage in App.tsx. This component is now presentational and no longer needs the AuthContext.
interface SubscriptionModalProps {
  onClose: () => void;
  onSubscribe: () => void;
}

const FeatureListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start">
        <svg className="w-6 h-6 text-green-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        <span className="text-slate-700">{children}</span>
    </li>
);

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose, onSubscribe }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 transform transition-all">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Upgrade to Resilios Premium</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <p className="text-slate-600 mb-6">Unlock powerful tools to enhance your wellness journey.</p>
        
        <div className="mb-6 bg-sky-50 p-4 rounded-lg">
            <ul className="space-y-3">
                <FeatureListItem><strong>Unlimited</strong> AI conversations</FeatureListItem>
                <FeatureListItem><strong>Deeper Thinking</strong> mode for more complex queries</FeatureListItem>
                <FeatureListItem>Advanced analysis of <strong>images and videos</strong></FeatureListItem>
                <FeatureListItem>Full access to all <strong>Wellness Plan</strong> sections</FeatureListItem>
                <FeatureListItem>Priority access to <strong>new features</strong></FeatureListItem>
            </ul>
        </div>
        
        <button
          onClick={onSubscribe}
          className="w-full p-3 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition"
        >
          Subscribe Now (Demo)
        </button>
         <p className="text-center mt-4 text-xs text-slate-500">
            This is a simulation. No payment is required.
        </p>
      </div>
    </div>
  );
};
