import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});
// Request interceptor to add token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., redirect to login)
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const login = (email: string, password: string) => 
// If you're using axios
api.post("/auth/login", { email, password }, { withCredentials: true });

export const register = (userData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  tenant: string;
}) => api.post('/auth/register', userData);

export const getCurrentUser = () => api.get('/auth/me');


// Device API
export const registerDevice = (deviceData: any) => api.post('/devices/register', deviceData);
export const getDeviceStatus = (deviceID: any) => api.get(`/devices/${deviceID}/status`);
export const getDeviceConfig = (deviceID: any) => api.get(`/devices/${deviceID}/config`);

// Fiscal API
export const openFiscalDay = (deviceID: any) => api.post(`/fiscal/${deviceID}/open-day`);
export const closeFiscalDay = (deviceID: any) => api.post(`/fiscal/${deviceID}/close-day`);

// Receipts API
export const submitReceipt = (deviceID: any, receiptData: any) => api.post('/receipts/submit', { deviceID, receiptData });
export const getReceipts = (deviceID: string) => api.get(`/receipts/device/${deviceID}`);
// services/api.ts
// In services/api.ts
export const getReceiptsByTenant = async (
  tenantID: string | { _id: string }, 
  params = {}
) => {
  try {
    const id = typeof tenantID === 'object' ? tenantID._id : tenantID;
    const response = await api.get(`/receipts/tenant/${id}`, { params });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch receipts');
    }

    return {
      data: response.data.data,
      totalPages: response.data.totalPages,
      currentPage: response.data.currentPage
    };
  } catch (error: any) {
    console.error('API Error:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to fetch receipts'
    );
  }
};
export default api;