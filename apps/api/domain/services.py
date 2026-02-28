from __future__ import annotations

import hashlib
import json
import logging
import uuid
from typing import List, Literal, Optional

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
from .order_store import get_order_store


logger = logging.getLogger("store_platform")


class IdempotencyConflictError(Exception):
    pass


def _is_placeholder_secret(value: Optional[str]) -> bool:
    if not value:
        return True
    normalized = value.strip().lower()
    return "placeholder" in normalized


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


def resolve_stripe_secret_key() -> Optional[str]:
    """
    Determine which Stripe secret key to use.
    Prefers environment variables, then client config integrations.
    """

    settings = get_settings()
    if settings.stripe_secret_key and not _is_placeholder_secret(settings.stripe_secret_key):
        return settings.stripe_secret_key

    loader = get_loader()
    storefront = loader.load_storefront_config()
    if (
        storefront.integrations.stripe
        and storefront.integrations.stripe.secret_key
        and not _is_placeholder_secret(storefront.integrations.stripe.secret_key)
    ):
        return storefront.integrations.stripe.secret_key

    return None


def resolve_stripe_webhook_secret() -> Optional[str]:
    """
    Determine Stripe webhook secret.
    Prefers env vars, then client config integrations.
    """

    settings = get_settings()
    if settings.stripe_webhook_secret and not _is_placeholder_secret(settings.stripe_webhook_secret):
        return settings.stripe_webhook_secret

    loader = get_loader()
    storefront = loader.load_storefront_config()
    if (
        storefront.integrations.stripe
        and storefront.integrations.stripe.webhook_secret
        and not _is_placeholder_secret(storefront.integrations.stripe.webhook_secret)
    ):
        return storefront.integrations.stripe.webhook_secret

    return None


def _hash_checkout_payload(payload: CheckoutRequest) -> str:
    normalized = json.dumps(payload.model_dump(mode="json"), sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


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

    if (
        not token
        or not chat_id
        or _is_placeholder_secret(token)
        or _is_placeholder_secret(chat_id)
    ):
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


def create_checkout(payload: CheckoutRequest, *, idempotency_key: Optional[str] = None) -> CheckoutResponse:
    """
    Domain-level checkout service.

    1) Пересчитывает корзину (price_cart).
    2) Пытается создать Stripe Checkout Session, если есть конфиг и ключ.
    3) Отправляет Telegram-нотификацию о заказе.
    4) Возвращает CheckoutResponse с order_id и либо redirect-статусом,
       либо confirmed (MVP без Stripe).
    """

    settings = get_settings()
    store = get_order_store()
    request_hash = _hash_checkout_payload(payload)

    if idempotency_key:
        existing = store.get_idempotency_record(client_id=settings.client_id, idempotency_key=idempotency_key)
        if existing:
            if existing.request_hash != request_hash:
                raise IdempotencyConflictError("Idempotency key already used with a different payload")
            return CheckoutResponse.model_validate(existing.response_payload)

    cart = price_cart(payload.cart)
    order_id = str(uuid.uuid4())

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
    status: Literal["pending", "redirect", "confirmed"] = "confirmed"

    secret_key = resolve_stripe_secret_key()
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

    response = CheckoutResponse(
        order_id=order_id,
        status=status,
        stripe_session_id=stripe_session_id,
        redirect_url=redirect_url,
    )

    store.save_order(
        order_id=order_id,
        client_id=settings.client_id,
        status=status,
        currency=grand_total.currency,
        amount=grand_total.amount,
        cart_payload=cart.model_dump(mode="json"),
        customer_payload=payload.customer.model_dump(mode="json"),
        stripe_session_id=stripe_session_id,
        redirect_url=redirect_url,
    )
    if idempotency_key:
        store.save_idempotency_record(
            client_id=settings.client_id,
            idempotency_key=idempotency_key,
            request_hash=request_hash,
            order_id=order_id,
            response_payload=response.model_dump(mode="json"),
        )

    return response
