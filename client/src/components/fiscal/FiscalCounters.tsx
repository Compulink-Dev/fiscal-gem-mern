// components/Fiscal/FiscalCounters.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import api from "@/services/api";

interface FiscalCounter {
  _id: string;
  fiscalCounterType: string;
  fiscalCounterCurrency: string;
  fiscalCounterValue: number;
  fiscalCounterTaxAmountValue?: number;
  fiscalCounterTaxPercent?: number;
}

export default function FiscalCounters({
  deviceID,
  fiscalDayNo,
  status,
}: {
  deviceID: number;
  fiscalDayNo: number;
  status: string;
}) {
  const [counters, setCounters] = useState<FiscalCounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCounters = async () => {
      try {
        const response = await api.get(
          `/fiscal/${deviceID}/counters?fiscalDayNo=${fiscalDayNo}`
        );
        setCounters(response.data.data);
      } catch (err) {
        console.error("Failed to fetch fiscal counters:", err);
        setError("Failed to load fiscal counters");
      } finally {
        setLoading(false);
      }
    };

    if (status !== "FiscalDayClosed" && fiscalDayNo) {
      fetchCounters();
    } else {
      setLoading(false);
    }
  }, [deviceID, fiscalDayNo, status]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fiscal Counters</CardTitle>
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
          <CardTitle>Fiscal Counters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (status === "FiscalDayClosed") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fiscal Counters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            Fiscal day is closed. Counters not available.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (counters.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fiscal Counters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            No counters found for current fiscal day
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fiscal Counters (Day #{fiscalDayNo})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Tax %</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Tax Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {counters.map((counter) => (
              <TableRow key={counter._id}>
                <TableCell>
                  <Badge variant="outline">{counter.fiscalCounterType}</Badge>
                </TableCell>
                <TableCell>{counter.fiscalCounterCurrency}</TableCell>
                <TableCell>
                  {counter.fiscalCounterTaxPercent
                    ? `${counter.fiscalCounterTaxPercent}%`
                    : "N/A"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {counter.fiscalCounterValue.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {counter.fiscalCounterTaxAmountValue
                    ? counter.fiscalCounterTaxAmountValue.toFixed(2)
                    : "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
