import { createContext, useContext, useState, ReactNode } from "react";
import { Alert } from "../components/Alert.js";
import { ConfirmDialog } from "../components/ConfirmDialog.js";

interface AlertContextType {
  showAlert: (message: string, type?: "success" | "error" | "info" | "warning") => void;
  showConfirm: (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
  }) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({
    isOpen: false,
    message: "",
    type: "info",
  });

  const [confirm, setConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
    resolve?: (value: boolean) => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const showAlert = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    setAlert({ isOpen: true, message, type });
  };

  const showConfirm = (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirm({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText,
        cancelText: options.cancelText,
        type: options.type,
        resolve,
      });
    });
  };

  const handleConfirmClose = () => {
    if (confirm.resolve) {
      confirm.resolve(false);
    }
    setConfirm({ isOpen: false, title: "", message: "" });
  };

  const handleConfirmConfirm = () => {
    if (confirm.resolve) {
      confirm.resolve(true);
    }
    setConfirm({ isOpen: false, title: "", message: "" });
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <Alert
        isOpen={alert.isOpen}
        onClose={() => setAlert({ isOpen: false, message: "", type: "info" })}
        message={alert.message}
        type={alert.type}
      />
      <ConfirmDialog
        isOpen={confirm.isOpen}
        onClose={handleConfirmClose}
        onConfirm={handleConfirmConfirm}
        title={confirm.title}
        message={confirm.message}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
        type={confirm.type}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within AlertProvider");
  }
  return context;
}

