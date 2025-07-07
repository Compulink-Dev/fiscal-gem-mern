import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const registerDevice = async (deviceData: any) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/devices/register`, deviceData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to register device');
  }
};

export const getDeviceStatus = async (deviceID: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/devices/${deviceID}/status`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get device status');
  }
};

export const getDeviceConfig = async (deviceID: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/devices/${deviceID}/config`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get device config');
  }
};