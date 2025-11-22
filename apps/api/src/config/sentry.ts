import * as Sentry from "@sentry/node";
import { env } from "./env";

export const initSentry = () => {
  if (!env.sentryDsn) {
    console.log("Sentry disabled (no DSN provided)");
    return;
  }

  Sentry.init({
    dsn: env.sentryDsn,
    tracesSampleRate: 1.0,
    environment: env.nodeEnv,
  });
};

