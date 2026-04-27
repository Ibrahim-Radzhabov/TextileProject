"use client";

import { useEffect } from "react";

const SERVICE_WORKER_PATH = "/sw.js";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      // In local dev we aggressively remove stale production SW registrations,
      // otherwise old offline fallback may keep intercepting requests.
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .catch(() => undefined);
      return;
    }

    void navigator.serviceWorker.register(SERVICE_WORKER_PATH).catch((error) => {
      console.error("Service worker registration failed", error);
    });
  }, []);

  return null;
}
