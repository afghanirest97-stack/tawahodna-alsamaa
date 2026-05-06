import React, { useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <FaCheckCircle />,
    error: <FaTimesCircle />,
    info: <FaInfoCircle />,
    warning: <FaExclamationTriangle />
  };

  const colors = {
    success: '#27ae60',
    error: '#dc2626',
    info: '#e8b339',
    warning: '#f39c12'
  };

  return (
    <div className="toast-notification" style={{ borderRightColor: colors[type] }}>
      <div className="toast-icon" style={{ color: colors[type] }}>
        {icons[type]}
      </div>
      <div className="toast-content">
        <p>{message}</p>
      </div>
      <button className="toast-close" onClick={onClose}>×</button>
      
      <style>{`
        .toast-notification {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background: white;
          border-radius: 12px;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          border-right: 4px solid;
          animation: slideInRight 0.3s ease;
          z-index: 9999;
          max-width: 400px;
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .toast-icon {
          font-size: 1.5rem;
        }
        
        .toast-content p {
          margin: 0;
          color: #1a2a3a;
          font-size: 0.9rem;
        }
        
        .toast-close {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: #adb5bd;
          padding: 0 0.25rem;
        }
        
        .toast-close:hover {
          color: #dc2626;
        }
        
        @media (max-width: 768px) {
          .toast-notification {
            left: 15px;
            right: 15px;
            bottom: 15px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;