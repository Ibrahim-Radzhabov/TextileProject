from typing import Optional

from fastapi import Header, HTTPException, status

from ..config import get_settings


def _extract_bearer_token(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    raw = value.strip()
    if not raw.lower().startswith("bearer "):
        return None
    token = raw[7:].strip()
    return token or None


def require_admin_token(
    x_admin_token: Optional[str] = Header(default=None),
    authorization: Optional[str] = Header(default=None),
) -> None:
    settings = get_settings()
    expected = (settings.admin_token or "").strip()
    if not expected:
        return

    provided = (x_admin_token or "").strip() or (_extract_bearer_token(authorization) or "")
    if provided != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin token is required",
        )
