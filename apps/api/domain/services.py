from __future__ import annotations

import logging
import uuid
from typing import List, Optional

import requests
import stripe

from ..config import get_settings
from .loaders import get_loader
from .models import (
    Cart,
    CartItem,
    CartItemInput,
    CartTotals,
    CheckoutRequest,
    CheckoutResponse,
    Money,
    PriceCartRequest,
    Product,
)


logger = logging.getLogger("store_platform")


def _find_product(products: List[Product], product_id: str) -> Product | None:
    for p in products:
        if p.id == product_id:
            return p
    return None


def price_cart(payload: PriceCartRequest) -> Cart:
    loader = get_loader()
    catalog = loader.load_catalog()
    currency = catalog.products[0].price.currency if catalog.products else "USD"

    items: List[CartItem] = []
    subtotal_amount = 0.0

    for item in payload.items:
        product = _find_product(catalog.products, item.product_id)
        if not product:
            continue
        quantity = max(item.quantity, 1)
        unit_price = product.price
        line_amount = unit_price.amount * quantity
        subtotal_amount += line_amount

        items.append(
            CartItem(
                id=str(uuid.uuid4()),
                product_id=product.id,
                quantity=quantity,
                unit_price=Money(currency=unit_price.currency, amount=unit_price.amount),
                line_total=Money(currency=unit_price.currency, amount=line_amount),
                product_snapshot={
                    "name": product.name,
                    "slug": product.slug,
                    "media": [m.model_dump() for m in product.media],
                },
            )
        )

    subtotal = Money(currency=currency, amount=subtotal_amount)
    grand_total = Money(currency=currency, amount=subtotal_amount)
    totals = CartTotals(subtotal=subtotal, grand_total=grand_total)

    return Cart(id=str(uuid.uuid4()), items=items, totals=totals, currency=currency)


def _resolve_frontend_urls() -> tuple[str, str]:
    """
    Build success/cancel URLs for Stripe from settings.frontend_origin.
    Falls back to localhost for development.
    """

    settings = get_settings()
    base = (settings.frontend_origin or "http://localhost:3000").rstrip("/")
    success_url = f"{base}/checkout/success"
    cancel_url = f"{base}/checkout"
    return success_url, cancel_url


def _resolve_stripe_secret_key() -> Optional[str]:
    """
    Determine which Stripe secret key to use.
    Prefers environment variables, then client config integrations.
    """

    settings = get_settings()
    if settings.stripe_secret_key:
        return settings.stripe_secret_key

    loader = get_loader()
    storefront = loader.load_storefront_config()
    if storefront.integrations.stripe and storefront.integrations.stripe.secret_key:
        return storefront.integrations.stripe.secret_key

    return None


def _send_telegram_notification(order_id: str, cart: Cart) -> None:
    """
    Fire-and-forget style Telegram notification for a new order.
    Uses env vars if present, otherwise falls back to client config.
    Any errors are swallowed to avoid breaking checkout flow.
    """

    settings = get_settings()
    loader = get_loader()
    storefront = loader.load_storefront_config()

    token: Optional[str] = settings.telegram_bot_token
    chat_id: Optional[str] = settings.telegram_chat_id

    if storefront.integrations.telegram:
        token = token or storefront.integrations.telegram.bot_token
        chat_id = chat_id or storefront.integrations.telegram.chat_id

    if not token or not chat_id:
        return

    total = cart.totals.grand_total
    lines_preview = []
    for item in cart.items[:5]:
        lines_preview.append(f"- {item.product_snapshot.get('name', 'Товар')} × {item.quantity}")
    if len(cart.items) > 5:
        lines_preview.append(f"... и ещё {len(cart.items) - 5} позиций")

    text = "\n".join(
        [
            "🧵 Новая заявка из store-platform",
            f"ID заказа: {order_id}",
            f"Сумма: {total.amount:.2f} {total.currency}",
            "",
            "Позиции:",
            *lines_preview,
        ]
    )

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    try:
        requests.post(
            url,
            json={
                "chat_id": chat_id,
                "text": text,
                "parse_mode": "HTML",
            },
            timeout=5,
        )
        logger.info(
            "telegram_notification_sent",
            extra={
                "order_id": order_id,
                "client_id": settings.client_id,
                "currency": total.currency,
                "amount": total.amount,
            },
        )
    except Exception:
        # Не ломаем checkout, если Telegram временно недоступен.
        logger.exception("telegram_notification_failed", extra={"order_id": order_id})
        return


def create_checkout(payload: CheckoutRequest) -> CheckoutResponse:
    """
    Domain-level checkout service.

    1) Пересчитывает корзину (price_cart).
    2) Пытается создать Stripe Checkout Session, если есть конфиг и ключ.
    3) Отправляет Telegram-нотификацию о заказе.
    4) Возвращает CheckoutResponse с order_id и либо redirect-статусом,
       либо confirmed (MVP без Stripe).
    """

    cart = price_cart(payload.cart)
    order_id = str(uuid.uuid4())
    settings = get_settings()

    grand_total = cart.totals.grand_total

    logger.info(
        "checkout_started",
        extra={
            "order_id": order_id,
            "client_id": settings.client_id,
            "currency": grand_total.currency,
            "amount": grand_total.amount,
            "items_count": len(cart.items),
        },
    )

    # Попытка интеграции со Stripe, если сконфигурировано.
    stripe_session_id: Optional[str] = None
    redirect_url: Optional[str] = None
    status: str = "confirmed"

    secret_key = _resolve_stripe_secret_key()
    if secret_key:
        stripe.api_key = secret_key
        success_url_base, cancel_url = _resolve_frontend_urls()
        success_url = f"{success_url_base}?order_id={order_id}"

        try:
            line_items = []
            for item in cart.items:
                line_items.append(
                    {
                        "quantity": item.quantity,
                        "price_data": {
                            "currency": item.unit_price.currency.lower(),
                            "unit_amount": int(item.unit_price.amount * 100),
                            "product_data": {
                                "name": item.product_snapshot.get("name", "Product"),
                            },
                        },
                    }
                )

            session = stripe.checkout.Session.create(
                mode="payment",
                line_items=line_items,
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={
                    "order_id": order_id,
                },
            )
            stripe_session_id = session.id
            redirect_url = session.url
            status = "redirect"
            logger.info(
                "stripe_checkout_session_created",
                extra={
                    "order_id": order_id,
                    "client_id": settings.client_id,
                    "stripe_session_id": stripe_session_id,
                },
            )
        except Exception:
            stripe_session_id = None
            redirect_url = None
            status = "confirmed"
            logger.exception(
                "stripe_checkout_session_failed",
                extra={"order_id": order_id, "client_id": settings.client_id},
            )

    # Telegram-нотификация не должна ломать заказ.
    _send_telegram_notification(order_id, cart)

    logger.info(
        "checkout_completed",
        extra={
            "order_id": order_id,
            "client_id": settings.client_id,
            "status": status,
            "currency": grand_total.currency,
            "amount": grand_total.amount,
        },
    )

    return CheckoutResponse(
        order_id=order_id,
        status=status,  # type: ignore[arg-type]
        stripe_session_id=stripe_session_id,
        redirect_url=redirect_url,
    )


