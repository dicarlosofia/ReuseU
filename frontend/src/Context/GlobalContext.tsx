import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import Listing from '@/components/Listings/Listing'

interface GlobalContextType {
  // Authentication
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  // Existing state
  filters: any;
  setFilters: (filters: any) => void;
  title: string;
  setTitle: (title: string) => void;
  listings: any[];
  setListings: (listings: any[]) => void;
}

const GlobalContext = createContext<GlobalContextType>({
  // Authentication defaults
  user: null,
  loading: true,
  error: null,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  logout: async () => {},
  // Existing defaults
  filters: {},
  setFilters: () => {},
  title: '',
  setTitle: () => {},
  listings: [],
  setListings: () => {},
});

export const useGlobalContext = () => useContext(GlobalContext);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Existing state
  const [filters, setFilters] = useState({});
  const [title, setTitle] = useState<string>('');
  const [listings, setListings] = useState<Array<any>>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      if (!email.endsWith('.edu')) {
        throw new Error('Please use a .edu email address');
      }
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        // Authentication
        user,
        loading,
        error,
        signInWithEmail,
        signUpWithEmail,
        logout,
        // Existing state
        filters,
        setFilters,
        title,
        setTitle,
        listings,
        setListings,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};