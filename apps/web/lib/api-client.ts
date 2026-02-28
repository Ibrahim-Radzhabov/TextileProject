import type {
  Cart,
  CatalogConfig,
  Product,
  StorefrontConfig
} from "@store-platform/shared-types";

const PUBLIC_API_URL = process.env.NEXT_PUBLIC_STORE_API_URL ?? "http://localhost:8000";
const INTERNAL_API_URL = process.env.STORE_API_URL ?? PUBLIC_API_URL;

function resolveApiUrl(): string {
  return typeof window === "undefined" ? INTERNAL_API_URL : PUBLIC_API_URL;
}

type MoneyDto = {
  currency: string;
  amount: number;
};

type ProductDto = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  shortDescription?: string;
  short_description?: string;
  price: MoneyDto;
  compareAtPrice?: MoneyDto;
  compare_at_price?: MoneyDto;
  badges?: Product["badges"];
  tags?: string[];
  media: Product["media"];
  isFeatured?: boolean;
  is_featured?: boolean;
  metadata?: Product["metadata"];
};

type CartItemDto = {
  id: string;
  productId?: string;
  product_id?: string;
  quantity: number;
  unitPrice?: MoneyDto;
  unit_price?: MoneyDto;
  lineTotal?: MoneyDto;
  line_total?: MoneyDto;
  productSnapshot?: Cart["items"][number]["productSnapshot"];
  product_snapshot?: Cart["items"][number]["productSnapshot"];
};

type CartTotalsDto = {
  subtotal: MoneyDto;
  discountTotal?: MoneyDto;
  discount_total?: MoneyDto;
  shippingTotal?: MoneyDto;
  shipping_total?: MoneyDto;
  taxTotal?: MoneyDto;
  tax_total?: MoneyDto;
  grandTotal?: MoneyDto;
  grand_total?: MoneyDto;
};

type CartDto = {
  id: string;
  items: CartItemDto[];
  totals: CartTotalsDto;
  currency: string;
};

type CheckoutResponseDto = {
  orderId?: string;
  order_id?: string;
  status: "pending" | "redirect" | "confirmed";
  stripeSessionId?: string | null;
  stripe_session_id?: string | null;
  redirectUrl?: string | null;
  redirect_url?: string | null;
};

type CheckoutCustomerDto = {
  email: string;
  name?: string;
  address_line1?: string;
  address_city?: string;
  address_country?: string;
  postal_code?: string;
};

type StoredOrderDto = {
  order_id: string;
  client_id: string;
  status: "pending" | "redirect" | "confirmed" | "paid" | "failed" | "cancelled";
  currency: string;
  amount: number;
  stripe_session_id?: string | null;
  redirect_url?: string | null;
  cart: CartDto;
  customer: CheckoutCustomerDto;
  created_at: string;
  updated_at: string;
};

type StoredOrderListResponseDto = {
  items: StoredOrderDto[];
  total: number;
  limit: number;
  offset: number;
};

type StripeWebhookAuditEntryDto = {
  id: number;
  event_id: string;
  livemode: boolean;
  account_id: string;
  client_id: string;
  event_type: string;
  order_id?: string | null;
  stripe_session_id?: string | null;
  processing_status: "processing" | "processed" | "ignored" | "failed";
  order_status?: "paid" | "failed" | "cancelled" | null;
  error_text?: string | null;
  created_at: string;
  updated_at: string;
};

type StripeWebhookAuditListResponseDto = {
  items: StripeWebhookAuditEntryDto[];
  total: number;
  limit: number;
  offset: number;
};

type StorefrontConfigDto = Omit<StorefrontConfig, "shop" | "catalog" | "integrations"> & {
  shop: {
    id: string;
    name: string;
    logo?: {
      src: string;
      alt: string;
    };
    primaryLocale?: string;
    primary_locale?: string;
    currency: string;
  };
  catalog: {
    products: ProductDto[];
  };
  integrations: {
    stripe?: {
      type: "stripe";
      publishableKey?: string;
      publishable_key?: string;
      secretKey?: string;
      secret_key?: string;
      webhookSecret?: string;
      webhook_secret?: string;
    };
    telegram?: {
      type: "telegram";
      botToken?: string;
      bot_token?: string;
      chatId?: string;
      chat_id?: string;
    };
  };
};

