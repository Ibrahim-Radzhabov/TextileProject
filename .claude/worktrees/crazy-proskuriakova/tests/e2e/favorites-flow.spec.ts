import { expect, test } from "@playwright/test";

test("favorites flow allows save and remove from catalog", async ({ page }) => {
  await page.goto("/catalog", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Каталог" })).toBeVisible();

  const firstCard = page.locator('[data-testid^="product-card-"]').first();
  await expect(firstCard).toBeVisible();

  const firstTitle = firstCard.locator('[id^="product-card-title-"]').first();
  const productName = (await firstTitle.textContent())?.trim() ?? "";
  expect(productName.length).toBeGreaterThan(0);

  await firstCard.getByRole("button", { name: /в избранное/ }).click();

  await page.goto("/favorites", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Ваши избранные ткани" })).toBeVisible();
  await expect(page.getByText(productName).first()).toBeVisible();

  await page.getByRole("button", { name: /Убрать .* из избранного/ }).first().click();
  await expect(page.getByRole("heading", { name: "Сохраненные позиции" })).toBeVisible();
});
