import { expect, test, type Page } from "@playwright/test";
import { createHmac } from "node:crypto";

const ADMIN_TOKEN = "e2e-admin";
const API_BASE_URL = "http://127.0.0.1:8000";
const E2E_STRIPE_WEBHOOK_SECRET = "whsec_e2e_test";

function signStripePayload(payload: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  return `t=${timestamp},v1=${signature}`;
}

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

  await page.goto(`/order-status?order_id=${encodeURIComponent(orderId)}`);
  await expect(page.getByRole("heading", { level: 1, name: "Статус заказа" })).toBeVisible();
  await expect(page.getByText(orderId)).toBeVisible();
  await expect(page.getByText("Ожидает оплаты")).toBeVisible();

  await loginToAdmin(page);
  await expect(page.getByRole("heading", { name: "Заказы" })).toBeVisible();

  await page.getByRole("link", { name: "Ожидают оплаты" }).click();
  await expect(page).toHaveURL(/payment_state=awaiting/);
  await expect(page.getByRole("link", { name: orderId })).toBeVisible();

  await page.getByRole("link", { name: "Оплаченные" }).click();
  await expect(page).toHaveURL(/payment_state=paid/);
  await expect(page.getByText("Заказы не найдены.")).toBeVisible();

  await page.getByRole("link", { name: "Все оплаты" }).click();
  await expect(page).toHaveURL(/\/admin\/orders$/);

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

test("stripe webhook marks order as paid and appears in paid filters/audit", async ({ request }) => {
  const checkoutResponse = await request.post(`${API_BASE_URL}/checkout`, {
    data: {
      cart: {
        items: [{ product_id: "p1", quantity: 1 }]
      },
      customer: {
        email: "webhook-e2e@example.com",
        name: "Webhook E2E"
      }
    }
  });
  expect(checkoutResponse.ok()).toBeTruthy();
  const checkoutPayload = (await checkoutResponse.json()) as { order_id: string };
  const orderId = checkoutPayload.order_id;
  expect(orderId).toBeTruthy();

  const eventPayload = JSON.stringify({
    id: `evt_e2e_${Date.now()}`,
    type: "checkout.session.async_payment_succeeded",
    livemode: false,
    account: null,
    data: {
      object: {
        id: `cs_test_e2e_${Date.now()}`,
        metadata: {
          order_id: orderId
        }
      }
    }
  });
  const signature = signStripePayload(eventPayload, E2E_STRIPE_WEBHOOK_SECRET);

  const webhookResponse = await request.post(`${API_BASE_URL}/webhooks/stripe`, {
    data: eventPayload,
    headers: {
      "content-type": "application/json",
      "stripe-signature": signature
    }
  });
  expect(webhookResponse.ok()).toBeTruthy();

  const orderResponse = await request.get(`${API_BASE_URL}/orders/${orderId}`);
  expect(orderResponse.ok()).toBeTruthy();
  const orderPayload = (await orderResponse.json()) as { status: string };
  expect(orderPayload.status).toBe("paid");

  const paidOrdersResponse = await request.get(`${API_BASE_URL}/orders?payment_state=paid`);
  expect(paidOrdersResponse.ok()).toBeTruthy();
  const paidOrdersPayload = (await paidOrdersResponse.json()) as {
    items: Array<{ order_id: string }>;
  };
  expect(paidOrdersPayload.items.some((item) => item.order_id === orderId)).toBeTruthy();

  const webhookAuditResponse = await request.get(
    `${API_BASE_URL}/webhooks/audit?order_id=${encodeURIComponent(orderId)}`
  );
  expect(webhookAuditResponse.ok()).toBeTruthy();
  const webhookAuditPayload = (await webhookAuditResponse.json()) as {
    items: Array<{ processing_status: string; order_status: string }>;
  };
  expect(webhookAuditPayload.items.length).toBeGreaterThan(0);
  expect(webhookAuditPayload.items[0]?.processing_status).toBe("processed");
  expect(webhookAuditPayload.items[0]?.order_status).toBe("paid");
});
