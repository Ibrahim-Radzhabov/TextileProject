from datetime import date, datetime, time, timedelta, timezone
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from ..config import get_settings
from ..domain.models import (
    PwaInstallEventEntry,
    PwaInstallEventListResponse,
    PwaInstallEventRequest,
    PwaInstallMetric,
)
from ..domain.order_store import get_order_store
from .admin_auth import require_admin_token

router = APIRouter(tags=["metrics"])
SortOrder = Literal["newest", "oldest"]


def _normalize_iso_timestamp(value: datetime) -> str:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc).isoformat()
    return value.astimezone(timezone.utc).isoformat()


def _resolve_source_ip(request: Request) -> Optional[str]:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        first = forwarded_for.split(",")[0].strip()
        return first[:120] if first else None

    if request.client and request.client.host:
        return request.client.host[:120]
    return None


@router.get("/metrics")
def get_metrics() -> dict:
    """
    Lightweight JSON metrics endpoint.

    Intended as a starting point; can be extended with real counters / histograms.
    """

    settings = get_settings()
    return {
        "status": "ok",
        "clientId": settings.client_id,
        "environment": settings.environment,
    }


@router.post("/metrics/pwa-install-events", status_code=202)
def collect_pwa_install_event(payload: PwaInstallEventRequest, request: Request) -> dict[str, bool]:
    settings = get_settings()
    store = get_order_store()

    user_agent = request.headers.get("user-agent")
    normalized_user_agent = user_agent[:700] if user_agent else None
    source_ip = _resolve_source_ip(request)

    store.record_pwa_install_event(
        client_id=settings.client_id,
        metric=payload.metric,
        path=payload.path,
        source=payload.source,
        event_timestamp=_normalize_iso_timestamp(payload.timestamp),
        user_agent=normalized_user_agent,
        source_ip=source_ip,
    )
    return {"ok": True}


@router.get(
    "/metrics/pwa-install-events",
    response_model=PwaInstallEventListResponse,
    dependencies=[Depends(require_admin_token)],
)
def list_pwa_install_events(
    metric: Optional[PwaInstallMetric] = Query(default=None),
    path_prefix: Optional[str] = Query(default=None, min_length=1, max_length=200),
    date_from: Optional[date] = Query(default=None),
    date_to: Optional[date] = Query(default=None),
    sort: SortOrder = Query(default="newest"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> PwaInstallEventListResponse:
    if date_from and date_to and date_from > date_to:
        raise HTTPException(
            status_code=422,
            detail='"date_from" must be less than or equal to "date_to"',
        )

    settings = get_settings()
    store = get_order_store()

    normalized_since = None
    normalized_until = None
    if date_from:
        normalized_since = datetime.combine(date_from, time.min, tzinfo=timezone.utc).isoformat()
    if date_to:
        normalized_until = datetime.combine(date_to + timedelta(days=1), time.min, tzinfo=timezone.utc).isoformat()

    items, total = store.list_pwa_install_events(
        client_id=settings.client_id,
        metric=metric,
        path_prefix=path_prefix,
        since_iso=normalized_since,
        until_iso=normalized_until,
        sort=sort,
        limit=limit,
        offset=offset,
    )
    return PwaInstallEventListResponse(
        items=[PwaInstallEventEntry.model_validate(item) for item in items],
        total=total,
        limit=limit,
        offset=offset,
    )
