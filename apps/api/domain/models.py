from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


OrderLifecycleStatus = Literal[
    "pending",
    "redirect",
    "confirmed",
    "paid",
    "processing",
    "shipped",
    "failed",
    "cancelled",
]


class Money(BaseModel):
    currency: str
    amount: float


class ProductMedia(BaseModel):
    id: str
    url: str
    alt: str


class ProductBadge(BaseModel):
    id: str
    label: str
    tone: Literal["accent", "neutral", "critical"]


class Product(BaseModel):
    id: str
    slug: str
    name: str
    description: Optional[str] = None
    short_description: Optional[str] = Field(default=None, alias="shortDescription")
    price: Money
    compare_at_price: Optional[Money] = Field(default=None, alias="compareAtPrice")
    badges: Optional[List[ProductBadge]] = None
    tags: Optional[List[str]] = None
    media: List[ProductMedia]
    is_active: Optional[bool] = Field(default=None, alias="isActive")
    sort_order: Optional[int] = Field(default=None, alias="sortOrder")
    is_featured: Optional[bool] = Field(default=None, alias="isFeatured")
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        populate_by_name = True


class CartItem(BaseModel):
    id: str
    product_id: str
    quantity: int
    unit_price: Money
    line_total: Money
    product_snapshot: Dict[str, Any]


class CartTotals(BaseModel):
    subtotal: Money
    discount_total: Optional[Money] = None
    shipping_total: Optional[Money] = None
    tax_total: Optional[Money] = None
    grand_total: Money


class Cart(BaseModel):
    id: str
    items: List[CartItem]
    totals: CartTotals
    currency: str


class ShopConfig(BaseModel):
    id: str
    name: str
    logo: Optional[Dict[str, str]] = None
    primary_locale: str = Field(alias="primaryLocale")
    currency: str

    class Config:
        populate_by_name = True


class ThemeConfig(BaseModel):
    id: str
    name: str
    colors: Dict[str, str]
    radii: Dict[str, float]
    shadows: Dict[str, str]
    typography: Dict[str, Any]
    gradients: Dict[str, str]


class SeoConfig(BaseModel):
    title_template: str = Field(alias="titleTemplate")
    default_title: str = Field(alias="defaultTitle")
    description: str
    open_graph_image: Optional[str] = Field(default=None, alias="openGraphImage")

    class Config:
        populate_by_name = True


class IntegrationStripe(BaseModel):
    type: Literal["stripe"]
    publishable_key: str = Field(alias="publishableKey")
    secret_key: str = Field(alias="secretKey")
    webhook_secret: Optional[str] = Field(default=None, alias="webhookSecret")

    class Config:
        populate_by_name = True


class IntegrationTelegram(BaseModel):
    type: Literal["telegram"]
    bot_token: str = Field(alias="botToken")
    chat_id: str = Field(alias="chatId")

    class Config:
        populate_by_name = True


class IntegrationsConfig(BaseModel):
    stripe: Optional[IntegrationStripe] = None
    telegram: Optional[IntegrationTelegram] = None


class PageBlockBase(BaseModel):
    id: str
    type: str


class HeroBlock(PageBlockBase):
    type: Literal["hero"]
    eyebrow: Optional[str] = None
    title: str
    subtitle: Optional[str] = None
    primary_cta: Optional[Dict[str, str]] = Field(default=None, alias="primaryCta")
    secondary_cta: Optional[Dict[str, str]] = Field(default=None, alias="secondaryCta")

    class Config:
        populate_by_name = True


class ProductGridBlock(PageBlockBase):
    type: Literal["product-grid"]
    title: Optional[str] = None
    subtitle: Optional[str] = None
    layout: Optional[Literal["auto-fit", "3-col", "4-col"]] = None
    filter: Optional[Dict[str, Any]] = None


class RichTextBlock(PageBlockBase):
    type: Literal["rich-text"]
    content: str


class CtaStripBlock(PageBlockBase):
    type: Literal["cta-strip"]
    title: str
    href: str


PageBlock = HeroBlock | ProductGridBlock | RichTextBlock | CtaStripBlock


