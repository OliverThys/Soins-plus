import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { AlertProvider } from "./context/AlertContext.js";
import "./styles/global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Ne pas réessayer si c'est une erreur de connexion (serveur non démarré)
        if (error?.code === "ERR_NETWORK" || error?.code === "ERR_CONNECTION_REFUSED") {
          return false;
        }
        // Réessayer jusqu'à 3 fois pour les autres erreurs
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // Désactiver le refetch automatique au focus
      refetchOnReconnect: true, // Réessayer seulement si la connexion est rétablie
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AlertProvider>
        <App />
      </AlertProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

