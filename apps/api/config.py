from functools import lru_cache
from typing import List, Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    client_id: str = "demo"
    environment: str = "development"
    frontend_origin: Optional[str] = None
    cors_allow_origins: List[str] = []

    stripe_secret_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None

    telegram_bot_token: Optional[str] = None
    telegram_chat_id: Optional[str] = None

    class Config:
        env_prefix = ""
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    settings = Settings()
    if settings.frontend_origin and not settings.cors_allow_origins:
        settings.cors_allow_origins = [settings.frontend_origin]
    return settings

