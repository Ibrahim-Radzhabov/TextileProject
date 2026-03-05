import type { PwaInstallEventPayload, PwaInstallMetric } from "@store-platform/shared-types";

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export type PwaPromptMode = "native" | "ios";

export const PWA_DISMISSED_STORAGE_KEY = "store-platform:pwa-install-dismissed";
export const PWA_INSTALLED_STORAGE_KEY = "store-platform:pwa-install-installed";
export const PWA_INSTALL_TRACK_EVENT_NAME = "store-platform:pwa-install";

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readPwaStorageFlag(key: string): boolean {
  if (!canUseLocalStorage()) {
    return false;
  }

  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

export function writePwaStorageFlag(key: string): void {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(key, "1");
  } catch {
    // No-op: best effort persistence.
  }
}

export function isStandaloneMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const displayModeStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone = Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
  return displayModeStandalone || iosStandalone;
}

export function isIosSafari(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent;
  const iosDevice = /iP(ad|hone|od)/i.test(ua);
  const webkit = /WebKit/i.test(ua);
  const excluded = /CriOS|FxiOS|OPiOS|EdgiOS/i.test(ua);
  return iosDevice && webkit && !excluded;
}

function resolveTrackEndpoint(): string {
  const explicitEndpoint = process.env.NEXT_PUBLIC_PWA_TRACK_URL?.trim();
  if (explicitEndpoint) {
    return explicitEndpoint;
  }

  const apiBase = (process.env.NEXT_PUBLIC_STORE_API_URL ?? "http://127.0.0.1:8000").trim();
  return `${apiBase.replace(/\/+$/, "")}/metrics/pwa-install-events`;
}

export function trackPwaInstallMetric(metric: PwaInstallMetric): void {
  if (typeof window === "undefined") {
    return;
  }

  const payload: PwaInstallEventPayload = {
    metric,
    path: window.location.pathname,
    timestamp: new Date().toISOString(),
    source: "web"
  };

  window.dispatchEvent(
    new CustomEvent(PWA_INSTALL_TRACK_EVENT_NAME, {
      detail: payload
    })
  );

  const trackEndpoint = resolveTrackEndpoint();
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(trackEndpoint, blob);
    return;
  }

  void fetch(trackEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true
  }).catch(() => {
    // No-op: tracking should not affect UX.
  });
}