export class ApiError extends Error {
  status: number;
  detail?: string;
  payload?: unknown;

  constructor(message: string, options: { status: number; detail?: string; payload?: unknown }) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.detail = options.detail;
    this.payload = options.payload;
  }
}

function getRequired<T>(value: T | undefined, field: string): T {
  if (value === undefined) {
    throw new Error(`Invalid API payload: missing "${field}"`);
  }
  return value;
}

function normalizeProduct(product: ProductDto): Product {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    shortDescription: product.shortDescription ?? product.short_description,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? product.compare_at_price,
    badges: product.badges,
    tags: product.tags,
    media: product.media,
    isFeatured: product.isFeatured ?? product.is_featured,
    metadata: product.metadata
  };
}

function normalizeCart(cart: CartDto): Cart {
  return {
    id: cart.id,
    currency: cart.currency,
    items: cart.items.map((item) => {
      const productId = item.productId ?? item.product_id;
      const unitPrice = item.unitPrice ?? item.unit_price;
      const lineTotal = item.lineTotal ?? item.line_total;
      const productSnapshot = item.productSnapshot ?? item.product_snapshot;

      return {
        id: item.id,
        productId: getRequired(productId, "cart.items[].productId"),
        quantity: item.quantity,
        unitPrice: getRequired(unitPrice, "cart.items[].unitPrice"),
        lineTotal: getRequired(lineTotal, "cart.items[].lineTotal"),
        productSnapshot: getRequired(productSnapshot, "cart.items[].productSnapshot")
      };
    }),
    totals: {
      subtotal: cart.totals.subtotal,
      discountTotal: cart.totals.discountTotal ?? cart.totals.discount_total,
      shippingTotal: cart.totals.shippingTotal ?? cart.totals.shipping_total,
      taxTotal: cart.totals.taxTotal ?? cart.totals.tax_total,
      grandTotal:
        cart.totals.grandTotal ??
        cart.totals.grand_total ??
        cart.totals.subtotal
    }
  };
}

function normalizeStorefrontConfig(config: StorefrontConfigDto): StorefrontConfig {
  const primaryLocale = config.shop.primaryLocale ?? config.shop.primary_locale;

  const stripe = config.integrations.stripe;
  const normalizedStripe =
    stripe &&
    (stripe.publishableKey ?? stripe.publishable_key) &&
    (stripe.secretKey ?? stripe.secret_key)
      ? {
          type: "stripe" as const,
          publishableKey: stripe.publishableKey ?? stripe.publishable_key ?? "",
          secretKey: stripe.secretKey ?? stripe.secret_key ?? "",
          webhookSecret: stripe.webhookSecret ?? stripe.webhook_secret
        }
      : undefined;

  const telegram = config.integrations.telegram;
  const normalizedTelegram =
    telegram &&
    (telegram.botToken ?? telegram.bot_token) &&
    (telegram.chatId ?? telegram.chat_id)
      ? {
          type: "telegram" as const,
          botToken: telegram.botToken ?? telegram.bot_token ?? "",
          chatId: telegram.chatId ?? telegram.chat_id ?? ""
        }
      : undefined;

  return {
    ...config,
    shop: {
      ...config.shop,
      primaryLocale: getRequired(primaryLocale, "shop.primaryLocale")
    },
    catalog: {
      products: config.catalog.products.map((product) => normalizeProduct(product))
    },
    integrations: {
      stripe: normalizedStripe,
      telegram: normalizedTelegram
    }
  };
}

function normalizeCheckoutCustomer(dto: CheckoutCustomerDto): CheckoutPayload["customer"] {
  return {
    email: dto.email,
    name: dto.name,
    addressLine1: dto.address_line1,
    addressCity: dto.address_city,
    addressCountry: dto.address_country,
    postalCode: dto.postal_code
  };
}

