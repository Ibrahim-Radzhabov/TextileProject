"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@store-platform/ui";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type PromptMode = "native" | "ios";

const STORAGE_KEY_DISMISSED = "store-platform:pwa-install-dismissed";
const STORAGE_KEY_INSTALLED = "store-platform:pwa-install-installed";
const TRACK_EVENT_NAME = "store-platform:pwa-install";
const INSTALL_TRACK_ENDPOINT = process.env.NEXT_PUBLIC_PWA_TRACK_URL;

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStorageFlag(key: string): boolean {
  if (!canUseLocalStorage()) {
    return false;
  }

  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeStorageFlag(key: string): void {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(key, "1");
  } catch {
    // No-op: best effort persistence.
  }
}

function isStandaloneMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const displayModeStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone = Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
  return displayModeStandalone || iosStandalone;
}

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent;
  const iosDevice = /iP(ad|hone|od)/i.test(ua);
  const webkit = /WebKit/i.test(ua);
  const excluded = /CriOS|FxiOS|OPiOS|EdgiOS/i.test(ua);
  return iosDevice && webkit && !excluded;
}

function trackInstallMetric(metric: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    metric,
    path: window.location.pathname,
    timestamp: new Date().toISOString()
  };

  window.dispatchEvent(
    new CustomEvent(TRACK_EVENT_NAME, {
      detail: payload
    })
  );

  if (!INSTALL_TRACK_ENDPOINT) {
    return;
  }

  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    navigator.sendBeacon(INSTALL_TRACK_ENDPOINT, body);
    return;
  }

  void fetch(INSTALL_TRACK_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true
  }).catch(() => {
    // No-op: tracking should not affect UX.
  });
}

export function PwaInstallPrompt() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<PromptMode | null>(null);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  const isAdminArea = useMemo(() => pathname.startsWith("/admin"), [pathname]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (isStandaloneMode() || readStorageFlag(STORAGE_KEY_INSTALLED) || readStorageFlag(STORAGE_KEY_DISMISSED)) {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      setPromptEvent(installEvent);
      setMode("native");
      setVisible(true);
      trackInstallMetric("prompt_available");
    };

    const handleAppInstalled = () => {
      writeStorageFlag(STORAGE_KEY_INSTALLED);
      setVisible(false);
      setPromptEvent(null);
      trackInstallMetric("installed");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // iOS Safari doesn't fire beforeinstallprompt; show a one-time hint.
    if (isIosSafari()) {
      setMode("ios");
      setVisible(true);
      trackInstallMetric("ios_hint_shown");
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (!visible || isAdminArea || !mode) {
    return null;
  }

  const closePrompt = (metric: string) => {
    writeStorageFlag(STORAGE_KEY_DISMISSED);
    setVisible(false);
    trackInstallMetric(metric);
  };

  const onInstallClick = async () => {
    if (!promptEvent) {
      return;
    }

    trackInstallMetric("prompt_opened");
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice.catch(() => null);
    if (!choice) {
      return;
    }

    if (choice.outcome === "accepted") {
      writeStorageFlag(STORAGE_KEY_INSTALLED);
      setVisible(false);
      setPromptEvent(null);
      trackInstallMetric("prompt_accepted");
      return;
    }

    trackInstallMetric("prompt_dismissed");
  };

  return (
    <AnimatePresence>
      <motion.section
        key="pwa-install"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="fixed inset-x-0 bottom-4 z-50 px-4 sm:bottom-6"
      >
        <div className="mx-auto w-full max-w-lg rounded-3xl border border-border/70 bg-surface-strong p-4 shadow-floating backdrop-blur-2xl sm:p-5">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">PWA install</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {mode === "native" ? "Установите витрину на экран" : "Добавьте витрину на Home Screen"}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {mode === "native"
                ? "Быстрый запуск, офлайн-страницы и нативный опыт на смартфоне."
                : "В Safari нажмите Поделиться, затем выберите «На экран Домой»."}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {mode === "native" && (
              <Button size="sm" onClick={() => void onInstallClick()}>
                Установить
              </Button>
            )}
            <Button
              variant={mode === "native" ? "ghost" : "secondary"}
              size="sm"
              onClick={() => closePrompt("banner_dismissed")}
            >
              {mode === "native" ? "Позже" : "Понятно"}
            </Button>
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
