import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
};

export type ToastContextType = {
  toasts: Toast[];
  showToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
};

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    //Since the function will remain the same, memoize using useCallback. id is not a dependency as it is a parameter and a new function is created for every new parameter, so that doesnt have to be a dependency. Only dependencies should be objects outside this code that might be used inside that might get stale if not passed as a dependecy.
    setToasts((prev) => prev.filter((toast) => toast.id != id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, duration = 4000) => {
      const id = Date.now().toString() + Math.random().toString(); //Create a new id

      const toast = { id, type, message, duration }; //Create a toast

      setToasts((prev) => [...prev, toast]); //Add toast to toasts array

      //Auto remove after duration
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must only be used inside ToastProvider");
  }
  return context;
};
