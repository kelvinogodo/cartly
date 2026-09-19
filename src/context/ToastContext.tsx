import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode,
} from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiAlertCircle, FiCheck, FiX } from 'react-icons/fi';
import { getProductImageUrl } from '../lib/images';

export interface ToastOptions {
  /** Reusing an id updates the existing toast in place instead of stacking a new one. */
  id?: string;
  title: string;
  description?: string;
  image?: string;
  tone?: 'default' | 'error';
  action?: { label: string; to: string };
  duration?: number;
}

interface Toast extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  show: (options: ToastOptions) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    window.clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (options: ToastOptions) => {
      const id = options.id ?? `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((current) => [...current.filter((toast) => toast.id !== id), { ...options, id }].slice(-3));
      window.clearTimeout(timers.current.get(id));
      timers.current.set(id, window.setTimeout(() => dismiss(id), options.duration ?? 3800));
    },
    [dismiss]
  );

  useEffect(() => {
    const active = timers.current;
    return () => active.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              layout
              key={toast.id}
              className={`toast ${toast.tone === 'error' ? 'is-error' : ''}`}
              initial={{ opacity: 0, y: -14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 36, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            >
              {toast.image ? (
                <div className="toast-img">
                  <img src={getProductImageUrl(toast.image)} alt="" />
                </div>
              ) : toast.tone === 'error' ? (
                <FiAlertCircle size={18} />
              ) : (
                <FiCheck size={18} />
              )}
              <div className="toast-body">
                <div className="toast-title">{toast.title}</div>
                {toast.description && <div className="toast-desc">{toast.description}</div>}
              </div>
              {toast.action && (
                <Link className="toast-action" to={toast.action.to} onClick={() => dismiss(toast.id)}>
                  {toast.action.label}
                </Link>
              )}
              <button className="toast-close" onClick={() => dismiss(toast.id)} aria-label="Dismiss">
                <FiX size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
