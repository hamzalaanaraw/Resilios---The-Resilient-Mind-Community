
import React, { useEffect, useState } from 'react';
import { CheckIcon } from './Icons';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationToastProps {
  notification: Notification | null;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, 5000); // Show for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification && !isVisible) return null;

  const bgColor = 
    notification?.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
    notification?.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
    'bg-sky-50 border-sky-200 text-sky-800';

  const icon = 
    notification?.type === 'error' ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ) : notification?.type === 'success' ? (
      <CheckIcon />
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    );

  return (
    <div className={`fixed top-4 left-0 right-0 z-[60] flex justify-center pointer-events-none transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
      <div className={`pointer-events-auto max-w-md w-full mx-4 shadow-lg rounded-xl border p-4 flex items-start gap-3 ${bgColor}`}>
        <div className="shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1 text-sm font-medium">{notification?.message}</div>
        <button onClick={() => setIsVisible(false)} className="shrink-0 text-current opacity-60 hover:opacity-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};
