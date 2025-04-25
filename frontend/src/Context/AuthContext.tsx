import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  jwtToken: string | null;
  loading: boolean;
  error: string | null;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  jwtToken: null,
  loading: true,
  error: null,
});

// Create a custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          // Get Firebase ID token
          const firebaseToken = await user.getIdToken();
          
          // Exchange Firebase token for JWT
          const response = await fetch('http://localhost:5000/api/auth/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firebase_token: firebaseToken }),
          });

          if (!response.ok) {
            throw new Error('Failed to get JWT token');
          }

          const data = await response.json();
          setJwtToken(data.token);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setJwtToken(null);
        }
      } else {
        setJwtToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    jwtToken,
    loading,
    error,
  }), [user, jwtToken, loading, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 