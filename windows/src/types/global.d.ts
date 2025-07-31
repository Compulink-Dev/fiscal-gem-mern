// src/global.d.ts
export {};

declare global {
  interface Window {
    electronAPI: {
      login: (credentials: { email: string; password: string }) => Promise<any>;
      logout: () => Promise<any>;
      checkAuth: () => Promise<any>;
      getAuthState: () => Promise<any>;
      fetchInvoices: () => Promise<any>;
      onAuthStateChange: (callback: (event: any, authState: any) => void) => () => void;
    };
  }
}