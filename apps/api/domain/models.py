from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


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
    publishable_key: str
    secret_key: str
    webhook_secret: Optional[str] = None


class IntegrationTelegram(BaseModel):
    type: Literal["telegram"]
    bot_token: str
    chat_id: str


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

