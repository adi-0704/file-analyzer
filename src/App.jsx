import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, XCircle, BarChart3, Search, Wallet, CreditCard } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { OrderTable } from './components/OrderTable';
import { analyzeOrders } from './utils/processor';

function App() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDataLoaded = (rawData) => {
    try {
      const processedData = analyzeOrders(rawData);
      setData(processedData);
      setError(null);
    } catch (e) {
      setError('Error processing data: ' + e.message);
    }
  };

  const filteredData = data ? data.filter(order => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      order.Name?.toLowerCase().includes(term) ||
      order.Email?.toLowerCase().includes(term) ||
      order['Shipping Phone']?.includes(searchTerm) ||
      order['Shipping Name']?.toLowerCase().includes(term) ||
      order['Shipping City']?.toLowerCase().includes(term);

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'cod') return order['Financial Status'] !== 'paid' && matchesSearch;
    if (activeTab === 'prepaid') return order['Financial Status'] === 'paid' && matchesSearch;
    return order.flag === activeTab && matchesSearch;
  }) : [];

  const stats = data ? {
    total: data.length,
    red: data.filter(d => d.flag === 'red').length,
    orange: data.filter(d => d.flag === 'orange').length,
    green: data.filter(d => d.flag === 'green').length,
    cod: data.filter(d => d['Financial Status'] !== 'paid').length,
    prepaid: data.filter(d => d['Financial Status'] === 'paid').length,
  } : null;

  return (
    <div className="dashboard-container">
      <header>
        <div>
          <h1>Shopify Order Insights</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Upload your Shopify export CSV to categorize orders</p>
        </div>
        {data && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
              <input
                type="text"
                placeholder="Search name, email, phone, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  color: 'white',
                  width: '320px',
                  outline: 'none',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>
        )}
      </header>

      {!data ? (
        <FileUpload onDataLoaded={handleDataLoaded} onError={setError} />
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total Orders</span>
              <span className="stat-value">{stats.total}</span>
              <BarChart3 size={20} color="var(--primary)" />
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid var(--green-flag)' }}>
              <span className="stat-label">🟢 Green Flags</span>
              <span className="stat-value">{stats.green}</span>
              <ShieldCheck size={20} color="var(--green-flag)" />
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid var(--orange-flag)' }}>
              <span className="stat-label">🟠 Orange Flags</span>
              <span className="stat-value">{stats.orange}</span>
              <AlertTriangle size={20} color="var(--orange-flag)" />
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid var(--red-flag)' }}>
              <span className="stat-label">🔴 Red Flags</span>
              <span className="stat-value">{stats.red}</span>
              <XCircle size={20} color="var(--red-flag)" />
            </div>
            <div className="stat-card">
              <span className="stat-label">COD Orders</span>
              <span className="stat-value">{stats.cod}</span>
              <Wallet size={20} color="#f59e0b" />
            </div>
            <div className="stat-card">
              <span className="stat-label">Prepaid Orders</span>
              <span className="stat-value">{stats.prepaid}</span>
              <CreditCard size={20} color="#10b981" />
            </div>
          </div>

          <div className="tabs">
            <div className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All ({stats.total})</div>
            <div className={`tab ${activeTab === 'green' ? 'active' : ''}`} onClick={() => setActiveTab('green')}>🟢 Green ({stats.green})</div>
            <div className={`tab ${activeTab === 'orange' ? 'active' : ''}`} onClick={() => setActiveTab('orange')}>🟠 Orange ({stats.orange})</div>
            <div className={`tab ${activeTab === 'red' ? 'active' : ''}`} onClick={() => setActiveTab('red')}>🔴 Red ({stats.red})</div>
            <div style={{ width: '1px', background: 'var(--border)', margin: '0 0.25rem' }}></div>
            <div className={`tab ${activeTab === 'cod' ? 'active' : ''}`} onClick={() => setActiveTab('cod')}>💰 COD ({stats.cod})</div>
            <div className={`tab ${activeTab === 'prepaid' ? 'active' : ''}`} onClick={() => setActiveTab('prepaid')}>💳 Prepaid ({stats.prepaid})</div>

            <button
              onClick={() => { setData(null); setSearchTerm(''); setActiveTab('all'); }}
              style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              Upload New File
            </button>
          </div>

          <OrderTable
            orders={filteredData}
            title={
              activeTab === 'all' ? 'All Processed Orders' :
              activeTab === 'cod' ? 'COD Orders' :
              activeTab === 'prepaid' ? 'Prepaid Orders' :
              `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Flag Orders`
            }
            flagType={activeTab}
          />
        </>
      )}

      {error && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red-flag)', borderRadius: '0.5rem', border: '1px solid var(--red-flag)' }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default App;
