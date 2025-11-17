
import React, { useEffect, useRef } from 'react';

// FIX: Added `onSubscribe` to the props interface to match the usage in App.tsx. This component is now presentational and no longer needs the AuthContext.
interface SubscriptionModalProps {
  onClose: () => void;
  onSubscribe: () => void;
}

declare global {
    interface Window {
        paypal: any;
    }
}


const FeatureListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start">
        <svg className="w-6 h-6 text-green-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        <span className="text-slate-700">{children}</span>
    </li>
);

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose, onSubscribe }) => {
  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.paypal && paypalRef.current && paypalRef.current.childElementCount === 0) {
        window.paypal.Buttons({
            // This function is called when the buyer clicks the PayPal button.
            // It sets up the details of the transaction, including the amount.
            // For a real application, this would call your backend to create an order.
            createOrder: (data: any, actions: any) => {
                return actions.order.create({
                    purchase_units: [{
                        description: 'Resilios Premium Subscription',
                        amount: {
                            // Replace with your actual subscription price
                            value: '9.99' 
                        }
                    }]
                });
            },
            // This function is called after the buyer approves the transaction on PayPal.
            // For a real application, this would call your backend to capture the payment.
            onApprove: async (data: any, actions: any) => {
                // const order = await actions.order.capture();
                // console.log('Payment successful:', order);
                
                // For this app, we simulate success and call the subscribe function.
                onSubscribe();
            },
            onError: (err: any) => {
                console.error("PayPal Error:", err);
                alert("An error occurred with your PayPal payment. Please try again.");
            }
        }).render(paypalRef.current);
    }
  }, [onSubscribe]);

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
          Subscribe Now (Card)
        </button>

        <div className="mt-4 flex items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-sm">OR</span>
            <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <div ref={paypalRef} className="mt-4"></div>

      </div>
    </div>
  );
};