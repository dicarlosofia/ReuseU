// src/Context/GlobalContext.tsx
// Global context for user and app-wide state
// This context manages the user's authentication state, account data, and other app-wide settings.
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { accountsApi, AccountData } from '@/pages/api/accounts'

interface GlobalContextType {
  user: User | null
  account: AccountData | null
  loading: boolean
  error: string | null
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    school: string
    username: string
  }) => Promise<void>
  logout: () => Promise<void>
  filters: any
  setFilters: (filters: any) => void
  title: string
  setTitle: (title: string) => void
  listings: any[]
  setListings: (listings: any[]) => void
  requestPasswordReset: (email: string) => Promise<void>
  searchQuery: string
  setSearchQuery: (query: string) => void
}

const GlobalContext = createContext<GlobalContextType>({} as any)
export const useGlobalContext = () => useContext(GlobalContext)

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    categories: [],
    priceRanges: [],
    sortByFavorites: false,
  });
  const [title, setTitle] = useState<string>('');
  const [listings, setListings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        const token = await fbUser.getIdToken();
        try {
          const acct = await accountsApi.getAccount(fbUser.uid, token);
          setAccount(acct);
        } catch {
          setAccount(null);
        }
      } else {
        setAccount(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken();
      let acct: AccountData | null = null;
      try {
        acct = await accountsApi.getAccount(cred.user.uid, token)
      } catch (err: any) {
        // If not found, create backend account with minimal info
        if (cred.user) {
          const payload: AccountData = {
            UserID: cred.user.uid,
            First_Name: cred.user.displayName?.split(' ')[0] || '',
            Last_Name: cred.user.displayName?.split(' ')[1] || '',
            School: '',
            Username: cred.user.email?.split('@')[0] || cred.user.uid,
            dateTime_creation: new Date().toISOString(),
            email: cred.user.email || '',
            Pronouns: '',
            AboutMe: '',
          };
          acct = await accountsApi.createAccount(payload, token);
        } else {
          throw err;
        }
      }
      setAccount(acct)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const signUpWithEmail = async ({
    email,
    password,
    firstName,
    lastName,
    school,
    username,
  }: {
    email: string
    password: string
    firstName: string
    lastName: string
    school: string
    username: string
  }) => {
    setLoading(true)
    try {
      if (!email.endsWith('.edu')) {
        throw new Error('Please use a .edu email address')
      }

      // Firebase sign-up
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      const token = await cred.user.getIdToken()

      // Backend account creation
      const payload: AccountData = {
        UserID: cred.user.uid,
        First_Name: firstName,
        Last_Name: lastName,
        School: school,
        Username: username,
        dateTime_creation: new Date().toISOString(),
        email: email,
        Pronouns: "",
        AboutMe: "",
      }
      const acct = await accountsApi.createAccount(payload, token)
      setAccount(acct)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await firebaseSignOut(auth)
      setAccount(null)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Password reset
  const requestPasswordReset = async (email: string) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        user,
        account,
        loading,
        error,
        signInWithEmail,
        signUpWithEmail,
        logout,
        filters,
        setFilters,
        title,
        setTitle,
        listings,
        setListings,
        requestPasswordReset,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}
