import React, { createContext, useContext, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router";
import { AxiosError } from "axios";

// types/auth.d.ts
export interface Tenant {
  _id: string;
  name: string;
  address?: {
    province: string;
    city: string;
    street: string;
    houseNo: string;
  };
  contacts?: {
    phoneNo: string;
    email: string;
  };
  // other tenant properties
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenant: Tenant; // Always expect a Tenant object now
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    tenant: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data; // Now matches backend response

      setToken(token);
      setUser(user); // Directly use the user object from response
      localStorage.setItem("token", token);

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Login failed. Please check your credentials and try again."
      );
    }
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    tenant: string;
  }) => {
    try {
      const response = await api.post("/auth/register", userData);
      const { token, data } = response.data;

      setToken(token);
      setUser(data.user);
      localStorage.setItem("token", token);

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      navigate("/dashboard");
    } catch (error) {
      const err = error as AxiosError;
      //@ts-ignore
      throw new Error(err.response?.data?.message || "Registration failed");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    navigate("/login");
  };

  // Check for existing token on initial load
  React.useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      // You might want to verify the token and fetch user data here
    }
  }, []);

  React.useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      setLoading(true);

      if (storedToken) {
        try {
          // Set auth header
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${storedToken}`;

          // Fetch user data
          const response = await api.get("/auth/me");

          // Update state with user data
          setUser(response.data.data);
          setToken(storedToken);
        } catch (error) {
          setLoading(false);
          console.error("Auth initialization error:", error);
          logout();
        }
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
