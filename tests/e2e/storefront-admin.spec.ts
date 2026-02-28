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

test("customer can checkout, then see order in admin", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Тихий люкс/i })).toBeVisible();

  await page.goto("/catalog");
  await expect(page.getByRole("heading", { name: "Каталог" })).toBeVisible();

  const checkoutResponse = await request.post(`${API_BASE_URL}/checkout`, {
    data: {
      cart: {
        items: [{ product_id: "p1", quantity: 1 }]
      },
      customer: {
        email: "e2e@example.com",
        name: "E2E Buyer",
        address_line1: "Main street 1",
        address_city: "Moscow",
        address_country: "RU",
        postal_code: "101000"
      }
    }
  });
  expect(checkoutResponse.ok()).toBeTruthy();
  const checkoutPayload = (await checkoutResponse.json()) as { order_id: string };
  const orderId = checkoutPayload.order_id;
  expect(orderId).toBeTruthy();

  await page.goto(`/checkout/success?order_id=${encodeURIComponent(orderId)}`);
  await expect(page.getByRole("heading", { name: "Заказ оформлен" })).toBeVisible();
  await expect(page.getByText(new RegExp(`Номер заказа:\\s*${orderId}`))).toBeVisible();

  await loginToAdmin(page);
  await expect(page.getByRole("heading", { name: "Заказы" })).toBeVisible();

  const orderLink = page.getByRole("link", { name: orderId });
  await expect(orderLink).toBeVisible();
  await orderLink.click();

  await expect(page.getByRole("heading", { name: new RegExp(`Заказ ${orderId}`) })).toBeVisible();
});

test("admin logout clears cookie and requires login again", async ({ page }) => {
  await loginToAdmin(page);

  await page.getByRole("button", { name: "Выйти" }).first().click();
  await expect(page).toHaveURL(/\/admin\/login/);

  await page.goto("/admin/orders");
  await expect(page).toHaveURL(/\/admin\/login/);
});
