import React from 'react';
import { Download } from 'lucide-react';
import Papa from 'papaparse';

export const OrderTable = ({ orders, title, flagType }) => {
  const exportCSV = () => {
    // Export original columns (without internal flags)
    const exportData = orders.map(({ flag, flagReason, _lineItems, _cleanZip, _cleanPhone, ...rest }) => ({
      ...rest,
      'Flag': flag.toUpperCase(),
      'Flag Reason': flagReason,
    }));
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${flagType}_flags_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (orders.length === 0) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No {flagType} flag orders found.
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.125rem' }}>{title} ({orders.length})</h3>
        <button onClick={exportCSV} className="export-btn">
          <Download size={18} /> Export {flagType.charAt(0).toUpperCase() + flagType.slice(1)} List
        </button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>City</th>
              <th>Pin Code</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Flag</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{order.Name}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{order['Shipping Name'] || order['Billing Name'] || '—'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {order['Shipping Address1']?.substring(0, 40) || '—'}
                  </div>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {order._cleanPhone || <span style={{ color: 'var(--red-flag)', fontWeight: 600 }}>Missing</span>}
                </td>
                <td>{order['Shipping City'] || '—'}</td>
                <td>
                  {order._cleanZip || <span style={{ color: 'var(--red-flag)', fontWeight: 600 }}>Missing</span>}
                </td>
                <td>{order['Lineitem quantity']}</td>
                <td style={{ whiteSpace: 'nowrap' }}>₹{order['Total']}</td>
                <td>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: order['Financial Status'] === 'paid' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: order['Financial Status'] === 'paid' ? '#a7f3d0' : '#fde68a',
                  }}>
                    {order['Financial Status'] === 'paid' ? 'Prepaid' : 'COD'}
                  </span>
                </td>
                <td>
                  <span className={`flag-badge flag-${order.flag}`}>
                    {order.flagReason}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
