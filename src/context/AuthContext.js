import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const USERS_KEY = 'dp_users';
const SESSION_KEY = 'dp_session';

const defaultUsers = [
  {
    id: 'u-001',
    name: 'Demo Manager',
    email: 'demo@dpmem.com',
    password: 'demo123',
  },
];

const readStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
};

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => readStorage(USERS_KEY, defaultUsers));
  const [currentUser, setCurrentUser] = useState(() => readStorage(SESSION_KEY, null));

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [currentUser]);

  const register = useCallback(
    ({ name, email, password }) => {
      const normalizedEmail = email.toLowerCase().trim();
      const exists = users.some((user) => user.email.toLowerCase() === normalizedEmail);

      if (exists) {
        return { ok: false, message: 'A user with this email already exists.' };
      }

      const newUser = {
        id: `u-${Date.now()}`,
        name: name.trim(),
        email: normalizedEmail,
        password,
      };

      setUsers((prev) => [...prev, newUser]);
      setCurrentUser({ id: newUser.id, name: newUser.name, email: newUser.email });

      return { ok: true };
    },
    [users]
  );

  const login = useCallback(
    ({ email, password }) => {
      const normalizedEmail = email.toLowerCase().trim();
      const found = users.find(
        (user) => user.email.toLowerCase() === normalizedEmail && user.password === password
      );

      if (!found) {
        return { ok: false, message: 'Incorrect email or password.' };
      }

      setCurrentUser({ id: found.id, name: found.name, email: found.email });
      return { ok: true };
    },
    [users]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const updateProfile = useCallback(
    ({ name }) => {
      if (!currentUser) return;

      const trimmedName = name.trim();

      setUsers((prev) =>
        prev.map((user) =>
          user.id === currentUser.id
            ? {
                ...user,
                name: trimmedName,
              }
            : user
        )
      );

      setCurrentUser((prev) => (prev ? { ...prev, name: trimmedName } : null));
    },
    [currentUser]
  );

  const value = useMemo(
    () => ({
      users,
      currentUser,
      isAuthenticated: Boolean(currentUser),
      register,
      login,
      logout,
      updateProfile,
    }),
    [users, currentUser, register, login, logout, updateProfile]
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