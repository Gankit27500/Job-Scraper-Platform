import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toasts Portal Area */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none select-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              layout
              className={`p-4 rounded-xl border shadow-lg backdrop-blur-md flex items-start gap-3 pointer-events-auto bg-card ${
                toast.type === "success"
                  ? "border-green-500/25 text-foreground"
                  : toast.type === "error"
                  ? "border-red-500/25 text-foreground"
                  : "border-border text-foreground"
              }`}
            >
              {/* Type Icons */}
              <div className="shrink-0 mt-0.5">
                {toast.type === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                {toast.type === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
                {toast.type === "info" && <Info className="h-5 w-5 text-primary" />}
              </div>

              {/* Message */}
              <div className="flex-1 text-xs font-semibold leading-relaxed">
                {toast.message}
              </div>

              {/* Close Button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-muted-foreground hover:text-foreground cursor-pointer transition-colors focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside a ToastProvider wrapper.");
  }
  return context;
};
