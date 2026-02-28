from fastapi import APIRouter, Header, HTTPException

from ..config import get_settings
from ..domain.models import CheckoutRequest, CheckoutResponse, StoredOrder
from ..domain.order_store import get_order_store
from ..domain.services import IdempotencyConflictError, create_checkout

router = APIRouter(prefix="/checkout", tags=["checkout"])


@router.post("", response_model=CheckoutResponse)
def checkout(
    payload: CheckoutRequest,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
    x_idempotency_key: str | None = Header(default=None, alias="X-Idempotency-Key"),
) -> CheckoutResponse:
    key = idempotency_key or x_idempotency_key

    try:
        return create_checkout(payload, idempotency_key=key)
    except IdempotencyConflictError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error


@router.get("/{order_id}", response_model=StoredOrder)
def get_checkout_order(order_id: str) -> StoredOrder:
    settings = get_settings()
    store = get_order_store()
    order = store.get_order(order_id=order_id, client_id=settings.client_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return StoredOrder.model_validate(order)
