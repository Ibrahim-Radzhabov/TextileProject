from datetime import date, datetime, time, timedelta, timezone
from typing import Literal, Optional

from fastapi import APIRouter, HTTPException, Query

from ..config import get_settings
from ..domain.models import StoredOrder, StoredOrderListResponse
from ..domain.order_store import get_order_store

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("", response_model=StoredOrderListResponse)
def list_orders(
    status: Optional[
        Literal["pending", "redirect", "confirmed", "paid", "failed", "cancelled"]
    ] = Query(default=None),
    payment_state: Optional[
        Literal["awaiting", "paid", "failed", "cancelled"]
    ] = Query(default=None),
    q: Optional[str] = Query(default=None, min_length=1, max_length=200),
    created_from: Optional[date] = Query(default=None),
    created_to: Optional[date] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> StoredOrderListResponse:
    if created_from and created_to and created_from > created_to:
        raise HTTPException(status_code=422, detail='"created_from" must be less than or equal to "created_to"')

    normalized_query = q.strip() if q else None

    created_from_iso: Optional[str] = None
    created_to_exclusive_iso: Optional[str] = None
    if created_from:
        created_from_iso = datetime.combine(created_from, time.min, tzinfo=timezone.utc).isoformat()
    if created_to:
        created_to_exclusive_iso = datetime.combine(
            created_to + timedelta(days=1),
            time.min,
            tzinfo=timezone.utc,
        ).isoformat()

    settings = get_settings()
    store = get_order_store()
    items, total = store.list_orders(
        client_id=settings.client_id,
        status=status,
        payment_state=payment_state,
        search_query=normalized_query,
        created_from_iso=created_from_iso,
        created_to_exclusive_iso=created_to_exclusive_iso,
        limit=limit,
        offset=offset,
    )

    return StoredOrderListResponse(
        items=[StoredOrder.model_validate(item) for item in items],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/{order_id}", response_model=StoredOrder)
def get_order(order_id: str) -> StoredOrder:
    settings = get_settings()
    store = get_order_store()
    order = store.get_order(order_id=order_id, client_id=settings.client_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return StoredOrder.model_validate(order)
