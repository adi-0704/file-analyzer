import React, { useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';

export const FileUpload = ({ onDataLoaded, onError }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      onError('Please upload a valid CSV file.');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          onDataLoaded(results.data);
        } else {
          onError('The CSV file appears to be empty.');
        }
      },
      error: (err) => {
        onError('Error parsing CSV: ' + err.message);
      }
    });
  };

  return (
    <div className="upload-section">
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <div className="upload-content">
        <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 1.5rem' }}>
          <Upload size={32} color="#6366f1" />
        </div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Upload Shopify Export</h2>
        <p style={{ color: 'var(--text-muted)' }}>Drag and drop your CSV file here or click to browse</p>
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <FileText size={16} /> Customers.csv
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <AlertCircle size={16} /> max 50MB
          </div>
        </div>
      </div>
    </div>
  );
};
