import json
from functools import lru_cache
from pathlib import Path
from typing import List, Optional, Union

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    client_id: str = "demo"
    environment: str = "development"
    frontend_origin: Optional[str] = None
    cors_allow_origins: Union[List[str], str] = []
    admin_token: Optional[str] = None

    stripe_secret_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None

    telegram_bot_token: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    order_db_path: Optional[str] = None

    class Config:
        env_prefix = ""
        env_file = str(Path(__file__).resolve().parent / ".env")
        env_file_encoding = "utf-8"


def _normalize_origins(raw: Union[List[str], str]) -> List[str]:
    if isinstance(raw, list):
        return [origin.strip() for origin in raw if origin.strip()]

    value = raw.strip()
    if not value:
        return []

    try:
        parsed = json.loads(value)
        if isinstance(parsed, list):
            return [str(origin).strip() for origin in parsed if str(origin).strip()]
    except json.JSONDecodeError:
        pass

    # Accept shell-friendly forms like [http://a,http://b] or http://a,http://b
    if value.startswith("[") and value.endswith("]"):
        value = value[1:-1]

    parts = [part.strip().strip("'\"") for part in value.split(",")]
    return [part for part in parts if part]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    settings = Settings()
    settings.cors_allow_origins = _normalize_origins(settings.cors_allow_origins)
    if settings.frontend_origin and settings.frontend_origin not in settings.cors_allow_origins:
        settings.cors_allow_origins = [settings.frontend_origin, *settings.cors_allow_origins]
    return settings
