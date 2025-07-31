import Label from '../../components/Label';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { useEffect } from 'react';
import Button from '../../components/Button';

export default function Invoices() {
  const { invoices, fetchInvoices, loading, error } = useInvoiceStore();

  useEffect(() => {
    fetchInvoices();
  }, []);

  if (loading) return <div className="status-message">Loading invoices...</div>;
  if (error) return <div className="status-message error">Error: {error}</div>;
  if (invoices.length === 0) return <div className="status-message">No invoices found</div>;

  return (
     <div className="invoices-container">
      <div className="invoices-header">
        <Label htmlFor='' className="title-label">Palladium Invoices</Label>
        <Button onClick={fetchInvoices}>Refresh</Button>

      </div>
      <div className="" style={{width: "100%", height: "2px", borderRadius: "8px",backgroundColor: "green" , marginBottom: "12px"}}/>

      {invoices.map((invoice) => (
        <div key={invoice.invoiceID} className="invoice-card">
          <Label htmlFor='' className="customer-label">{invoice.customer}</Label>
          <p className="invoice-date">{new Date(invoice.date).toLocaleDateString()}</p>
          <p className="invoice-total">Total: ${invoice.total.toFixed(2)}</p>
          <ul className="invoice-items">
            {invoice.items.map((item) => (
              <li key={item.lineNo}>
                <span className="" style={{fontWeight: 'bold'}}>{item.partNumber} - {item.description}</span> ${item.totalLineAmount.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
