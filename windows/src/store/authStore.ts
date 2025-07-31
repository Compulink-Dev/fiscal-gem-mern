// src/store/authStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface Tenant {
  _id: string;
  name: string;
  // Add other tenant properties as needed
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenant: string | Tenant; // Can be either string ID or full tenant object
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  token: string | null;
  lastLogin: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: {
      login: (credentials: { email: string; password: string }) => Promise<any>;
      logout: () => Promise<any>;
      checkAuth: () => Promise<any>;
      getAuthState: () => Promise<any>;
      onAuthStateChange: (callback: (event: any, authState: any) => void) => () => void;
    };
  }
}

export const useAuthStore = create<AuthState>()(
  immer((set, get) => ({
    user: null,
    isAuthenticated: false,
    loading: true, // Start with loading true
    error: null,
    token: null,
    lastLogin: null,
    
    initialize: async () => {
      try {
        const authState = await window.electronAPI.getAuthState();
        set({
          isAuthenticated: authState.isAuthenticated,
          user: authState.user,
          token: authState.token,
          lastLogin: authState.lastLogin,
          loading: false
        });
        
        // Listen for auth state changes
        window.electronAPI.onAuthStateChange((event, newAuthState) => {
          set({
            isAuthenticated: newAuthState.isAuthenticated,
            user: newAuthState.user,
            token: newAuthState.token,
            lastLogin: newAuthState.lastLogin
          });
        });
      } catch (error) {
        set({ 
          error: 'Failed to initialize auth state',
          loading: false 
        });
      }
    },
    
    login: async (email, password) => {
      set({ loading: true, error: null });
      try {
        const result = await window.electronAPI.login({ email, password });
        if (result.success) {
          set({ 
            isAuthenticated: true,
            user: result.user,
            token: result.token,
            loading: false 
          });
        } else {
          set({ 
            error: result.error || 'Login failed',
            loading: false 
          });
        }
      } catch (error) {
        set({ 
          error: 'An error occurred during login',
          loading: false 
        });
      }
    },
    
    logout: async () => {
      set({ loading: true });
      try {
        const result = await window.electronAPI.logout();
        if (result.success) {
          set({ 
            isAuthenticated: false,
            user: null,
            token: null,
            lastLogin: null,
            loading: false 
          });
        }
      } catch (error) {
        set({ 
          error: 'Logout failed',
          loading: false 
        });
      }
    },
    
    checkAuth: async () => {
      set({ loading: true });
      try {
        const result = await window.electronAPI.checkAuth();
        set({ 
          isAuthenticated: result.isAuthenticated,
          user: result.user || null,
          loading: false 
        });
      } catch (error) {
        set({ 
          isAuthenticated: false,
          user: null,
          loading: false 
        });
      }
    }
  }))
);