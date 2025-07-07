import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const submitReceipt = async (deviceID: number, receiptData: any) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/receipts/submit`, {
      deviceID,
      receiptData
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to submit receipt');
  }
};

export const getReceipts = async (deviceID: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/receipts/${deviceID}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get receipts');
  }
};