import csv
import io
from datetime import date, datetime, time, timedelta, timezone
from typing import Literal, Optional

from fastapi import APIRouter, HTTPException, Query, Response

from ..config import get_settings
from ..domain.models import (
    OrderStatusAuditEntry,
    OrderStatusAuditListResponse,
    StoredOrder,
    StoredOrderListResponse,
    UpdateOrderStatusRequest,
)
from ..domain.order_store import get_order_store
from ..domain.order_transitions import get_allowed_manual_statuses

router = APIRouter(prefix="/orders", tags=["orders"])

OrderFilterStatus = Literal[
    "pending",
    "redirect",
    "confirmed",
    "paid",
    "processing",
    "shipped",
    "failed",
    "cancelled",
]

OrderPaymentState = Literal["awaiting", "paid", "failed", "cancelled"]
ManualOrderStatus = Literal["processing", "shipped", "cancelled"]
OrderStatusAuditActorType = Literal["checkout", "webhook", "admin", "system"]
SortOrder = Literal["newest", "oldest"]

def _normalize_filters(
    *,
    q: Optional[str],
    created_from: Optional[date],
    created_to: Optional[date],
) -> tuple[Optional[str], Optional[str], Optional[str]]:
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
    return normalized_query, created_from_iso, created_to_exclusive_iso


def _resolve_payment_state(status: str) -> str:
    if status in {"pending", "redirect", "confirmed"}:
        return "awaiting"
    if status in {"paid", "processing", "shipped"}:
        return "paid"
    if status == "failed":
        return "failed"
    return "cancelled"


@router.get("", response_model=StoredOrderListResponse)
def list_orders(
    status: Optional[OrderFilterStatus] = Query(default=None),
    payment_state: Optional[OrderPaymentState] = Query(default=None),
    q: Optional[str] = Query(default=None, min_length=1, max_length=200),
    created_from: Optional[date] = Query(default=None),
    created_to: Optional[date] = Query(default=None),
    sort: SortOrder = Query(default="newest"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> StoredOrderListResponse:
    if created_from and created_to and created_from > created_to:
        raise HTTPException(status_code=422, detail='"created_from" must be less than or equal to "created_to"')

    normalized_query, created_from_iso, created_to_exclusive_iso = _normalize_filters(
        q=q,
        created_from=created_from,
        created_to=created_to,
    )

    settings = get_settings()
    store = get_order_store()
    items, total = store.list_orders(
        client_id=settings.client_id,
        status=status,
        payment_state=payment_state,
        search_query=normalized_query,
        created_from_iso=created_from_iso,
        created_to_exclusive_iso=created_to_exclusive_iso,
        sort=sort,
        limit=limit,
        offset=offset,
    )

    return StoredOrderListResponse(
        items=[StoredOrder.model_validate(item) for item in items],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/export.csv")
def export_orders_csv(
    status: Optional[OrderFilterStatus] = Query(default=None),
    payment_state: Optional[OrderPaymentState] = Query(default=None),
    q: Optional[str] = Query(default=None, min_length=1, max_length=200),
    created_from: Optional[date] = Query(default=None),
    created_to: Optional[date] = Query(default=None),
    sort: SortOrder = Query(default="newest"),
) -> Response:
    if created_from and created_to and created_from > created_to:
        raise HTTPException(status_code=422, detail='"created_from" must be less than or equal to "created_to"')

    normalized_query, created_from_iso, created_to_exclusive_iso = _normalize_filters(
        q=q,
        created_from=created_from,
        created_to=created_to,
    )

    settings = get_settings()
    store = get_order_store()

    rows_buffer: list[dict] = []
    offset = 0
    batch_size = 500
    max_rows = 5000
    total = 0

    while len(rows_buffer) < max_rows:
        remaining = max_rows - len(rows_buffer)
        items, total = store.list_orders(
            client_id=settings.client_id,
            status=status,
            payment_state=payment_state,
            search_query=normalized_query,
            created_from_iso=created_from_iso,
            created_to_exclusive_iso=created_to_exclusive_iso,
            sort=sort,
            limit=min(batch_size, remaining),
            offset=offset,
        )
        if not items:
            break
        rows_buffer.extend(items)
        offset += len(items)
        if offset >= total:
            break

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "order_id",
            "status",
            "payment_state",
            "currency",
            "amount",
            "customer_email",
            "items_count",
            "created_at",
            "updated_at",
            "stripe_session_id",
        ]
    )

    for item in rows_buffer:
        customer = item.get("customer") or {}
        cart = item.get("cart") or {}
        items = cart.get("items") or []
        writer.writerow(
            [
                item.get("order_id"),
                item.get("status"),
                _resolve_payment_state(str(item.get("status", ""))),
                item.get("currency"),
                item.get("amount"),
                customer.get("email"),
                len(items),
                item.get("created_at"),
                item.get("updated_at"),
                item.get("stripe_session_id") or "",
            ]
        )

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    filename = f"orders-{settings.client_id}-{timestamp}.csv"
    return Response(
        content="\ufeff" + output.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Export-Total": str(total),
            "X-Export-Returned": str(len(rows_buffer)),
        },
    )


@router.get("/{order_id}", response_model=StoredOrder)
def get_order(order_id: str) -> StoredOrder:
    settings = get_settings()
    store = get_order_store()
    order = store.get_order(order_id=order_id, client_id=settings.client_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return StoredOrder.model_validate(order)


@router.post("/{order_id}/status", response_model=StoredOrder)
def update_order_status(order_id: str, payload: UpdateOrderStatusRequest) -> StoredOrder:
    settings = get_settings()
    store = get_order_store()
    order = store.get_order(order_id=order_id, client_id=settings.client_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    current_status = str(order["status"])
    next_status: ManualOrderStatus = payload.status

    if current_status == next_status:
        return StoredOrder.model_validate(order)

    allowed_next_statuses = get_allowed_manual_statuses(current_status)
    if next_status not in allowed_next_statuses:
        raise HTTPException(
            status_code=409,
            detail=f'Cannot change order status from "{current_status}" to "{next_status}"',
        )

    updated = store.update_order_status(
        order_id=order_id,
        client_id=settings.client_id,
        status=next_status,
        reason=payload.reason,
        actor_type="admin",
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Order not found")

    updated_order = store.get_order(order_id=order_id, client_id=settings.client_id)
    if updated_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return StoredOrder.model_validate(updated_order)


@router.get("/{order_id}/status-audit", response_model=OrderStatusAuditListResponse)
def get_order_status_audit(
    order_id: str,
    to_status: Optional[OrderFilterStatus] = Query(default=None),
    actor_type: Optional[OrderStatusAuditActorType] = Query(default=None),
    sort: SortOrder = Query(default="newest"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> OrderStatusAuditListResponse:
    settings = get_settings()
    store = get_order_store()
    order = store.get_order(order_id=order_id, client_id=settings.client_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    items, total = store.list_order_status_audit(
        order_id=order_id,
        client_id=settings.client_id,
        to_status=to_status,
        actor_type=actor_type,
        sort=sort,
        limit=limit,
        offset=offset,
    )
    return OrderStatusAuditListResponse(
        items=[OrderStatusAuditEntry.model_validate(item) for item in items],
        total=total,
        limit=limit,
        offset=offset,
    )
