"use client";

import { useEffect } from "react";

const SERVICE_WORKER_PATH = "/sw.js";

export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    void navigator.serviceWorker.register(SERVICE_WORKER_PATH).catch((error) => {
      console.error("Service worker registration failed", error);
    });
  }, []);

  return null;
}
