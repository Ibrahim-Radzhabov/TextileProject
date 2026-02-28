import logging
from typing import Any, Literal, Optional

import stripe
from fastapi import APIRouter, HTTPException, Query, Request

from ..config import get_settings
from ..domain.models import StripeWebhookAuditEntry, StripeWebhookAuditListResponse
from ..domain.order_store import get_order_store
from ..domain.services import resolve_stripe_webhook_secret, send_telegram_payment_notification

router = APIRouter(prefix="/webhooks", tags=["webhooks"])
logger = logging.getLogger("store_platform")


@router.post("/stripe")
async def stripe_webhook(request: Request) -> dict:
    settings = get_settings()
    payload = await request.body()
    signature = request.headers.get("stripe-signature")
    webhook_secret = resolve_stripe_webhook_secret()

    if not webhook_secret:
        raise HTTPException(status_code=503, detail="Stripe webhook secret is not configured")
    if not signature:
        raise HTTPException(status_code=400, detail="Missing stripe-signature header")

    try:
        event = stripe.Webhook.construct_event(payload=payload, sig_header=signature, secret=webhook_secret)
    except ValueError as error:
        raise HTTPException(status_code=400, detail="Invalid Stripe payload") from error
    except stripe.error.SignatureVerificationError as error:
        raise HTTPException(status_code=400, detail="Invalid Stripe signature") from error

    event_id = event.get("id", "")
    if not event_id:
        raise HTTPException(status_code=400, detail="Stripe event has no id")

    livemode = bool(event.get("livemode", False))
    account_id = event.get("account")
    event_type = event.get("type", "unknown")
    event_object: dict[str, Any] = event.get("data", {}).get("object", {})
    metadata: dict[str, Any] = event_object.get("metadata") or {}
    order_id = metadata.get("order_id")
    stripe_session_id = event_object.get("id")

    raw_payload = event.to_dict_recursive() if hasattr(event, "to_dict_recursive") else dict(event)
    store = get_order_store()
    inserted = store.start_stripe_webhook_event(
        event_id=event_id,
        livemode=livemode,
        account_id=account_id,
        client_id=settings.client_id,
        event_type=event_type,
        order_id=order_id,
        stripe_session_id=stripe_session_id,
        raw_payload=raw_payload,
    )
    if not inserted:
        return {"received": True, "deduplicated": True}

    try:
        payment_status = event_object.get("payment_status")
        status_by_event = {
            "checkout.session.async_payment_succeeded": "paid",
            "checkout.session.async_payment_failed": "failed",
            "checkout.session.expired": "cancelled",
        }
        if event_type == "checkout.session.completed":
            next_status = "paid" if payment_status == "paid" else None
        else:
            next_status = status_by_event.get(event_type)

        if order_id and next_status:
            store.update_order_status(
                order_id=order_id,
                status=next_status,
                stripe_session_id=stripe_session_id,
            )
            logger.info(
                "stripe_webhook_order_status_updated",
                extra={
                    "order_id": order_id,
                    "stripe_event_type": event_type,
                    "next_status": next_status,
                },
            )
            if next_status == "paid":
                order = store.get_order(order_id=order_id, client_id=settings.client_id)
                if order:
                    customer = order.get("customer") or {}
                    send_telegram_payment_notification(
                        order_id=order_id,
                        amount=float(order.get("amount", 0)),
                        currency=str(order.get("currency", "USD")),
                        customer_email=customer.get("email"),
                        stripe_session_id=order.get("stripe_session_id"),
                    )

        store.finish_stripe_webhook_event(
            event_id=event_id,
            livemode=livemode,
            account_id=account_id,
            client_id=settings.client_id,
            processing_status="processed" if next_status else "ignored",
            order_status=next_status,
        )
    except Exception as error:
        store.finish_stripe_webhook_event(
            event_id=event_id,
            livemode=livemode,
            account_id=account_id,
            client_id=settings.client_id,
            processing_status="failed",
            error_text=str(error)[:2000],
        )
        raise

    return {"received": True}


@router.get("/audit", response_model=StripeWebhookAuditListResponse)
def list_stripe_webhook_audit(
    order_id: Optional[str] = Query(default=None),
    processing_status: Optional[Literal["processing", "processed", "ignored", "failed"]] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> StripeWebhookAuditListResponse:
    settings = get_settings()
    store = get_order_store()
    items, total = store.list_stripe_webhook_audit(
        client_id=settings.client_id,
        order_id=order_id,
        processing_status=processing_status,
        limit=limit,
        offset=offset,
    )
    return StripeWebhookAuditListResponse(
        items=[StripeWebhookAuditEntry.model_validate(item) for item in items],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.post("/telegram")
async def telegram_webhook(request: Request) -> dict:
    # Заглушка для Telegram webhook / нотификаций
    _ = await request.body()
    return {"received": True}
