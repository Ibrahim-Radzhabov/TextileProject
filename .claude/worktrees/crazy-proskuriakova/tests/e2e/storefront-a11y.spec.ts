import { expect, test, type Page } from "@playwright/test";

async function tabUntil(page: Page, predicate: () => Promise<boolean>, attempts = 60): Promise<void> {
  for (let index = 0; index < attempts; index += 1) {
    await page.keyboard.press("Tab");
    if (await predicate()) {
      return;
    }
  }
  throw new Error("Unable to reach target element via keyboard tab flow");
}

test("catalog and PDP core controls are keyboard reachable", async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (entry) => {
    if (entry.type() === "error") {
      consoleErrors.push(entry.text());
    }
  });
  page.on("pageerror", (error) => {
    pageErrors.push(String(error));
  });

  await page.goto("/catalog", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Каталог" })).toBeVisible();

  await tabUntil(page, async () => {
    return page.evaluate(() => {
      const active = document.activeElement as HTMLAnchorElement | null;
      if (!active || active.tagName !== "A") {
        return false;
      }
      const href = active.getAttribute("href") ?? "";
      return href.startsWith("/product/");
    });
  });

  await page.keyboard.press("Enter");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/\/product\//);
  await expect(page.getByRole("tabpanel", { name: "Галерея товара" })).toBeVisible();

  const firstThumb = page.getByTestId("product-gallery-thumb-1");
  const secondThumb = page.getByTestId("product-gallery-thumb-2");
  const hasThumbNavigation = (await firstThumb.count()) > 0 && (await secondThumb.count()) > 0;

  if (hasThumbNavigation) {
    await expect(firstThumb).toBeVisible();
    await expect(secondThumb).toBeVisible();

    await firstThumb.focus();
    await expect(firstThumb).toBeFocused();
    await expect(firstThumb).toHaveAttribute("role", "tab");
    await expect(firstThumb).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("ArrowRight");
    await expect(secondThumb).toBeFocused();
    await expect(secondThumb).toHaveAttribute("aria-selected", "true");
  }

  await tabUntil(page, async () => {
    return page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null;
      return active?.getAttribute("data-testid") === "pdp-add-to-cart";
    });
  });

  const addToCartButton = page.getByTestId("pdp-add-to-cart");
  await expect(addToCartButton).toBeFocused();
  await expect(addToCartButton).toBeVisible();
  await expect(addToCartButton).toBeEnabled();

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
