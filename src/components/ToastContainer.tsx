import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-4 h-4 text-sky-500 shrink-0" />;
        let borderColor = 'border-sky-200';
        let bgColor = 'bg-white';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
          borderColor = 'border-emerald-200';
        } else if (toast.type === 'warning') {
          icon = <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />;
          borderColor = 'border-amber-200';
        } else if (toast.type === 'error') {
          icon = <XCircle className="w-4 h-4 text-rose-600 shrink-0" />;
          borderColor = 'border-rose-200';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-lg border ${borderColor} ${bgColor} shadow-md text-slate-800 text-xs transition-all`}
          >
            <div className="flex items-start gap-2.5">
              {icon}
              <span className="font-medium leading-relaxed">{toast.text}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 transition-colors p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
