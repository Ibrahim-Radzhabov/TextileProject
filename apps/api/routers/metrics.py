from fastapi import APIRouter

from ..config import get_settings

router = APIRouter(tags=["metrics"])


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

