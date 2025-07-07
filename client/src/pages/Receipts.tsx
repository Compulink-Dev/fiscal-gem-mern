import { useState, useEffect } from "react";
import {
  Check,
  Search,
  Printer,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import api, { getReceiptsByTenant } from "@/services/api"; // ✅ Correct

interface Receipt {
  _id: string;
  receiptType: string;
  receiptCounter: number;
  receiptGlobalNo: number;
  invoiceNo: string;
  receiptDate: string;
  receiptTotal: number;
  receiptPayments: Array<{
    moneyTypeCode: string;
    paymentAmount: number;
  }>;
  receiptLines: Array<{
    receiptLineName: string;
    receiptLineQuantity: number;
    receiptLineTotal: number;
  }>;
}

const ReceiptContent = () => {
  const [activeTab, setActiveTab] = useState<"recent" | "all">("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  return (
    <div className="space-y-4">
      <ReceiptTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <ReceiptSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {activeTab === "recent" ? (
        <RecentReceiptsSection />
      ) : (
        <AllReceiptsSection
          searchQuery={searchQuery}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          setTotalPages={setTotalPages}
        />
      )}
    </div>
  );
};

const ReceiptTabs = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: "recent" | "all";
  setActiveTab: (tab: "recent" | "all") => void;
}) => {
  return (
    <div className="flex border-b">
      <button
        className={`px-4 py-2 font-medium ${
          activeTab === "recent"
            ? "border-b-2 border-primary text-primary"
            : "text-muted-foreground"
        }`}
        onClick={() => setActiveTab("recent")}
      >
        Recent Receipts
      </button>
      <button
        className={`px-4 py-2 font-medium ${
          activeTab === "all"
            ? "border-b-2 border-primary text-primary"
            : "text-muted-foreground"
        }`}
        onClick={() => setActiveTab("all")}
      >
        All Receipts
      </button>
    </div>
  );
};

const ReceiptSearch = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search receipts by invoice number..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Button variant="outline">
        <Printer className="mr-2 h-4 w-4" />
        Print Report
      </Button>
    </div>
  );
};

const RecentReceiptsSection = () => {
  const [recentReceipts, setRecentReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecentReceipts = async () => {
      try {
        if (!user?.tenant) {
          throw new Error("No tenant assigned to user");
        }

        // Ensure we pass the ID string, not the object
        const tenantId =
          typeof user.tenant === "object" ? user.tenant._id : user.tenant;

        const response = await getReceiptsByTenant(tenantId, {
          limit: 4,
          sort: "-receiptDate",
        });

        setRecentReceipts(response.data);
      } catch (err) {
        console.error("Failed to fetch recent receipts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentReceipts();
  }, [user?.tenant]);

  if (loading) {
    return (
      <div className="grid xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-full border p-4 rounded-lg animate-pulse h-64"
          />
        ))}
      </div>
    );
  }

  if (recentReceipts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recent receipts found
      </div>
    );
  }

  return (
    <div className="grid xl:grid-cols-4 gap-4">
      {recentReceipts.map((receipt) => (
        <ReceiptCard key={receipt._id} receipt={receipt} />
      ))}
    </div>
  );
};

const ReceiptCard = ({ receipt }: { receipt: Receipt }) => {
  const paymentMethod = receipt.receiptPayments[0]?.moneyTypeCode || "N/A";

  return (
    <div className="w-full border p-4 rounded-lg hover:shadow-md transition-shadow">
      <div className="space-y-4">
        <div className="flex flex-col gap-2 items-center justify-center">
          <div className="flex items-center justify-center bg-green-200 h-12 w-12 rounded-lg">
            <Check className="text-green-600" />
          </div>
          <Label className="font-medium">Receipt Fiscalized</Label>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Reference</Label>
            <Label className="font-medium">{receipt.invoiceNo}</Label>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Type</Label>
            <Badge
              variant={
                receipt.receiptType === "CreditNote" ? "destructive" : "default"
              }
            >
              {receipt.receiptType}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Date</Label>
            <Label className="font-medium">
              {format(new Date(receipt.receiptDate), "MMM dd, yyyy")}
            </Label>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Payment Method</Label>
            <Label className="font-medium">{paymentMethod}</Label>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Total</Label>
            <Label className="font-medium">
              ${receipt.receiptTotal.toFixed(2)}
            </Label>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1">
              <FileText className="mr-2 h-4 w-4" />
              View
            </Button>
            <Button className="flex-1">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AllReceiptsSection = ({
  searchQuery,
  currentPage,
  totalPages,
  setCurrentPage,
  setTotalPages, // Add this
}: {
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void; // Add this
}) => {
  const [allReceipts, setAllReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAllReceipts = async () => {
      try {
        if (!user?.tenant) {
          throw new Error("No tenant assigned to user");
        }

        // Ensure we pass the ID string, not the object
        const tenantId =
          typeof user.tenant === "object" ? user.tenant._id : user.tenant;

        const params = {
          page: currentPage,
          limit: 10,
          sort: "-receiptDate",
          search: searchQuery || undefined,
        };

        const response = await api.get(`/receipts/tenant/${tenantId}`, {
          params,
        });
        setAllReceipts(response.data.data);
        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        console.error("Failed to fetch all receipts:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchAllReceipts();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [user?.tenant, currentPage, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell
                    className="animate-pulse bg-muted/50 h-12"
                    colSpan={6}
                  />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (allReceipts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No receipts found {searchQuery && `matching "${searchQuery}"`}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allReceipts.map((receipt) => (
              <TableRow key={receipt._id}>
                <TableCell className="font-medium">
                  {receipt.invoiceNo}
                </TableCell>
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
                <TableCell>
                  {format(new Date(receipt.receiptDate), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  {receipt.receiptPayments[0]?.moneyTypeCode || "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  ${receipt.receiptTotal.toFixed(2)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

function Receipts() {
  return (
    <DashboardLayout>
      <ReceiptContent />
    </DashboardLayout>
  );
}

export default Receipts;
