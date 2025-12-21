import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastVariant = 'default' | 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  // Aliases for backward compatibility
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'default') => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, variant }]);

      // Auto-dismiss after 3s
      setTimeout(() => removeToast(id), 3000);
    },
    [removeToast],
  );

  const successFn = useCallback((msg: string) => showToast(msg, 'success'), [showToast]);
  const errorFn = useCallback((msg: string) => showToast(msg, 'error'), [showToast]);
  const infoFn = useCallback((msg: string) => showToast(msg, 'info'), [showToast]);

  const value: ToastContextValue = {
    toasts,
    showToast,
    success: successFn,
    error: errorFn,
    info: infoFn,
    showSuccess: successFn,
    showError: errorFn,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};

const variantClasses: Record<ToastVariant, string> = {
  default: 'bg-slate-800 text-white',
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-blue-600 text-white',
};

const ToastContainer: React.FC<{
  toasts: Toast[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-[220px] max-w-sm rounded-lg shadow-lg px-4 py-3 text-sm flex items-start justify-between gap-3 ${variantClasses[toast.variant]}`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            className="text-xs opacity-80 hover:opacity-100"
            onClick={() => onDismiss(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};


