from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Query

from ..config import get_settings
from ..domain.models import FavoritesSyncPayload, FavoritesSyncResponse
from ..domain.order_store import get_order_store

router = APIRouter(prefix="/favorites", tags=["favorites"])


def _normalize_product_ids(raw_ids: list[str]) -> list[str]:
    normalized: list[str] = []
    seen: set[str] = set()
    for raw in raw_ids:
        value = raw.strip()
        if not value or value in seen:
            continue
        seen.add(value)
        normalized.append(value)
        if len(normalized) >= 200:
            break
    return normalized


@router.get("/sync", response_model=FavoritesSyncResponse)
def get_favorites_sync(
    sync_id: str = Query(..., min_length=1, max_length=120),
) -> FavoritesSyncResponse:
    settings = get_settings()
    store = get_order_store()

    existing = store.get_favorites_state(client_id=settings.client_id, sync_id=sync_id)
    if existing is None:
        return FavoritesSyncResponse(
            syncId=sync_id,
            productIds=[],
            updatedAt=datetime.now(timezone.utc).isoformat(),
        )

    return FavoritesSyncResponse.model_validate(existing)


@router.put("/sync", response_model=FavoritesSyncResponse)
def put_favorites_sync(
    payload: FavoritesSyncPayload,
    sync_id: str = Query(..., min_length=1, max_length=120),
) -> FavoritesSyncResponse:
    settings = get_settings()
    store = get_order_store()

    normalized_ids = _normalize_product_ids(payload.product_ids)
    saved = store.save_favorites_state(
        client_id=settings.client_id,
        sync_id=sync_id,
        product_ids=normalized_ids,
    )
    return FavoritesSyncResponse.model_validate(saved)
