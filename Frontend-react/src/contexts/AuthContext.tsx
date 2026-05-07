// @ts-nocheck
import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, RegisterData } from '@/types';
import { api, endpoints } from '@/services/api';

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'LOGOUT':
      return { ...initialState, isLoading: false, token: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// Context
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const user = JSON.parse(savedUser) as User;
          dispatch({ type: 'SET_USER', payload: { user, token } });
          
          // Optionally verify token with backend
          try {
            const freshUser = await api.get<User>(endpoints.me);
            localStorage.setItem('user', JSON.stringify(freshUser));
            dispatch({ type: 'SET_USER', payload: { user: freshUser, token } });
          } catch (e) {
            console.error('Failed to refresh user data', e);
            // If 401, the interceptor will handle it
          }
        } catch {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  // Refresh user data
  const refreshUser = async () => {
    try {
      const user = await api.get<User>(endpoints.me);
      const token = localStorage.getItem('auth_token') || '';
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'SET_USER', payload: { user, token } });
    } catch (error: any) {
      console.error('Refresh user error:', error);
    }
  };

  // Real login
  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const response = await api.post<{ access: string; refresh: string }>(endpoints.login, credentials);
      const { access, refresh } = response;
      localStorage.setItem('auth_token', access);
      localStorage.setItem('refresh_token', refresh);

      const user = await api.get<User>(endpoints.me);
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'SET_USER', payload: { user, token: access } });
    } catch (error: any) {
      let message = 'Identifiants invalides ou erreur serveur';
      if (!error.response) {
        message = 'Le serveur démarre, veuillez patienter 30 secondes et réessayer…';
      } else if (error.response.status === 401) {
        message = 'Email ou mot de passe incorrect';
      } else if (error.response.status === 404) {
        message = 'Endpoint de connexion non trouvé (404)';
      } else {
        message = error.response.data?.detail || error.response.data?.message || `Erreur serveur (${error.response.status})`;
      }
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  // Real register
  const register = async (data: RegisterData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      await api.post<User>(endpoints.register, data);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error: any) {
      // Extraire le message d'erreur le plus pertinent
      const responseData = error.response?.data;
      let message = 'Erreur lors de l\'inscription';
      if (responseData) {
        if (typeof responseData === 'string') {
          message = responseData;
        } else if (responseData.error) {
          message = responseData.error;
        } else if (responseData.detail) {
          message = responseData.detail;
        } else {
          // Prendre la première erreur de champ
          const firstKey = Object.keys(responseData)[0];
          if (firstKey) {
            const val = responseData[firstKey];
            message = `${firstKey} : ${Array.isArray(val) ? val[0] : val}`;
          }
        }
      }
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error; // Propager pour que RegisterPage puisse lire error.response.data
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
