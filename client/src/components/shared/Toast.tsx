import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }].slice(-3));
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Expose to window for global access
  useEffect(() => {
    (window as any).toast = addToast;
  }, [addToast]);

  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const icons = {
    success: <CheckCircle size={20} className="text-accent-green" />,
    info: <Info size={20} className="text-accent-blue" />,
    warning: <AlertTriangle size={20} className="text-accent-amber" />,
    error: <AlertCircle size={20} className="text-accent-error" />,
  };

  const borders = {
    success: 'border-accent-green/30 bg-accent-green/5',
    info: 'border-accent-blue/30 bg-accent-blue/5',
    warning: 'border-accent-amber/30 bg-accent-amber/5',
    error: 'border-accent-error/30 bg-accent-error/5',
  };

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      className={cn(
        "flex items-center gap-4 min-w-[320px] max-w-[400px] p-5 rounded-2xl border glass shadow-2xl",
        borders[toast.type]
      )}
    >
      <div className="shrink-0">{icons[toast.type]}</div>
      <p className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</p>
      <button onClick={onDismiss} className="text-text-muted hover:text-white transition-colors">
        <X size={18} />
      </button>
    </motion.div>
  );
};
