
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { User } from '../types';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleAuthError = (err: any) => {
      console.error("Firebase Auth Error:", err);
      let message = 'An unexpected error occurred. Please try again later.';
      switch (err.code) {
        // Google Sign-In specific
        case 'auth/unauthorized-domain':
          const hostname = window.location.hostname;
          message = `This domain (${hostname}) is not authorized for sign-in. Please add it to your Firebase project's "Authorized domains" list.`;
          break;
        case 'auth/popup-closed-by-user':
        case 'auth/cancelled-popup-request':
          message = 'Sign-in cancelled. Please try again.';
          break;
        case 'auth/popup-blocked':
          message = 'Pop-up blocked. Please allow pop-ups for this site to sign in.';
          break;
        
        // Email/Password specific
        case 'auth/email-already-in-use':
          message = 'An account already exists with this email address.';
          break;
        case 'auth/invalid-email':
          message = 'The email address is not valid.';
          break;
        case 'auth/weak-password':
          message = 'The password is too weak. It must be at least 6 characters.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          message = 'Invalid email or password. Please try again.';
          break;

        // General errors
        case 'auth/configuration-not-found':
          message = 'Sign-in provider is not configured. Please check your Firebase project settings.';
          break;
        case 'auth/api-key-not-valid':
             message = 'The API Key is invalid. Please check your firebase/config.ts file.';
             break;
      }
      setError(message);
      setLoading(false);
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      handleAuthError(err);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      handleAuthError(err);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
      setLoading(true);
      setError(null);
      if (!displayName.trim()) {
        setError("Display name cannot be empty.");
        setLoading(false);
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
            await updateProfile(userCredential.user, { displayName });
            // This is needed to make the displayName available immediately after sign up
            // as onAuthStateChanged can be slightly delayed.
            const firebaseUser = userCredential.user;
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            });
        }
      } catch (err: any) {
          handleAuthError(err);
      }
  };
  
  const signUpForTrial = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    setError(null);
    if (!displayName.trim()) {
      setError("Display name cannot be empty.");
      setLoading(false);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
          const firebaseUser = userCredential.user;
          await updateProfile(firebaseUser, { displayName });
          
          // Grant premium status for the trial
          localStorage.setItem(`premium_${firebaseUser.uid}`, 'true');
          setIsPremium(true);

          // This is needed to make the displayName available immediately after sign up
          // as onAuthStateChanged can be slightly delayed.
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
      }
    } catch (err: any) {
        handleAuthError(err);
    } finally {
        // We manually set the user, so we can also manually stop loading
        // to provide a faster UI transition.
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
    if (user) {
      localStorage.setItem(`premium_${user.uid}`, 'true');
      setIsPremium(true);
    }
  };
  
  if (loading && !user) {
    return (
        <div className="flex items-center justify-center h-screen bg-sky-50">
            <div className="text-center">
                <p className="text-slate-600">Initializing...</p>
            </div>
        </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isPremium, loading, loginWithGoogle, loginWithEmail, signUp, signUpForTrial, logout, subscribe, error }}>
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
