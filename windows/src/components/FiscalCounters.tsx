// components/Fiscal/FiscalCounters.tsx
import api from '../services/api'
import { useState, useEffect } from 'react'


interface FiscalCounter {
  _id: string
  fiscalCounterType: string
  fiscalCounterCurrency: string
  fiscalCounterValue: number
  fiscalCounterTaxAmountValue?: number
  fiscalCounterTaxPercent?: number
}

export default function FiscalCounters({
  deviceID,
  fiscalDayNo,
  status
}: {
  deviceID: number
  fiscalDayNo: number
  status: string
}) {
  const [counters, setCounters] = useState<FiscalCounter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCounters = async () => {
      try {
        const response = await api.get(`/fiscal/${deviceID}/counters?fiscalDayNo=${fiscalDayNo}`)
        setCounters(response.data.data)
      } catch (err) {
        console.error('Failed to fetch fiscal counters:', err)
        setError('Failed to load fiscal counters')
      } finally {
        setLoading(false)
      }
    }

    if (status !== 'FiscalDayClosed' && fiscalDayNo) {
      fetchCounters()
    } else {
      setLoading(false)
    }
  }, [deviceID, fiscalDayNo, status])

  if (loading) {
    return (
      <div>
        <>
          <p className='title'>Fiscal Counters</p>
        </>
        <div className="flex justify-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <>
          <p className='title'>Fiscal Counters</p>
        </>
        <>
          <div className="text-red-500" style={{color:"red", fontSize:"12px"}}>{error}</div>
        </>
      </div>
    )
  }

  if (status === 'FiscalDayClosed') {
    return (
      <div>
        <>
          <p className='title'>Fiscal Counters</p>
        </>
        <div>
          <div className="text-muted-foreground" style={{color:"red", fontSize:"12px"}}>Fiscal day is closed. Counters not available.</div>
        </div>
      </div>
    )
  }

  if (counters.length === 0) {
    return (
      <div>
        <div>
          <p className='title'>Fiscal Counters</p>
        </div>
        <div>
          <div className="text-muted-foreground" style={{color:"red", fontSize:"12px"}}>No counters found for current fiscal day</div>
        </div>
      </div>
    )
  }

  return (
<div className="">
    Table
</div>
  )
}
