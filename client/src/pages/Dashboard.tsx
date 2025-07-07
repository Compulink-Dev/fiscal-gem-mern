import { useState, useEffect } from "react";
import api, { getDeviceStatus, getDeviceConfig } from "../services/api";
// import RecentReceipts from "../components/Receipts/RecentReceipts";
// import FiscalCounters from "../components/Fiscal/FiscalCounters";
import FiscalDayStatus from "../components/fiscal/FiscalDayStatus";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Loader } from "lucide-react";
import TaxpayerInfo from "@/components/fiscal/TaxpayerInfo";
import RecentReceipts from "@/components/fiscal/RecentReceipts.";
import FiscalCounters from "@/components/fiscal/FiscalCounters";
import { Link, useNavigate } from "react-router";

function Dashboard() {
  const [device, setDevice] = useState<any>(null);
  const [taxpayer, setTaxpayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const deviceID = localStorage.getItem("deviceID");
  const deviceID = 19034;

  const navigate = useNavigate();
  const { user } = useAuth();

  console.log("User details : ", user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch device data
        const [status, config] = await Promise.all([
          getDeviceStatus(deviceID),
          getDeviceConfig(deviceID),
        ]);

        // Fetch taxpayer data - ensure user.tenant is a string
        if (user?.tenant) {
          try {
            const taxpayerId =
              typeof user.tenant === "object" && user.tenant !== null
                ? (user.tenant as { _id: string })._id
                : (user.tenant as string);
            const taxpayerResponse = await api.get(
              `/taxpayer/id/${taxpayerId}`
            );
            setTaxpayer(taxpayerResponse.data.data);
          } catch (taxpayerError) {
            console.error("Failed to fetch taxpayer:", taxpayerError);
            setError("Failed to load taxpayer information");
          }
        }

        setDevice({
          ...status.data,
          ...config.data,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load device data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deviceID, user?.tenant]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="h-screen w-screen bg-green-300 flex items-center justify-center">
        <Loader className="animate-spin" size={48} />
        <Link to={"/login"}>Login</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p className="">Loading</p>
          <Loader className="animate-spin" size={48} />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-4 text-red-500">{error}</div>
      </DashboardLayout>
    );
  }

  if (!device) {
    return (
      <DashboardLayout>
        <div className="p-4">Device not found</div>
      </DashboardLayout>
    );
  }

  console.log("Device details :", device);

  if (loading) return <div>Loading...</div>;
  if (!deviceID) return <div>Device not found</div>;

  return (
    <DashboardLayout>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <FiscalDayStatus
            status={device.fiscalDayStatus}
            receiptCounter={device.lastReceiptCounter}
            lastFiscalDay={device.lastFiscalDayNo}
            globalNo={device.lastReceiptGlobalNo}
            date={new Date().toLocaleDateString()}
          />
          {taxpayer ? (
            <TaxpayerInfo
              name={taxpayer.name}
              tin={taxpayer.tin}
              branch={device.deviceBranchName || "N/A"}
              address={
                taxpayer.address || {
                  province: "N/A",
                  city: "N/A",
                  street: "N/A",
                  houseNo: "N/A",
                }
              }
              contacts={
                taxpayer.contacts || {
                  phoneNo: "N/A",
                  email: "N/A",
                }
              }
              vatNumber={taxpayer.vatNumber || "N/A"}
            />
          ) : (
            <div className="border p-4 rounded-lg md:col-span-3">
              <div className="text-lg font-bold mb-4">Tax Payer Details</div>
              <div className="text-muted-foreground">
                Taxpayer information not available
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RecentReceipts />
          <FiscalCounters
            deviceID={deviceID}
            fiscalDayNo={device.lastFiscalDayNo || 0}
            status={device.fiscalDayStatus || "Unknown"}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
