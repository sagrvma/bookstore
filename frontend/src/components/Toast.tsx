import { useEffect } from "react";
import { Toast, useToast } from "../context/ToastContext";
import "./Toast.css";

const ToastItem = ({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: () => void;
}) => {
  useEffect(() => {
    //Add animation after a small delay
    const timer = setTimeout(() => {
      const element = document.getElementById(`toast-${toast.id}`);
      if (element) {
        element.classList.add("toastEnter");
      }
    }, 10);

    return () => clearTimeout(timer);
  }, [toast.id]);

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return "✓";
      case "error":
        return "✗";
      case "info":
        return "ℹ";
      case "warning":
        return "⚠";
      default:
        return "ℹ";
    }
  };
  return (
    <div id={`toast-${toast.id}`} className={`toast toast-${toast.type}`}>
      <div className="toastIcon">{getIcon()}</div>
      <div className="toastMessage">{toast.message}</div>
      <button className="toastClose" onClick={() => onRemove()}>
        x
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toastContainer">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
