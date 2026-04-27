import { expect, test, type Page } from "@playwright/test";

type OverflowMetrics = {
  scrollWidth: number;
  clientWidth: number;
  hasOverflow: boolean;
};

async function readOverflowMetrics(page: Page): Promise<OverflowMetrics> {
  return page.evaluate(() => {
    const root = document.scrollingElement ?? document.documentElement;
    const scrollWidth = root.scrollWidth;
    const clientWidth = root.clientWidth;
    return {
      scrollWidth,
      clientWidth,
      hasOverflow: scrollWidth > clientWidth + 1
    };
  });
}

test("catalog to PDP transition keeps layout stable", async ({ page }) => {
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

  const catalogOverflow = await readOverflowMetrics(page);
  expect(catalogOverflow.hasOverflow, JSON.stringify(catalogOverflow)).toBeFalsy();

  const firstCard = page.locator('[data-testid^="product-card-"]').first();
  await expect(firstCard).toBeVisible();

  const firstCardLink = firstCard.locator("a").first();
  await expect(firstCardLink).toHaveAttribute("href", /\/product\//);

  await firstCardLink.click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(250);

  await expect(page).toHaveURL(/\/product\//);
  await expect(page.locator("h1").first()).toBeVisible();

  const productOverflow = await readOverflowMetrics(page);
  expect(productOverflow.hasOverflow, JSON.stringify(productOverflow)).toBeFalsy();

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
