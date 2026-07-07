import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";

export type UserRole = "STUDENT" | "HIRING_MANAGER";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get<User>("/auth/me");
      setUser(response.data);
      setToken(currentToken);
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post<{ access_token: string }>("/auth/login", {
        email,
        password,
      });
      const jwtToken = response.data.access_token;
      localStorage.setItem("token", jwtToken);
      setToken(jwtToken);
      
      // Fetch user profile info
      const userRes = await api.get<User>("/auth/me");
      setUser(userRes.data);
    } catch (error) {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, role: UserRole) => {
    setLoading(true);
    try {
      // Register request
      await api.post<User>("/auth/register", {
        email,
        password,
        role,
      });
      // Auto-login after registration
      await login(email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
