'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
}

interface ToastContextValue {
  pushToast: (toast: Omit<ToastItem, 'id'>, durationMs?: number) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const VARIANT_STYLES: Record<
  ToastVariant,
  { container: string; icon: React.ReactNode }
> = {
  success: {
    container: 'bg-white border-emerald-200 text-slate-900 shadow-lg shadow-emerald-950/5',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
  },
  error: {
    container: 'bg-white border-red-200 text-slate-900 shadow-lg shadow-red-950/5',
    icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
  },
  warning: {
    container: 'bg-white border-amber-200 text-slate-900 shadow-lg shadow-amber-950/5',
    icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
  },
  info: {
    container: 'bg-white border-slate-200 text-slate-900 shadow-lg shadow-slate-950/5',
    icon: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
  },
};

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast: Omit<ToastItem, 'id'>, durationMs = 4500) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-4), { ...toast, id }]);
      if (durationMs > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((item) => item.id !== id));
        }, durationMs);
      }
    },
    []
  );

  const api = useMemo<ToastContextValue>(
    () => ({
      pushToast,
      dismissToast,
      success: (title, description) => pushToast({ variant: 'success', title, description }),
      error: (title, description) => pushToast({ variant: 'error', title, description }, 6500),
      warning: (title, description) => pushToast({ variant: 'warning', title, description }, 5500),
      info: (title, description) => pushToast({ variant: 'info', title, description }),
    }),
    [pushToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 left-4 z-[90] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
      >
        {toasts.map((item) => {
          const style = VARIANT_STYLES[item.variant];
          return (
            <div
              key={item.id}
              role="status"
              className={`pointer-events-auto rounded-lg border px-4 py-3 flex items-start gap-3 transition-all ${style.container}`}
            >
              <div className="mt-0.5">{style.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 leading-snug">{item.title}</p>
                {item.description && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed break-words">
                    {item.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(item.id)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors shrink-0"
                aria-label="بستن اعلان"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useAdminToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useAdminToast must be used inside AdminToastProvider');
  }
  return ctx;
}
