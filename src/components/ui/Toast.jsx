// src/components/ui/Toast.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import Icon from '../AppIcon';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      ...toast,
      timestamp: Date.now()
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 5000);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((title, message, options = {}) => {
    return addToast({
      type: 'success',
      title,
      message,
      ...options
    });
  }, [addToast]);

  const error = useCallback((title, message, options = {}) => {
    return addToast({
      type: 'error',
      title,
      message,
      duration: 7000, // Longer for errors
      ...options
    });
  }, [addToast]);

  const warning = useCallback((title, message, options = {}) => {
    return addToast({
      type: 'warning',
      title,
      message,
      ...options
    });
  }, [addToast]);

  const info = useCallback((title, message, options = {}) => {
    return addToast({
      type: 'info',
      title,
      message,
      ...options
    });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{
      success,
      error,
      warning,
      info,
      removeToast
    }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onRemove }) => {
  const typeStyles = {
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: 'CheckCircle',
      iconColor: 'text-green-500',
      titleColor: 'text-green-900',
      messageColor: 'text-green-700'
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: 'XCircle',
      iconColor: 'text-red-500',
      titleColor: 'text-red-900',
      messageColor: 'text-red-700'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: 'AlertTriangle',
      iconColor: 'text-yellow-500',
      titleColor: 'text-yellow-900',
      messageColor: 'text-yellow-700'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'Info',
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-700'
    }
  };

  const style = typeStyles[toast.type] || typeStyles.info;

  return (
    <div className={`
      ${style.bg} border rounded-lg shadow-lg p-4 transition-all duration-300
      animate-in slide-in-from-right-full
    `}>
      <div className="flex items-start space-x-3">
        <Icon name={style.icon} size={20} className={style.iconColor} />
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${style.titleColor}`}>
            {toast.title}
          </p>
          {toast.message && (
            <p className={`text-sm mt-1 ${style.messageColor}`}>
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className={`flex-shrink-0 ${style.iconColor} hover:opacity-70`}
        >
          <Icon name="X" size={16} />
        </button>
      </div>
    </div>
  );
};