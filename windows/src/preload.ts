// preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  login: (credentials: { email: string; password: string }) => 
  ipcRenderer.invoke('login', credentials),
  logout: () => ipcRenderer.invoke('logout'),
  checkAuth: () => ipcRenderer.invoke('check-auth'),
  getAuthState: () => ipcRenderer.invoke('get-auth-state'),
  fetchInvoices: () => ipcRenderer.invoke('fetchInvoices'),
  onAuthStateChange: (callback: (event: any, authState: any) => void) => {
    ipcRenderer.on('auth-state-changed', callback);
    return () => ipcRenderer.removeListener('auth-state-changed', callback);
  }
});