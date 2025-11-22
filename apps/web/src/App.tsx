import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { router } from "./routes/router";
import { initClarity } from "./lib/clarity";

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
  });
}

export default function App() {
  useEffect(() => {
    // Initialisation Microsoft Clarity
    initClarity(import.meta.env.VITE_CLARITY_ID);
  }, []);

  return <RouterProvider router={router} />;
}

