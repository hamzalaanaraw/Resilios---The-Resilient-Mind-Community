
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase/config';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isPremium: boolean;
  loading: boolean;
  login: () => void;
  logout: () => void;
  subscribe: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const mappedUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
        setUser(mappedUser);
        // In a real app, you'd fetch this from Firestore.
        // For this demo, we'll use localStorage keyed by UID.
        const premiumStatus = localStorage.getItem(`premium_${firebaseUser.uid}`);
        setIsPremium(premiumStatus === 'true');
      } else {
        setUser(null);
        setIsPremium(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during sign-in:", error);
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign-out:", error);
    } finally {
        setLoading(false);
    }
  };

  const subscribe = () => {
    // This simulates a successful payment and updates the user's status.
    if (user) {
      localStorage.setItem(`premium_${user.uid}`, 'true');
      setIsPremium(true);
    }
  };
  
  if (loading) {
    // Render a loading state while Firebase initializes
    return (
        <div className="flex items-center justify-center h-screen bg-sky-50">
            <div className="text-center">
                <p className="text-slate-600">Initializing...</p>
            </div>
        </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isPremium, loading, login, logout, subscribe }}>
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