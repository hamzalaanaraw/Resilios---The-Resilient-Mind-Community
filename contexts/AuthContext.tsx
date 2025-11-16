
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isPremium: boolean;
  login: () => void;
  logout: () => void;
  subscribe: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = () => {
    // In a real app, this would involve a call to Firebase Auth
    // and then setting the user object from the response.
    setUser({
      id: 'demo-user-123',
      email: 'user@example.com',
      isPremium: false,
    });
  };

  const logout = () => {
    // In a real app, this would call Firebase's signOut() method.
    setUser(null);
  };

  const subscribe = () => {
    // This simulates a successful payment and updates the user's status.
    // In a real app, this state would be derived from a user's subscription
    // status in Firestore, updated via a backend webhook.
    if (user) {
      setUser({ ...user, isPremium: true });
    }
  };

  const isPremium = user ? user.isPremium : false;

  return (
    <AuthContext.Provider value={{ user, isPremium, login, logout, subscribe }}>
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
