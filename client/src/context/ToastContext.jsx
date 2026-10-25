import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cx } from '../lib/format';

const ToastContext = createContext(null);
let nextToastId = 0;

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (message, type = 'success') => {
      nextToastId += 1;
      const id = nextToastId;
      setToasts((current) => [...current.slice(-2), { id, message, type }]);
      const timer = setTimeout(() => dismiss(id), 4500);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  const api = useMemo(
    () => ({
      show: push,
      success: (message) => push(message, 'success'),
      error: (message) => push(message, 'error'),
      info: (message) => push(message, 'info'),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[120] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-5 sm:items-end sm:p-0 sm:pb-5"
          aria-live="polite"
          aria-atomic="false"
        >
          {toasts.map((toast) => {
            const Icon = ICONS[toast.type] || Info;
            return (
              <div
                key={toast.id}
                role="status"
                className={cx(
                  'animate-fade-up pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-white/10 bg-ink px-4 py-3.5 text-cream shadow-lift',
                )}
              >
                <span
                  className={cx(
                    'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full',
                    toast.type === 'error'
                      ? 'bg-clay/15 text-clay'
                      : toast.type === 'info'
                        ? 'bg-white/10 text-cream'
                        : 'bg-lime/15 text-lime',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <p className="flex-1 pt-1 text-[13px] leading-5 text-cream/90">{toast.message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  className="mt-0.5 grid h-6 w-6 place-items-center rounded-full text-cream/40 transition hover:bg-white/10 hover:text-cream"
                  aria-label="Dismiss notification"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
