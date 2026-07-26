"use client";

import { useToast, ToastType } from "@/context/ToastContext";

const iconMap: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "i",
  warning: "!",
};

const colorMap: Record<ToastType, string> = {
  success: "from-emerald-500 to-green-600",
  error: "from-red-500 to-rose-600",
  info: "from-blue-500 to-indigo-600",
  warning: "from-yellow-500 to-amber-600",
};

const bgMap: Record<ToastType, string> = {
  success: "border-emerald-500/30",
  error: "border-red-500/30",
  info: "border-blue-500/30",
  warning: "border-yellow-500/30",
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
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorMap[toast.type]} flex items-center justify-center shrink-0 text-white text-sm font-bold`}>
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
