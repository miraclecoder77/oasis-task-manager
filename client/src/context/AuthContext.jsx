import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth.js';
import {
  ApiError,
  clearToken,
  getToken,
  setToken,
  setUnauthorizedHandler,
} from '../api/client.js';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  // 'checking' until the stored token has been validated, so ProtectedRoute
  // does not bounce a signed-in user to /login on a refresh.
  const [status, setStatus] = useState('checking');

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setStatus('anonymous');
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  const restoreSession = useCallback(async () => {
    if (!getToken()) {
      setStatus('anonymous');
      return;
    }

    setStatus('checking');

    try {
      const { user: currentUser } = await authApi.fetchCurrentUser();
      setUser(currentUser);
      setStatus('authenticated');
    } catch (error) {
      // Only a rejected token means the session is over. An unreachable API is
      // a transient failure, and signing the user out would discard a token
      // that is still valid.
      if (error instanceof ApiError && error.status === 401) {
        setUser(null);
        setStatus('anonymous');
      } else {
        setStatus('error');
      }
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (email, password) => {
    const { token, user: loggedInUser } = await authApi.login(email, password);
    setToken(token);
    setUser(loggedInUser);
    setStatus('authenticated');
    return loggedInUser;
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      isChecking: status === 'checking',
      hasSessionError: status === 'error',
      retrySession: restoreSession,
      login,
      logout,
    }),
    [user, status, restoreSession, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
