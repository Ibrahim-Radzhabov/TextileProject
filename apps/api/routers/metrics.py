import csv
import io
from datetime import date, datetime, time, timedelta, timezone
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response

from ..config import get_settings
from ..domain.models import (
    FavoritesEventEntry,
    FavoritesEventListResponse,
    FavoritesEventRequest,
    FavoritesMetric,
    PwaInstallDailySummaryEntry,
    PwaInstallDailySummaryResponse,
    PwaInstallEventEntry,
    PwaInstallEventListResponse,
    PwaInstallEventRequest,
    PwaInstallMetric,
)
from ..domain.order_store import get_order_store
from .admin_auth import require_admin_token

router = APIRouter(tags=["metrics"])
SortOrder = Literal["newest", "oldest"]
PWA_METRICS: tuple[PwaInstallMetric, ...] = (
    "prompt_available",
    "ios_hint_shown",
    "prompt_opened",
    "installed",
    "prompt_accepted",
    "prompt_dismissed",
    "banner_dismissed",
)


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


def _build_date_bounds(
    *,
    date_from: Optional[date],
    date_to: Optional[date],
) -> tuple[Optional[str], Optional[str]]:
    if date_from and date_to and date_from > date_to:
        raise HTTPException(
            status_code=422,
            detail='"date_from" must be less than or equal to "date_to"',
        )

    normalized_since = None
    normalized_until = None
    if date_from:
        normalized_since = datetime.combine(date_from, time.min, tzinfo=timezone.utc).isoformat()
    if date_to:
        normalized_until = datetime.combine(date_to + timedelta(days=1), time.min, tzinfo=timezone.utc).isoformat()
    return normalized_since, normalized_until


def _create_daily_entry(event_date: str) -> dict[str, int | str]:
    return {
        "date": event_date,
        "prompt_available": 0,
        "ios_hint_shown": 0,
        "prompt_opened": 0,
        "installed": 0,
        "prompt_accepted": 0,
        "prompt_dismissed": 0,
        "banner_dismissed": 0,
        "total": 0,
    }


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


@router.post("/metrics/favorites-events", status_code=202)
def collect_favorites_event(payload: FavoritesEventRequest, request: Request) -> dict[str, bool]:
    settings = get_settings()
    store = get_order_store()

    user_agent = request.headers.get("user-agent")
    normalized_user_agent = user_agent[:700] if user_agent else None
    source_ip = _resolve_source_ip(request)

    store.record_favorites_event(
        client_id=settings.client_id,
        sync_id=payload.sync_id,
        metric=payload.metric,
        path=payload.path,
        product_id=payload.product_id,
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
    normalized_since, normalized_until = _build_date_bounds(date_from=date_from, date_to=date_to)

    settings = get_settings()
    store = get_order_store()

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


@router.get(
    "/metrics/pwa-install-events/daily",
    response_model=PwaInstallDailySummaryResponse,
    dependencies=[Depends(require_admin_token)],
)
def list_pwa_install_events_daily(
    metric: Optional[PwaInstallMetric] = Query(default=None),
    path_prefix: Optional[str] = Query(default=None, min_length=1, max_length=200),
    date_from: Optional[date] = Query(default=None),
    date_to: Optional[date] = Query(default=None),
) -> PwaInstallDailySummaryResponse:
    normalized_since, normalized_until = _build_date_bounds(date_from=date_from, date_to=date_to)

    settings = get_settings()
    store = get_order_store()

    raw_items = store.list_pwa_install_daily_summary(
        client_id=settings.client_id,
        metric=metric,
        path_prefix=path_prefix,
        since_iso=normalized_since,
        until_iso=normalized_until,
    )

    grouped: dict[str, dict[str, int | str]] = {}
    for item in raw_items:
        event_date = str(item["event_date"])
        metric_name = str(item["metric"])
        total = int(item["total"])

        entry = grouped.setdefault(event_date, _create_daily_entry(event_date))
        if metric_name in PWA_METRICS:
            current_metric_total = entry.get(metric_name)
            if isinstance(current_metric_total, int):
                entry[metric_name] = current_metric_total + total
            else:
                entry[metric_name] = total

        current_total = entry.get("total")
        entry["total"] = int(current_total) + total if isinstance(current_total, int) else total

    return PwaInstallDailySummaryResponse(
        items=[
            PwaInstallDailySummaryEntry.model_validate(grouped[event_date])
            for event_date in sorted(grouped.keys())
        ]
    )


@router.get(
    "/metrics/pwa-install-events/export.csv",
    dependencies=[Depends(require_admin_token)],
)
def export_pwa_install_events_csv(
    metric: Optional[PwaInstallMetric] = Query(default=None),
    path_prefix: Optional[str] = Query(default=None, min_length=1, max_length=200),
    date_from: Optional[date] = Query(default=None),
    date_to: Optional[date] = Query(default=None),
    sort: SortOrder = Query(default="newest"),
) -> Response:
    normalized_since, normalized_until = _build_date_bounds(date_from=date_from, date_to=date_to)

    settings = get_settings()
    store = get_order_store()

    rows_buffer: list[dict] = []
    offset = 0
    batch_size = 500
    max_rows = 5000
    total = 0

    while len(rows_buffer) < max_rows:
        remaining = max_rows - len(rows_buffer)
        items, total = store.list_pwa_install_events(
            client_id=settings.client_id,
            metric=metric,
            path_prefix=path_prefix,
            since_iso=normalized_since,
            until_iso=normalized_until,
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
            "id",
            "metric",
            "path",
            "source",
            "event_timestamp",
            "created_at",
            "user_agent",
            "source_ip",
        ]
    )

    for item in rows_buffer:
        writer.writerow(
            [
                item.get("id"),
                item.get("metric"),
                item.get("path"),
                item.get("source"),
                item.get("event_timestamp"),
                item.get("created_at"),
                item.get("user_agent") or "",
                item.get("source_ip") or "",
            ]
        )

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    filename = f"pwa-install-events-{settings.client_id}-{timestamp}.csv"
    return Response(
        content="\ufeff" + output.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Export-Total": str(total),
            "X-Export-Returned": str(len(rows_buffer)),
        },
    )


