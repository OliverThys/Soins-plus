import { useEffect } from "react";
import { Icon } from "./Icon.js";

interface AlertProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: "success" | "error" | "info" | "warning";
}

export function Alert({ isOpen, onClose, message, type = "info" }: AlertProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const icons = {
    success: "check",
    error: "x",
    info: "document",
    warning: "shield",
  };

  const colors = {
    success: "var(--success-500)",
    error: "var(--error-500)",
    info: "var(--info-500)",
    warning: "var(--warning-500)",
  };

  return (
    <div className="alert-overlay" onClick={onClose}>
      <div className="alert-content" onClick={(e) => e.stopPropagation()}>
        <div className="alert-icon" style={{ color: colors[type] }}>
          <Icon name={icons[type] as any} size={24} aria-hidden />
        </div>
        <div className="alert-message">
          <p>{message}</p>
        </div>
        <button className="alert-close" onClick={onClose} aria-label="Fermer">
          <Icon name="x" size={18} aria-hidden />
        </button>
      </div>
    </div>
  );
}