class PageConfig(BaseModel):
    id: str
    slug: str
    kind: Literal["home", "catalog", "product", "custom"]
    title: str
    blocks: List[PageBlock]


class CatalogConfig(BaseModel):
    products: List[Product]


class StorefrontConfig(BaseModel):
    shop: ShopConfig
    theme: ThemeConfig
    seo: SeoConfig
    pages: List[PageConfig]
    catalog: CatalogConfig
    integrations: IntegrationsConfig


class CartItemInput(BaseModel):
    product_id: str
    quantity: int


class PriceCartRequest(BaseModel):
    items: List[CartItemInput]


class CheckoutCustomer(BaseModel):
    email: str
    name: Optional[str] = None
    address_line1: Optional[str] = None
    address_city: Optional[str] = None
    address_country: Optional[str] = None
    postal_code: Optional[str] = None


class CheckoutRequest(BaseModel):
    cart: PriceCartRequest
    customer: CheckoutCustomer


class CheckoutResponse(BaseModel):
    order_id: str
    status: Literal["pending", "redirect", "confirmed"]
    stripe_session_id: Optional[str] = None
    redirect_url: Optional[str] = None


class StoredOrder(BaseModel):
    order_id: str
    client_id: str
    status: OrderLifecycleStatus
    currency: str
    amount: float
    stripe_session_id: Optional[str] = None
    redirect_url: Optional[str] = None
    cart: Cart
    customer: CheckoutCustomer
    created_at: str
    updated_at: str


class StoredOrderListResponse(BaseModel):
    items: List[StoredOrder]
    total: int
    limit: int
    offset: int


class UpdateOrderStatusRequest(BaseModel):
    status: Literal["processing", "shipped", "cancelled"]
    reason: Optional[str] = Field(default=None, max_length=500)


class OrderStatusAuditEntry(BaseModel):
    id: int
    order_id: str
    client_id: str
    from_status: Optional[OrderLifecycleStatus] = None
    to_status: OrderLifecycleStatus
    reason: Optional[str] = None
    actor_type: str
    created_at: str


class OrderStatusAuditListResponse(BaseModel):
    items: List[OrderStatusAuditEntry]
    total: int
    limit: int
    offset: int


class StripeWebhookAuditEntry(BaseModel):
    id: int
    event_id: str
    livemode: bool
    account_id: str
    client_id: str
    event_type: str
    order_id: Optional[str] = None
    stripe_session_id: Optional[str] = None
    processing_status: Literal["processing", "processed", "ignored", "failed"]
    order_status: Optional[Literal["paid", "failed", "cancelled"]] = None
    error_text: Optional[str] = None
    created_at: str
    updated_at: str


class StripeWebhookAuditListResponse(BaseModel):
    items: List[StripeWebhookAuditEntry]
    total: int
    limit: int
    offset: int


PwaInstallMetric = Literal[
    "prompt_available",
    "ios_hint_shown",
    "prompt_opened",
    "installed",
    "prompt_accepted",
    "prompt_dismissed",
    "banner_dismissed",
]

PwaInstallSource = Literal["web"]


class PwaInstallEventRequest(BaseModel):
    metric: PwaInstallMetric
    path: str = Field(min_length=1, max_length=300)
    timestamp: datetime
    source: PwaInstallSource = "web"


class PwaInstallEventEntry(BaseModel):
    id: int
    client_id: str
    metric: PwaInstallMetric
    path: str
    source: PwaInstallSource
    user_agent: Optional[str] = None
    source_ip: Optional[str] = None
    event_timestamp: str
    created_at: str


class PwaInstallEventListResponse(BaseModel):
    items: List[PwaInstallEventEntry]
    total: int
    limit: int
    offset: int


class PwaInstallDailySummaryEntry(BaseModel):
    date: str
    prompt_available: int
    ios_hint_shown: int
    prompt_opened: int
    installed: int
    prompt_accepted: int
    prompt_dismissed: int
    banner_dismissed: int
    total: int


class PwaInstallDailySummaryResponse(BaseModel):
    items: List[PwaInstallDailySummaryEntry]
