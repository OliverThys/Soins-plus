import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  define: {
    __SENTRY_DSN__: JSON.stringify(process.env.VITE_SENTRY_DSN ?? ""),
    __CLARITY_ID__: JSON.stringify(process.env.VITE_CLARITY_ID ?? ""),
  },
});

