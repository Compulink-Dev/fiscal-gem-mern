// components/Receipts/RecentReceipts.tsx
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

interface Receipt {
  _id: string;
  receiptType: string;
  receiptCounter: number;
  receiptGlobalNo: number;
  invoiceNo: string;
  receiptDate: string;
  receiptTotal: number;
  receiptLines: Array<{
    receiptLineName: string;
    receiptLineQuantity: number;
    receiptLineTotal: number;
  }>;
}

export default function RecentReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        if (!user?.tenant) {
          throw new Error('Tenant information not available');
        }

        // Handle both string and object tenant cases
        const tenantId = typeof user.tenant === 'object' ? 
                         (user.tenant as any)._id : 
                         user.tenant;

        setLoading(true);
        const response = await api.get(`/receipts/tenant/${tenantId}?limit=5&sort=-receiptDate`);
        
        if (response.data.success) {
          setReceipts(response.data.data);
        } else {
          setError(response.data.message || 'Failed to load recent receipts');
        }
      } catch (err: any) {
        console.error('Failed to fetch receipts:', err);
        setError(err.response?.data?.message || 'Failed to load recent receipts');
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, [user?.tenant]);

  if (loading) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Recent Receipts</h3>
        <div className="flex justify-center py-4">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="title">Recent Receipts</h3>
        <div className="text-red-500 py-4" style={{color: "red", fontSize: "12px"}}>{error}</div>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="title">Recent Receipts</h3>
        <div className="text-gray-500 py-4">No receipts found</div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="title">Recent Receipts</h3>
      <div className="space-y-3">
        {receipts.map((receipt) => (
          <div key={receipt._id} className="p-3 border rounded hover:bg-gray-50">
            <div className="flex justify-between">
              <span className="font-medium">#{receipt.receiptCounter}</span>
              <span className="text-sm text-gray-500">
                {format(new Date(receipt.receiptDate), 'PPpp')}
              </span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-sm">{receipt.receiptType}</span>
              <span className="font-medium">${receipt.receiptTotal.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}