export type OrderStatus = "pending" | "redirect" | "confirmed" | "paid" | "failed" | "cancelled";
export type OrderPaymentState = "awaiting" | "paid" | "failed" | "cancelled";

export type StoredOrder = {
  orderId: string;
  clientId: string;
  status: OrderStatus;
  currency: string;
  amount: number;
  stripeSessionId?: string | null;
  redirectUrl?: string | null;
  cart: Cart;
  customer: CheckoutPayload["customer"];
  createdAt: string;
  updatedAt: string;
};

export type OrdersListResponse = {
  items: StoredOrder[];
  total: number;
  limit: number;
  offset: number;
};

export type WebhookProcessingStatus = "processing" | "processed" | "ignored" | "failed";

export type StripeWebhookAuditEntry = {
  id: number;
  eventId: string;
  livemode: boolean;
  accountId: string;
  clientId: string;
  eventType: string;
  orderId?: string | null;
  stripeSessionId?: string | null;
  processingStatus: WebhookProcessingStatus;
  orderStatus?: "paid" | "failed" | "cancelled" | null;
  errorText?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StripeWebhookAuditListResponse = {
  items: StripeWebhookAuditEntry[];
  total: number;
  limit: number;
  offset: number;
};

function normalizeStoredOrder(dto: StoredOrderDto): StoredOrder {
  return {
    orderId: dto.order_id,
    clientId: dto.client_id,
    status: dto.status,
    currency: dto.currency,
    amount: dto.amount,
    stripeSessionId: dto.stripe_session_id ?? null,
    redirectUrl: dto.redirect_url ?? null,
    cart: normalizeCart(dto.cart),
    customer: normalizeCheckoutCustomer(dto.customer),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at
  };
}

function normalizeStripeWebhookAuditEntry(dto: StripeWebhookAuditEntryDto): StripeWebhookAuditEntry {
  return {
    id: dto.id,
    eventId: dto.event_id,
    livemode: dto.livemode,
    accountId: dto.account_id,
    clientId: dto.client_id,
    eventType: dto.event_type,
    orderId: dto.order_id ?? null,
    stripeSessionId: dto.stripe_session_id ?? null,
    processingStatus: dto.processing_status,
    orderStatus: dto.order_status ?? null,
    errorText: dto.error_text ?? null,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at
  };
}

async function handleJson<T>(res: Response): Promise<T> {
  const payload = (await res.json().catch(() => null)) as { detail?: unknown } | null;
  if (!res.ok) {
    const detail = typeof payload?.detail === "string" ? payload.detail : undefined;
    throw new ApiError(detail ?? `API error: ${res.status}`, {
      status: res.status,
      detail,
      payload
    });
  }
  return payload as T;
}

export async function fetchStorefrontConfig(): Promise<StorefrontConfig> {
  const res = await fetch(`${resolveApiUrl()}/storefront/config`, {
    next: { revalidate: 30 }
  });
  const dto = await handleJson<StorefrontConfigDto>(res);
  return normalizeStorefrontConfig(dto);
}

export type CartPricePayload = {
  items: { productId: string; quantity: number }[];
};

export async function priceCart(payload: CartPricePayload): Promise<Cart> {
  const res = await fetch(`${resolveApiUrl()}/cart/price`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      items: payload.items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity
      }))
    })
  });

  const dto = await handleJson<CartDto>(res);
  return normalizeCart(dto);
}

export async function fetchCatalog(): Promise<CatalogConfig> {
  const res = await fetch(`${resolveApiUrl()}/catalog`);
  const dto = await handleJson<{ products: ProductDto[] }>(res);
  return {
    products: dto.products.map((product) => normalizeProduct(product))
  };
}

export async function fetchProduct(slug: string): Promise<Product> {
  const res = await fetch(`${resolveApiUrl()}/catalog/${slug}`);
  const dto = await handleJson<ProductDto>(res);
  return normalizeProduct(dto);
}

