// components/Receipts/RecentReceipts.tsx
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

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
  const { user } = useAuth();

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const tenantId = user?.tenant?._id;
        if (!tenantId) {
          throw new Error("Tenant information not available");
        }

        setLoading(true);
        const response = await api.get(
          `/receipts/tenant/${tenantId}?limit=5&sort=-receiptDate`
        );
        if (response.data.success) {
          setReceipts(response.data.data);
        } else {
          setError(response.data.message || "Failed to load recent receipts");
        }
      } catch (err: any) {
        console.error("Failed to fetch receipts:", err);
        setError(
          err.response?.data?.message || "Failed to load recent receipts"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, [user?.tenant?._id]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Receipts</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (receipts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">No receipts found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Receipts</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.map((receipt) => (
              <TableRow key={receipt._id}>
                <TableCell>
                  <Badge
                    variant={
                      receipt.receiptType === "CreditNote"
                        ? "destructive"
                        : "default"
                    }
                  >
                    {receipt.receiptType}
                  </Badge>
                </TableCell>
                <TableCell>{receipt.invoiceNo}</TableCell>
                <TableCell>
                  {format(new Date(receipt.receiptDate), "MMM dd, yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  {receipt.receiptLines.slice(0, 2).map((line) => (
                    <div key={line.receiptLineName}>
                      {line.receiptLineName} (x{line.receiptLineQuantity})
                    </div>
                  ))}
                  {receipt.receiptLines.length > 2 && (
                    <div className="text-muted-foreground">
                      +{receipt.receiptLines.length - 2} more
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${receipt.receiptTotal.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