@router.get(
    "/metrics/favorites-events",
    response_model=FavoritesEventListResponse,
    dependencies=[Depends(require_admin_token)],
)
def list_favorites_events(
    metric: Optional[FavoritesMetric] = Query(default=None),
    sync_id: Optional[str] = Query(default=None, min_length=1, max_length=120),
    path_prefix: Optional[str] = Query(default=None, min_length=1, max_length=200),
    date_from: Optional[date] = Query(default=None),
    date_to: Optional[date] = Query(default=None),
    sort: SortOrder = Query(default="newest"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> FavoritesEventListResponse:
    normalized_since, normalized_until = _build_date_bounds(date_from=date_from, date_to=date_to)

    settings = get_settings()
    store = get_order_store()

    items, total = store.list_favorites_events(
        client_id=settings.client_id,
        metric=metric,
        sync_id=sync_id,
        path_prefix=path_prefix,
        since_iso=normalized_since,
        until_iso=normalized_until,
        sort=sort,
        limit=limit,
        offset=offset,
    )

    return FavoritesEventListResponse(
        items=[FavoritesEventEntry.model_validate(item) for item in items],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/metrics/favorites-events/export.csv",
    dependencies=[Depends(require_admin_token)],
)
def export_favorites_events_csv(
    metric: Optional[FavoritesMetric] = Query(default=None),
    sync_id: Optional[str] = Query(default=None, min_length=1, max_length=120),
    path_prefix: Optional[str] = Query(default=None, min_length=1, max_length=200),
    date_from: Optional[date] = Query(default=None),
    date_to: Optional[date] = Query(default=None),
    sort: SortOrder = Query(default="newest"),
) -> Response:
    normalized_since, normalized_until = _build_date_bounds(date_from=date_from, date_to=date_to)

    settings = get_settings()
    store = get_order_store()

    rows_buffer: list[dict] = []
    offset = 0
    batch_size = 500
    max_rows = 5000
    total = 0

    while len(rows_buffer) < max_rows:
        remaining = max_rows - len(rows_buffer)
        items, total = store.list_favorites_events(
            client_id=settings.client_id,
            metric=metric,
            sync_id=sync_id,
            path_prefix=path_prefix,
            since_iso=normalized_since,
            until_iso=normalized_until,
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
            "id",
            "metric",
            "sync_id",
            "product_id",
            "path",
            "source",
            "event_timestamp",
            "created_at",
            "user_agent",
            "source_ip",
        ]
    )

    for item in rows_buffer:
        writer.writerow(
            [
                item.get("id"),
                item.get("metric"),
                item.get("sync_id"),
                item.get("product_id") or "",
                item.get("path"),
                item.get("source"),
                item.get("event_timestamp"),
                item.get("created_at"),
                item.get("user_agent") or "",
                item.get("source_ip") or "",
            ]
        )

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    filename = f"favorites-events-{settings.client_id}-{timestamp}.csv"
    return Response(
        content="\ufeff" + output.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Export-Total": str(total),
            "X-Export-Returned": str(len(rows_buffer)),
        },
    )
