import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const openFiscalDay = async (deviceID: number) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/fiscal/${deviceID}/open-day`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to open fiscal day');
  }
};

export const closeFiscalDay = async (deviceID: number) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/fiscal/${deviceID}/close-day`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to close fiscal day');
  }
};