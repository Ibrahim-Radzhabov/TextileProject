from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict

from .models import CatalogConfig, IntegrationsConfig, SeoConfig, ShopConfig, StorefrontConfig, ThemeConfig, PageConfig
from ..config import get_settings


class ClientConfigLoader:
    def __init__(self, root_dir: Path, client_id: str) -> None:
        self.root_dir = root_dir
        self.client_id = client_id

    @property
    def client_dir(self) -> Path:
        return self.root_dir / "clients" / self.client_id

    def _read_json(self, name: str) -> Dict[str, Any]:
        path = self.client_dir / f"{name}.json"
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)

    def load_shop(self) -> ShopConfig:
        data = self._read_json("shop")
        return ShopConfig.model_validate(data)

    def load_theme(self) -> ThemeConfig:
        data = self._read_json("theme")
        return ThemeConfig.model_validate(data)

    def load_catalog(self) -> CatalogConfig:
        data = self._read_json("catalog")
        return CatalogConfig.model_validate(data)

    def load_pages(self) -> list[PageConfig]:
        data = self._read_json("pages")
        return [PageConfig.model_validate(p) for p in data]

    def load_seo(self) -> SeoConfig:
        data = self._read_json("seo")
        return SeoConfig.model_validate(data)

    def load_integrations(self) -> IntegrationsConfig:
        data = self._read_json("integrations")
        return IntegrationsConfig.model_validate(data)

    def load_storefront_config(self) -> StorefrontConfig:
        return StorefrontConfig(
            shop=self.load_shop(),
            theme=self.load_theme(),
            seo=self.load_seo(),
            pages=self.load_pages(),
            catalog=self.load_catalog(),
            integrations=self.load_integrations(),
        )


@lru_cache(maxsize=1)
def get_loader() -> ClientConfigLoader:
    settings = get_settings()
    root = Path(__file__).resolve().parents[2]
    return ClientConfigLoader(root_dir=root, client_id=settings.client_id)

