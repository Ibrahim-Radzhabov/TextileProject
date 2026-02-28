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
  const createdOrderResponse = await request.get(`${API_BASE_URL}/orders/${orderId}`);
  expect(createdOrderResponse.ok()).toBeTruthy();
  const createdOrderPayload = (await createdOrderResponse.json()) as { created_at: string };
  const createdOrderDate = new Date(createdOrderPayload.created_at).toISOString().slice(0, 10);

  await page.goto(`/checkout/success?order_id=${encodeURIComponent(orderId)}`);
  await expect(page.getByRole("heading", { name: "Заказ оформлен" })).toBeVisible();
  await expect(page.getByText(new RegExp(`Номер заказа:\\s*${orderId}`))).toBeVisible();

  await page.goto(`/order-status?order_id=${encodeURIComponent(orderId)}`);
  await expect(page.getByRole("heading", { level: 1, name: "Статус заказа" })).toBeVisible();
  await expect(page.getByText(orderId)).toBeVisible();
  await expect(page.getByText("Ожидает оплаты").first()).toBeVisible();
  await expect(page.getByText("Ход заказа")).toBeVisible();
  await expect(page.getByText("Заказ создан")).toBeVisible();

  await loginToAdmin(page);
  await expect(page.getByRole("heading", { name: "Заказы" })).toBeVisible();
  await page.getByLabel(/Поиск/).fill("e2e@example.com");
  await page.getByLabel("С даты").fill(createdOrderDate);
  await page.getByRole("button", { name: "Применить" }).click();
  await expect(page).toHaveURL(/q=e2e%40example\.com/);
  await expect(page).toHaveURL(new RegExp(`created_from=${createdOrderDate}`));
  await expect(page.getByRole("link", { name: orderId })).toBeVisible();

  await page.getByRole("link", { name: "Ожидают оплаты" }).click();
  await expect(page).toHaveURL(/payment_state=awaiting/);
  await expect(page.getByRole("link", { name: orderId })).toBeVisible();

  await page.getByRole("link", { name: "Оплаченные" }).click();
  await expect(page).toHaveURL(/payment_state=paid/);
  await expect(page.getByText("Заказы не найдены.")).toBeVisible();

  await page.getByRole("link", { name: "Все оплаты" }).click();
  await expect(page).toHaveURL(/\/admin\/orders\?/);
  await expect(page).not.toHaveURL(/payment_state=/);

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

