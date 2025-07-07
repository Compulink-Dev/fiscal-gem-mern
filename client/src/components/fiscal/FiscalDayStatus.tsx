import { useState, useEffect } from "react";
import { Power, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { openFiscalDay, closeFiscalDay } from "@/services/api";

interface FiscalDayDetailsProps {
  status: string;
  lastFiscalDay: number;
  receiptCounter: number;
  globalNo: number;
  date: string;
}

const FiscalDayStatus = ({
  status,
  receiptCounter,
  lastFiscalDay,
  globalNo,
  date,
}: FiscalDayDetailsProps) => {
  const [isFiscalDayOpen, setIsFiscalDayOpen] = useState(
    status === "FiscalDayOpened"
  );
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const deviceID = 19034;

  useEffect(() => {
    setIsFiscalDayOpen(status === "FiscalDayOpened");
    setCurrentStatus(status);
  }, [status]);

  const toggleFiscalDay = async () => {
    if (!deviceID) return;
    setLoading(true);

    try {
      if (isFiscalDayOpen) {
        await closeFiscalDay(deviceID);
        setIsFiscalDayOpen(false);
        setCurrentStatus("FiscalDayClosed");
      } else {
        await openFiscalDay(deviceID);
        setIsFiscalDayOpen(true);
        setCurrentStatus("FiscalDayOpened");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded-lg md:col-span-2 space-y-4 bg-white shadow">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-bold">Fiscal Day</Label>
        <Button
          onClick={toggleFiscalDay}
          variant="ghost"
          disabled={loading}
          className={`p-2 rounded-full ${
            isFiscalDayOpen
              ? "bg-red-500 hover:bg-red-200"
              : "bg-green-500 hover:bg-green-200"
          }`}
        >
          <Power
            className={`w-5 h-5 ${
              isFiscalDayOpen ? "text-black" : "text-white"
            }`}
          />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full border p-2 flex items-center justify-center font-bold">
          {lastFiscalDay}
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <Label className="text-xs">{date}</Label>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label>Receipt Counter</Label>
        <div className="w-12 h-12 text-xs rounded-lg border border-green-600 text-green-600 p-2 flex items-center justify-center font-bold">
          {receiptCounter}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label>Global No</Label>
        <div className="w-12 h-12 text-xs rounded-lg border border-blue-900 text-blue-900 p-2 flex items-center justify-center font-bold">
          {globalNo}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label>Status</Label>
        <div
          className={`text-xs rounded-lg p-2 flex items-center justify-center font-bold ${
            isFiscalDayOpen
              ? "bg-green-300 text-green-900"
              : "bg-red-300 text-red-900"
          }`}
        >
          {currentStatus}
        </div>
      </div>
    </div>
  );
};

export default FiscalDayStatus;
