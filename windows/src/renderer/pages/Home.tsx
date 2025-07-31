import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { Gem } from "lucide-react";
import FiscalDayStatus from "../../components/FiscalDayStatus";
import TaxpayerInfo from "../../components/TaxpayerInfo";
import RecentReceipts from "../../components/RecentReceipts";
import FiscalCounters from "../../components/FiscalCounters";
import api from "../../services/api";

interface DeviceData {
  fiscalDayStatus?: string;
  lastReceiptCounter?: number;
  lastFiscalDayNo?: number;
  lastReceiptGlobalNo?: number;
  deviceBranchName?: string;
}

interface TaxpayerData {
  _id: string;
  name: string;
  tin: string;
  address?: {
    province: string;
    city: string;
    street: string;
    houseNo: string;
  };
  contacts?: {
    phoneNo: string;
    email: string;
  };
  vatNumber?: string;
}

export function Home() {
  const { user } = useAuthStore();
  const [device, setDevice] = useState<DeviceData | null>(null);
  const [taxpayer, setTaxpayer] = useState<TaxpayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const deviceID = '19034';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [status, config] = await Promise.all([
          api.get(`/api/devices/${deviceID}/status`).catch(err => {
            console.error('Status fetch error:', err);
            throw new Error('Failed to fetch device status');
          }),
          api.get(`/api/devices/${deviceID}/config`).catch(err => {
            console.error('Config fetch error:', err);
            throw new Error('Failed to fetch device config');
          })
        ]);

        if (user?.tenant) {
          try {
            const taxpayerId = typeof user.tenant === 'object' ? user.tenant._id : user.tenant;
            const taxpayerResponse = await api.get(`/api/taxpayer/id/${taxpayerId}`).catch(err => {
              console.error('Taxpayer fetch error:', err);
              throw new Error('Failed to fetch taxpayer information');
            });
            setTaxpayer(taxpayerResponse.data.data);
          } catch (taxpayerError: any) {
            console.error('Taxpayer error:', taxpayerError);
            setError(taxpayerError.message);
          }
        }

        setDevice({
          ...status.data,
          ...config.data
        });
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load device data');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data when user and user.tenant are available
    if (user?.tenant) {
      fetchData();
    } else {
      setError("User is not logged in or tenant information is missing.");
      setLoading(false);
    }
  }, [deviceID, user?.tenant]); // Dependency only on deviceID and user.tenant

  if (!user) {
    return (
      <div className="login-redirect">
        <Gem className="animate-spin" size={20} />
        <p>Please login to view the dashboard</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container" style={{color:"green"}}>
        <p>Loading</p>
        <Gem className="animate-spin" size={20} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">{error}</div>
    );
  }

  if (!device) {
    return (
      <div className="device-not-found">Device not found</div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Welcome, {user?.firstName}!</h1>
      <div className="dashboard-content space-y-4">
        <div className="grid-container">
          <FiscalDayStatus
            status={device.fiscalDayStatus || 'Unknown'}
            receiptCounter={device.lastReceiptCounter || 0}
            lastFiscalDay={device.lastFiscalDayNo || 0}
            globalNo={device.lastReceiptGlobalNo || 0}
            date={new Date().toLocaleDateString()}
          />
          
          {taxpayer ? (
            <TaxpayerInfo
              name={taxpayer.name}
              tin={taxpayer.tin}
              branch={device.deviceBranchName || 'N/A'}
              address={taxpayer.address || {
                province: 'N/A',
                city: 'N/A',
                street: 'N/A',
                houseNo: 'N/A'
              }}
              contacts={taxpayer.contacts || {
                phoneNo: 'N/A',
                email: 'N/A'
              }}
              vatNumber={taxpayer.vatNumber || 'N/A'}
            />
          ) : (
            <div className="taxpayer-not-available">
              <div className="taxpayer-title">Tax Payer Details</div>
              <div className="taxpayer-message">Taxpayer information not available</div>
            </div>
          )}
        </div>
        
        <div className="grid-container">
          <RecentReceipts />
          <FiscalCounters
            deviceID={parseInt(deviceID)}
            fiscalDayNo={device.lastFiscalDayNo || 0}
            status={device.fiscalDayStatus || 'Unknown'}
          />
        </div>
      </div>
    </div>
  );
}