test("admin can update status to shipped and export filtered CSV", async ({ page, request }) => {
  const email = `status-e2e-${Date.now()}@example.com`;
  const checkoutResponse = await request.post(`${API_BASE_URL}/checkout`, {
    data: {
      cart: {
        items: [{ product_id: "p1", quantity: 1 }]
      },
      customer: {
        email,
        name: "Status E2E"
      }
    }
  });
  expect(checkoutResponse.ok()).toBeTruthy();
  const checkoutPayload = (await checkoutResponse.json()) as { order_id: string };
  const orderId = checkoutPayload.order_id;
  expect(orderId).toBeTruthy();

  const webhookPayload = JSON.stringify({
    id: `evt_status_e2e_${Date.now()}`,
    type: "checkout.session.async_payment_succeeded",
    livemode: false,
    account: null,
    data: {
      object: {
        id: `cs_status_e2e_${Date.now()}`,
        metadata: {
          order_id: orderId
        }
      }
    }
  });
  const webhookSignature = signStripePayload(webhookPayload, E2E_STRIPE_WEBHOOK_SECRET);
  const webhookResponse = await request.post(`${API_BASE_URL}/webhooks/stripe`, {
    data: webhookPayload,
    headers: {
      "content-type": "application/json",
      "stripe-signature": webhookSignature
    }
  });
  expect(webhookResponse.ok()).toBeTruthy();

  await loginToAdmin(page);
  await page.getByLabel(/Поиск/).fill(email);
  await page.getByLabel("Сортировка").selectOption("oldest");
  await page.getByRole("button", { name: "Применить" }).click();
  await expect(page).toHaveURL(new RegExp(`q=${encodeURIComponent(email)}`));
  await expect(page).toHaveURL(/sort=oldest/);
  const exportHref = await page.getByRole("link", { name: "Экспорт CSV" }).getAttribute("href");
  expect(exportHref).not.toBeNull();
  expect(exportHref).toContain(`/admin/orders/export?q=${encodeURIComponent(email)}`);
  expect(exportHref).toContain("sort=oldest");
  const orderRow = page.locator("tr", { has: page.getByRole("link", { name: orderId }) });

  await orderRow.getByRole("button", { name: "В обработку" }).click();
  await expect(page.getByText("Статус обновлён: processing.")).toBeVisible();
  await expect(orderRow.getByText("processing")).toBeVisible();

  await orderRow.getByRole("button", { name: "Отправлен" }).click();
  await expect(page.getByText("Статус обновлён: shipped.")).toBeVisible();
  await expect(orderRow.getByText("shipped").first()).toBeVisible();

  await orderRow.getByRole("link", { name: orderId }).click();
  await expect(page.getByRole("heading", { name: new RegExp(`Заказ ${orderId}`) })).toBeVisible();
  await page.getByLabel("Статус назначения").selectOption("shipped");
  await page.getByLabel("Источник").selectOption("admin");
  await page.getByLabel("Сортировка").selectOption("oldest");
  await page.getByRole("button", { name: "Применить фильтры" }).click();
  await expect(page).toHaveURL(/status_audit_to=shipped/);
  await expect(page).toHaveURL(/status_audit_actor=admin/);
  await expect(page).toHaveURL(/status_audit_sort=oldest/);
  await expect(page.getByText("shipped").first()).toBeVisible();

  const paidOrdersResponse = await request.get(`${API_BASE_URL}/orders?payment_state=paid`);
  expect(paidOrdersResponse.ok()).toBeTruthy();
  const paidOrdersPayload = (await paidOrdersResponse.json()) as {
    items: Array<{ order_id: string }>;
  };
  expect(paidOrdersPayload.items.some((item) => item.order_id === orderId)).toBeTruthy();

  const statusAuditResponse = await request.get(
    `${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/status-audit?actor_type=admin&sort=newest&limit=1&offset=0`
  );
  expect(statusAuditResponse.ok()).toBeTruthy();
  const statusAuditPayload = (await statusAuditResponse.json()) as {
    items: Array<{ id: number; to_status: string; actor_type: string }>;
    total: number;
  };
  expect(statusAuditPayload.total).toBeGreaterThanOrEqual(2);
  expect(statusAuditPayload.items[0]?.actor_type).toBe("admin");

  const statusAuditSecondPageResponse = await request.get(
    `${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/status-audit?actor_type=admin&sort=newest&limit=1&offset=1`
  );
  expect(statusAuditSecondPageResponse.ok()).toBeTruthy();
  const statusAuditSecondPagePayload = (await statusAuditSecondPageResponse.json()) as {
    items: Array<{ id: number; to_status: string; actor_type: string }>;
  };
  expect(statusAuditSecondPagePayload.items.length).toBeGreaterThan(0);
  expect(statusAuditSecondPagePayload.items[0]?.id).not.toBe(statusAuditPayload.items[0]?.id);

  const statusAuditOldestResponse = await request.get(
    `${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/status-audit?actor_type=admin&sort=oldest&limit=1&offset=0`
  );
  expect(statusAuditOldestResponse.ok()).toBeTruthy();
  const statusAuditOldestPayload = (await statusAuditOldestResponse.json()) as {
    items: Array<{ id: number; to_status: string; actor_type: string }>;
  };
  expect(statusAuditOldestPayload.items.length).toBeGreaterThan(0);
  expect(statusAuditOldestPayload.items[0]?.id).not.toBe(statusAuditPayload.items[0]?.id);
  expect(statusAuditPayload.items[0]?.id).toBeGreaterThan(statusAuditOldestPayload.items[0]?.id);

  const shippedStatusAuditResponse = await request.get(
    `${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/status-audit?actor_type=admin&to_status=shipped`
  );
  expect(shippedStatusAuditResponse.ok()).toBeTruthy();
  const shippedStatusAuditPayload = (await shippedStatusAuditResponse.json()) as {
    items: Array<{ to_status: string; actor_type: string }>;
  };
  expect(
    shippedStatusAuditPayload.items.some(
      (item) => item.to_status === "shipped" && item.actor_type === "admin"
    )
  ).toBeTruthy();

  const csvResponse = await request.get(
    `${API_BASE_URL}/orders/export.csv?status=shipped&q=${encodeURIComponent(email)}&sort=oldest`
  );
  expect(csvResponse.ok()).toBeTruthy();
  expect(csvResponse.headers()["content-type"]).toContain("text/csv");
  const csvBody = await csvResponse.text();
  expect(csvBody).toContain(orderId);
  expect(csvBody).toContain("shipped");
  expect(csvBody).toContain(email);
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
