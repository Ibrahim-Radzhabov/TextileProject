"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@store-platform/ui";
import type { PwaInstallMetric } from "@store-platform/shared-types";
import {
  type BeforeInstallPromptEvent,
  type PwaPromptMode,
  PWA_DISMISSED_STORAGE_KEY,
  PWA_INSTALLED_STORAGE_KEY,
  isIosSafari,
  isStandaloneMode,
  readPwaStorageFlag,
  trackPwaInstallMetric,
  writePwaStorageFlag
} from "@/lib/pwa-install";

export function PwaInstallPrompt() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<PwaPromptMode | null>(null);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  const isAdminArea = useMemo(() => pathname.startsWith("/admin"), [pathname]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (
      isStandaloneMode() ||
      readPwaStorageFlag(PWA_INSTALLED_STORAGE_KEY) ||
      readPwaStorageFlag(PWA_DISMISSED_STORAGE_KEY)
    ) {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      setPromptEvent(installEvent);
      setMode("native");
      setVisible(true);
      trackPwaInstallMetric("prompt_available");
    };

    const handleAppInstalled = () => {
      writePwaStorageFlag(PWA_INSTALLED_STORAGE_KEY);
      setVisible(false);
      setPromptEvent(null);
      trackPwaInstallMetric("installed");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // iOS Safari doesn't fire beforeinstallprompt; show a one-time hint.
    if (isIosSafari()) {
      setMode("ios");
      setVisible(true);
      trackPwaInstallMetric("ios_hint_shown");
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (!visible || isAdminArea || !mode) {
    return null;
  }

  const closePrompt = (metric: PwaInstallMetric) => {
    writePwaStorageFlag(PWA_DISMISSED_STORAGE_KEY);
    setVisible(false);
    trackPwaInstallMetric(metric);
  };

  const onInstallClick = async () => {
    if (!promptEvent) {
      return;
    }

    trackPwaInstallMetric("prompt_opened");
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice.catch(() => null);
    if (!choice) {
      return;
    }

    if (choice.outcome === "accepted") {
      writePwaStorageFlag(PWA_INSTALLED_STORAGE_KEY);
      setVisible(false);
      setPromptEvent(null);
      trackPwaInstallMetric("prompt_accepted");
      return;
    }

    trackPwaInstallMetric("prompt_dismissed");
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
