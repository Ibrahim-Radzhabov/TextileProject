import { expect, test } from "@playwright/test";

test("favorites sync flow persists after reload and reflects on PDP", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: /Тихий люкс/i })).toBeVisible();

  const firstCard = page.locator('[data-testid^="product-card-"]').first();
  await expect(firstCard).toBeVisible();

  const firstTitle = firstCard.locator('[id^="product-card-title-"]').first();
  const productName = (await firstTitle.textContent())?.trim() ?? "";
  expect(productName.length).toBeGreaterThan(0);

  await firstCard.getByRole("button", { name: /Добавить .* в избранное/ }).click();
  await expect(firstCard.getByRole("button", { name: /Убрать .* из избранного/ })).toBeVisible();

  await page.reload({ waitUntil: "networkidle" });
  const cardAfterReload = page.locator('[data-testid^="product-card-"]').filter({ hasText: productName }).first();
  await expect(cardAfterReload).toBeVisible();
  await expect(cardAfterReload.getByRole("button", { name: /Убрать .* из избранного/ })).toBeVisible();

  await page.goto("/favorites", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Ваши избранные ткани" })).toBeVisible();
  await expect(page.getByText(productName).first()).toBeVisible();

  await page.getByRole("link", { name: new RegExp(`Открыть товар ${productName}`) }).first().click();
  await expect(page).toHaveURL(/\/product\//);

  const pdpToggleFavorite = page.getByTestId("pdp-toggle-favorite");
  await expect(pdpToggleFavorite).toBeVisible();
  await expect(pdpToggleFavorite).toHaveAttribute("aria-label", /Убрать .* из избранного/);

  await pdpToggleFavorite.click();
  await expect(pdpToggleFavorite).toHaveAttribute("aria-label", /Добавить .* в избранное/);
});
