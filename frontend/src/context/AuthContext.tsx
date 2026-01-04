import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { DEMO_USER, DEFAULT_DEMO_ROLE } from '../config/demoConfig';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  licensePlate?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  authenticateUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem('token');
    if (tokenFromStorage) {
      setToken(tokenFromStorage);
      authenticateUser();
    } else {
      // In demo mode, set a demo user
      setUser(DEMO_USER[DEFAULT_DEMO_ROLE as keyof typeof DEMO_USER]);
      setLoading(false);
    }
  }, []);

  const authenticateUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    // Demo mode: set demo user directly
    setUser(DEMO_USER[DEFAULT_DEMO_ROLE as keyof typeof DEMO_USER]);
    
    // Set auth token header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    // Demo mode: bypass actual login
    const demoToken = 'demo_token_for_testing';
    
    // Use the demo user based on the default role
    const demoUser = {
      ...DEMO_USER[DEFAULT_DEMO_ROLE as keyof typeof DEMO_USER],
      email: email  // Override email with the one provided
    };
    
    localStorage.setItem('token', demoToken);
    setToken(demoToken);
    setUser(demoUser);
    axios.defaults.headers.common['Authorization'] = `Bearer ${demoToken}`;
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    // Demo mode: bypass actual registration
    const demoToken = 'demo_token_for_testing';
    
    // Use the appropriate demo user based on the role
    const demoUser = {
      ...DEMO_USER[role as keyof typeof DEMO_USER] || DEMO_USER[DEFAULT_DEMO_ROLE as keyof typeof DEMO_USER],
      name: name,
      email: email
    };
    
    localStorage.setItem('token', demoToken);
    setToken(demoToken);
    setUser(demoUser);
    axios.defaults.headers.common['Authorization'] = `Bearer ${demoToken}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    authenticateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};