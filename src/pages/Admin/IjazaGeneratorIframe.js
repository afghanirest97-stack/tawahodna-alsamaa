// src/pages/Admin/IjazaGeneratorIframe.jsx
import React, { useState, useEffect } from 'react';

const IjazaGeneratorIframe = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    // استقبال رسائل التنزيل من الـ iframe
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'DOWNLOAD_PDF') {
        const { data, filename } = event.data;
        // إنشاء رابط تنزيل
        const link = document.createElement('a');
        link.href = data;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('PDF downloaded:', filename);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className="ijaza-iframe-container">
      {loading && (
        <div className="iframe-loading">
          <div className="iframe-spinner"></div>
          <p>جاري تحميل مولد الإجازات...</p>
        </div>
      )}
      <iframe
        src="/ijaza-generator.html"
        className="ijaza-iframe-full"
        title="مولد الإجازات الشرعية"
        style={{
          width: '100%',
          height: 'calc(100vh - 120px)',
          border: 'none',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          display: loading ? 'none' : 'block',
        }}
        allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone"
        sandbox="allow-same-origin allow-scripts allow-modals allow-popups"
      />
      
      <style>{`
        .ijaza-iframe-container {
          width: 100%;
          height: 100%;
          position: relative;
          background: #f4f6f8;
          border-radius: 12px;
          overflow: hidden;
        }

        .iframe-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: calc(100vh - 120px);
          background: #f4f6f8;
        }

        .iframe-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e0e0e0;
          border-top: 4px solid #8e44ad;
          border-radius: 50%;
          animation: iframeSpin 1s linear infinite;
          margin-bottom: 1rem;
        }

        .iframe-loading p {
          color: #555;
          font-size: 1.1rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        @keyframes iframeSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .ijaza-iframe-full {
          width: 100%;
          height: calc(100vh - 120px);
          border: none;
          border-radius: 12px;
          background: white;
        }

        @media (max-width: 768px) {
          .ijaza-iframe-full {
            height: calc(100vh - 100px);
          }
          .iframe-loading {
            height: calc(100vh - 100px);
          }
        }
      `}</style>
    </div>
  );
};

export default IjazaGeneratorIframe;