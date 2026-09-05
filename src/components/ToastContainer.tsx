import React from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { ToastMessage } from '../types/movie';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          id={`toast-${toast.id}`}
          className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl bg-[#121622] border border-zinc-700/80 shadow-2xl shadow-black/80 text-white animate-slideUp backdrop-blur-xl"
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'error' && <XCircle size={18} className="text-red-400" />}
            {toast.type === 'warning' && <AlertTriangle size={18} className="text-amber-400" />}
            {toast.type === 'info' && <Info size={18} className="text-blue-400" />}
            {(!toast.type || toast.type === 'success') && <CheckCircle2 size={18} className="text-emerald-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-100">{toast.title}</p>
            {toast.message && <p className="text-xs text-zinc-400 mt-0.5">{toast.message}</p>}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md transition-colors"
            aria-label="Dismiss toast"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
