import { createContext, useCallback, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';
import { IconCheck, IconAlertCircle, IconInfo, IconX } from './icons';

const ToastContext = createContext(null);

const VARIANTS = {
  success: { classes: 'bg-success-600', Icon: IconCheck },
  danger: { classes: 'bg-danger-600', Icon: IconAlertCircle },
  info: { classes: 'bg-neutral-900', Icon: IconInfo },
};

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (variant, message, { duration = 4000 } = {}) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, variant, message }]);
      if (duration) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const api = {
    success: (message, opts) => push('success', message, opts),
    error: (message, opts) => push('danger', message, opts),
    info: (message, opts) => push('info', message, opts),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm">
          {toasts.map((t) => {
            const { classes, Icon } = VARIANTS[t.variant];
            return (
              <div
                key={t.id}
                role="status"
                className={cn(
                  'flex items-start gap-2.5 rounded-lg px-4 py-3 text-sm text-white shadow-lg animate-in',
                  classes
                )}
              >
                <Icon size={16} className="mt-0.5 shrink-0" />
                <span className="flex-1">{t.message}</span>
                <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="shrink-0 opacity-80 hover:opacity-100">
                  <IconX size={14} />
                </button>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
