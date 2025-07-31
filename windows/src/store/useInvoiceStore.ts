// src/store/useInvoiceStore.ts
import { create } from 'zustand';

type InvoiceItem = {
  lineNo: number;
  partNumber: string;
  description: string;
  quantity: number;
  priceEach: number;
  totalLineAmount: number;
};

type Invoice = {
  invoiceID: string;
  customer: string;
  date: string;
  total: number;
  items: InvoiceItem[];
};

type InvoiceStore = {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  fetchInvoices: () => Promise<void>;
};

export const useInvoiceStore = create<InvoiceStore>((set) => ({
  invoices: [],
  loading: false,
  error: null,

  fetchInvoices: async () => {
    set({ loading: true, error: null });

    try {
      //@ts-ignore
      if (!window.electronAPI?.fetchInvoices) {
        throw new Error('Electron API not available');
      }

      //@ts-ignore
      const response = await window.electronAPI.fetchInvoices();

      if (response.success) {
        set({ invoices: response.data || [] });
      } else {
        set({ error: response.error || 'Failed to fetch invoices' });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ loading: false });
    }
  },
}));