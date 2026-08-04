import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  loadAuthSession,
  saveAuthSession,
  clearAuthSession,
} from '../api/authStorage';
import { loginUser, registerUser, fetchCurrentUser } from '../api/authApi';
import { isApiEnabled } from '../api/config';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { token, user: savedUser } = await loadAuthSession();

      if (token && savedUser && isApiEnabled()) {
        try {
          const timeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Session check timed out')), 8000);
          });
          const { user: currentUser } = await Promise.race([
            fetchCurrentUser(),
            timeout,
          ]);
          setUser(currentUser);
        } catch {
          await clearAuthSession();
          setUser(null);
        }
      }

      setIsAuthReady(true);
    })();
  }, []);

  const signIn = useCallback(async (email, password) => {
    setIsSubmitting(true);
    try {
      const { token, user: nextUser } = await loginUser({ email, password });
      await saveAuthSession({ token, user: nextUser });
      setUser(nextUser);
      return nextUser;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const signUp = useCallback(async (email, password, name) => {
    setIsSubmitting(true);
    try {
      const { token, user: nextUser } = await registerUser({ email, password, name });
      await saveAuthSession({ token, user: nextUser });
      setUser(nextUser);
      return nextUser;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await clearAuthSession();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: Boolean(user),
      isAuthReady,
      isSubmitting,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
