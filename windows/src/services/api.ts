import axios, { AxiosInstance } from 'axios';

const isElectron = typeof window !== 'undefined' && window.electronAPI;

const API_URL="http://localhost:5000"
const API_URLS="https://fiscal-gem-mern.onrender.com"

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

api.interceptors.request.use(async (config) => {
  if (isElectron) {
    try {
      const authState = await window.electronAPI.getAuthState();
      if (authState?.token) {
        config.headers.Authorization = `Bearer ${authState.token}`;
      }
    } catch (error) {
      console.error('Failed to get auth state:', error);
    }
  } else {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      if (isElectron) {
        window.electronAPI.logout();
      } else {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password })

export const register = (userData: {
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
  tenant: string
}) => api.post('/auth/register', userData)

export const getCurrentUser = () => api.get('/auth/me')

// Device API
export const registerDevice = (deviceData: any) => api.post('/api/devices/register', deviceData)

export const getDeviceStatus = (deviceID: string) => api.get(`/api/devices/${deviceID}/status`)

export const getDeviceConfig = (deviceID: string) => api.get(`/api/devices/${deviceID}/config`)

// Fiscal API
export const openFiscalDay = (deviceID: string) => api.post(`/api/fiscal/${deviceID}/open-day`)

export const closeFiscalDay = (deviceID: string) => api.post(`/api/fiscal/${deviceID}/close-day`)

// Receipts API
export const submitReceipt = (deviceID: string, receiptData: any) =>
  api.post('/api/receipts/submit', { deviceID, receiptData })

export const getReceipts = (deviceID: string) => api.get(`/api/receipts/device/${deviceID}`)

export const getReceiptsByTenant = async (tenantID: string | { _id: string }, params = {}) => {
  try {
    const id = typeof tenantID === 'object' ? tenantID._id : tenantID
    const response = await api.get(`/api/receipts/tenant/${id}`, { params })

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch receipts')
    }

    return {
      data: response.data.data,
      totalPages: response.data.totalPages,
      currentPage: response.data.currentPage
    }
  } catch (error: any) {
    console.error('API Error:', error)
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch receipts')
  }
}

export default api
