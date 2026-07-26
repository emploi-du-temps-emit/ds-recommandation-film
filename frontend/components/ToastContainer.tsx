"use client";

import { useToast, ToastType } from "@/context/ToastContext";
import { Check, X, Info, AlertTriangle } from "lucide-react";

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <Check className="w-4 h-4" />,
  error: <X className="w-4 h-4" />,
  info: <Info className="w-4 h-4" />,
  warning: <AlertTriangle className="w-4 h-4" />,
};

const colorMap: Record<ToastType, string> = {
  success: "from-emerald-500 to-green-600",
  error: "from-red-500 to-rose-600",
  info: "from-blue-500 to-indigo-600",
  warning: "from-yellow-500 to-amber-600",
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast-enter pointer-events-auto flex items-start gap-3 p-4 rounded-xl 
                     backdrop-blur-xl border shadow-2xl
                     bg-[var(--toast-bg)] border-[var(--card-border)]"
          role="alert"
        >
          {/* Icon badge */}
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorMap[toast.type]} flex items-center justify-center shrink-0 text-white`}>
            {iconMap[toast.type]}
          </div>

          {/* Message */}
          <p className="flex-1 text-sm text-[var(--text-primary)] pt-1.5">
            {toast.message}
          </p>

          {/* Close button */}
          <button
            onClick={() => removeToast(toast.id)}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
