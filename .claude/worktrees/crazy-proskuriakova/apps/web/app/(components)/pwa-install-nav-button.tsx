"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@store-platform/ui";
import {
  type BeforeInstallPromptEvent,
  PWA_DISMISSED_STORAGE_KEY,
  PWA_INSTALLED_STORAGE_KEY,
  isStandaloneMode,
  readPwaStorageFlag,
  trackPwaInstallMetric,
  writePwaStorageFlag
} from "@/lib/pwa-install";

export function PwaInstallNavButton() {
  const pathname = usePathname();
  const isAdminArea = useMemo(() => pathname.startsWith("/admin"), [pathname]);

  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (
      isStandaloneMode() ||
      readPwaStorageFlag(PWA_DISMISSED_STORAGE_KEY) ||
      readPwaStorageFlag(PWA_INSTALLED_STORAGE_KEY)
    ) {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      setInstallEvent(promptEvent);
      setVisible(true);
    };

    const handleAppInstalled = () => {
      setInstallEvent(null);
      setVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (!visible || !installEvent || isAdminArea) {
    return null;
  }

  const handleInstall = async () => {
    trackPwaInstallMetric("prompt_opened");
    await installEvent.prompt();
    const choice = await installEvent.userChoice.catch(() => null);
    if (!choice) {
      return;
    }

    if (choice.outcome === "accepted") {
      writePwaStorageFlag(PWA_INSTALLED_STORAGE_KEY);
      setVisible(false);
      setInstallEvent(null);
      trackPwaInstallMetric("prompt_accepted");
      return;
    }

    trackPwaInstallMetric("prompt_dismissed");
  };

  return (
    <Button variant="ghost" size="sm" onClick={() => void handleInstall()}>
      Установить приложение
    </Button>
  );
}
