import { expect, test, type Page } from "@playwright/test";

const ADMIN_TOKEN = "e2e-admin";
const API_BASE_URL = "http://127.0.0.1:8000";

async function loginToAdmin(page: Page) {
  await page.goto("/admin/orders");
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel("Admin token").fill(ADMIN_TOKEN);
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page).toHaveURL(/\/admin\/orders/);
}

test("admin pwa analytics page supports presets and csv export", async ({ page, request }) => {
  const trackedPath = `/e2e/pwa-ui-${Date.now()}`;
  const eventTimestamp = new Date().toISOString();

  const trackResponse = await request.post(`${API_BASE_URL}/metrics/pwa-install-events`, {
    data: {
      metric: "prompt_available",
      path: trackedPath,
      timestamp: eventTimestamp,
      source: "web"
    }
  });
  expect(trackResponse.status()).toBe(202);

  await loginToAdmin(page);
  await page.getByRole("link", { name: "PWA" }).click();
  await expect(page).toHaveURL(/\/admin\/analytics\/pwa/);

  await expect(page.getByRole("heading", { name: "PWA Analytics" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Динамика по дням" })).toBeVisible();

  await page.getByLabel("Path prefix").fill(trackedPath);
  await page.getByRole("button", { name: "Применить" }).click();
  await expect(page).toHaveURL(new RegExp(`path_prefix=${encodeURIComponent(trackedPath)}`));

  const initialExportHref = await page.getByRole("link", { name: "Экспорт CSV" }).first().getAttribute("href");
  expect(initialExportHref).not.toBeNull();
  expect(initialExportHref ?? "").toContain("/admin/analytics/pwa/export");
  expect(initialExportHref ?? "").toContain(`path_prefix=${encodeURIComponent(trackedPath)}`);

  await page.getByRole("link", { name: "7 дней" }).click();
  await expect(page).toHaveURL(new RegExp(`path_prefix=${encodeURIComponent(trackedPath)}`));
  await expect(page).toHaveURL(/date_from=\d{4}-\d{2}-\d{2}/);
  await expect(page).toHaveURL(/date_to=\d{4}-\d{2}-\d{2}/);

  const exportHref = await page.getByRole("link", { name: "Экспорт CSV" }).first().getAttribute("href");
  expect(exportHref).not.toBeNull();

  const exportResponse = await page.request.get(exportHref ?? "/admin/analytics/pwa/export", {
    headers: {
      "x-admin-token": ADMIN_TOKEN
    }
  });
  expect(exportResponse.ok()).toBeTruthy();
  expect(exportResponse.headers()["content-type"]).toContain("text/csv");

  const exportBody = await exportResponse.text();
  expect(exportBody).toContain("id,metric,path");
  expect(exportBody).toContain(trackedPath);
});
