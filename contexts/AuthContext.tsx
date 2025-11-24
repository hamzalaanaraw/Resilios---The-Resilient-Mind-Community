
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';

// Mock Auth Context Interface
interface AuthContextType {
  user: User | null;
  isPremium: boolean;
  loading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signUpForTrial: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  subscribe: () => void;
  sendVerificationEmail: () => Promise<void>;
  mockVerifyEmail: () => Promise<void>; // Helper for the mock environment
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'resilios_mock_user';
const STORAGE_KEY_PREMIUM = 'resilios_mock_premium';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check local storage on load
    const storedUser = localStorage.getItem(STORAGE_KEY_USER);
    const storedPremium = localStorage.getItem(STORAGE_KEY_PREMIUM);
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Backward compatibility: if emailVerified is missing, assume true for old mock users
        if (parsedUser.emailVerified === undefined) {
            parsedUser.emailVerified = true;
        }
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse user from storage", e);
      }
    }
    if (storedPremium === 'true') {
      setIsPremium(true);
    }
    setLoading(false);
  }, []);

  const simulateNetwork = () => new Promise(resolve => setTimeout(resolve, 800));

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    await simulateNetwork();
    
    const mockUser: User = {
      uid: 'google-user-123',
      email: 'user@gmail.com',
      displayName: 'Google User',
      photoURL: null,
      emailVerified: true, // Google auth usually implies verified email
    };
    
    setUser(mockUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
    setLoading(false);
  };

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    await simulateNetwork();

    if (!email.includes('@')) {
       setError("Please enter a valid email address.");
       setLoading(false);
       return;
    }

    if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setLoading(false);
        return;
    }

    const name = email.split('@')[0];
    const mockUser: User = {
      uid: `email-user-${Date.now()}`,
      email: email,
      displayName: name.charAt(0).toUpperCase() + name.slice(1),
      photoURL: null,
      emailVerified: true // For login in mock, assume verified if account exists (simplification)
    };

    setUser(mockUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
    setLoading(false);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    setError(null);
    await simulateNetwork();

    if (!displayName || displayName.trim().length === 0) {
        setError("Please enter a display name.");
        setLoading(false);
        return;
    }

    if (!email.includes('@')) {
        setError("Please enter a valid email address.");
        setLoading(false);
        return;
    }

    if (password.length < 6) {
        setError("Password is too short (min 6 chars).");
        setLoading(false);
        return;
    }

    const mockUser: User = {
      uid: `user-${Date.now()}`,
      email: email,
      displayName: displayName,
      photoURL: null,
      emailVerified: false // New signups need verification
    };

    setUser(mockUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(mockUser));
    setLoading(false);
  };

  const signUpForTrial = async (email: string, password: string, displayName: string) => {
    await signUp(email, password, displayName);
    subscribe();
  };

  const logout = async () => {
    setLoading(true);
    await simulateNetwork();
    setUser(null);
    setIsPremium(false);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_PREMIUM);
    setLoading(false);
  };

  const subscribe = () => {
    setIsPremium(true);
    localStorage.setItem(STORAGE_KEY_PREMIUM, 'true');
  };

  const sendVerificationEmail = async () => {
      setLoading(true);
      await simulateNetwork();
      // In a real app, this triggers firebase.auth().currentUser.sendEmailVerification()
      setLoading(false);
  };

  // Only for mock environment to simulate clicking the link
  const mockVerifyEmail = async () => {
      if (!user) return;
      setLoading(true);
      await simulateNetwork();
      
      const updatedUser = { ...user, emailVerified: true };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
      setLoading(false);
  };

  if (loading && !user) {
    return (
        <div className="flex items-center justify-center h-screen bg-sky-50">
            <div className="text-center">
                <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600">Initializing Resilios...</p>
            </div>
        </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
        user, 
        isPremium, 
        loading, 
        loginWithGoogle, 
        loginWithEmail, 
        signUp, 
        signUpForTrial, 
        logout, 
        subscribe, 
        error,
        sendVerificationEmail,
        mockVerifyEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
