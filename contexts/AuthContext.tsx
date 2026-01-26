
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  sendEmailVerification
} from "firebase/auth";
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isPremium: boolean; 
  isTrialActive: boolean;
  hasTrialEnded: boolean;
  hasPremiumAccess: boolean; 
  trialDaysLeft: number;
  loading: boolean;
  error: string | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  subscribe: () => void;
  startTrial: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TRIAL_PERIOD_DAYS = 7;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [trialStartDate, setTrialStartDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isTrialActive, setIsTrialActive] = useState(false);
  const [hasTrialEnded, setHasTrialEnded] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);

  useEffect(() => {
    if (trialStartDate) {
      const start = new Date(trialStartDate).getTime();
      const now = new Date().getTime();
      const diffMs = now - start;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      
      if (diffDays < TRIAL_PERIOD_DAYS) {
        setIsTrialActive(true);
        setHasTrialEnded(false);
        setTrialDaysLeft(Math.max(1, Math.ceil(TRIAL_PERIOD_DAYS - diffDays)));
      } else {
        setIsTrialActive(false);
        setHasTrialEnded(true);
        setTrialDaysLeft(0);
      }
    } else {
      setIsTrialActive(false);
      setHasTrialEnded(false);
      setTrialDaysLeft(0);
    }
  }, [trialStartDate]);

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified
        });

        const userDocRef = doc(db, "users", firebaseUser.uid);
        unsubscribeUserDoc = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setIsPremium(data.isPremium === true);
            setTrialStartDate(data.trialStartDate || null);
          } else {
            setDoc(userDocRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              isPremium: false,
              createdAt: new Date().toISOString()
            }, { merge: true });
          }
        });
      } else {
        setUser(null);
        setIsPremium(false);
        setTrialStartDate(null);
        if (unsubscribeUserDoc) unsubscribeUserDoc();
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      await sendEmailVerification(userCredential.user);
      
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        displayName,
        isPremium: false,
        createdAt: new Date().toISOString(),
        usage: { count: 0, date: new Date().toDateString() }
      });
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => signOut(auth);

  const subscribe = async () => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, { isPremium: true });
  };

  const startTrial = async () => {
    if (!user || trialStartDate) return;
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, { trialStartDate: new Date().toISOString() });
  };

  const sendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        isPremium, 
        isTrialActive,
        hasTrialEnded,
        hasPremiumAccess: isPremium || isTrialActive,
        trialDaysLeft,
        loading, 
        loginWithEmail, 
        signUp, 
        logout, 
        subscribe, 
        startTrial,
        error, 
        sendVerificationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
