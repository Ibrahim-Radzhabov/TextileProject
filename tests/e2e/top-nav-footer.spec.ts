import { expect, test } from "@playwright/test";

test.describe("storefront top-nav and footer qa", () => {
  test("desktop header and footer render expected structure", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });

    await expect(page.getByRole("navigation", { name: "Основная навигация" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Каталог" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Избранное" }).first()).toBeVisible();

    await expect(page.locator("button[aria-label='Открыть меню']")).toBeHidden();

    await expect(page.getByText("Подбор под интерьер")).toBeVisible();
    await expect(page.getByRole("link", { name: "Политика конфиденциальности" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Публичная оферта" })).toBeVisible();
  });

  test("mobile drawer supports open, focus, esc, overlay and body lock", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "networkidle" });

    const openButton = page.getByTestId("top-nav-mobile-open");
    await expect(openButton).toBeVisible();
    await openButton.click();

    const dialog = page.getByTestId("top-nav-mobile-menu");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Навигация")).toHaveCount(0);
    await expect(dialog.locator("a[href='/catalog']")).toHaveCount(0);
    await expect(dialog.locator("a[href='/favorites']")).toHaveCount(0);
    await expect(dialog.getByText("Клиентам")).toBeVisible();

    const openState = await page.evaluate(() => {
      const drawer = document.getElementById("top-nav-mobile-menu");
      return {
        overflow: document.body.style.overflow,
        focusInside: drawer ? drawer.contains(document.activeElement) : false
      };
    });
    expect(openState.overflow).toBe("hidden");
    expect(openState.focusInside).toBe(true);

    await page.keyboard.press("Tab");
    const tabState = await page.evaluate(() => {
      const drawer = document.getElementById("top-nav-mobile-menu");
      return drawer ? drawer.contains(document.activeElement) : false;
    });
    expect(tabState).toBe(true);

    await page.keyboard.press("Escape");
    await expect
      .poll(async () => page.evaluate(() => Boolean(document.getElementById("top-nav-mobile-menu"))), {
        timeout: 3000
      })
      .toBe(false);
    await expect
      .poll(async () => page.evaluate(() => document.body.style.overflow), {
        timeout: 3000
      })
      .toBe("");

    await openButton.click();
    await expect(dialog).toBeVisible();

    await page.getByTestId("top-nav-mobile-overlay").click({ position: { x: 5, y: 5 } });
    await expect
      .poll(async () => page.evaluate(() => Boolean(document.getElementById("top-nav-mobile-menu"))), {
        timeout: 3000
      })
      .toBe(false);
    await expect
      .poll(async () => page.evaluate(() => document.body.style.overflow), {
        timeout: 3000
      })
      .toBe("");
  });
});
