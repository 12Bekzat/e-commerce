import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest, getStoredToken, setStoredToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(getStoredToken()));

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      if (!getStoredToken()) {
        setIsLoading(false);
        return;
      }

      try {
        const user = await apiRequest('/auth/me');
        if (active) setCurrentUser(user);
      } catch (error) {
        setStoredToken(null);
        if (active) setCurrentUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const register = useCallback(
    async ({ name, email, password }) => {
      try {
        const response = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        });
        setStoredToken(response.token);
        setCurrentUser(response.user);
        return { ok: true };
      } catch (error) {
        return { ok: false, message: error.message };
      }
    },
    []
  );

  const login = useCallback(
    async ({ email, password }) => {
      try {
        const response = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        setStoredToken(response.token);
        setCurrentUser(response.user);
        return { ok: true };
      } catch (error) {
        return { ok: false, message: error.message };
      }
    },
    []
  );

  const logout = useCallback(() => {
    setStoredToken(null);
    setCurrentUser(null);
  }, []);

  const updateProfile = useCallback(
    async ({ name }) => {
      if (!currentUser) return;

      const user = await apiRequest('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      });
      setCurrentUser(user);
    },
    [currentUser]
  );

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      isLoading,
      register,
      login,
      logout,
      updateProfile,
    }),
    [currentUser, isLoading, register, login, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
