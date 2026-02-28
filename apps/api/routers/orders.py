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
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> StoredOrderListResponse:
    settings = get_settings()
    store = get_order_store()
    items, total = store.list_orders(
        client_id=settings.client_id,
        status=status,
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
