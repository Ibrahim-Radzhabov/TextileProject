import type {
  Cart,
  CatalogConfig,
  ManualOrderStatus as SharedManualOrderStatus,
  OrderLifecycleStatus,
  PwaInstallMetric,
  Product,
  StorefrontConfig
} from "@store-platform/shared-types";

const PUBLIC_API_URL = process.env.NEXT_PUBLIC_STORE_API_URL ?? "http://127.0.0.1:8000";
const INTERNAL_API_URL = process.env.STORE_API_URL ?? PUBLIC_API_URL;

function resolveApiUrl(): string {
  return typeof window === "undefined" ? INTERNAL_API_URL : PUBLIC_API_URL;
}

function resolveFavoritesSyncUrl(syncId: string): string {
  const params = new URLSearchParams({ sync_id: syncId });
  if (typeof window !== "undefined") {
    return `/api/favorites/sync?${params.toString()}`;
  }
  return `${resolveApiUrl()}/favorites/sync?${params.toString()}`;
}

function resolveFavoritesMetricsUrl(): string {
  if (typeof window !== "undefined") {
    return "/api/metrics/favorites-events";
  }
  return `${resolveApiUrl()}/metrics/favorites-events`;
}

function resolveAdminHeaders(): HeadersInit {
  const token = process.env.ADMIN_TOKEN?.trim();
  if (!token) {
    return {};
  }
  return {
    "x-admin-token": token
  };
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
  isActive?: boolean;
  is_active?: boolean;
  sortOrder?: number;
  sort_order?: number;
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
  status:
    | "pending"
    | "redirect"
    | "confirmed"
    | "paid"
    | "processing"
    | "shipped"
    | "failed"
    | "cancelled";
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

type PwaInstallEventDto = {
  id: number;
  client_id: string;
  metric: PwaInstallMetric;
  path: string;
  source: "web";
  user_agent?: string | null;
  source_ip?: string | null;
  event_timestamp: string;
  created_at: string;
};

type PwaInstallEventListResponseDto = {
  items: PwaInstallEventDto[];
  total: number;
  limit: number;
  offset: number;
};

type PwaInstallDailySummaryEntryDto = {
  date: string;
  prompt_available: number;
  ios_hint_shown: number;
  prompt_opened: number;
  installed: number;
  prompt_accepted: number;
  prompt_dismissed: number;
  banner_dismissed: number;
  total: number;
};

type PwaInstallDailySummaryResponseDto = {
  items: PwaInstallDailySummaryEntryDto[];
};

type FavoritesEventDto = {
  id: number;
  client_id: string;
  sync_id: string;
  metric:
    | "favorites_opened"
    | "favorite_added"
    | "favorite_removed"
    | "favorites_cleared"
    | "favorites_synced_pull"
    | "favorites_synced_push";
  path: string;
  product_id?: string | null;
  source: "web";
  user_agent?: string | null;
  source_ip?: string | null;
  event_timestamp: string;
  created_at: string;
};

type FavoritesEventListResponseDto = {
  items: FavoritesEventDto[];
  total: number;
  limit: number;
  offset: number;
};

type FavoritesSyncResponseDto = {
  sync_id?: string;
  syncId?: string;
  product_ids?: string[];
  productIds?: string[];
  updated_at?: string;
  updatedAt?: string;
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
    contacts?: {
      phoneLabel?: string;
      phone_label?: string;
      phoneHref?: string;
      phone_href?: string;
      emailLabel?: string;
      email_label?: string;
      emailHref?: string;
      email_href?: string;
      address?: string;
    };
    socialLinks?: Array<{ label: string; href: string }>;
    social_links?: Array<{ label: string; href: string }>;
    supportLinks?: Array<{ label: string; href: string }>;
    support_links?: Array<{ label: string; href: string }>;
    primaryCta?: { label: string; href: string };
    primary_cta?: { label: string; href: string };
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
    isActive: product.isActive ?? product.is_active,
    sortOrder: product.sortOrder ?? product.sort_order,
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
  const contacts = config.shop.contacts
    ? {
        phoneLabel: config.shop.contacts.phoneLabel ?? config.shop.contacts.phone_label,
        phoneHref: config.shop.contacts.phoneHref ?? config.shop.contacts.phone_href,
        emailLabel: config.shop.contacts.emailLabel ?? config.shop.contacts.email_label,
        emailHref: config.shop.contacts.emailHref ?? config.shop.contacts.email_href,
        address: config.shop.contacts.address
      }
    : undefined;
  const socialLinks = config.shop.socialLinks ?? config.shop.social_links;
  const supportLinks = config.shop.supportLinks ?? config.shop.support_links;
  const primaryCta = config.shop.primaryCta ?? config.shop.primary_cta;

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
      id: config.shop.id,
      name: config.shop.name,
      logo: config.shop.logo,
      primaryLocale: getRequired(primaryLocale, "shop.primaryLocale"),
      currency: config.shop.currency,
      contacts,
      socialLinks,
      supportLinks,
      primaryCta
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

export type OrderStatus = OrderLifecycleStatus;
export type OrderPaymentState = "awaiting" | "paid" | "failed" | "cancelled";
export type SortOrder = "newest" | "oldest";

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

export type PwaInstallSource = "web";

export type PwaInstallEvent = {
  id: number;
  clientId: string;
  metric: PwaInstallMetric;
  path: string;
  source: PwaInstallSource;
  userAgent?: string | null;
  sourceIp?: string | null;
  eventTimestamp: string;
  createdAt: string;
};

export type PwaInstallEventListResponse = {
  items: PwaInstallEvent[];
  total: number;
  limit: number;
  offset: number;
};

export type PwaInstallDailySummaryEntry = {
  date: string;
  promptAvailable: number;
  iosHintShown: number;
  promptOpened: number;
  installed: number;
  promptAccepted: number;
  promptDismissed: number;
  bannerDismissed: number;
  total: number;
};

export type PwaInstallDailySummaryResponse = {
  items: PwaInstallDailySummaryEntry[];
};

export type FavoritesMetric =
  | "favorites_opened"
  | "favorite_added"
  | "favorite_removed"
  | "favorites_cleared"
  | "favorites_synced_pull"
  | "favorites_synced_push";

export type FavoritesEventSource = "web";

export type FavoritesEvent = {
  id: number;
  clientId: string;
  syncId: string;
  metric: FavoritesMetric;
  path: string;
  productId?: string | null;
  source: FavoritesEventSource;
  userAgent?: string | null;
  sourceIp?: string | null;
  eventTimestamp: string;
  createdAt: string;
};

export type FavoritesEventListResponse = {
  items: FavoritesEvent[];
  total: number;
  limit: number;
  offset: number;
};

export type FavoritesSyncSnapshot = {
  syncId: string;
  productIds: string[];
  updatedAt: string;
};

export type ManualOrderStatus = SharedManualOrderStatus;
export type StatusAuditActorType = "checkout" | "webhook" | "admin" | "system";

type OrderStatusAuditEntryDto = {
  id: number;
  order_id: string;
  client_id: string;
  from_status?: OrderStatus | null;
  to_status: OrderStatus;
  reason?: string | null;
  actor_type: string;
  created_at: string;
};

type OrderStatusAuditListResponseDto = {
  items: OrderStatusAuditEntryDto[];
  total: number;
  limit: number;
  offset: number;
};

export type OrderStatusAuditEntry = {
  id: number;
  orderId: string;
  clientId: string;
  fromStatus?: OrderStatus | null;
  toStatus: OrderStatus;
  reason?: string | null;
  actorType: string;
  createdAt: string;
};

export type OrderStatusAuditListResponse = {
  items: OrderStatusAuditEntry[];
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

function normalizeOrderStatusAuditEntry(dto: OrderStatusAuditEntryDto): OrderStatusAuditEntry {
  return {
    id: dto.id,
    orderId: dto.order_id,
    clientId: dto.client_id,
    fromStatus: dto.from_status ?? null,
    toStatus: dto.to_status,
    reason: dto.reason ?? null,
    actorType: dto.actor_type,
    createdAt: dto.created_at
  };
}

function normalizePwaInstallEvent(dto: PwaInstallEventDto): PwaInstallEvent {
  return {
    id: dto.id,
    clientId: dto.client_id,
    metric: dto.metric,
    path: dto.path,
    source: dto.source,
    userAgent: dto.user_agent ?? null,
    sourceIp: dto.source_ip ?? null,
    eventTimestamp: dto.event_timestamp,
    createdAt: dto.created_at
  };
}

function normalizePwaInstallDailySummaryEntry(
  dto: PwaInstallDailySummaryEntryDto
): PwaInstallDailySummaryEntry {
  return {
    date: dto.date,
    promptAvailable: dto.prompt_available,
    iosHintShown: dto.ios_hint_shown,
    promptOpened: dto.prompt_opened,
    installed: dto.installed,
    promptAccepted: dto.prompt_accepted,
    promptDismissed: dto.prompt_dismissed,
    bannerDismissed: dto.banner_dismissed,
    total: dto.total
  };
}

function normalizeFavoritesSyncSnapshot(dto: FavoritesSyncResponseDto): FavoritesSyncSnapshot {
  const syncId = dto.syncId ?? dto.sync_id;
  const productIds = dto.productIds ?? dto.product_ids;
  const updatedAt = dto.updatedAt ?? dto.updated_at;

  return {
    syncId: getRequired(syncId, "favorites.syncId"),
    productIds: Array.isArray(productIds) ? productIds.map((value) => String(value)) : [],
    updatedAt: getRequired(updatedAt, "favorites.updatedAt")
  };
}

function normalizeFavoritesEvent(dto: FavoritesEventDto): FavoritesEvent {
  return {
    id: dto.id,
    clientId: dto.client_id,
    syncId: dto.sync_id,
    metric: dto.metric,
    path: dto.path,
    productId: dto.product_id ?? null,
    source: dto.source,
    userAgent: dto.user_agent ?? null,
    sourceIp: dto.source_ip ?? null,
    eventTimestamp: dto.event_timestamp,
    createdAt: dto.created_at
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

export async function fetchCatalogProductsAdmin(): Promise<Product[]> {
  const res = await fetch(`${resolveApiUrl()}/catalog/products`, { cache: "no-store" });
  const dto = await handleJson<{ products: ProductDto[] }>(res);
  return dto.products.map((product) => normalizeProduct(product));
}

export async function fetchProduct(slug: string): Promise<Product> {
  const res = await fetch(`${resolveApiUrl()}/catalog/${slug}`);
  const dto = await handleJson<ProductDto>(res);
  return normalizeProduct(dto);
}

export async function fetchProductByIdAdmin(productId: string): Promise<Product> {
  const res = await fetch(`${resolveApiUrl()}/catalog/products/${encodeURIComponent(productId)}`, {
    cache: "no-store"
  });
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
  sort?: SortOrder;
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
  if (options?.sort) {
    params.set("sort", options.sort);
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

export async function updateOrderStatus(params: {
  orderId: string;
  status: ManualOrderStatus;
  reason?: string;
}): Promise<StoredOrder> {
  const res = await fetch(`${resolveApiUrl()}/orders/${encodeURIComponent(params.orderId)}/status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      status: params.status,
      reason: params.reason
    })
  });
  const dto = await handleJson<StoredOrderDto>(res);
  return normalizeStoredOrder(dto);
}

export async function fetchOrderStatusAudit(params: {
  orderId: string;
  limit?: number;
  offset?: number;
  toStatus?: OrderStatus;
  actorType?: StatusAuditActorType;
  sort?: SortOrder;
}): Promise<OrderStatusAuditListResponse> {
  const query = new URLSearchParams();
  if (params.limit !== undefined) {
    query.set("limit", String(params.limit));
  }
  if (params.offset !== undefined) {
    query.set("offset", String(params.offset));
  }
  if (params.toStatus) {
    query.set("to_status", params.toStatus);
  }
  if (params.actorType) {
    query.set("actor_type", params.actorType);
  }
  if (params.sort) {
    query.set("sort", params.sort);
  }
  const queryString = query.toString();
  const res = await fetch(
    `${resolveApiUrl()}/orders/${encodeURIComponent(params.orderId)}/status-audit${
      queryString ? `?${queryString}` : ""
    }`,
    { cache: "no-store" }
  );
  const dto = await handleJson<OrderStatusAuditListResponseDto>(res);
  return {
    items: dto.items.map((item) => normalizeOrderStatusAuditEntry(item)),
    total: dto.total,
    limit: dto.limit,
    offset: dto.offset
  };
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

export async function fetchPwaInstallEvents(options?: {
  metric?: PwaInstallMetric;
  pathPrefix?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: SortOrder;
  limit?: number;
  offset?: number;
}): Promise<PwaInstallEventListResponse> {
  const params = new URLSearchParams();
  if (options?.metric) {
    params.set("metric", options.metric);
  }
  if (options?.pathPrefix) {
    params.set("path_prefix", options.pathPrefix);
  }
  if (options?.dateFrom) {
    params.set("date_from", options.dateFrom);
  }
  if (options?.dateTo) {
    params.set("date_to", options.dateTo);
  }
  if (options?.sort) {
    params.set("sort", options.sort);
  }
  if (options?.limit !== undefined) {
    params.set("limit", String(options.limit));
  }
  if (options?.offset !== undefined) {
    params.set("offset", String(options.offset));
  }

  const query = params.toString();
  const res = await fetch(
    `${resolveApiUrl()}/metrics/pwa-install-events${query ? `?${query}` : ""}`,
    {
      cache: "no-store",
      headers: resolveAdminHeaders()
    }
  );
  const dto = await handleJson<PwaInstallEventListResponseDto>(res);

  return {
    items: dto.items.map((item) => normalizePwaInstallEvent(item)),
    total: dto.total,
    limit: dto.limit,
    offset: dto.offset
  };
}

export async function fetchPwaInstallDailySummary(options?: {
  metric?: PwaInstallMetric;
  pathPrefix?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<PwaInstallDailySummaryResponse> {
  const params = new URLSearchParams();
  if (options?.metric) {
    params.set("metric", options.metric);
  }
  if (options?.pathPrefix) {
    params.set("path_prefix", options.pathPrefix);
  }
  if (options?.dateFrom) {
    params.set("date_from", options.dateFrom);
  }
  if (options?.dateTo) {
    params.set("date_to", options.dateTo);
  }

  const query = params.toString();
  const res = await fetch(
    `${resolveApiUrl()}/metrics/pwa-install-events/daily${query ? `?${query}` : ""}`,
    {
      cache: "no-store",
      headers: resolveAdminHeaders()
    }
  );
  const dto = await handleJson<PwaInstallDailySummaryResponseDto>(res);

  return {
    items: dto.items.map((item) => normalizePwaInstallDailySummaryEntry(item))
  };
}

export async function fetchFavoritesEvents(options?: {
  metric?: FavoritesMetric;
  syncId?: string;
  pathPrefix?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: SortOrder;
  limit?: number;
  offset?: number;
}): Promise<FavoritesEventListResponse> {
  const params = new URLSearchParams();
  if (options?.metric) {
    params.set("metric", options.metric);
  }
  if (options?.syncId) {
    params.set("sync_id", options.syncId);
  }
  if (options?.pathPrefix) {
    params.set("path_prefix", options.pathPrefix);
  }
  if (options?.dateFrom) {
    params.set("date_from", options.dateFrom);
  }
  if (options?.dateTo) {
    params.set("date_to", options.dateTo);
  }
  if (options?.sort) {
    params.set("sort", options.sort);
  }
  if (options?.limit !== undefined) {
    params.set("limit", String(options.limit));
  }
  if (options?.offset !== undefined) {
    params.set("offset", String(options.offset));
  }

  const query = params.toString();
  const res = await fetch(
    `${resolveApiUrl()}/metrics/favorites-events${query ? `?${query}` : ""}`,
    {
      cache: "no-store",
      headers: resolveAdminHeaders()
    }
  );
  const dto = await handleJson<FavoritesEventListResponseDto>(res);

  return {
    items: dto.items.map((item) => normalizeFavoritesEvent(item)),
    total: dto.total,
    limit: dto.limit,
    offset: dto.offset
  };
}

export async function fetchFavoritesSnapshot(syncId: string): Promise<FavoritesSyncSnapshot> {
  const res = await fetch(resolveFavoritesSyncUrl(syncId), {
    cache: "no-store"
  });
  const dto = await handleJson<FavoritesSyncResponseDto>(res);
  return normalizeFavoritesSyncSnapshot(dto);
}

export async function saveFavoritesSnapshot(
  syncId: string,
  productIds: string[]
): Promise<FavoritesSyncSnapshot> {
  const res = await fetch(resolveFavoritesSyncUrl(syncId), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      productIds
    })
  });
  const dto = await handleJson<FavoritesSyncResponseDto>(res);
  return normalizeFavoritesSyncSnapshot(dto);
}

export function trackFavoritesMetric(params: {
  metric: FavoritesMetric;
  path: string;
  syncId: string;
  productId?: string;
  timestamp?: string;
}): void {
  if (typeof window === "undefined") {
    return;
  }

  const endpoint = resolveFavoritesMetricsUrl();
  const payload = {
    metric: params.metric,
    path: params.path,
    syncId: params.syncId,
    productId: params.productId,
    timestamp: params.timestamp ?? new Date().toISOString(),
    source: "web" as const
  };

  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(endpoint, blob);
    return;
  }

  void fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body,
    keepalive: true
  }).catch(() => {
    // Best effort metrics.
  });
}
