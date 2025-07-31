// FiscalDayStatus.jsx
import React, { useEffect, useState } from 'react';
import { Power, Clock, FileX, PowerOff } from 'lucide-react';
import { closeFiscalDay, openFiscalDay } from '../services/api';
import Label from './Label';
import Button from './Button';

interface FiscalDayStatusProps {
  status: string
  receiptCounter: number | string
  lastFiscalDay: number | string
  globalNo: number | string
  date: string
}

const FiscalDayStatus = ({
  status,
  receiptCounter,
  lastFiscalDay,
  globalNo,
  date
}: FiscalDayStatusProps) => {
  const [isFiscalDayOpen, setIsFiscalDayOpen] = useState(status === 'FiscalDayOpened');
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const deviceID = '19034';

   useEffect(() => {
    setIsFiscalDayOpen(status === 'FiscalDayOpened')
    setCurrentStatus(status)
  }, [status])

  const toggleFiscalDay = async () => {
    if (!deviceID) return
    setLoading(true)

    try {
      if (isFiscalDayOpen) {
        await closeFiscalDay(deviceID)
        setIsFiscalDayOpen(false)
        setCurrentStatus('FiscalDayClosed')
      } else {
        await openFiscalDay(deviceID)
        setIsFiscalDayOpen(true)
        setCurrentStatus('FiscalDayOpened')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fiscal-day-status">
      <div className="status-header flex-container" >
        <p  className="title">Fiscal Day</p>
        <Button
          onClick={toggleFiscalDay}
          disabled={loading}
          className={`status-button ${isFiscalDayOpen ? 'status-button-open' : 'status-button-closed'}`}
        >{
          isFiscalDayOpen ? (
            <PowerOff size={12}/>
          ) : (
            <Power size={12}/>
          )
        }
        </Button>
      </div>

      <div className="status-day-info flex-container" style={{marginTop:"12px", marginBottom: "6px"}}>
        <div className="day-number flex items-center justify-center" style={{background: "green", padding: 4, width:"24px",height: "24px", borderRadius: "20px", fontSize:"12px",color:"white" }}>{lastFiscalDay}</div>
        <div className="date-info flex">
          <Clock size={12} />
          <Label htmlFor='' className="date-text">{date}</Label>
        </div>
      </div>

      <div className="status-counter flex-container">
        <Label htmlFor=''>Receipt Counter</Label>
        <div className="fiscal-value">{receiptCounter}</div>
      </div>

      <div className="status-global flex-container">
        <Label htmlFor=''>Global No</Label>
        <div className="fiscal-value">{globalNo}</div>
      </div>

      <div className="status-indicator flex-container">
        <Label htmlFor=''>Status</Label>
        <div className={`indicator fiscal-value ${isFiscalDayOpen ? 'indicator-open' : 'indicator-closed'}`}>
          {currentStatus}
        </div>
      </div>
    </div>
  );
};

export default FiscalDayStatus;