export type CheckoutPayload = {
  cart: CartPricePayload;
  idempotencyKey?: string;
  customer: {
    email: string;
    name?: string;
    addressLine1?: string;
    addressCity?: string;
    addressCountry?: string;
    postalCode?: string;
  };
};

export type CheckoutResponse = {
  orderId: string;
  status: "pending" | "redirect" | "confirmed";
  stripeSessionId?: string | null;
  redirectUrl?: string | null;
};

export async function checkout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (payload.idempotencyKey) {
    headers["Idempotency-Key"] = payload.idempotencyKey;
  }

  const res = await fetch(`${resolveApiUrl()}/checkout`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      cart: {
        items: payload.cart.items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity
        }))
      },
      customer: {
        email: payload.customer.email,
        name: payload.customer.name,
        address_line1: payload.customer.addressLine1,
        address_city: payload.customer.addressCity,
        address_country: payload.customer.addressCountry,
        postal_code: payload.customer.postalCode
      }
    })
  });

  const dto = await handleJson<CheckoutResponseDto>(res);
  const orderId = dto.orderId ?? dto.order_id;

  return {
    orderId: getRequired(orderId, "checkout.orderId"),
    status: dto.status,
    stripeSessionId: dto.stripeSessionId ?? dto.stripe_session_id,
    redirectUrl: dto.redirectUrl ?? dto.redirect_url
  };
}

export async function fetchOrders(options?: {
  status?: OrderStatus;
  paymentState?: OrderPaymentState;
  query?: string;
  createdFrom?: string;
  createdTo?: string;
  limit?: number;
  offset?: number;
}): Promise<OrdersListResponse> {
  const params = new URLSearchParams();
  if (options?.status) {
    params.set("status", options.status);
  }
  if (options?.paymentState) {
    params.set("payment_state", options.paymentState);
  }
  if (options?.query) {
    params.set("q", options.query);
  }
  if (options?.createdFrom) {
    params.set("created_from", options.createdFrom);
  }
  if (options?.createdTo) {
    params.set("created_to", options.createdTo);
  }
  if (options?.limit !== undefined) {
    params.set("limit", String(options.limit));
  }
  if (options?.offset !== undefined) {
    params.set("offset", String(options.offset));
  }

  const query = params.toString();
  const res = await fetch(`${resolveApiUrl()}/orders${query ? `?${query}` : ""}`, {
    cache: "no-store"
  });
  const dto = await handleJson<StoredOrderListResponseDto>(res);

  return {
    items: dto.items.map((item) => normalizeStoredOrder(item)),
    total: dto.total,
    limit: dto.limit,
    offset: dto.offset
  };
}

export async function fetchOrderById(orderId: string): Promise<StoredOrder> {
  const res = await fetch(`${resolveApiUrl()}/orders/${encodeURIComponent(orderId)}`, {
    cache: "no-store"
  });
  const dto = await handleJson<StoredOrderDto>(res);
  return normalizeStoredOrder(dto);
}

export async function fetchWebhookAudit(options?: {
  orderId?: string;
  processingStatus?: WebhookProcessingStatus;
  limit?: number;
  offset?: number;
}): Promise<StripeWebhookAuditListResponse> {
  const params = new URLSearchParams();
  if (options?.orderId) {
    params.set("order_id", options.orderId);
  }
  if (options?.processingStatus) {
    params.set("processing_status", options.processingStatus);
  }
  if (options?.limit !== undefined) {
    params.set("limit", String(options.limit));
  }
  if (options?.offset !== undefined) {
    params.set("offset", String(options.offset));
  }

  const query = params.toString();
  const res = await fetch(`${resolveApiUrl()}/webhooks/audit${query ? `?${query}` : ""}`, {
    cache: "no-store"
  });
  const dto = await handleJson<StripeWebhookAuditListResponseDto>(res);

  return {
    items: dto.items.map((item) => normalizeStripeWebhookAuditEntry(item)),
    total: dto.total,
    limit: dto.limit,
    offset: dto.offset
  };
}
