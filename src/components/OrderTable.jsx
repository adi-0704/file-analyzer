import React from 'react';
import { Download, Info } from 'lucide-react';
import Papa from 'papaparse';

export const OrderTable = ({ orders, title, flagType }) => {
  const exportCSV = () => {
    const csv = Papa.unparse(orders);
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
        No {flagType} flags found in this dataset.
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
              <th>Pin Code</th>
              <th>Quantity</th>
              <th>Flag Reason</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => (
              <tr key={idx}>
                <td>{order.Name}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{order.Email}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order['Shipping Address1']?.substring(0, 30)}...</div>
                </td>
                <td>{order['Shipping Phone'] || <span style={{ color: 'var(--red-flag)' }}>Missing</span>}</td>
                <td>{order['Shipping Zip'] || <span style={{ color: 'var(--red-flag)' }}>Missing</span>}</td>
                <td>{order['Lineitem quantity']}</td>
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
