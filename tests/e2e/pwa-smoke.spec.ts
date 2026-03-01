import { expect, test, type Page } from "@playwright/test";

const STORAGE_KEY_DISMISSED = "store-platform:pwa-install-dismissed";
const STORAGE_KEY_INSTALLED = "store-platform:pwa-install-installed";

type ManifestIcon = {
  src: string;
  sizes: string;
  type: string;
};

type WebManifest = {
  name: string;
  short_name: string;
  display: string;
  start_url: string;
  icons: ManifestIcon[];
};

async function ensureServiceWorkerControl(page: Page): Promise<void> {
  await page.goto("/", { waitUntil: "networkidle" });

  const registrationReady = await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) {
      return false;
    }

    await navigator.serviceWorker.ready;
    const registration = await navigator.serviceWorker.getRegistration();
    return Boolean(registration?.active);
  });

  expect(registrationReady).toBeTruthy();

  const hasController = await page.evaluate(() => Boolean(navigator.serviceWorker?.controller));
  if (!hasController) {
    await page.reload({ waitUntil: "networkidle" });
  }

  const controlledAfterReload = await page.evaluate(() => Boolean(navigator.serviceWorker?.controller));
  expect(controlledAfterReload).toBeTruthy();
}

test("pwa manifest and service worker assets are served", async ({ request }) => {
  const manifestResponse = await request.get("/manifest.webmanifest");
  expect(manifestResponse.ok()).toBeTruthy();
  expect(manifestResponse.headers()["content-type"] ?? "").toContain("json");
  const manifest = (await manifestResponse.json()) as WebManifest;

  expect(manifest.name.length).toBeGreaterThan(0);
  expect(manifest.short_name.length).toBeGreaterThan(0);
  expect(manifest.display).toBe("standalone");
  expect(manifest.start_url).toBe("/");
  expect(manifest.icons.some((icon) => icon.src === "/icons/icon-192.svg")).toBeTruthy();
  expect(manifest.icons.some((icon) => icon.src === "/icons/icon-512.svg")).toBeTruthy();

  const serviceWorkerResponse = await request.get("/sw.js");
  expect(serviceWorkerResponse.ok()).toBeTruthy();
  expect(serviceWorkerResponse.headers()["cache-control"]).toContain("no-cache");
  const serviceWorkerScript = await serviceWorkerResponse.text();
  expect(serviceWorkerScript).toContain("CACHE_VERSION");
  expect(serviceWorkerScript).toContain("OFFLINE_URL");
});

test("pwa install banner appears on beforeinstallprompt and can be dismissed", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(([dismissedKey, installedKey]) => {
    window.localStorage.removeItem(dismissedKey);
    window.localStorage.removeItem(installedKey);
  }, [STORAGE_KEY_DISMISSED, STORAGE_KEY_INSTALLED]);
  await page.reload({ waitUntil: "networkidle" });

  await page.evaluate(() => {
    const syntheticPrompt = new Event("beforeinstallprompt");
    Object.defineProperty(syntheticPrompt, "prompt", {
      value: async () => undefined
    });
    Object.defineProperty(syntheticPrompt, "userChoice", {
      value: Promise.resolve({ outcome: "dismissed", platform: "web" })
    });
    window.dispatchEvent(syntheticPrompt);
  });

  await expect(page.getByRole("heading", { level: 2, name: "Установите витрину на экран" })).toBeVisible();
  await page.getByRole("button", { name: "Позже" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Установите витрину на экран" })).toHaveCount(0);

  const dismissedStored = await page.evaluate((dismissedKey) => {
    return window.localStorage.getItem(dismissedKey);
  }, STORAGE_KEY_DISMISSED);
  expect(dismissedStored).toBe("1");
});

test("service worker serves offline fallback for navigation", async ({ page }) => {
  test.slow();

  await page.evaluate(([dismissedKey, installedKey]) => {
    window.localStorage.removeItem(dismissedKey);
    window.localStorage.removeItem(installedKey);
  }, [STORAGE_KEY_DISMISSED, STORAGE_KEY_INSTALLED]).catch(() => {
    // No-op: localStorage may not be available before initial navigation.
  });

  await ensureServiceWorkerControl(page);

  await page.context().setOffline(true);
  try {
    await page.goto("/catalog?offline_smoke=1", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1, name: "Connection lost." })).toBeVisible();
    await expect(page.getByText("The storefront is offline right now.")).toBeVisible();
  } finally {
    await page.context().setOffline(false);
  }
});
