import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  msg: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
          info: <Info className="w-4 h-4 text-blue-600 shrink-0" />,
        };

        const borders = {
          success: 'border-l-emerald-500 bg-white text-gray-800',
          error: 'border-l-red-500 bg-white text-gray-800',
          warning: 'border-l-amber-500 bg-white text-gray-800',
          info: 'border-l-blue-500 bg-white text-gray-800',
        };

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-3 rounded-xl shadow-lg border border-gray-100 border-l-4 ${borders[t.type]} flex items-start justify-between gap-3 text-xs animate-in slide-in-from-right-4 duration-150`}
          >
            <div className="flex items-start gap-2 pt-0.5">
              {icons[t.type]}
              <span className="font-medium leading-snug">{t.msg}</span>
            </div>

            <button
              onClick={() => onDismiss(t.id)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
