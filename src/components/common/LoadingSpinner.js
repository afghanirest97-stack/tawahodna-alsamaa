import React from 'react';

function LoadingSpinner() {
  return (
    <div className="loading-spinner" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '300px',
      flexDirection: 'column'
    }}>
      <div className="spinner" style={{
        width: '50px',
        height: '50px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #c9a03d',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ marginTop: '1rem', color: '#1e3a5f' }}>جاري التحميل...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default LoadingSpinner;